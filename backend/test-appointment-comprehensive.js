import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

config({ path: './config/config.env' });

const baseURL = 'http://localhost:4000/api/v1';

console.log('🔍 KIỂM TRA CHI TIẾT USER DATA VÀ APPOINTMENT SYSTEM');
console.log('==================================================');

async function checkSpecificUsers() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Lấy các user cụ thể
    const specificUsers = await User.find({
      email: {
        $in: [
          'admin.an@mediflow.dev',
          'dr.ha@mediflow.dev',
          'phinhut203@gmail.com',
          'admin@hospital.com',
          'doctor@hospital.com',
          'patient@hospital.com'
        ]
      }
    }).select('firstName lastName email role password');

    console.log('👥 Found users:');

    for (const user of specificUsers) {
      console.log(`\n👤 ${user.firstName} ${user.lastName}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role: ${user.role}`);

      // Test password với các options
      const testPasswords = ['password123', 'testpassword123', '123456', 'admin123'];
      let correctPassword = null;

      for (const testPass of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPass, user.password);
          if (isMatch) {
            correctPassword = testPass;
            console.log(`✅ Password: "${testPass}"`);
            break;
          }
        } catch (error) {
          // Skip
        }
      }

      if (!correctPassword) {
        console.log('❌ Không tìm thấy password match');
      }

      // Test login với password đúng
      if (correctPassword) {
        try {
          console.log(`🔑 Testing login...`);
          const loginResponse = await fetch(`${baseURL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              password: correctPassword,
              role: user.role
            })
          });

          console.log(`📊 Login Status: ${loginResponse.status}`);

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log(`✅ Login thành công! Token: ${loginData.token ? 'Yes' : 'No'}`);

            // Test appointment với token này
            await testAppointmentWithToken(loginData.token, user.role, `${user.firstName} ${user.lastName}`);
          } else {
            const errorData = await loginResponse.json();
            console.log(`❌ Login failed: ${errorData.message}`);
          }
        } catch (error) {
          console.log(`❌ Login error: ${error.message}`);
        }
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.log('❌ Database error:', error.message);
  }
}

async function testAppointmentWithToken(token, role, userName) {
  console.log(`\n📅 Testing Appointment với ${userName} (${role})...`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test GET appointments
  try {
    const getResponse = await fetch(`${baseURL}/appointment/getall`, { headers });
    console.log(`   📊 GET appointments: ${getResponse.status}`);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✅ Success: ${data.appointments?.length || 0} appointments found`);
    } else {
      const error = await getResponse.json();
      console.log(`   ❌ Error: ${error.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test POST appointment
  try {
    const appointmentData = {
      firstName: 'Test',
      lastName: 'Appointment',
      email: `test${role.toLowerCase()}@example.com`,
      phone: '0123456789',
      nic: '123456789012',
      dob: '1990-01-01',
      gender: 'Male',
      appointment_date: '2025-08-26',
      department: 'Đa khoa',
      doctor_firstName: 'Ngọc',
      doctor_lastName: 'Hà',
      hasVisited: false,
      address: '123 Test Street'
    };

    const postResponse = await fetch(`${baseURL}/appointment/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData)
    });

    console.log(`   📊 POST appointment: ${postResponse.status}`);

    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log(`   ✅ Success: ${data.message || 'Appointment created'}`);
    } else {
      const error = await postResponse.json();
      console.log(`   ❌ Error: ${error.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Test appointment router configuration
async function checkAppointmentRoutes() {
  console.log('\n🔍 KIỂM TRA APPOINTMENT ROUTER CONFIGURATION');
  console.log('===========================================');

  // Test các endpoint appointment khác nhau
  const endpoints = [
    { url: `${baseURL}/appointment/getall`, method: 'GET', desc: 'Get all appointments' },
    { url: `${baseURL}/appointment/post`, method: 'POST', desc: 'Create appointment' },
    { url: `${baseURL}/appointment/`, method: 'GET', desc: 'Base appointment endpoint' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.desc}...`);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify({
          firstName: 'Test',
          lastName: 'Route',
          email: 'testroute@example.com'
        }) : undefined
      });

      console.log(`   📊 Status: ${response.status}`);

      if (response.status === 401) {
        console.log('   🔐 Requires authentication (expected)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found');
      } else if (response.status === 400) {
        console.log('   ⚠️ Bad request (might be validation)');
      } else {
        console.log(`   ✅ Endpoint accessible`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function runComprehensiveAppointmentTest() {
  await checkSpecificUsers();
  await checkAppointmentRoutes();

  console.log('\n🎯 APPOINTMENT MANAGEMENT ANALYSIS COMPLETE');
  console.log('===========================================');
}

runComprehensiveAppointmentTest();
