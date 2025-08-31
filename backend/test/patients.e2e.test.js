// ===================================================================
// PATIENT MANAGEMENT E2E TESTS
// Test patient CRUD operations and profile management
// ===================================================================

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';

// Test database setup
const testDb = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/hospital_management_test_patients';
let authTokens = {};
let testUsers = {};

// Helper function to create JWT token
const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '24h' }
    );
};

// Helper function to create unique email
const createUniqueEmail = (base, role) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${base}_${role}_${timestamp}_${random}@test.com`;
};

describe('Patient Management E2E Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDb);
        }

        console.log('🔧 Setting up test users for Patient Management tests...');

        // Create test users with different roles
        const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist'];

        for (const role of roles) {
            const userData = {
                firstName: `Test${role}`,
                lastName: 'User',
                email: createUniqueEmail('test', role.toLowerCase()),
                phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                nic: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
                password: await bcrypt.hash('TestPassword123!', 12),
                role: role,
                gender: 'Male',
                dob: new Date('1990-01-01'),
                isVerified: true,
                authType: 'traditional'
            };

            if (role === 'Doctor') {
                userData.doctorDepartment = 'Cardiology';
            }

            const user = await User.create(userData);
            testUsers[role] = user;
            authTokens[role] = createToken(user);

            console.log(`✅ Created ${role}: ${user.email}`);
        }

        console.log('✅ Patient Management test setup completed');
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up Patient Management test data...');

        // Clean up test data
        const userIds = Object.values(testUsers).map(user => user._id);

        await Appointment.deleteMany({
            $or: [
                { patientId: { $in: userIds } },
                { doctorId: { $in: userIds } }
            ]
        });

        await User.deleteMany({ _id: { $in: userIds } });

        console.log('✅ Patient Management cleanup completed');
    });

    describe('Get Patient Information', () => {
        it('should get all patients with admin authorization', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data.patients)).toBe(true);
        });

        it('should allow doctor to view patients', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject unauthorized access', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients')
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect([401, 403]).toContain(response.status);
        });
    });

    describe('Patient Search and Filtering', () => {
        it('should search patients by name', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients?search=Test')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect([200, 404]).toContain(response.status);
        });

        it('should filter patients by criteria', async () => {
            const response = await request(app)
                .get('/api/v1/users/patients?gender=Male')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect([200, 404]).toContain(response.status);
        });
    });
});
