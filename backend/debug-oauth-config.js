import { config } from 'dotenv';
config({ path: './config/config.env' });

console.log('🔍 KIỂM TRA GOOGLE OAUTH CONFIGURATION');
console.log('=====================================');

console.log('📋 Environment Variables:');
console.log(`BACKEND_URL: ${process.env.BACKEND_URL}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);

console.log('\n🔗 OAuth URLs:');
console.log(`Google Auth: ${process.env.BACKEND_URL}/api/v1/users/auth/google`);
console.log(`Google Callback: ${process.env.BACKEND_URL}/api/v1/users/auth/google/callback`);
console.log(`GitHub Auth: ${process.env.BACKEND_URL}/api/v1/users/auth/github`);
console.log(`GitHub Callback: ${process.env.BACKEND_URL}/api/v1/users/auth/github/callback`);

console.log('\n📝 CẦN CẤU HÌNH TRONG GOOGLE CONSOLE:');
console.log('=====================================');
console.log('1. Vào https://console.developers.google.com/');
console.log('2. Chọn project của bạn');
console.log('3. Credentials > OAuth 2.0 Client IDs');
console.log('4. Thêm Authorized redirect URIs:');
console.log(`   ✅ ${process.env.BACKEND_URL}/api/v1/users/auth/google/callback`);
console.log(`   ✅ http://localhost:4000/api/v1/users/auth/google/callback`);

console.log('\n📝 CẦN CẤU HÌNH TRONG GITHUB:');
console.log('==============================');
console.log('1. Vào https://github.com/settings/applications/');
console.log('2. Chọn OAuth App của bạn');
console.log('3. Authorization callback URL:');
console.log(`   ✅ ${process.env.BACKEND_URL}/api/v1/users/auth/github/callback`);

console.log('\n🧪 TESTING OAUTH ENDPOINTS:');
console.log('============================');

import fetch from 'node-fetch';

async function testOAuthEndpoints() {
  const baseURL = process.env.BACKEND_URL;

  // Test Google auth endpoint
  try {
    console.log('\n🔍 Testing Google auth endpoint...');
    const googleResponse = await fetch(`${baseURL}/api/v1/users/auth/google`, {
      method: 'GET',
      redirect: 'manual'
    });

    console.log(`📊 Google auth status: ${googleResponse.status}`);

    if (googleResponse.status === 302) {
      const location = googleResponse.headers.get('location');
      console.log('✅ Google auth redirect working');
      console.log(`🔗 Redirect to: ${location?.substring(0, 100)}...`);

      // Check if redirect URL contains correct callback
      if (location?.includes('callback')) {
        console.log('✅ Callback URL included in redirect');
      } else {
        console.log('❌ Callback URL missing in redirect');
      }
    } else {
      console.log('❌ Google auth endpoint not working properly');
    }
  } catch (error) {
    console.log(`❌ Google auth test error: ${error.message}`);
  }

  // Test GitHub auth endpoint
  try {
    console.log('\n🔍 Testing GitHub auth endpoint...');
    const githubResponse = await fetch(`${baseURL}/api/v1/users/auth/github`, {
      method: 'GET',
      redirect: 'manual'
    });

    console.log(`📊 GitHub auth status: ${githubResponse.status}`);

    if (githubResponse.status === 302) {
      const location = githubResponse.headers.get('location');
      console.log('✅ GitHub auth redirect working');
      console.log(`🔗 Redirect to: ${location?.substring(0, 100)}...`);
    } else {
      console.log('❌ GitHub auth endpoint not working properly');
    }
  } catch (error) {
    console.log(`❌ GitHub auth test error: ${error.message}`);
  }
}

testOAuthEndpoints().then(() => {
  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  console.log('1. 🔧 Cấu hình Google Console với callback URL đúng');
  console.log('2. 🔧 Cấu hình GitHub OAuth App với callback URL đúng');
  console.log('3. 🔄 Restart backend server');
  console.log('4. 🧪 Test social login again');

  console.log('\n💡 TIP: Nếu vẫn lỗi redirect_uri_mismatch:');
  console.log('- Kiểm tra Google Console có đúng callback URL không');
  console.log('- Đảm bảo URL chính xác 100% (không có trailing slash)');
  console.log('- Thử cả http://localhost:4000 và http://127.0.0.1:4000');
});
