// Simple test with manual JWT header
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function simpleTest() {
    console.log('🔬 Simple JWT test...\n');

    try {
        // Step 1: Login and get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token length:', token.length);

        // Step 2: Test authenticated endpoint with token in header
        console.log('\n2. Testing authenticated endpoint...');
        const meResponse = await axios.get(`${BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ /users/me successful:', {
            name: `${meResponse.data.user.firstName} ${meResponse.data.user.lastName}`,
            role: meResponse.data.user.role
        });

        // Step 3: Test lab tests endpoint
        console.log('\n3. Testing lab tests endpoint...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Lab tests successful:', {
            count: testsResponse.data.tests?.length || 0
        });

        // Step 4: Test lab queue endpoint
        console.log('\n4. Testing lab queue endpoint...');
        const queueResponse = await axios.get(`${BASE_URL}/lab/queue`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Lab queue successful:', {
            count: queueResponse.data.orders?.length || 0
        });

        console.log('\n🎉 All JWT authentication tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            headers: error.config?.headers
        });
    }
}

simpleTest();
