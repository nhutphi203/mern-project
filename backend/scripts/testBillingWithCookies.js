// Test billing API với cookie authentication 
import http from 'http';

// Admin credentials
const loginData = JSON.stringify({
    email: 'nhutadmin@gmail.com',
    password: '11111111',
    role: 'Admin'
});

console.log('🔐 Testing Billing API with Cookie Authentication...');

// Step 1: Login and get cookie
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

            if (result.success) {
                // Extract adminToken cookie from Set-Cookie header
                const setCookieHeader = res.headers['set-cookie'];
                let adminToken = null;

                if (setCookieHeader) {
                    setCookieHeader.forEach(cookie => {
                        if (cookie.startsWith('adminToken=')) {
                            adminToken = cookie.split(';')[0]; // Get just "adminToken=value"
                        }
                    });
                }

                if (adminToken) {
                    console.log('🍪 Admin cookie extracted:', adminToken.substring(0, 30) + '...');
                    testBillingWithCookie(adminToken);
                } else {
                    console.log('❌ No adminToken cookie found in response');
                    console.log('Set-Cookie headers:', setCookieHeader);
                }
            } else {
                console.log('❌ Login failed:', result.message);
            }
        } catch (e) {
            console.log('❌ Login JSON error:', e.message);
            console.log('Raw response:', data);
        }
    });
});

loginReq.on('error', (err) => {
    console.log('❌ Login request error:', err.message);
});

loginReq.write(loginData);
loginReq.end();

// Step 2: Test billing API with cookie
function testBillingWithCookie(cookieValue) {
    console.log('\n📊 Testing Billing API with admin cookie...');

    const billingOptions = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/billing/invoices',
        method: 'GET',
        headers: {
            'Cookie': cookieValue,
            'Content-Type': 'application/json'
        }
    };

    const billingReq = http.request(billingOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('✅ Billing API Status:', res.statusCode);

                if (result.success && result.data) {
                    console.log(`🎉 SUCCESS! Found ${result.data.length} invoices`);

                    result.data.forEach((invoice, i) => {
                        console.log(`\n🧾 Invoice ${i + 1}:`);
                        console.log(`   Number: ${invoice.invoiceNumber}`);
                        console.log(`   Amount: ${invoice.totalAmount?.toLocaleString()} VND`);
                        console.log(`   Status: ${invoice.status}`);
                        console.log(`   Items: ${invoice.items?.length || 0} services`);
                    });

                    console.log('\n✅ PROBLEM SOLVED! Frontend should use cookies for authentication.');
                    console.log('💡 The invoice count shows 0 because frontend is not sending cookies properly.');

                } else {
                    console.log('❌ Billing API failed:', result.message);
                    console.log('Raw response:', data);
                }
            } catch (e) {
                console.log('❌ Billing JSON error:', e.message);
                console.log('Raw response:', data);
            }
        });
    });

    billingReq.on('error', (err) => {
        console.log('❌ Billing request error:', err.message);
    });

    billingReq.end();
}

console.log('Starting cookie-based authentication test...');
