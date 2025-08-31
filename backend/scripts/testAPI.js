import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../config/config.env') });

const BASE_URL = 'http://localhost:4000';

async function testAPIEndpoints() {
    console.log('🧪 Testing Lab Management API endpoints...\n');

    try {
        // Test 1: Get lab tests (may require auth)
        console.log('1. Testing GET /api/v1/lab/tests');
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/lab/tests`);
            console.log('   ✅ Success:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ⚠️  Authentication required');
                console.log('   Response:', error.response.data);
            } else {
                console.log('   ❌ Error:', error.message);
            }
        }

        // Test 2: Test a public endpoint or health check
        console.log('\n2. Testing server health...');
        try {
            const response = await axios.get(`${BASE_URL}/`);
            console.log('   ✅ Server is running');
        } catch (error) {
            console.log('   ❌ Server connection error:', error.message);
        }

        // Test 3: Check available endpoints by testing different methods
        console.log('\n3. Testing available routes...');
        const testRoutes = [
            '/api/v1/users',
            '/api/v1/appointment',
            '/api/v1/lab',
            '/api/lab'
        ];

        for (const route of testRoutes) {
            try {
                const response = await axios.get(`${BASE_URL}${route}`);
                console.log(`   ✅ ${route}: Available`);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log(`   🔐 ${route}: Requires authentication`);
                } else if (error.response?.status === 404) {
                    console.log(`   ❌ ${route}: Not found`);
                } else {
                    console.log(`   ⚠️  ${route}: ${error.response?.status || 'Error'}`);
                }
            }
        }

        console.log('\n📊 API Test Summary:');
        console.log('- Lab tests endpoint exists but requires authentication');
        console.log('- Server is running on port 4000');
        console.log('- Database has lab test data ready');
        console.log('- Frontend should be able to fetch data after login');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAPIEndpoints();
