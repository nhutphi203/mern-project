// Simple test without authentication
const request = require('supertest');

// Import Express app with dynamic import for ES modules compatibility
let app;

beforeAll(async () => {
    // Dynamic import for ES modules
    const appModule = await import('../app.js');
    app = appModule.default;
});

describe('Basic API Tests - No Auth Required', () => {
    test('Should return API health check', async () => {
        const response = await request(app)
            .get('/api/v1/users/health/check')
            .expect(200);
            
        console.log('✅ API health check response:', response.body);
    });
    
    test('Should handle 404 for non-existent route', async () => {
        const response = await request(app)
            .get('/api/v1/non-existent-route')
            .expect(404);
            
        console.log('✅ 404 response:', response.body);
    });
});

module.exports = {};
