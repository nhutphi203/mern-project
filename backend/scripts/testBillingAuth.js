// Test billing API with authentication
import http from 'http';

// Login credentials  
const loginData = JSON.stringify({
    email: 'nhutadmin@gmail.com',
    password: '11111111',
    role: 'Admin'  // ADD: Required role field
});

console.log('🔐 Attempting login...');

const loginOptions = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ Login Status:', res.statusCode);

            if (result.success && result.token) {
                console.log('🎫 Token received! Testing billing API...');
                console.log('🔑 Token preview:', result.token.substring(0, 20) + '...');
                testBillingWithToken(result.token);
            } else {
                console.log('❌ Login failed:', result.message);
                console.log('Full response:', result);
            }
        } catch (e) {
            console.log('❌ Login response:', data);
        }
    });
});

loginReq.on('error', (err) => {
    console.log('❌ Login error:', err.message);
});

loginReq.write(loginData);
loginReq.end();

function testBillingWithToken(token) {
    const billingOptions = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/billing/invoices',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };

    const billingReq = http.request(billingOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('\n📊 BILLING API WITH AUTH:');
                console.log('Status:', res.statusCode);
                console.log('Invoice count:', result.data?.length || 0);

                if (result.data && result.data.length > 0) {
                    console.log('\n🧾 INVOICES FOUND:');
                    result.data.forEach((invoice, i) => {
                        console.log(`  ${i + 1}. ${invoice.invoiceNumber} - ${invoice.totalAmount} VND (${invoice.status})`);
                    });
                } else {
                    console.log('❌ No invoices found or access denied');
                    console.log('Raw response:', data);
                }
            } catch (e) {
                console.log('Raw billing response:', data);
            }
        });
    });

    billingReq.on('error', (err) => {
        console.log('❌ Billing API error:', err.message);
    });

    billingReq.end();
}
