// ===================================================================
// AUTH & AUTHORIZATION E2E TESTS
// Test authentication and authorization for all user roles
// ===================================================================

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { User } from '../models/userScheme.js';

describe('Authentication & Authorization E2E Tests', () => {
    let testUsers = {};
    let authTokens = {};
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);

    beforeAll(async () => {
        // Create test users for all roles with unique emails
        const roles = ['Patient', 'Doctor', 'Admin', 'Receptionist', 'BillingStaff', 'LabTechnician'];

        for (const role of roles) {
            const hashedPassword = await bcrypt.hash('testpassword123', 12);
            const user = await User.create({
                firstName: `Test${role}`,
                lastName: 'User',
                email: `test.${role.toLowerCase()}.${timestamp}.${randomId}@test.com`,
                password: hashedPassword,
                phone: '1234567890',
                nic: '123456789012',
                dob: new Date('1990-01-01'),
                gender: 'Other',
                role,
                isVerified: true,
                authType: 'traditional',
                isTestData: true
            });

            testUsers[role] = user;

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' }
            );
            authTokens[role] = token;
        }

        console.log('✅ Created test users for all roles');
    });

    afterAll(async () => {
        // Clean up test data
        await User.deleteMany({ isTestData: true });
        console.log('🧹 Cleaned up auth test data');
    });

    describe('User Registration', () => {
        it('should register a new patient successfully', async () => {
            const uniqueEmail = `newtest.patient.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`;
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    firstName: 'NewTest',
                    lastName: 'Patient',
                    email: uniqueEmail,
                    password: 'testpassword123',
                    phone: '9876543210',
                    nic: '987654321098',
                    dob: '1995-05-15',
                    gender: 'Male',
                    role: 'Patient'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('OTP sent');

            // Verify user exists in database
            const user = await User.findOne({ email: uniqueEmail });
            expect(user).toBeTruthy();
            expect(user.role).toBe('Patient');
            expect(user.isVerified).toBe(false);

            // Cleanup
            await User.deleteOne({ _id: user._id });
        });

        it('should reject registration with duplicate email', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    firstName: 'Duplicate',
                    lastName: 'Test',
                    email: testUsers.Patient.email, // Use existing email
                    password: 'testpassword123',
                    phone: '1111111111',
                    nic: '111111111111',
                    dob: '1990-01-01',
                    gender: 'Female',
                    role: 'Patient'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject registration with invalid data', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    firstName: 'A', // Too short
                    lastName: '',   // Required
                    email: 'invalid-email',
                    password: '123', // Too short
                    phone: '12345', // Too short
                    role: 'Patient'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('User Login', () => {
        it('should login patient successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUsers.Patient.email,
                    password: 'testpassword123',
                    role: 'Patient'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.role).toBe('Patient');
            expect(response.body.token).toBeDefined();

            // Check cookie is set
            const cookies = response.headers['set-cookie'];
            expect(cookies.some(cookie => cookie.includes('patientToken'))).toBe(true);
        });

        it('should login doctor successfully', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUsers.Doctor.email,
                    password: 'testpassword123',
                    role: 'Doctor'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.role).toBe('Doctor');

            const cookies = response.headers['set-cookie'];
            expect(cookies.some(cookie => cookie.includes('doctorToken'))).toBe(true);
        });

        it('should login admin successfully', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUsers.Admin.email,
                    password: 'testpassword123',
                    role: 'Admin'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.role).toBe('Admin');

            const cookies = response.headers['set-cookie'];
            expect(cookies.some(cookie => cookie.includes('adminToken'))).toBe(true);
        });

        it('should reject login with wrong password', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUsers.Patient.email,
                    password: 'wrongpassword',
                    role: 'Patient'
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

        it('should reject login with wrong role', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUsers.Patient.email,
                    password: 'testpassword123',
                    role: 'Doctor' // Wrong role
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

        it('should reject login for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'testpassword123',
                    role: 'Patient'
                });

            expect([400, 401, 404]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Authorization & Role-Based Access Control', () => {
        it('should allow authenticated user to access protected route', async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.role).toBe('Patient');
        });

        it('should reject unauthenticated access to protected route', async () => {
            const response = await request(app)
                .get('/api/v1/users/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should allow admin to access admin-only routes', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject patient access to admin-only routes', async () => {
            const response = await request(app)
                .post('/api/v1/users/admin/addnew')
                .set('Authorization', `Bearer ${authTokens.Patient}`)
                .send({
                    firstName: 'Test',
                    lastName: 'NewAdmin',
                    email: 'test.newadmin@test.com',
                    password: 'testpassword123',
                    phone: '1234567890',
                    role: 'Admin'
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should allow doctor to access doctor-specific routes', async () => {
            const response = await request(app)
                .get('/api/v1/users/doctors')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should allow admin to view all patients', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.users)).toBe(true);
        });

        it('should allow doctor to view patients', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject patient access to patients list', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Token Management', () => {
        it('should reject invalid JWT token', async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject expired JWT token', async () => {
            // Create expired token
            const expiredToken = jwt.sign(
                { id: testUsers.Patient._id, role: 'Patient' },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '-1s' } // Already expired
            );

            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should accept valid token and return user data', async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user._id).toBe(testUsers.Doctor._id.toString());
            expect(response.body.user.role).toBe('Doctor');
        });
    });

    describe('Logout Functionality', () => {
        it('should logout user successfully', async () => {
            const response = await request(app)
                .get('/api/v1/users/logout')
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Logged Out');
        });
    });

    describe('Social Media Authentication', () => {
        it('should have Google OAuth routes configured', async () => {
            const response = await request(app)
                .get('/api/v1/users/auth/google');

            // Should redirect to Google OAuth
            expect([302, 400]).toContain(response.status);
        });

        it('should have GitHub OAuth routes configured', async () => {
            const response = await request(app)
                .get('/api/v1/users/auth/github');

            // Should redirect to GitHub OAuth
            expect([302, 400]).toContain(response.status);
        });

        it('should have Gmail OAuth routes configured', async () => {
            const response = await request(app)
                .get('/api/v1/users/auth/gmail');

            // Should redirect since Gmail uses Google OAuth
            expect([302, 400]).toContain(response.status);
        });
    });

    describe('Role-Specific Feature Access', () => {
        it('should allow receptionist to access appointment management', async () => {
            const response = await request(app)
                .get('/api/v1/appointment/getall')
                .set('Authorization', `Bearer ${authTokens.Receptionist}`);

            expect([200, 404]).toContain(response.status); // 404 if no appointments exist
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('should allow billing staff to access billing routes', async () => {
            const response = await request(app)
                .get('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('should allow lab technician to access lab routes', async () => {
            const response = await request(app)
                .get('/api/v1/lab/queue')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`);

            expect([200, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });
    });
});
