// Test Lab API endpoints with admin authentication
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

// Admin credentials - Backend requires email, password, and role
const ADMIN_CREDENTIALS = {
    email: 'nhutadmin@gmail.com',
    password: '11111111',
    role: 'Admin'
};

async function testLabAPIWithAuth() {
    console.log('🔬 Testing Lab API endpoints with admin authentication...\n');

    try {
        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, ADMIN_CREDENTIALS, {
            withCredentials: true
        });

        console.log('✅ Admin login successful:', {
            role: loginResponse.data.user?.role,
            name: `${loginResponse.data.user?.firstName} ${loginResponse.data.user?.lastName}`,
            email: loginResponse.data.user?.email
        });

        // Extract cookies for subsequent requests
        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';

        // Step 2: Test getting lab tests
        console.log('\n2. Testing GET /lab/tests with authentication...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            headers: {
                'Cookie': cookieHeader
            },
            withCredentials: true
        });

        console.log('✅ Lab tests retrieved:', {
            count: testsResponse.data.tests?.length || 0,
            categories: [...new Set(testsResponse.data.tests?.map(t => t.category) || [])],
            sampleTest: testsResponse.data.tests?.[0] ? {
                name: testsResponse.data.tests[0].testName,
                category: testsResponse.data.tests[0].category,
                price: testsResponse.data.tests[0].price
            } : 'No tests found'
        });

        // Step 3: Test getting lab queue
        console.log('\n3. Testing GET /lab/queue with authentication...');
        const queueResponse = await axios.get(`${BASE_URL}/lab/queue`, {
            headers: {
                'Cookie': cookieHeader
            },
            withCredentials: true
        });

        console.log('✅ Lab queue retrieved:', {
            count: queueResponse.data.orders?.length || 0,
            message: queueResponse.data.message || 'Success',
            sampleOrder: queueResponse.data.orders?.[0] ? {
                orderId: queueResponse.data.orders[0].orderId,
                status: queueResponse.data.orders[0].status,
                testsCount: queueResponse.data.orders[0].tests?.length || 0
            } : 'No orders found'
        });

        // Step 4: Check what users exist in database
        console.log('\n4. Checking existing users...');
        try {
            const allUsersResponse = await axios.get(`${BASE_URL}/users/patients`, {
                headers: {
                    'Cookie': cookieHeader
                },
                withCredentials: true
            });

            console.log('Users found:', {
                patients: allUsersResponse.data.patients?.length || 0,
                totalCount: allUsersResponse.data.totalCount || 0
            });

            if (allUsersResponse.data.patients && allUsersResponse.data.patients.length > 0) {
                console.log('Sample patient:', {
                    name: `${allUsersResponse.data.patients[0].firstName} ${allUsersResponse.data.patients[0].lastName}`,
                    email: allUsersResponse.data.patients[0].email,
                    role: allUsersResponse.data.patients[0].role
                });
            }
        } catch (userError) {
            console.log('Error fetching users:', userError.response?.data?.message);
        }

        // Step 5: Create a test lab order (need patient and encounter IDs from database)
        console.log('\n5. Testing creating lab order...');

        // First, get a test patient ID (assuming we have seeded data)
        const usersResponse = await axios.get(`${BASE_URL}/users/patients`, {
            headers: {
                'Cookie': cookieHeader
            },
            withCredentials: true
        });

        if (usersResponse.data.patients && usersResponse.data.patients.length > 0) {
            const testPatientId = usersResponse.data.patients[0]._id;
            const testEncounterId = '66c2e8a8e45f123456789abc'; // Mock encounter ID

            // Get first available test
            if (testsResponse.data.tests && testsResponse.data.tests.length > 0) {
                const testId = testsResponse.data.tests[0]._id;

                const labOrderData = {
                    encounterId: testEncounterId,
                    patientId: testPatientId,
                    tests: [{
                        testId: testId,
                        priority: 'Routine',
                        instructions: 'Test order created by API test'
                    }],
                    clinicalInfo: 'API testing - comprehensive lab order creation test'
                };

                try {
                    const orderResponse = await axios.post(`${BASE_URL}/lab/orders`, labOrderData, {
                        headers: {
                            'Cookie': cookieHeader,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    });

                    console.log('✅ Lab order created successfully:', {
                        orderId: orderResponse.data.order?.orderId,
                        status: orderResponse.data.order?.status,
                        totalAmount: orderResponse.data.order?.totalAmount,
                        testsCount: orderResponse.data.order?.tests?.length
                    });
                } catch (orderError) {
                    console.log('⚠️ Lab order creation failed (expected if no valid encounter):', {
                        status: orderError.response?.status,
                        message: orderError.response?.data?.message
                    });
                }
            }
        } else {
            console.log('⚠️ No patients found for testing lab order creation');
        }

        console.log('\n🎉 Lab API authentication tests completed!');

    } catch (error) {
        console.error('❌ Lab API authentication test failed:', {
            endpoint: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
    }
}

testLabAPIWithAuth();
