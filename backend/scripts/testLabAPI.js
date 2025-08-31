// Test Lab API endpoints without authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function testLabAPI() {
    console.log('🔬 Testing Lab API endpoints...\n');

    try {
        // Test 1: Get lab tests (should work without auth)
        console.log('1. Testing GET /lab/tests...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`);
        console.log('✅ Lab tests retrieved:', {
            count: testsResponse.data.tests?.length || 0,
            sample: testsResponse.data.tests?.[0]?.testName || 'No tests found'
        });

        // Test 2: Check lab queue (should work without auth for testing)
        console.log('\n2. Testing GET /lab/queue...');
        const queueResponse = await axios.get(`${BASE_URL}/lab/queue`);
        console.log('✅ Lab queue retrieved:', {
            count: queueResponse.data.orders?.length || 0,
            message: queueResponse.data.message || 'Success'
        });

        console.log('\n🎉 Lab API tests completed successfully!');

    } catch (error) {
        console.error('❌ Lab API test failed:', {
            endpoint: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
}

testLabAPI();
