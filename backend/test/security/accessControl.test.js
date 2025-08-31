// Access Control Tests cho Medical Records System
const request = require('supertest');
const app = require('../../app.js');
const MedicalRecordSeeder = require('../database/seeders/medicalRecordSeeder');

describe('Medical Records Access Control Tests', () => {
    let testData;
    let tokens = {};

    beforeAll(async () => {
        console.log('🔐 Setting up access control tests...');

        // Seed test data
        testData = await MedicalRecordSeeder.seedTestData();

        // Get authentication tokens for different roles
        tokens = await getAllRoleTokens();

        console.log('✅ Access control test setup complete');
    });

    afterAll(async () => {
        await MedicalRecordSeeder.cleanupTestData();
    });

    describe('Doctor Access Control', () => {
        test('Doctor can create medical records', async () => {
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'Doctor access test',
                historyOfPresentIllness: 'Testing doctor permissions'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .send(recordData)
                .expect(201);

            expect(response.body.success).toBe(true);
            console.log('✅ Doctor can create medical records');
        });

        test('Doctor can view medical records', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            console.log('✅ Doctor can view medical records');
        });

        test('Doctor can search medical records', async () => {
            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .send({ query: 'test' })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ Doctor can search medical records');
        });

        test('Doctor can view statistics', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/statistics')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ Doctor can view statistics');
        });
    });

    describe('Patient Access Control', () => {
        test('Patient cannot create medical records', async () => {
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                chiefComplaint: 'Patient unauthorized attempt'
            };

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.patient}`)
                .send(recordData)
                .expect(403);

            console.log('✅ Patient cannot create medical records');
        });

        test('Patient can view only own records', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.patient}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // All records should belong to the patient
            response.body.data.forEach(record => {
                expect(record.patientId._id).toBe(testData.testPatient._id.toString());
            });

            console.log('✅ Patient can only view own records');
        });

        test('Patient has limited search capabilities', async () => {
            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${tokens.patient}`)
                .send({ query: 'test' })
                .expect(200);

            expect(response.body.success).toBe(true);

            // All search results should belong to the patient
            response.body.data.forEach(record => {
                expect(record.patientId._id).toBe(testData.testPatient._id.toString());
            });

            console.log('✅ Patient has limited search capabilities');
        });

        test('Patient can view own statistics', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/statistics')
                .set('Authorization', `Bearer ${tokens.patient}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ Patient can view own statistics');
        });
    });

    describe('Unauthorized Access Control', () => {
        test('No token returns 401', async () => {
            await request(app)
                .get('/api/v1/medical-records/enhanced')
                .expect(401);

            console.log('✅ No token properly rejected');
        });

        test('Invalid token returns 401', async () => {
            await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            console.log('✅ Invalid token properly rejected');
        });

        test('Expired token returns 401', async () => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid';

            await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);

            console.log('✅ Expired token properly rejected');
        });
    });

    describe('Role-based Endpoint Access', () => {
        const roleEndpoints = {
            'Doctor': {
                allowed: [
                    'GET /api/v1/medical-records/enhanced',
                    'POST /api/v1/medical-records/enhanced',
                    'POST /api/v1/medical-records/search',
                    'GET /api/v1/medical-records/statistics'
                ],
                forbidden: []
            },
            'Patient': {
                allowed: [
                    'GET /api/v1/medical-records/enhanced',
                    'POST /api/v1/medical-records/search',
                    'GET /api/v1/medical-records/statistics'
                ],
                forbidden: [
                    'POST /api/v1/medical-records/enhanced'
                ]
            }
        };

        Object.entries(roleEndpoints).forEach(([role, endpoints]) => {
            describe(`${role} Endpoint Access`, () => {
                endpoints.allowed.forEach(endpoint => {
                    test(`${role} can access ${endpoint}`, async () => {
                        const [method, path] = endpoint.split(' ');
                        const token = tokens[role.toLowerCase()];

                        let requestAgent = request(app);

                        if (method === 'GET') {
                            requestAgent = requestAgent.get(path);
                        } else if (method === 'POST') {
                            requestAgent = requestAgent.post(path);
                        }

                        const response = await requestAgent
                            .set('Authorization', `Bearer ${token}`)
                            .send({});

                        expect(response.status).not.toBe(403);
                        console.log(`✅ ${role} can access ${endpoint}`);
                    });
                });

                endpoints.forbidden.forEach(endpoint => {
                    test(`${role} cannot access ${endpoint}`, async () => {
                        const [method, path] = endpoint.split(' ');
                        const token = tokens[role.toLowerCase()];

                        let requestAgent = request(app);

                        if (method === 'GET') {
                            requestAgent = requestAgent.get(path);
                        } else if (method === 'POST') {
                            requestAgent = requestAgent.post(path);
                        }

                        await requestAgent
                            .set('Authorization', `Bearer ${token}`)
                            .send({})
                            .expect(403);

                        console.log(`✅ ${role} cannot access ${endpoint}`);
                    });
                });
            });
        });
    });

    describe('Data Isolation Tests', () => {
        test('Patients cannot access other patients data', async () => {
            // Create another patient and medical record
            const { User } = await import('../../models/userScheme.js');
            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            const otherPatient = await User.create({
                firstName: 'Other',
                lastName: 'Patient',
                email: 'other.patient@test.com',
                role: 'Patient',
                phone: '9876543210',
                password: '$2b$10$3Xe8ZJ0OkWpG1V1ZJ9G3N.OjWO1P8M2V9NMQyoQ3OWy2.yZ8c8K3K',
                isTestData: true
            });

            const otherRecord = await EnhancedMedicalRecord.create({
                appointmentId: testData.testAppointment._id,
                patientId: otherPatient._id,
                doctorId: testData.testDoctor._id,
                encounterId: testData.testAppointment._id,
                clinicalAssessment: {
                    chiefComplaint: 'Other patient record',
                    historyOfPresentIllness: 'Should not be accessible',
                    assessedBy: testData.testDoctor._id
                },
                recordStatus: 'Completed',
                isTestData: true
            });

            // Test patient should not see other patient's record
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.patient}`)
                .expect(200);

            const otherPatientRecords = response.body.data.filter(
                record => record.patientId._id === otherPatient._id.toString()
            );

            expect(otherPatientRecords).toHaveLength(0);
            console.log('✅ Patients cannot access other patients data');

            // Cleanup
            await EnhancedMedicalRecord.findByIdAndDelete(otherRecord._id);
            await User.findByIdAndDelete(otherPatient._id);
        });

        test('Doctors can only see their own patients records', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // All records should be associated with the doctor
            response.body.data.forEach(record => {
                expect(record.doctorId._id).toBe(testData.testDoctor._id.toString());
            });

            console.log('✅ Doctors can only see their own patients records');
        });
    });

    describe('Security Headers and Validation', () => {
        test('API includes security headers', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.doctor}`);

            // Check for common security headers
            expect(response.headers['x-content-type-options']).toBeDefined();
            expect(response.headers['x-frame-options']).toBeDefined();

            console.log('✅ Security headers present');
        });

        test('Input validation prevents injection', async () => {
            const maliciousData = {
                patientId: testData.testPatient._id.toString(),
                chiefComplaint: '<script>alert("xss")</script>',
                historyOfPresentIllness: '{ "$where": "this.password" }'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${tokens.doctor}`)
                .send(maliciousData);

            // Should either sanitize input or reject malicious content
            if (response.status === 201) {
                expect(response.body.data.clinicalAssessment.chiefComplaint)
                    .not.toContain('<script>');
            }

            console.log('✅ Input validation working');
        });
    });
});

async function getAllRoleTokens() {
    try {
        // Doctor login
        const doctorResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.doctor@hospital.com',
                password: 'testpassword123'
            });

        // Patient login
        const patientResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.patient@email.com',
                password: 'testpassword123'
            });

        return {
            doctor: doctorResponse.body.token,
            patient: patientResponse.body.token
        };
    } catch (error) {
        console.error('❌ Error getting role tokens:', error);
        throw error;
    }
}
