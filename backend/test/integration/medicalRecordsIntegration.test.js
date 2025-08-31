// Medical Records API Integration Tests - REAL API Testing
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import MedicalRecordSeeder from '../database/seeders/medicalRecordSeeder.js';

describe('Medical Records API Integration Tests - REAL API', () => {
    let testData;
    let doctorToken;
    let patientToken;

    beforeAll(async () => {
        // Connect to test database
        if (!mongoose.connection.readyState) {
            const mongoUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI;
            await mongoose.connect(mongoUri);
            console.log('✅ Connected to test database');
        }

        // Seed real test data
        console.log('🌱 Seeding test data...');
        testData = await MedicalRecordSeeder.seedTestData();

        // Get real authentication tokens
        console.log('🔐 Getting authentication tokens...');
        const tokens = await getRealAuthToken();
        doctorToken = tokens.doctor;
        patientToken = tokens.patient;

        console.log('✅ Setup complete');
    });

    afterAll(async () => {
        // Cleanup test data
        console.log('🧹 Cleaning up test data...');
        await MedicalRecordSeeder.cleanupTestData();
        console.log('✅ Cleanup complete');
    });

    describe('POST /api/v1/medical-records/enhanced - Real API', () => {
        test('Doctor can create medical record with real data', async () => {
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'Integration test complaint',
                historyOfPresentIllness: 'Patient reports symptoms during integration test',
                assessment: 'Test assessment for integration'
            };

            console.log('📝 Creating medical record with data:', recordData);

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.appointmentId).toBe(recordData.appointmentId);
            expect(response.body.data.patientId).toBeDefined();
            expect(response.body.data.clinicalAssessment.chiefComplaint).toBe(recordData.chiefComplaint);

            // Verify data actually saved to database
            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');
            const savedRecord = await EnhancedMedicalRecord.findById(response.body.data._id);
            expect(savedRecord).toBeTruthy();
            expect(savedRecord.clinicalAssessment.chiefComplaint).toBe(recordData.chiefComplaint);

            console.log('✅ Medical record created successfully');
        });

        test('Patient cannot create medical record - Real API', async () => {
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                chiefComplaint: 'Unauthorized attempt'
            };

            console.log('🚫 Testing unauthorized access...');

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(recordData)
                .expect(403);

            console.log('✅ Unauthorized access properly blocked');
        });

        test('Validation works for required fields', async () => {
            console.log('🔍 Testing validation...');

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send({}) // Empty data
                .expect(400);

            console.log('✅ Validation working correctly');
        });
    });

    describe('GET /api/v1/medical-records/enhanced - Real API', () => {
        test('Doctor can view medical records with real data', async () => {
            console.log('📋 Testing medical records retrieval...');

            const response = await request(app)
                .get('/api/v1/medical-records/enhanced?limit=10&page=1')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.totalRecords).toBeGreaterThanOrEqual(0);

            // Verify real data structure
            if (response.body.data.length > 0) {
                const record = response.body.data[0];
                expect(record._id).toBeDefined();
                expect(record.patientId).toBeDefined();
                expect(record.patientId.firstName).toBeDefined();
                expect(record.doctorId).toBeDefined();
                expect(record.createdAt).toBeDefined();
            }

            console.log(`✅ Retrieved ${response.body.data.length} medical records`);
        });

        test('Patient can only view own records - Real API', async () => {
            console.log('🔐 Testing patient access control...');

            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${patientToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // All returned records should belong to the test patient
            response.body.data.forEach(record => {
                expect(record.patientId._id).toBe(testData.testPatient._id.toString());
            });

            console.log('✅ Patient access control working correctly');
        });

        test('Pagination works correctly', async () => {
            console.log('📄 Testing pagination...');

            const response = await request(app)
                .get('/api/v1/medical-records/enhanced?limit=2&page=1')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.pagination.currentPage).toBe(1);
            expect(response.body.data.length).toBeLessThanOrEqual(2);

            console.log('✅ Pagination working correctly');
        });
    });

    describe('Medical Record Search - Real API', () => {
        test('Search by diagnosis works with real data', async () => {
            const searchData = {
                query: 'fever',
                dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            console.log('🔍 Testing search functionality...');

            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(searchData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);

            console.log(`✅ Search returned ${response.body.data.length} results`);
        });

        test('Search with patient name filter', async () => {
            const searchData = {
                patientName: 'Test'
            };

            console.log('👤 Testing patient name search...');

            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(searchData)
                .expect(200);

            expect(response.body.success).toBe(true);

            console.log('✅ Patient name search working');
        });
    });

    describe('Medical Record Statistics - Real API', () => {
        test('Statistics endpoint returns valid data', async () => {
            console.log('📊 Testing statistics...');

            const response = await request(app)
                .get('/api/v1/medical-records/statistics')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(typeof response.body.data.totalRecords).toBe('number');
            expect(typeof response.body.data.activeCases).toBe('number');

            console.log('✅ Statistics working correctly');
        });
    });

    describe('Error Handling - Real API', () => {
        test('Invalid ID returns 400', async () => {
            console.log('❌ Testing error handling...');

            await request(app)
                .get('/api/v1/medical-records/enhanced/invalid-id')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(400);

            console.log('✅ Error handling working');
        });

        test('Unauthorized access returns 401', async () => {
            await request(app)
                .get('/api/v1/medical-records/enhanced')
                .expect(401);

            console.log('✅ Authentication working');
        });
    });
});

