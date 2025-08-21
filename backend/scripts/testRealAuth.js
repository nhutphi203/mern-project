// Fixed Authentication Test Script
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:4000/api/v1';

const testRealAuthentication = async () => {
    try {
        console.log('🔐 TESTING REAL AUTHENTICATION SYSTEM\n');

        // Test 1: Login with ACTUAL database credentials
        console.log('1️⃣ Testing Real Database Authentication...');

        const realCredentials = [
            {
                email: 'phinhut2003@gmail.com',
                password: '11111111',
                role: 'Patient',
                expected: 'Patient'
            },
            {
                email: 'admin@hospital.com',
                password: 'password123',
                role: 'Admin',
                expected: 'Admin'
            },
            {
                email: 'doctor@hospital.com',
                password: 'password123',
                role: 'Doctor',
                expected: 'Doctor'
            }
        ];

        for (const creds of realCredentials) {
            console.log(`\n🧪 Testing: ${creds.email} as ${creds.role}`);

            try {
                const response = await axios.post(`${BASE_URL}/users/login`, {
                    email: creds.email,
                    password: creds.password,
                    role: creds.role
                });

                if (response.data.success) {
                    const user = response.data.user;
                    const token = response.data.token;

                    console.log(`✅ Login Success:`);
                    console.log(`   User: ${user.firstName} ${user.lastName}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Role: ${user.role}`);
                    console.log(`   Expected: ${creds.expected}`);
                    console.log(`   Role Match: ${user.role === creds.expected ? '✅' : '❌'}`);

                    // Decode JWT to verify content
                    if (token) {
                        const decoded = jwt.decode(token);
                        console.log(`   JWT Role: ${decoded.role}`);
                        console.log(`   JWT Valid: ${decoded.role === user.role ? '✅' : '❌'}`);
                    }

                    // Test API access with this token
                    await testAPIAccess(token, user.role, creds.email);

                } else {
                    console.log(`❌ Login Failed: ${response.data.message}`);
                }

            } catch (error) {
                console.log(`❌ Login Error: ${error.response?.data?.message || error.message}`);
            }
        }

        console.log('\n🎯 SUMMARY:');
        console.log('If all logins work correctly but frontend still shows wrong dashboard,');
        console.log('the issue is in FRONTEND authentication handling, not backend.');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
};

const testAPIAccess = async (token, userRole, email) => {
    console.log(`   🔑 Testing API access for ${userRole}...`);

    const testEndpoints = [
        {
            url: '/users/me',
            method: 'GET',
            expectSuccess: true,
            description: 'Get own profile'
        },
        {
            url: '/medical-records/enhanced',
            method: 'GET',
            expectSuccess: ['Doctor', 'Admin'].includes(userRole),
            description: 'Access medical records'
        },
        {
            url: '/icd10/search?query=diabetes',
            method: 'GET',
            expectSuccess: ['Doctor', 'Admin'].includes(userRole),
            description: 'Search ICD-10 codes'
        }
    ];

    for (const endpoint of testEndpoints) {
        try {
            const response = await axios({
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.url}`,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const success = response.data.success !== false;
            const expected = endpoint.expectSuccess;
            const result = success === expected ? '✅' : '❌';

            console.log(`     ${result} ${endpoint.description}: ${success ? 'Access' : 'Denied'}`);

        } catch (error) {
            const denied = error.response?.status === 403 || error.response?.status === 401;
            const expected = !endpoint.expectSuccess;
            const result = denied === expected ? '✅' : '❌';

            console.log(`     ${result} ${endpoint.description}: ${denied ? 'Denied' : 'Error'}`);
        }
    }
};

// Check if users exist in database
const checkDatabaseUsers = async () => {
    console.log('👥 CHECKING DATABASE USERS...\n');

    const testEmails = [
        'phinhut2003@gmail.com',
        'admin@hospital.com',
        'doctor@hospital.com',
        'nurse@hospital.com'
    ];

    for (const email of testEmails) {
        try {
            // Try to login with wrong password to check if user exists
            await axios.post(`${BASE_URL}/users/login`, {
                email: email,
                password: 'wrong_password',
                role: 'Patient'
            });
        } catch (error) {
            if (error.response?.data?.message === 'Invalid Credentials.') {
                console.log(`✅ User exists: ${email}`);
            } else if (error.response?.data?.message?.includes('role not found')) {
                console.log(`✅ User exists: ${email} (role mismatch)`);
            } else {
                console.log(`❌ User not found: ${email}`);
            }
        }
    }
    console.log('');
};

const main = async () => {
    await checkDatabaseUsers();
    await testRealAuthentication();
};

main();
