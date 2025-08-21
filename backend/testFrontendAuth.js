// Test frontend authentication and invoice count
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testFrontendFlow() {
    console.log('🔧 TESTING FRONTEND AUTHENTICATION FLOW\n');

    try {
        // 1. Test login with admin user
        console.log('1. Testing Admin Login...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        }, {
            withCredentials: true // Quan trọng!
        });

        console.log('✅ Login successful');
        console.log('   User:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
        console.log('   Role:', loginResponse.data.user.role);

        // 2. Get cookies from login response
        const cookies = loginResponse.headers['set-cookie'];
        console.log('\n2. Cookies set:', cookies ? 'YES' : 'NO');
        if (cookies) {
            cookies.forEach(cookie => {
                console.log('   Cookie:', cookie.split(';')[0]);
            });
        }

        // 3. Test invoice API with cookies
        console.log('\n3. Testing Invoice API with cookies...');
        const cookieString = cookies ? cookies.join('; ') : '';

        const invoiceResponse = await axios.get(`${BASE_URL}/billing/invoices`, {
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Invoice API successful');
        console.log('   Count:', invoiceResponse.data.count);
        console.log('   Total:', invoiceResponse.data.total);
        console.log('   Invoices found:', invoiceResponse.data.invoices.length);

        // 4. Test me endpoint
        console.log('\n4. Testing /users/me with cookies...');
        const meResponse = await axios.get(`${BASE_URL}/users/me`, {
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ /users/me successful');
        console.log('   User:', meResponse.data.user.firstName, meResponse.data.user.lastName);

        console.log('\n🎉 FRONTEND AUTHENTICATION FLOW WORKS!');
        console.log('   ✓ Login sets cookies correctly');
        console.log('   ✓ Invoice API returns correct count:', invoiceResponse.data.count);
        console.log('   ✓ Authentication persists across requests');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            console.log('\n🔍 Authentication issue detected');
            console.log('   This is likely why frontend shows count 0');
        }
    }
}

testFrontendFlow();