// Performance Tests
describe('Medical Records Performance Tests - Real API', () => {
    let testData;
    let doctorToken;

    beforeAll(async () => {
        // Seed large dataset for performance testing
        console.log('🚀 Setting up performance tests...');
        testData = await MedicalRecordSeeder.seedLargeDataset();

        const tokens = await getRealAuthToken();
        doctorToken = tokens.doctor;
    });

    afterAll(async () => {
        await MedicalRecordSeeder.cleanupTestData();
    });

    test('Large dataset pagination performance', async () => {
        const startTime = Date.now();

        const response = await request(app)
            .get('/api/v1/medical-records/enhanced?limit=50&page=1')
            .set('Authorization', `Bearer ${doctorToken}`)
            .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`⏱️ Response time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
        expect(response.body.data).toHaveLength(50);
        expect(response.body.pagination.totalRecords).toBeGreaterThan(100);
    });

    test('Search performance with complex queries', async () => {
        const searchQueries = [
            { query: 'headache' },
            { query: 'fever' },
            { query: 'pain' }
        ];

        for (const searchQuery of searchQueries) {
            const startTime = Date.now();

            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(searchQuery)
                .expect(200);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log(`🔍 Search "${searchQuery.query}" took ${responseTime}ms`);
            expect(responseTime).toBeLessThan(5000); // Search should complete within 5 seconds
            expect(response.body.success).toBe(true);
        }
    });

    test('Concurrent user access performance', async () => {
        const concurrentRequests = Array(5).fill(null).map((_, index) => {
            return request(app)
                .get(`/api/v1/medical-records/enhanced?page=${index + 1}&limit=10`)
                .set('Authorization', `Bearer ${doctorToken}`);
        });

        const startTime = Date.now();
        const responses = await Promise.all(concurrentRequests);
        const endTime = Date.now();

        const totalResponseTime = endTime - startTime;
        console.log(`🚀 ${concurrentRequests.length} concurrent requests took ${totalResponseTime}ms`);
        expect(totalResponseTime).toBeLessThan(8000); // All concurrent requests within 8 seconds

        responses.forEach(response => {
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});

// Helper function to get real authentication token
async function getRealAuthToken() {
    try {
        // Login doctor
        const doctorResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.doctor@hospital.com',
                password: 'testpassword123'
            });

        if (doctorResponse.status !== 200) {
            throw new Error(`Doctor login failed: ${doctorResponse.body.message}`);
        }

        // Login patient
        const patientResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.patient@email.com',
                password: 'testpassword123'
            });

        if (patientResponse.status !== 200) {
            throw new Error(`Patient login failed: ${patientResponse.body.message}`);
        }

        return {
            doctor: doctorResponse.body.token,
            patient: patientResponse.body.token
        };
    } catch (error) {
        console.error('❌ Error getting auth tokens:', error);
        throw error;
    }
}
