// Quick billing API test
import http from 'http';

function testBillingAPI() {
    console.log('🔍 Testing Billing API...');

    const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/billing/invoices',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('\n📊 BILLING API RESULTS:');
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Success: ${result.success}`);
                console.log(`Message: ${result.message || 'No message'}`);

                if (result.data && Array.isArray(result.data)) {
                    console.log(`\n📋 INVOICE COUNT: ${result.data.length}`);

                    result.data.forEach((invoice, index) => {
                        console.log(`\n🧾 Invoice ${index + 1}:`);
                        console.log(`   Number: ${invoice.invoiceNumber}`);
                        console.log(`   Amount: ${invoice.totalAmount?.toLocaleString()} VND`);
                        console.log(`   Status: ${invoice.status}`);
                        console.log(`   Items: ${invoice.items?.length || 0} services`);
                    });
                } else {
                    console.log('❌ No invoice data found');
                    console.log('Raw response:', JSON.stringify(result, null, 2));
                }

            } catch (e) {
                console.log('❌ JSON Parse Error:', e.message);
                console.log('Raw data:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request Error:', e.message);
    });

    req.end();
}

testBillingAPI();
