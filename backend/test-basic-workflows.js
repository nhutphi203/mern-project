import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🏥 TEST CÁC CHỨC NĂNG NGƯỜI DÙNG CƠ BẢN');
console.log('==========================================');

// TEST 1: Danh sách bác sĩ (Public - Thành công!)
async function testDoctorsList() {
  console.log('\n👨‍⚕️ TEST 1: Danh sách Bác sĩ (Public)');
  console.log('---------------------------------------');

  try {
    const doctorsResponse = await fetch(`${baseURL}/users/doctors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', doctorsResponse.status);
    if (doctorsResponse.ok) {
      const data = await doctorsResponse.json();
      console.log('✅ THÀNH CÔNG - Lấy danh sách bác sĩ');
      console.log('👨‍⚕️ Tổng số bác sĩ:', data.doctors?.length || 0);

      if (data.doctors?.length > 0) {
        console.log('\n📋 DANH SÁCH BÁC SĨ:');
        data.doctors.slice(0, 5).forEach((doctor, index) => {
          console.log(`${index + 1}. 👨‍⚕️ ${doctor.firstName} ${doctor.lastName}`);
          console.log(`   📧 Email: ${doctor.email}`);
          console.log(`   🏥 Chuyên khoa: ${doctor.department || 'Đa khoa'}`);
          console.log(`   📞 Điện thoại: ${doctor.phone || 'Chưa có'}`);
          console.log('   ─────────────────────');
        });
      }
      return true;
    } else {
      console.log('❌ Lỗi:', await doctorsResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
    return false;
  }
}

// TEST 2: Danh sách bệnh nhân (Public)
async function testPatientsList() {
  console.log('\n👥 TEST 2: Danh sách Bệnh nhân (Public)');
  console.log('---------------------------------------');

  try {
    const patientsResponse = await fetch(`${baseURL}/users/patients`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', patientsResponse.status);
    if (patientsResponse.ok) {
      const data = await patientsResponse.json();
      console.log('✅ THÀNH CÔNG - Lấy danh sách bệnh nhân');
      console.log('👥 Tổng số bệnh nhân:', data.patients?.length || 0);

      if (data.patients?.length > 0) {
        console.log('\n📋 DANH SÁCH BỆNH NHÂN (5 đầu):');
        data.patients.slice(0, 5).forEach((patient, index) => {
          console.log(`${index + 1}. 👤 ${patient.firstName} ${patient.lastName}`);
          console.log(`   📧 Email: ${patient.email}`);
          console.log(`   📞 Điện thoại: ${patient.phone || 'Chưa có'}`);
          console.log('   ─────────────────────');
        });
      }
      return true;
    } else {
      console.log('❌ Lỗi:', await patientsResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
    return false;
  }
}

// TEST 3: Test tính năng Đăng ký (User Registration)
async function testUserRegistration() {
  console.log('\n📝 TEST 3: Chức năng Đăng ký');
  console.log('-----------------------------');

  try {
    // Test với thông tin đăng ký mẫu
    const registrationData = {
      firstName: 'Test',
      lastName: 'Workflow',
      email: `testworkflow${Date.now()}@example.com`,
      phone: '0123456789',
      password: 'password123',
      gender: 'Male',
      dob: '1990-01-01',
      nic: '123456789012'
    };

    console.log('🔍 Thử đăng ký với email:', registrationData.email);
    const registerResponse = await fetch(`${baseURL}/users/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    console.log('📊 Status:', registerResponse.status);
    const responseText = await registerResponse.text();

    if (registerResponse.status === 201) {
      console.log('✅ THÀNH CÔNG - Đăng ký tài khoản');
      console.log('📧 Cần xác thực OTP qua email');
    } else {
      console.log('⚠️ Response:', responseText);
    }

    return registerResponse.status === 201;
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
    return false;
  }
}

// TEST 4: Test message/contact system
async function testMessageSystem() {
  console.log('\n💬 TEST 4: Hệ thống Tin nhắn/Liên hệ');
  console.log('------------------------------------');

  try {
    // Test gửi tin nhắn liên hệ
    const messageData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      phone: '0123456789',
      message: 'Đây là tin nhắn test từ workflow testing system.'
    };

    console.log('🔍 Thử gửi tin nhắn liên hệ...');
    const messageResponse = await fetch(`${baseURL}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    console.log('📊 Status:', messageResponse.status);
    if (messageResponse.ok) {
      const data = await messageResponse.json();
      console.log('✅ THÀNH CÔNG - Gửi tin nhắn liên hệ');
      console.log('📨 Tin nhắn đã được gửi thành công');
    } else {
      console.log('⚠️ Response:', await messageResponse.text());
    }

    return messageResponse.ok;
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
    return false;
  }
}

// TEST 5: Test API health/status
async function testSystemHealth() {
  console.log('\n🏥 TEST 5: Kiểm tra tình trạng hệ thống');
  console.log('-------------------------------------');

  try {
    // Test base API endpoint
    const healthResponse = await fetch(`http://localhost:4000/api/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 API Base Status:', healthResponse.status);

    // Test v1 endpoint  
    const v1Response = await fetch(`${baseURL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 API v1 Status:', v1Response.status);

    if (healthResponse.ok || v1Response.ok) {
      console.log('✅ THÀNH CÔNG - Hệ thống đang hoạt động');
      return true;
    } else {
      console.log('⚠️ Hệ thống có vấn đề');
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối hệ thống:', error.message);
    return false;
  }
}

// Chạy tất cả test và tổng kết
async function runWorkflowTests() {
  console.log('🚀 BẮT ĐẦU TEST WORKFLOW CÁC CHỨC NĂNG CƠ BẢN...\n');

  const results = {
    doctorsList: await testDoctorsList(),
    patientsList: await testPatientsList(),
    userRegistration: await testUserRegistration(),
    messageSystem: await testMessageSystem(),
    systemHealth: await testSystemHealth()
  };

  console.log('\n🎯 TỔNG KẾT KẾT QUÁ TEST');
  console.log('========================');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'THÀNH CÔNG' : 'THẤT BẠI';
    console.log(`${icon} ${test}: ${status}`);
  });

  console.log(`\n📊 Kết quả: ${passedTests}/${totalTests} tests đã pass`);
  console.log(`💯 Tỷ lệ thành công: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 TẤT CẢ TESTS ĐÃ THÀNH CÔNG!');
  } else {
    console.log('⚠️ Một số chức năng cần authentication hoặc cần fix');
  }
}

runWorkflowTests();
