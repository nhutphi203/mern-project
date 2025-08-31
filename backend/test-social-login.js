import fetch from 'node-fetch';
import { config } from 'dotenv';

config({ path: './config/config.env' });

console.log('🔐 KIỂM TRA HỆ THỐNG SOCIAL LOGIN');
console.log('==================================');

// Kiểm tra cấu hình OAuth
function checkOAuthConfig() {
  console.log('\n📋 1. KIỂM TRA CẤU HÌNH OAUTH');
  console.log('================================');

  const configs = {
    'Google': {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      status: 'unknown'
    },
    'GitHub': {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      status: 'unknown'
    },
    'Facebook': {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      status: 'unknown'
    }
  };

  Object.entries(configs).forEach(([provider, config]) => {
    console.log(`\n🔑 ${provider}:`);

    if (config.clientId && config.clientId !== 'your-facebook-id' && config.clientSecret && config.clientSecret !== 'your-facebook-secret') {
      console.log(`   ✅ Client ID: ${config.clientId.substring(0, 20)}...`);
      console.log(`   ✅ Client Secret: ${config.clientSecret.substring(0, 8)}...`);
      configs[provider].status = 'configured';
    } else {
      console.log(`   ❌ Chưa cấu hình đúng`);
      configs[provider].status = 'not_configured';
    }
  });

  return configs;
}

// Kiểm tra OAuth endpoints
async function checkOAuthEndpoints() {
  console.log('\n📡 2. KIỂM TRA OAUTH ENDPOINTS');
  console.log('==============================');

  const baseURL = 'http://localhost:4000/api/v1/users/auth';
  const providers = ['google', 'github', 'facebook'];

  for (const provider of providers) {
    try {
      console.log(`\n🔍 Testing ${provider} endpoint...`);

      const response = await fetch(`${baseURL}/${provider}`, {
        method: 'GET',
        redirect: 'manual' // Không follow redirects
      });

      console.log(`   📊 Status: ${response.status}`);

      if (response.status === 302) {
        const location = response.headers.get('location');
        if (location) {
          console.log(`   ✅ Redirect to: ${location.substring(0, 50)}...`);

          // Kiểm tra redirect URL có đúng format OAuth không
          if (location.includes('oauth') || location.includes('authorize')) {
            console.log(`   ✅ OAuth redirect detected`);
          } else {
            console.log(`   ⚠️ Unexpected redirect URL`);
          }
        }
      } else {
        console.log(`   ❌ Unexpected status (expected 302)`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test database connection và user creation
async function testSocialUserCreation() {
  console.log('\n💾 3. TEST SOCIAL USER CREATION');
  console.log('================================');

  try {
    // Import models
    await import('./models/userScheme.js');
    const mongoose = await import('mongoose');

    await mongoose.default.connect(process.env.MONGO_URI);
    console.log('✅ Database connected');

    const User = mongoose.default.model('User');

    // Test creating a social user
    const testSocialUser = {
      firstName: 'Test',
      lastName: 'SocialUser',
      email: `testsocial${Date.now()}@example.com`,
      authType: 'google',
      providerId: 'test123',
      role: 'Patient',
      isVerified: true,
      phone: '0000000000',
      nic: '000000000000',
      dob: new Date('1990-01-01'),
      gender: 'Other'
    };

    console.log('\n🔍 Testing social user creation...');
    const user = await User.create(testSocialUser);
    console.log(`✅ Social user created: ${user.firstName} ${user.lastName}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Auth Type: ${user.authType}`);
    console.log(`   🆔 Provider ID: ${user.providerId}`);

    // Clean up test user
    await User.findByIdAndDelete(user._id);
    console.log('🧹 Test user cleaned up');

    mongoose.default.disconnect();

  } catch (error) {
    console.log(`❌ Database test error: ${error.message}`);
  }
}

// Test callback URLs
function testCallbackUrls() {
  console.log('\n🔗 4. KIỂM TRA CALLBACK URLS');
  console.log('============================');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

  const providers = ['google', 'github', 'facebook'];

  providers.forEach(provider => {
    const callbackUrl = `${backendUrl}/api/v1/users/auth/${provider}/callback`;
    console.log(`\n🔗 ${provider.toUpperCase()} Callback URL:`);
    console.log(`   ${callbackUrl}`);

    // Kiểm tra format URL
    try {
      new URL(callbackUrl);
      console.log(`   ✅ Valid URL format`);
    } catch {
      console.log(`   ❌ Invalid URL format`);
    }
  });

  console.log(`\n🎯 Frontend Redirect URL: ${frontendUrl}/dashboard`);
  console.log(`🎯 Error Redirect URL: ${frontendUrl}/login`);
}

// Kiểm tra existing social users
async function checkExistingSocialUsers() {
  console.log('\n👥 5. KIỂM TRA EXISTING SOCIAL USERS');
  console.log('===================================');

  try {
    await import('./models/userScheme.js');
    const mongoose = await import('mongoose');

    await mongoose.default.connect(process.env.MONGO_URI);

    const User = mongoose.default.model('User');

    // Tìm social users
    const socialUsers = await User.find({
      authType: { $in: ['google', 'github', 'facebook'] }
    }).select('firstName lastName email authType providerId isVerified');

    console.log(`📊 Found ${socialUsers.length} social users:`);

    if (socialUsers.length > 0) {
      socialUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Auth Type: ${user.authType}`);
        console.log(`   ✅ Verified: ${user.isVerified}`);
        console.log(`   🆔 Provider ID: ${user.providerId || 'N/A'}`);
      });
    } else {
      console.log('ℹ️ Chưa có user nào đăng nhập bằng social media');
    }

    mongoose.default.disconnect();

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Main test function
async function runSocialLoginTests() {
  console.log('🚀 BẮT ĐẦU KIỂM TRA SOCIAL LOGIN SYSTEM...\n');

  const configs = checkOAuthConfig();
  await checkOAuthEndpoints();
  await testSocialUserCreation();
  testCallbackUrls();
  await checkExistingSocialUsers();

  console.log('\n🎯 TỔNG KẾT SOCIAL LOGIN STATUS');
  console.log('===============================');

  Object.entries(configs).forEach(([provider, config]) => {
    const status = config.status === 'configured' ? '✅ READY' : '❌ NOT CONFIGURED';
    console.log(`${provider}: ${status}`);
  });

  console.log('\n💡 HƯỚNG DẪN TIẾP THEO:');
  console.log('1. Google và GitHub đã cấu hình, có thể test ngay');
  console.log('2. Facebook cần cấu hình FACEBOOK_APP_ID và FACEBOOK_APP_SECRET');
  console.log('3. Test bằng cách truy cập: http://localhost:4000/api/v1/users/auth/google');
  console.log('4. Hoặc test từ frontend: http://localhost:8080/login');

  console.log('\n🔧 DEBUG URLS (paste vào browser):');
  console.log('Google: http://localhost:4000/api/v1/users/auth/google');
  console.log('GitHub: http://localhost:4000/api/v1/users/auth/github');
}

runSocialLoginTests();
