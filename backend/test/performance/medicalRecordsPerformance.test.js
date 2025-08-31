// Performance Tests cho Medical Records System
import request from 'supertest';
import app from '../../app.js';
import MedicalRecordSeeder from '../database/seeders/medicalRecordSeeder.js';

describe('Medical Records Performance Tests - Real API', () => {
    let testData;
    let authTokens = {};

    beforeAll(async () => {
        console.log('🚀 Setting up performance tests...');

        // Seed large dataset for performance testing
        testData = await MedicalRecordSeeder.seedLargeDataset();
        authTokens = await getAuthTokens();

        console.log('✅ Performance test setup complete');
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up performance test data...');
        await MedicalRecordSeeder.cleanupTestData();
    });

    test('Large dataset pagination performance', async () => {
        console.log('📊 Testing pagination performance...');

        const startTime = Date.now();

        const response = await request(app)
            .get('/api/v1/medical-records/enhanced?limit=50&page=1')
            .set('Authorization', `Bearer ${authTokens.doctor}`)
            .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`⏱️ Pagination response time: ${responseTime}ms`);

        expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
        expect(response.body.data).toHaveLength(50);
        expect(response.body.pagination.totalRecords).toBeGreaterThan(100);
    });

    test('Search performance with complex queries', async () => {
        console.log('🔍 Testing search performance...');

        const searchQueries = [
            { query: 'headache' },
            { query: 'fever' },
            { query: 'pain' },
            { query: 'Test' },
            {
                query: 'performance',
                dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Active'
            }
        ];

        for (const searchQuery of searchQueries) {
            const startTime = Date.now();

            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${authTokens.doctor}`)
                .send(searchQuery)
                .expect(200);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log(`🔍 Search "${JSON.stringify(searchQuery)}" took ${responseTime}ms`);
            expect(responseTime).toBeLessThan(3000); // Search should complete within 3 seconds
            expect(response.body.success).toBe(true);
        }
    });

    test('Concurrent user access performance', async () => {
        console.log('🚀 Testing concurrent access...');

        const concurrentRequests = Array(10).fill(null).map((_, index) => {
            return request(app)
                .get(`/api/v1/medical-records/enhanced?page=${index + 1}&limit=10`)
                .set('Authorization', `Bearer ${authTokens.doctor}`);
        });

        const startTime = Date.now();
        const responses = await Promise.all(concurrentRequests);
        const endTime = Date.now();

        const totalResponseTime = endTime - startTime;
        console.log(`🚀 ${concurrentRequests.length} concurrent requests took ${totalResponseTime}ms`);
        expect(totalResponseTime).toBeLessThan(5000); // All 10 concurrent requests within 5 seconds

        responses.forEach((response, index) => {
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            console.log(`✅ Request ${index + 1} successful`);
        });
    });

    test('Memory usage during large data operations', async () => {
        console.log('💾 Testing memory usage...');

        const initialMemory = process.memoryUsage();

        // Perform memory-intensive operation
        const response = await request(app)
            .get('/api/v1/medical-records/enhanced?limit=1000&page=1')
            .set('Authorization', `Bearer ${authTokens.doctor}`)
            .expect(200);

        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        const memoryIncreaseInMB = memoryIncrease / 1024 / 1024;

        console.log(`💾 Memory increase: ${memoryIncreaseInMB.toFixed(2)}MB`);

        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('Database query optimization', async () => {
        console.log('🗄️ Testing database performance...');

        const queries = [
            // Simple filter
            '/api/v1/medical-records/enhanced?status=Completed',
            // Date range filter
            `/api/v1/medical-records/enhanced?dateFrom=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
            // Complex pagination
            '/api/v1/medical-records/enhanced?page=5&limit=20',
            // Statistics endpoint
            '/api/v1/medical-records/statistics'
        ];

        for (const queryPath of queries) {
            const startTime = Date.now();

            const response = await request(app)
                .get(queryPath)
                .set('Authorization', `Bearer ${authTokens.doctor}`)
                .expect(200);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log(`🗄️ Query "${queryPath}" took ${responseTime}ms`);
            expect(responseTime).toBeLessThan(2000);
            expect(response.body.success).toBe(true);
        }
    });

    test('Response size optimization', async () => {
        console.log('📦 Testing response size...');

        const response = await request(app)
            .get('/api/v1/medical-records/enhanced?limit=100')
            .set('Authorization', `Bearer ${authTokens.doctor}`)
            .expect(200);

        const responseSize = JSON.stringify(response.body).length;
        const responseSizeInKB = responseSize / 1024;

        console.log(`📦 Response size: ${responseSizeInKB.toFixed(2)}KB for ${response.body.data.length} records`);

        // Response should be reasonably sized
        expect(responseSizeInKB).toBeLessThan(500); // Less than 500KB
        expect(response.body.data.length).toBeLessThanOrEqual(100);
    });

    test('Error handling performance', async () => {
        console.log('❌ Testing error handling performance...');

        const errorCases = [
            '/api/v1/medical-records/enhanced/invalid-id',
            '/api/v1/medical-records/enhanced?page=999999',
            '/api/v1/medical-records/enhanced?limit=10000'
        ];

        for (const errorPath of errorCases) {
            const startTime = Date.now();

            await request(app)
                .get(errorPath)
                .set('Authorization', `Bearer ${authTokens.doctor}`);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log(`❌ Error case "${errorPath}" took ${responseTime}ms`);
            expect(responseTime).toBeLessThan(1000); // Errors should be fast
        }
    });
});

