// Simple test to create lab order and check queue
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function simpleLabTest() {
    console.log('🧪 Simple Lab Order Test...\n');

    try {
        // Test 1: Login admin
        console.log('1. Login admin...');
        const loginData = {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        };

        const loginResponse = await axios.post(`${BASE_URL}/users/login`, loginData, {
            withCredentials: true
        });

        if (loginResponse.data.success) {
            console.log('✅ Login successful');
        }

        // Test 2: Get a patient  
        console.log('\n2. Get patient...');
        const patientsResponse = await axios.get(`${BASE_URL}/users/patients`, {
            withCredentials: true
        });

        const patient = patientsResponse.data.users?.[0];
        if (!patient) {
            console.log('❌ No patients found');
            return;
        }
        console.log(`✅ Patient: ${patient.firstName} ${patient.lastName}`);

        // Test 3: Get lab tests
        console.log('\n3. Get lab tests...');
        const testsResponse = await axios.get(`${BASE_URL}/lab/tests`, {
            withCredentials: true
        });

        const tests = testsResponse.data.tests || [];
        console.log(`✅ Found ${tests.length} tests`);

        if (tests.length === 0) {
            console.log('❌ No tests available');
            return;
        }

        // Test 4: Create encounter
        console.log('\n4. Create encounter...');
        const encounterData = {
            patientId: patient._id,
            reasonForVisit: 'Lab work',
            chiefComplaint: 'Testing'
        };

        const encounterResponse = await axios.post(`${BASE_URL}/encounters`, encounterData, {
            withCredentials: true
        });

        const encounterId = encounterResponse.data.encounter?._id || encounterResponse.data._id;
        console.log(`✅ Encounter: ${encounterId}`);

        // Test 5: Create lab order
        console.log('\n5. Create lab order...');
        const orderData = {
            encounterId: encounterId,
            patientId: patient._id,
            tests: [
                {
                    testId: tests[0]._id,
                    priority: 'Routine',
                    instructions: 'Standard processing'
                }
            ],
            clinicalInfo: 'Testing lab order creation'
        };

        console.log('Sending order data:', JSON.stringify(orderData, null, 2));

        const orderResponse = await axios.post(`${BASE_URL}/lab/orders`, orderData, {
            withCredentials: true
        });

        console.log('🎉 LAB ORDER CREATED!');
        console.log('Response:', orderResponse.data);

        // Test 6: Check queue
        console.log('\n6. Check lab queue...');
        const queueResponse = await axios.get(`${BASE_URL}/lab/queue?status=Pending`, {
            withCredentials: true
        });

        console.log(`Queue result: ${queueResponse.data.orders?.length || 0} orders`);

        if (queueResponse.data.orders?.length > 0) {
            queueResponse.data.orders.forEach(order => {
                console.log(`- Order ${order.orderId}: ${order.status}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
    }
}

simpleLabTest();
