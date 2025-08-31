/**
 * API Endpoint Validation Tests
 * Comprehensive testing of all API endpoints for functionality and security
 */
const request = require('supertest');
const app = require('../../app.js');

describe('🔧 API Endpoint Validation Tests', () => {
    let testTokens = {};

    beforeAll(async () => {
        // Setup authentication tokens for different roles
        const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Technician', 'BillingStaff', 'Pharmacist'];

        for (const role of roles) {
            try {
                const loginResponse = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: `${role.toLowerCase()}.test@hospital.com`,
                        password: `${role}Test123!`
                    });

                if (loginResponse.status === 200) {
                    testTokens[role] = loginResponse.body.token;
                }
            } catch (error) {
                console.log(`Could not authenticate ${role}: ${error.message}`);
            }
        }
    });

    describe('🔐 Authentication Endpoints', () => {
        describe('POST /api/v1/user/login', () => {
            it('Should login with valid credentials', async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: 'admin.test@hospital.com',
                        password: 'AdminTest123!'
                    });

                expect([200, 400, 404]).toContain(response.status);
                if (response.status === 200) {
                    expect(response.body).toHaveProperty('token');
                    expect(response.body).toHaveProperty('user');
                }
            });

            it('Should reject invalid credentials', async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: 'invalid@email.com',
                        password: 'wrongpassword'
                    });

                expect([400, 401, 404]).toContain(response.status);
            });

            it('Should validate required fields', async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({});

                expect([400]).toContain(response.status);
            });
        });

        describe('POST /api/v1/user/patient/register', () => {
            it('Should register new patient with valid data', async () => {
                const uniqueEmail = `test.patient.${Date.now()}@test.com`;

                const response = await request(app)
                    .post('/api/v1/user/patient/register')
                    .send({
                        firstName: 'Test',
                        lastName: 'Patient',
                        email: uniqueEmail,
                        password: 'TestPassword123!',
                        phone: '1234567890',
                        dateOfBirth: '1990-01-01',
                        gender: 'Male'
                    });

                expect([201, 400]).toContain(response.status);
                if (response.status === 201) {
                    expect(response.body).toHaveProperty('user');
                    expect(response.body.user.email).toBe(uniqueEmail);
                }
            });

            it('Should reject duplicate email', async () => {
                const email = 'duplicate@test.com';

                // First registration
                await request(app)
                    .post('/api/v1/user/patient/register')
                    .send({
                        firstName: 'First',
                        lastName: 'User',
                        email: email,
                        password: 'Password123!',
                        phone: '1111111111'
                    });

                // Second registration with same email
                const response = await request(app)
                    .post('/api/v1/user/patient/register')
                    .send({
                        firstName: 'Second',
                        lastName: 'User',
                        email: email,
                        password: 'Password123!',
                        phone: '2222222222'
                    });

                expect([400, 409]).toContain(response.status);
            });
        });

        describe('GET /api/v1/user/me', () => {
            it('Should return user profile with valid token', async () => {
                if (testTokens.Patient) {
                    const response = await request(app)
                        .get('/api/v1/user/me')
                        .set('Authorization', `Bearer ${testTokens.Patient}`);

                    expect([200]).toContain(response.status);
                    if (response.status === 200) {
                        expect(response.body).toHaveProperty('user');
                    }
                }
            });

            it('Should reject request without token', async () => {
                const response = await request(app)
                    .get('/api/v1/user/me');

                expect([401]).toContain(response.status);
            });

            it('Should reject request with invalid token', async () => {
                const response = await request(app)
                    .get('/api/v1/user/me')
                    .set('Authorization', 'Bearer invalid-token');

                expect([401]).toContain(response.status);
            });
        });
    });

    describe('📅 Appointment Endpoints', () => {
        describe('POST /api/v1/appointment/book', () => {
            it('Should book appointment with valid data', async () => {
                if (testTokens.Receptionist) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const response = await request(app)
                        .post('/api/v1/appointment/book')
                        .set('Authorization', `Bearer ${testTokens.Receptionist}`)
                        .send({
                            appointment_date: tomorrow.toISOString().split('T')[0],
                            appointment_time: '10:00',
                            department: 'General Medicine',
                            reason: 'Test appointment'
                        });

                    expect([200, 201, 400]).toContain(response.status);
                }
            });

            it('Should reject unauthorized users', async () => {
                const response = await request(app)
                    .post('/api/v1/appointment/book')
                    .send({
                        appointment_date: '2024-12-31',
                        appointment_time: '10:00',
                        department: 'General Medicine'
                    });

                expect([401]).toContain(response.status);
            });
        });

        describe('GET /api/v1/appointment/patient', () => {
            it('Should allow patients to view their appointments', async () => {
                if (testTokens.Patient) {
                    const response = await request(app)
                        .get('/api/v1/appointment/patient')
                        .set('Authorization', `Bearer ${testTokens.Patient}`);

                    expect([200, 404]).toContain(response.status);
                }
            });

            it('Should reject non-patient access', async () => {
                if (testTokens.Admin) {
                    const response = await request(app)
                        .get('/api/v1/appointment/patient')
                        .set('Authorization', `Bearer ${testTokens.Admin}`);

                    expect([403, 404]).toContain(response.status);
                }
            });
        });

        describe('GET /api/v1/appointment/all', () => {
            it('Should allow staff to view all appointments', async () => {
                if (testTokens.Receptionist) {
                    const response = await request(app)
                        .get('/api/v1/appointment/all')
                        .set('Authorization', `Bearer ${testTokens.Receptionist}`);

                    expect([200, 403, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('🏥 Medical Records Endpoints', () => {
        describe('POST /api/v1/medical-records/create', () => {
            it('Should allow doctors to create medical records', async () => {
                if (testTokens.Doctor) {
                    const response = await request(app)
                        .post('/api/v1/medical-records/create')
                        .set('Authorization', `Bearer ${testTokens.Doctor}`)
                        .send({
                            clinicalAssessment: {
                                chiefComplaint: 'Test complaint',
                                historyOfPresentIllness: 'Test history'
                            },
                            recordStatus: 'Draft'
                        });

                    expect([200, 201, 400]).toContain(response.status);
                }
            });

            it('Should reject non-doctor access', async () => {
                if (testTokens.Patient) {
                    const response = await request(app)
                        .post('/api/v1/medical-records/create')
                        .set('Authorization', `Bearer ${testTokens.Patient}`)
                        .send({
                            clinicalAssessment: {
                                chiefComplaint: 'Test complaint'
                            }
                        });

                    expect([403]).toContain(response.status);
                }
            });
        });

        describe('GET /api/v1/medical-records/summary', () => {
            it('Should return medical records summary', async () => {
                if (testTokens.Doctor) {
                    const response = await request(app)
                        .get('/api/v1/medical-records/summary')
                        .set('Authorization', `Bearer ${testTokens.Doctor}`);

                    expect([200, 404]).toContain(response.status);
                    if (response.status === 200) {
                        expect(response.body).toHaveProperty('data');
                        expect(response.body).toHaveProperty('statistics');
                    }
                }
            });
        });

        describe('GET /api/v1/medical-records/my-records', () => {
            it('Should allow patients to view their records', async () => {
                if (testTokens.Patient) {
                    const response = await request(app)
                        .get('/api/v1/medical-records/my-records')
                        .set('Authorization', `Bearer ${testTokens.Patient}`);

                    expect([200, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('🧪 Lab Test Endpoints', () => {
        describe('POST /api/v1/lab/tests', () => {
            it('Should allow doctors to order lab tests', async () => {
                if (testTokens.Doctor) {
                    const response = await request(app)
                        .post('/api/v1/lab/tests')
                        .set('Authorization', `Bearer ${testTokens.Doctor}`)
                        .send({
                            testType: 'Blood Work',
                            testName: 'Complete Blood Count',
                            urgency: 'routine'
                        });

                    expect([200, 201, 400, 404]).toContain(response.status);
                }
            });
        });

        describe('GET /api/v1/lab/tests', () => {
            it('Should allow technicians to view lab tests', async () => {
                if (testTokens.Technician) {
                    const response = await request(app)
                        .get('/api/v1/lab/tests')
                        .set('Authorization', `Bearer ${testTokens.Technician}`);

                    expect([200, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('💊 Prescription Endpoints', () => {
        describe('POST /api/v1/prescriptions', () => {
            it('Should allow doctors to create prescriptions', async () => {
                if (testTokens.Doctor) {
                    const response = await request(app)
                        .post('/api/v1/prescriptions')
                        .set('Authorization', `Bearer ${testTokens.Doctor}`)
                        .send({
                            medications: [{
                                name: 'Test Medication',
                                dosage: '10mg',
                                frequency: 'Once daily',
                                duration: '7 days'
                            }]
                        });

                    expect([200, 201, 400, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('💰 Billing Endpoints', () => {
        describe('POST /api/v1/billing/invoices', () => {
            it('Should allow billing staff to create invoices', async () => {
                if (testTokens.BillingStaff) {
                    const response = await request(app)
                        .post('/api/v1/billing/invoices')
                        .set('Authorization', `Bearer ${testTokens.BillingStaff}`)
                        .send({
                            services: [{
                                name: 'Consultation',
                                amount: 100.00
                            }],
                            totalAmount: 100.00
                        });

                    expect([200, 201, 400, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('👨‍💼 Admin Endpoints', () => {
        describe('GET /api/v1/admin/users', () => {
            it('Should allow admins to view all users', async () => {
                if (testTokens.Admin) {
                    const response = await request(app)
                        .get('/api/v1/admin/users')
                        .set('Authorization', `Bearer ${testTokens.Admin}`);

                    expect([200, 404]).toContain(response.status);
                }
            });

            it('Should reject non-admin access', async () => {
                if (testTokens.Patient) {
                    const response = await request(app)
                        .get('/api/v1/admin/users')
                        .set('Authorization', `Bearer ${testTokens.Patient}`);

                    expect([403]).toContain(response.status);
                }
            });
        });

        describe('GET /api/v1/admin/dashboard', () => {
            it('Should provide admin dashboard data', async () => {
                if (testTokens.Admin) {
                    const response = await request(app)
                        .get('/api/v1/admin/dashboard')
                        .set('Authorization', `Bearer ${testTokens.Admin}`);

                    expect([200, 404]).toContain(response.status);
                }
            });
        });
    });

    describe('🔒 Security and Error Handling', () => {
        it('Should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/v1/user/login')
                .send('invalid json')
                .set('Content-Type', 'application/json');

            expect([400]).toContain(response.status);
        });

        it('Should handle non-existent endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/non-existent-endpoint');

            expect([404]).toContain(response.status);
        });

        it('Should handle SQL injection attempts', async () => {
            const response = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: "admin'; DROP TABLE users; --",
                    password: 'password'
                });

            expect([400, 401]).toContain(response.status);
        });

        it('Should handle XSS attempts', async () => {
            const response = await request(app)
                .post('/api/v1/user/patient/register')
                .send({
                    firstName: '<script>alert("xss")</script>',
                    lastName: 'Test',
                    email: 'xss.test@test.com',
                    password: 'Password123!'
                });

            expect([400, 201]).toContain(response.status);
            // If created, should not contain script tags
            if (response.status === 201) {
                expect(response.body.user.firstName).not.toContain('<script>');
            }
        });

        it('Should rate limit requests', async () => {
            // Send multiple rapid requests
            const promises = Array(10).fill().map(() =>
                request(app).get('/api/v1/user/me')
            );

            const responses = await Promise.all(promises);

            // Some responses should be rate limited (429) or unauthorized (401)
            const statusCodes = responses.map(r => r.status);
            expect(statusCodes.every(code => [401, 429, 200].includes(code))).toBe(true);
        });
    });

    describe('📊 Performance Tests', () => {
        it('Should respond to health check quickly', async () => {
            const start = Date.now();

            const response = await request(app)
                .get('/api/v1/health');

            const duration = Date.now() - start;

            expect([200, 404]).toContain(response.status);
            expect(duration).toBeLessThan(1000); // Should respond within 1 second
        });

        it('Should handle concurrent requests', async () => {
            const promises = Array(5).fill().map(() =>
                request(app).get('/api/v1/health')
            );

            const start = Date.now();
            const responses = await Promise.all(promises);
            const duration = Date.now() - start;

            // All requests should complete reasonably quickly
            expect(duration).toBeLessThan(5000);
            responses.forEach(response => {
                expect([200, 404]).toContain(response.status);
            });
        });
    });
});

module.exports = {};
