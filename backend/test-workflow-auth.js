import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🏥 Bắt đầu test WORKFLOW Hospital Management System');
console.log('=====================================================');
console.log('📋 TEST 1: Authentication & User Management');
console.log('-----------------------------------------------------');

async function testAuthentication() {
  try {
    console.log('🔍 Testing User Login...');

    // Test với existing user
    const loginResponse = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hospital.com',
        password: 'testpassword123',
        role: 'Admin'
      })
    });

    console.log('📊 Login Status:', loginResponse.status);

    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('👤 User:', loginData.user?.firstName, loginData.user?.lastName);
      console.log('🔑 Token received:', loginData.token ? 'Yes' : 'No');
      return loginData.token;
    } else {
      console.log('❌ Login failed:', await loginResponse.text());
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication test error:', error.message);
    return null;
  }
}

testAuthentication();
