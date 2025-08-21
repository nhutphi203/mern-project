// Test Lab Queue API after fixes
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testLabQueueAPI() {
    console.log('🧪 TESTING LAB QUEUE API AFTER FIXES\n');

    try {
        // 1. Login first to get authentication
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        }, {
            withCredentials: true
        });

        console.log('✅ Login successful');

        // Get cookies
        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';

        // 2. Test Lab Queue API
        console.log('\n2. Testing Lab Queue API...');
        const labQueueResponse = await axios.get(`${BASE_URL}/lab/queue`, {
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Lab Queue API successful');
        console.log('\n📊 RESULTS:');
        console.log(`   Total Orders: ${labQueueResponse.data.orders.length}`);
        console.log(`   Expected: 3 orders (fixed from 2)`);

        // Display each order
        labQueueResponse.data.orders.forEach((order, index) => {
            console.log(`\n   Order ${index + 1}: ${order.orderNumber}`);
            console.log(`      Patient: ${order.patientName}`);
            console.log(`      Doctor: ${order.doctorName} (should be Dr. Thanh Sơn for some)`);
            console.log(`      Status: ${order.status}`);
            console.log(`      Tests: ${order.tests?.length || 0} tests`);

            // Show tests
            if (order.tests && order.tests.length > 0) {
                order.tests.forEach((test, testIndex) => {
                    console.log(`         ${testIndex + 1}. ${test.testName || 'Test Name'}`);
                    console.log(`            Code: ${test.testCode || 'N/A'}`);
                    console.log(`            Status: ${test.status || 'N/A'}`);
                });
            }
        });

        // 3. Verification
        console.log('\n🎯 VERIFICATION:');
        const hasThreeOrders = labQueueResponse.data.orders.length === 3;
        const hasNoUnknownTests = !labQueueResponse.data.orders.some(order =>
            order.tests?.some(test => test.testName?.includes('Unknown'))
        );

        console.log(`   ✅ Has 3 orders: ${hasThreeOrders ? 'YES' : 'NO'}`);
        console.log(`   ✅ No "Unknown Test": ${hasNoUnknownTests ? 'YES' : 'NO'}`);

        if (hasThreeOrders && hasNoUnknownTests) {
            console.log('\n🎉 SUCCESS! Lab Queue API is now working correctly!');
            console.log('   - Shows 3 orders instead of 2');
            console.log('   - No more "Unknown Test" entries');
            console.log('   - Ready for frontend display');
        } else {
            console.log('\n⚠️  Still need some fixes...');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testLabQueueAPI();
