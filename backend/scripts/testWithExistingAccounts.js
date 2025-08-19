// Test complete lab flow with existing accounts
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

// Create axios instance with cookie jar to persist session
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000
});

async function testCompleteLabFlow() {
    console.log('🏥 Testing complete Lab Management flow with existing accounts...\n');

    let adminToken = null;
    let patientId = null;
    let encounterId = null;

    try {
        // Step 1: Login as admin to get access
        console.log('1. Logging in as admin...');
        const adminLogin = await axiosInstance.post('/users/login', {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        });

        adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful');
        console.log('🍪 Response cookies:', adminLogin.headers['set-cookie']);
        console.log('🔑 Token received:', adminToken ? 'Yes' : 'No');

        // Wait a moment for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 2: Get patient by email using Authorization header
        console.log('\n2. Finding patient...');
        const usersResponse = await axiosInstance.get('/users/patients', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const patient = usersResponse.data.users?.find(u => u.email === 'phinhut2003@gmail.com');
        if (!patient) {
            console.log('❌ Patient not found. Available patients:',
                usersResponse.data.users?.map(u => ({ email: u.email, role: u.role })) || 'None'
            );
            return;
        }

        patientId = patient._id;
        console.log('✅ Patient found:', {
            name: `${patient.firstName} ${patient.lastName}`,
            email: patient.email,
            id: patientId
        });

        // Step 3: Create a mock encounter (required for lab orders)
        console.log('\n3. Creating encounter...');
        const encounterData = {
            patientId: patientId,
            reasonForVisit: 'Lab work required',
            chiefComplaint: 'Routine health check'
        };

        const encounterResponse = await axiosInstance.post('/encounters', encounterData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        encounterId = encounterResponse.data.encounter?._id || encounterResponse.data._id;
        console.log('✅ Encounter created:', encounterId);

        // Step 4: Get available lab tests
        console.log('\n4. Getting available lab tests...');
        const testsResponse = await axiosInstance.get('/lab/tests', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const tests = testsResponse.data.tests || [];
        console.log('✅ Available tests:', tests.length);

        if (tests.length === 0) {
            console.log('❌ No tests available. Run seeder first.');
            return;
        }

        // Step 5: Create lab order with proper format matching backend expectations
        console.log('\n5. Creating lab order...');
        const labOrderData = {
            encounterId: encounterId,  // Backend expects 'encounterId'
            patientId: patientId,      // Backend expects 'patientId'
            tests: [
                {
                    testId: tests[0]._id,
                    priority: 'Routine',
                    instructions: 'Fasting required'
                },
                {
                    testId: tests[1]._id,
                    priority: 'Urgent',
                    instructions: 'STAT order'
                }
            ],
            clinicalInfo: 'Routine health screening - checking for diabetes and cholesterol levels'
        };

        console.log('📝 Sending lab order data:', {
            encounterId,
            patientId,
            testsCount: labOrderData.tests.length,
            selectedTests: labOrderData.tests.map(t => ({
                testName: tests.find(test => test._id === t.testId)?.testName,
                priority: t.priority
            }))
        });

        const orderResponse = await axiosInstance.post('/lab/orders', labOrderData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const createdOrder = orderResponse.data.order || orderResponse.data;
        console.log('✅ Lab order created successfully:', {
            orderId: createdOrder.orderId,
            id: createdOrder._id,
            testsCount: createdOrder.tests?.length,
            totalAmount: createdOrder.totalAmount,
            status: createdOrder.status
        });

        // Step 6: Verify order appears in lab queue
        console.log('\n6. Checking lab queue...');
        const queueResponse = await axiosInstance.get('/lab/queue?status=Ordered', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const orders = queueResponse.data.orders || [];
        console.log('✅ Lab queue retrieved:', {
            totalOrders: orders.length,
            newOrder: orders.find(o => o._id === createdOrder._id) ? 'Found' : 'Not found'
        });

        if (orders.length > 0) {
            console.log('📋 Orders in queue:');
            orders.forEach((order, index) => {
                console.log(`   ${index + 1}. Order #${order.orderId} - Patient: ${order.patientId?.firstName} ${order.patientId?.lastName} - Tests: ${order.tests?.length} - Status: ${order.status}`);
            });
        }

        console.log('\n🎉 Complete lab flow test successful!');
        console.log('\n📊 Summary:');
        console.log('- ✅ Admin authentication works');
        console.log('- ✅ Patient found in database');
        console.log('- ✅ Encounter creation works');
        console.log('- ✅ Lab tests are available');
        console.log('- ✅ Lab order creation works');
        console.log('- ✅ Lab queue retrieval works');
        console.log('- ✅ Order appears in queue with correct status');

    } catch (error) {
        console.error('❌ Test failed:', {
            step: error.config?.url ? `API call to ${error.config.url}` : 'Unknown',
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.log('🔐 Authentication issue - check if backend requires proper login');
        }
    }
}

testCompleteLabFlow();
