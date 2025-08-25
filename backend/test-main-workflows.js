import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🏥 TEST CÁC CHỨC NĂNG CHÍNH CỦA HỆ THỐNG');
console.log('=========================================');

// TEST 1: Đăng ký tài khoản (Fixed endpoint)
async function testUserRegistration() {
  console.log('\n📝 TEST 1: Chức năng Đăng ký Bệnh nhân');
  console.log('-------------------------------------');

  try {
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      phone: '0123456789',
      password: 'password123',
      gender: 'Male',
      dob: '1990-01-01',
      nic: '123456789012'
    };

    console.log('🔍 Đăng ký tài khoản với email:', registrationData.email);
    const registerResponse = await fetch(`${baseURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    console.log('📊 Status:', registerResponse.status);
    const responseData = await registerResponse.json();

    if (registerResponse.status === 201) {
      console.log('✅ THÀNH CÔNG - Đăng ký tài khoản');
      console.log('📧 Tin nhắn:', responseData.message);
      console.log('💡 Cần xác thực OTP qua email');
      return true;
    } else {
      console.log('⚠️ Response:', JSON.stringify(responseData, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// TEST 2: Hệ thống tin nhắn/liên hệ
async function testContactSystem() {
  console.log('\n💬 TEST 2: Hệ thống Tin nhắn Liên hệ');
  console.log('-----------------------------------');

  try {
    const messageData = {
      firstName: 'Test',
      lastName: 'Contact',
      email: 'contact@example.com',
      phone: '0987654321',
      message: 'Tôi muốn hỏi về dịch vụ khám bệnh tại bệnh viện.'
    };

    console.log('🔍 Gửi tin nhắn liên hệ...');
    const messageResponse = await fetch(`${baseURL}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    console.log('📊 Status:', messageResponse.status);
    if (messageResponse.ok) {
      const data = await messageResponse.json();
      console.log('✅ THÀNH CÔNG - Gửi tin nhắn liên hệ');
      console.log('📨 Tin nhắn:', data.message);
      return true;
    } else {
      console.log('❌ Lỗi:', await messageResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// TEST 3: Xem danh sách bác sĩ (Thành công từ test trước)
async function testDoctorList() {
  console.log('\n👨‍⚕️ TEST 3: Xem Danh sách Bác sĩ');
  console.log('-------------------------------');

  try {
    const doctorsResponse = await fetch(`${baseURL}/users/doctors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', doctorsResponse.status);
    if (doctorsResponse.ok) {
      const data = await doctorsResponse.json();
      console.log('✅ THÀNH CÔNG - Lấy danh sách bác sĩ');
      console.log('👨‍⚕️ Số lượng bác sĩ:', data.doctors?.length || 0);

      // Hiển thị thông tin bác sĩ theo chuyên khoa
      const specialties = {};
      data.doctors?.forEach(doctor => {
        const dept = doctor.department || 'Đa khoa';
        if (!specialties[dept]) specialties[dept] = [];
        specialties[dept].push(doctor);
      });

      console.log('\n📋 PHÂN LOẠI THEO CHUYÊN KHOA:');
      Object.entries(specialties).forEach(([specialty, doctors]) => {
        console.log(`🏥 ${specialty}: ${doctors.length} bác sĩ`);
      });

      return true;
    } else {
      console.log('❌ Lỗi:', await doctorsResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// TEST 4: Test các endpoint service catalog
async function testServiceCatalog() {
  console.log('\n🏥 TEST 4: Danh mục Dịch vụ Y tế');
  console.log('-------------------------------');

  try {
    const servicesResponse = await fetch(`${baseURL}/services`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', servicesResponse.status);
    if (servicesResponse.ok) {
      const data = await servicesResponse.json();
      console.log('✅ THÀNH CÔNG - Lấy danh mục dịch vụ');
      console.log('🏥 Số dịch vụ:', data.services?.length || 0);

      if (data.services?.length > 0) {
        console.log('\n📋 CÁC DỊCH VỤ HIỆN CÓ:');
        data.services.slice(0, 5).forEach((service, index) => {
          console.log(`${index + 1}. ${service.name} - ${service.price || 'Liên hệ'}đ`);
        });
      }
      return true;
    } else {
      console.log('❌ Lỗi:', await servicesResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// TEST 5: Test ICD10 diagnosis codes
async function testDiagnosisCodes() {
  console.log('\n🔍 TEST 5: Mã Chẩn đoán ICD10');
  console.log('-----------------------------');

  try {
    const icdResponse = await fetch(`${baseURL}/diagnosis/icd10`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', icdResponse.status);
    if (icdResponse.ok) {
      const data = await icdResponse.json();
      console.log('✅ THÀNH CÔNG - Lấy mã chẩn đoán ICD10');
      console.log('🔍 Số mã chẩn đoán:', data.codes?.length || 0);

      if (data.codes?.length > 0) {
        console.log('\n📋 MÃ CHẨN ĐOÁN MẪU:');
        data.codes.slice(0, 3).forEach((code, index) => {
          console.log(`${index + 1}. ${code.code}: ${code.description}`);
        });
      }
      return true;
    } else {
      console.log('❌ Lỗi:', await icdResponse.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// TEST 6: Test workflow đặt lịch hẹn (Không cần auth)
async function testAppointmentBooking() {
  console.log('\n📅 TEST 6: Đặt lịch Khám bệnh');
  console.log('-----------------------------');

  try {
    const appointmentData = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'testpatient@example.com',
      phone: '0123456789',
      nic: '123456789012',
      dob: '1990-01-01',
      gender: 'Male',
      appointment_date: '2025-08-25',
      department: 'Đa khoa',
      doctor_firstName: 'Ngọc',
      doctor_lastName: 'Hà',
      hasVisited: false,
      address: '123 Test Street'
    };

    console.log('🔍 Đặt lịch khám với bác sĩ Ngọc Hà...');
    const appointmentResponse = await fetch(`${baseURL}/appointment/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    console.log('📊 Status:', appointmentResponse.status);
    const responseData = await appointmentResponse.json();

    if (appointmentResponse.status === 200 || appointmentResponse.status === 201) {
      console.log('✅ THÀNH CÔNG - Đặt lịch khám');
      console.log('📅 Thông tin:', responseData.message);
      return true;
    } else {
      console.log('⚠️ Response:', JSON.stringify(responseData, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    return false;
  }
}

// Chạy tất cả test
async function runMainWorkflowTests() {
  console.log('🚀 BẮT ĐẦU TEST CÁC WORKFLOW CHÍNH...\n');

  const results = {
    userRegistration: await testUserRegistration(),
    contactSystem: await testContactSystem(),
    doctorList: await testDoctorList(),
    serviceCatalog: await testServiceCatalog(),
    diagnosisCodes: await testDiagnosisCodes(),
    appointmentBooking: await testAppointmentBooking()
  };

  console.log('\n🎯 TỔNG KẾT KẾT QUÁ TEST WORKFLOW');
  console.log('=================================');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'THÀNH CÔNG' : 'THẤT BẠI';
    console.log(`${icon} ${test}: ${status}`);
  });

  console.log(`\n📊 Kết quả: ${passedTests}/${totalTests} workflows thành công`);
  console.log(`💯 Tỷ lệ thành công: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests >= totalTests * 0.8) {
    console.log('🎉 HỆ THỐNG HOẠT ĐỘNG TỐT!');
    console.log('💡 Người dùng có thể:');
    console.log('   - Xem danh sách bác sĩ');
    console.log('   - Đăng ký tài khoản');
    console.log('   - Gửi tin nhắn liên hệ');
    console.log('   - Đặt lịch khám bệnh');
  } else {
    console.log('⚠️ Một số chức năng cần cải thiện');
  }
}

runMainWorkflowTests();
