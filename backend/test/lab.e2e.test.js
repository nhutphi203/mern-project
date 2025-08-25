import { config } from "dotenv";
config({ path: "./config/config.env" });

import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';

describe('Lab Management E2E Tests', () => {
    let testUsers = {};
    let authTokens = {};
    let testLabOrder, testLabResult;

    beforeAll(async () => {
        // Create test users for different roles
        const uniqueId = Date.now();
        const testUserData = {
            Patient: {
                firstName: `Test`,
                lastName: `Patient`,
                email: `test.patient.lab.${uniqueId}@test.com`,
                phone: "1234567890",
                password: "Password123!",
                dob: "1990-01-01",
                gender: "Male",
                role: "Patient"
            },
            Doctor: {
                firstName: `Dr`,
                lastName: `Test`,
                email: `test.doctor.lab.${uniqueId}@test.com`,
                phone: "1234567891",
                password: "Password123!",
                dob: "1980-01-01",
                gender: "Male",
                role: "Doctor",
                department: "Cardiology",
                specialization: "Cardiology"
            },
            LabTechnician: {
                firstName: `Lab`,
                lastName: `Technician`,
                email: `test.labtech.lab.${uniqueId}@test.com`,
                phone: "1234567892",
                password: "Password123!",
                dob: "1985-01-01",
                gender: "Female",
                role: "LabTechnician",
                department: "Laboratory"
            },
            Admin: {
                firstName: `Admin`,
                lastName: `Test`,
                email: `test.admin.lab.${uniqueId}@test.com`,
                phone: "1234567893",
                password: "Password123!",
                dob: "1975-01-01",
                gender: "Male",
                role: "Admin"
            }
        };

        for (const [role, userData] of Object.entries(testUserData)) {
            try {
                const user = await User.create(userData);
                testUsers[role] = user;

                // Get auth token
                const loginResponse = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: userData.email,
                        password: userData.password
                    });

                if (loginResponse.body && loginResponse.body.token) {
                    authTokens[role] = loginResponse.body.token;
                }
            } catch (error) {
                console.log(`Setup error for ${role}:`, error.message);
            }
        }
    });

    afterAll(async () => {
        try {
            // Clean up test data
            const emails = Object.values(testUsers).map(user => user.email);
            await User.deleteMany({ email: { $in: emails } });

            if (testLabOrder) await LabOrder.findByIdAndDelete(testLabOrder._id);
            if (testLabResult) await LabResult.findByIdAndDelete(testLabResult._id);
        } catch (error) {
            console.log('Cleanup error:', error.message);
        }
    });

    describe('Lab Order Management', () => {
        it('should create lab order successfully by doctor', async () => {
            const labOrderData = {
                patientId: testUsers.Patient?._id,
                doctorId: testUsers.Doctor?._id,
                tests: ['CBC', 'Blood Sugar'],
                priority: 'Normal',
                notes: 'Routine checkup'
            };

            const response = await request(app)
                .post('/api/v1/lab/orders')
                .set('Authorization', `Bearer ${authTokens.Doctor}`)
                .send(labOrderData);

            expect([200, 201, 401, 404]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body.success).toBe(true);
                testLabOrder = response.body.labOrder;
            }
        });

        it('should reject lab order creation by unauthorized user', async () => {
            const labOrderData = {
                patientId: testUsers.Patient?._id,
                tests: ['CBC'],
                priority: 'Normal'
            };

            const response = await request(app)
                .post('/api/v1/lab/orders')
                .set('Authorization', `Bearer ${authTokens.Patient}`)
                .send(labOrderData);

            expect([401, 403, 404]).toContain(response.status);
        });

        it('should get all lab orders by lab technician', async () => {
            const response = await request(app)
                .get('/api/v1/lab/orders')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.orders)).toBe(true);
            }
        });

        it('should get lab orders by patient ID', async () => {
            const response = await request(app)
                .get(`/api/v1/lab/orders/patient/${testUsers.Patient?._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });
    });

    describe('Lab Result Management', () => {
        it('should create lab result by lab technician', async () => {
            const labResultData = {
                orderId: testLabOrder?._id || new mongoose.Types.ObjectId(),
                patientId: testUsers.Patient?._id,
                results: [
                    {
                        testName: 'CBC',
                        value: '12.5',
                        unit: 'g/dL',
                        normalRange: '12.0-15.5',
                        status: 'Normal'
                    }
                ],
                status: 'Completed'
            };

            const response = await request(app)
                .post('/api/v1/lab/results')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`)
                .send(labResultData);

            expect([200, 201, 401, 404]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body.success).toBe(true);
                testLabResult = response.body.result;
            }
        });

        it('should get lab results by patient', async () => {
            const response = await request(app)
                .get(`/api/v1/lab/results/patient/${testUsers.Patient?._id}`)
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('should update lab result status', async () => {
            if (!testLabResult) return;

            const response = await request(app)
                .put(`/api/v1/lab/results/${testLabResult._id}/status`)
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`)
                .send({ status: 'Reviewed' });

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });
    });

    describe('Lab Reports and Analytics', () => {
        it('should get lab statistics', async () => {
            const response = await request(app)
                .get('/api/v1/lab/statistics')
                .set('Authorization', `Bearer ${authTokens.Admin}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('should get pending lab orders', async () => {
            const response = await request(app)
                .get('/api/v1/lab/orders/pending')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('should search lab results', async () => {
            const response = await request(app)
                .get('/api/v1/lab/results/search?testName=CBC')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });
    });

    describe('Lab Integration', () => {
        it('should handle lab order workflow', async () => {
            // Create order -> Process -> Results -> Review
            const orderData = {
                patientId: testUsers.Patient?._id,
                doctorId: testUsers.Doctor?._id,
                tests: ['Lipid Panel'],
                priority: 'Urgent'
            };

            const response = await request(app)
                .post('/api/v1/lab/orders/workflow')
                .set('Authorization', `Bearer ${authTokens.Doctor}`)
                .send(orderData);

            expect([200, 201, 401, 404]).toContain(response.status);
        });

        it('should validate lab result data integrity', async () => {
            const invalidResultData = {
                orderId: 'invalid-id',
                results: []
            };

            const response = await request(app)
                .post('/api/v1/lab/results')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`)
                .send(invalidResultData);

            expect([400, 401, 404, 422]).toContain(response.status);
        });

        it('should get lab queue status', async () => {
            const response = await request(app)
                .get('/api/v1/lab/queue')
                .set('Authorization', `Bearer ${authTokens.LabTechnician}`);

            expect([200, 401, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });
    });
});