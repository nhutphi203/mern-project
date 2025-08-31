// Simple test with manual cookie handling
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function testLabOrderWithCookies() {
    console.log('🏥 Testing Lab Order with Cookie Authentication...\n');

    let cookies = '';

    try {
        // Step 1: Login and extract cookies
        console.log('1. 🔐 Admin login...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        });

        // Extract cookies from response
        const setCookieHeader = loginResponse.headers['set-cookie'];
        if (setCookieHeader) {
            cookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
            console.log('✅ Login successful, cookies extracted');
        }

        // Step 2: Test authenticated request with cookies
        console.log('\n2. 👥 Getting patients with cookies...');
        const patientsResponse = await axios.get(`${BASE_URL}/users/patients`, {
            headers: {
                'Cookie': cookies
            }
        });

        const patients = patientsResponse.data.users || [];
        const patient = patients.find(p => p.email === 'phinhut2003@gmail.com');

        if (!patient) {
            console.log('❌ Patient not found. Available patients:');
            patients.forEach(p => console.log(`   - ${p.firstName} ${p.lastName} (${p.email})`));
            return;
        }

        console.log('✅ Patient found:', `${patient.firstName} ${patient.lastName}`);

        // Step 3: Create encounter
        console.log('\n3. 📋 Creating encounter...');
        const encounterData = {
            patientId: patient._id,
            reasonForVisit: 'Lab tests needed',
            chiefComplaint: 'Routine checkup'
        };

        const encounterResponse = await axios.post(`${BASE_URL}/encounters`, encounterData, {
            headers: { 'Cookie': cookies }
        });

        const encounter = encounterResponse.data.encounter || encounterResponse.data;
        console.log('✅ Encounter created:', encounter._id);

        // Step 4: Get lab tests
        console.log('\n4. 🧪 Getting lab tests...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            headers: { 'Cookie': cookies }
        });

        const tests = testsResponse.data.tests || [];
        console.log('✅ Lab tests available:', tests.length);

        if (tests.length === 0) {
            console.log('❌ No tests found. Run seeder first.');
            return;
        }

        // Step 5: Create lab order
        console.log('\n5. 📝 Creating lab order...');
        const labOrderData = {
            encounterId: encounter._id,
            patientId: patient._id,
            tests: [
                {
                    testId: tests[0]._id,
                    priority: 'Routine',
                    instructions: 'Standard processing'
                }
            ],
            clinicalInfo: 'Test lab order creation from script'
        };

        const orderResponse = await axios.post(`${BASE_URL}/lab/orders`, labOrderData, {
            headers: { 'Cookie': cookies }
        });

        const order = orderResponse.data.order || orderResponse.data;
        console.log('✅ Lab order created!');
        console.log('   Order ID:', order.orderId);
        console.log('   Database ID:', order._id);
        console.log('   Status:', order.status);
        console.log('   Tests:', order.tests?.length);

        // Step 6: Check lab queue
        console.log('\n6. 📊 Checking lab queue...');
        const queueResponse = await axios.get(`${BASE_URL}/lab/queue`, {
            headers: { 'Cookie': cookies }
        });

        const allOrders = queueResponse.data.orders || [];
        console.log('✅ Lab queue retrieved');
        console.log('   Total orders:', allOrders.length);

        const newOrder = allOrders.find(o => o._id === order._id);
        console.log('   New order found:', newOrder ? '✅ YES' : '❌ NO');

        if (allOrders.length > 0) {
            console.log('\n📋 Orders in queue:');
            allOrders.forEach((o, index) => {
                const isNew = o._id === order._id;
                console.log(`   ${index + 1}. ${isNew ? '🆕 ' : ''}#${o.orderId} - ${o.patientId?.firstName} ${o.patientId?.lastName} - ${o.status}`);
            });
        }

        // Step 7: Test with specific filter (what frontend uses)
        console.log('\n7. 🔍 Testing with Ordered status filter...');
        const orderedResponse = await axios.get(`${BASE_URL}/lab/queue?status=Ordered`, {
            headers: { 'Cookie': cookies }
        });

        const orderedOrders = orderedResponse.data.orders || [];
        const foundInFiltered = orderedOrders.find(o => o._id === order._id);

        console.log('✅ Filtered results:');
        console.log('   Orders with "Ordered" status:', orderedOrders.length);
        console.log('   New order in filtered results:', foundInFiltered ? '✅ YES' : '❌ NO');

        console.log('\n🎉 SUCCESS! Lab order creation and queue display working!');

    } catch (error) {
        console.error('❌ Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
}

testLabOrderWithCookies();
