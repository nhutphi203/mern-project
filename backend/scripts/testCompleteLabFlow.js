// Create test patient and test lab order creation
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

const ADMIN_CREDENTIALS = {
    email: 'nhutadmin@gmail.com',
    password: '11111111',
    role: 'Admin'
};

const TEST_PATIENT = {
    firstName: 'Test',
    lastName: 'Patient',
    email: 'testpatient@example.com',
    phone: '1234567890',
    nic: '199012345678', // FIX: 12-digit NIC as required by validation
    dob: '1990-01-01',
    gender: 'Male',
    password: 'testpass123',
    role: 'Patient'
};

async function createTestPatientAndOrder() {
    console.log('🏥 Creating test patient and lab order...\n');

    try {
        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, ADMIN_CREDENTIALS, {
            withCredentials: true
        });

        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';

        console.log('✅ Admin login successful');

        // Step 2: Register a test patient
        console.log('\n2. Creating test patient...');
        const patientResponse = await axios.post(`${BASE_URL}/users/register`, TEST_PATIENT, {
            headers: {
                'Cookie': cookieHeader
            },
            withCredentials: true
        });

        console.log('✅ Test patient created:', {
            id: patientResponse.data.user?._id,
            name: `${patientResponse.data.user?.firstName} ${patientResponse.data.user?.lastName}`,
            role: patientResponse.data.user?.role
        });

        // Step 3: Get available lab tests
        console.log('\n3. Getting available lab tests...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            headers: {
                'Cookie': cookieHeader
            },
            withCredentials: true
        });

        const availableTests = testsResponse.data.tests || [];
        console.log('✅ Available tests:', availableTests.length);

        // Step 4: Create lab order
        if (availableTests.length > 0 && patientResponse.data.user?._id) {
            console.log('\n4. Creating lab order...');

            const testId = availableTests[0]._id;
            const patientId = patientResponse.data.user._id;

            // Create a mock encounter ID (in real scenario, this would come from an actual encounter)
            const mockEncounterId = '66c2e8a8e45f123456789abc';

            const labOrderData = {
                encounterId: mockEncounterId,
                patientId: patientId,
                tests: [{
                    testId: testId,
                    priority: 'Routine',
                    instructions: 'Test order for API validation'
                }],
                clinicalInfo: 'Test order created via API - verifying lab order creation flow'
            };

            console.log('Request data:', JSON.stringify(labOrderData, null, 2));

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

                // Step 5: Verify order appears in queue
                console.log('\n5. Checking lab queue...');
                const queueResponse = await axios.get(`${BASE_URL}/lab/queue`, {
                    headers: {
                        'Cookie': cookieHeader
                    },
                    withCredentials: true
                });

                console.log('✅ Lab queue after order creation:', {
                    count: queueResponse.data.orders?.length || 0,
                    newOrder: queueResponse.data.orders?.[0] ? {
                        orderId: queueResponse.data.orders[0].orderId,
                        status: queueResponse.data.orders[0].status,
                        patientName: `${queueResponse.data.orders[0].patientId?.firstName} ${queueResponse.data.orders[0].patientId?.lastName}`
                    } : 'No orders found'
                });

            } catch (orderError) {
                console.error('❌ Lab order creation failed:', {
                    status: orderError.response?.status,
                    message: orderError.response?.data?.message,
                    details: orderError.response?.data
                });
            }
        }

        console.log('\n🎉 Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', {
            endpoint: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
}

createTestPatientAndOrder();
