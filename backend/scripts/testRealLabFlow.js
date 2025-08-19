// Test Real Lab Order Creation and Queue Display
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testRealLabFlow() {
    console.log('🏥 Testing REAL Lab Order Creation → Queue Display...\n');

    try {
        // Step 1: Login as admin
        console.log('1. 🔐 Logging in as admin...');
        const adminLogin = await axios.post(`${BASE_URL}/users/login`, {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        }, { withCredentials: true });

        const token = adminLogin.data.token;
        console.log('✅ Admin login successful');

        // Step 2: Get patient 
        console.log('\n2. 👤 Finding patient...');
        const usersResponse = await axios.get(`${BASE_URL}/users/patients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const patient = usersResponse.data.users?.find(u => u.email === 'phinhut2003@gmail.com');
        if (!patient) {
            console.log('❌ Patient not found');
            return;
        }

        console.log('✅ Patient found:', {
            name: `${patient.firstName} ${patient.lastName}`,
            id: patient._id
        });

        // Step 3: Create encounter
        console.log('\n3. 📝 Creating encounter...');
        const encounterResponse = await axios.post(`${BASE_URL}/encounters`, {
            patientId: patient._id,
            reasonForVisit: 'Lab work required',
            chiefComplaint: 'Routine health check'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const encounterId = encounterResponse.data.encounter?._id || encounterResponse.data._id;
        console.log('✅ Encounter created:', encounterId);

        // Step 4: Get lab tests
        console.log('\n4. 🧪 Getting available lab tests...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tests = testsResponse.data.tests || [];
        console.log('✅ Available tests:', tests.length);

        if (tests.length === 0) {
            console.log('❌ No tests available');
            return;
        }

        // Step 5: Check queue BEFORE creating order
        console.log('\n5. 📋 Checking queue BEFORE creating order...');
        const queueBefore = await axios.get(`${BASE_URL}/lab/queue?status=Ordered`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📊 Orders in queue BEFORE:', queueBefore.data.orders?.length || 0);

        // Step 6: Create lab order with EXACT frontend format
        console.log('\n6. ➕ Creating lab order...');
        const labOrderData = {
            encounterId: encounterId,
            patientId: patient._id,
            tests: [
                {
                    testId: tests[0]._id,
                    priority: 'Routine',
                    instructions: 'Fasting required'
                }
            ],
            clinicalInfo: 'Routine health screening'
        };

        console.log('📝 Sending lab order data:', {
            encounterId,
            patientId: patient._id,
            testsCount: labOrderData.tests.length,
            testName: tests[0].testName
        });

        const orderResponse = await axios.post(`${BASE_URL}/lab/orders`, labOrderData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const createdOrder = orderResponse.data.order;
        console.log('✅ Lab order created:', {
            orderId: createdOrder.orderId,
            _id: createdOrder._id,
            status: createdOrder.status,
            testsCount: createdOrder.tests?.length
        });

        // Step 7: Check queue AFTER creating order
        console.log('\n7. 📋 Checking queue AFTER creating order...');
        const queueAfter = await axios.get(`${BASE_URL}/lab/queue?status=Ordered`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📊 Orders in queue AFTER:', queueAfter.data.orders?.length || 0);

        if (queueAfter.data.orders?.length > queueBefore.data.orders?.length) {
            console.log('🎉 SUCCESS: New order appears in queue!');

            const newOrder = queueAfter.data.orders.find(o => o._id === createdOrder._id);
            if (newOrder) {
                console.log('📋 Order details in queue:', {
                    orderId: newOrder.orderId,
                    patient: `${newOrder.patientId?.firstName} ${newOrder.patientId?.lastName}`,
                    testsCount: newOrder.tests?.length,
                    status: newOrder.status
                });
            }
        } else {
            console.log('❌ PROBLEM: Order NOT found in queue');

            // Debug: Check all orders
            console.log('\n🔍 DEBUG: All orders in database...');
            const allOrders = await axios.get(`${BASE_URL}/lab/queue`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Total orders in DB:', allOrders.data.orders?.length || 0);
            if (allOrders.data.orders?.length > 0) {
                allOrders.data.orders.forEach((order, index) => {
                    console.log(`   ${index + 1}. ${order.orderId} - Status: ${order.status} - Patient: ${order.patientId?.firstName || 'Unknown'}`);
                });
            }
        }

        // Step 8: Test with different filters
        console.log('\n8. 🔍 Testing different filters...');
        const filters = ['', 'Ordered', 'Collected', 'InProgress', 'Completed'];

        for (const status of filters) {
            const url = status ? `${BASE_URL}/lab/queue?status=${status}` : `${BASE_URL}/lab/queue`;
            const filterResponse = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log(`   Status "${status || 'ALL'}": ${filterResponse.data.orders?.length || 0} orders`);
        }

    } catch (error) {
        console.error('❌ Test failed:', {
            step: error.config?.url ? `API call to ${error.config.url}` : 'Unknown',
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
    }
}

testRealLabFlow();