// Load Testing
describe('Medical Records Load Testing', () => {
    let authTokens = {};

    beforeAll(async () => {
        authTokens = await getAuthTokens();
    });

    test('Sustained load test', async () => {
        console.log('🔄 Running sustained load test...');

        const numberOfRequests = 50;
        const requests = [];

        for (let i = 0; i < numberOfRequests; i++) {
            requests.push(
                request(app)
                    .get('/api/v1/medical-records/enhanced?limit=10')
                    .set('Authorization', `Bearer ${authTokens.doctor}`)
            );
        }

        const startTime = Date.now();
        const responses = await Promise.all(requests);
        const endTime = Date.now();

        const totalTime = endTime - startTime;
        const averageTime = totalTime / numberOfRequests;

        console.log(`🔄 ${numberOfRequests} requests completed in ${totalTime}ms`);
        console.log(`📊 Average response time: ${averageTime.toFixed(2)}ms`);

        // All requests should succeed
        responses.forEach((response, index) => {
            expect(response.status).toBe(200);
        });

        // Average response time should be reasonable
        expect(averageTime).toBeLessThan(500);
    });

    test('Spike load test', async () => {
        console.log('⚡ Running spike load test...');

        // Simulate traffic spike
        const waves = 3;
        const requestsPerWave = 20;

        for (let wave = 0; wave < waves; wave++) {
            console.log(`⚡ Wave ${wave + 1}/${waves}`);

            const waveRequests = Array(requestsPerWave).fill(null).map(() =>
                request(app)
                    .get('/api/v1/medical-records/enhanced?limit=5')
                    .set('Authorization', `Bearer ${authTokens.doctor}`)
            );

            const startTime = Date.now();
            const responses = await Promise.all(waveRequests);
            const endTime = Date.now();

            const waveTime = endTime - startTime;
            console.log(`⚡ Wave ${wave + 1} completed in ${waveTime}ms`);

            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // Small delay between waves
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    });
});

async function getAuthTokens() {
    try {
        // Login doctor for performance tests
        const doctorLoginResponse = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'test.doctor@hospital.com',
                password: 'testpassword123'
            });

        if (doctorLoginResponse.status !== 200) {
            throw new Error(`Doctor login failed: ${doctorLoginResponse.body.message}`);
        }

        return {
            doctor: doctorLoginResponse.body.token
        };
    } catch (error) {
        console.error('❌ Error getting auth tokens for performance tests:', error);
        throw error;
    }
}
