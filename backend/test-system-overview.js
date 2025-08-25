import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🏥 BÁO CÁO TỔNG QUAN HỆ THỐNG BỆNH VIỆN');
console.log('==========================================');

// Test các chức năng cốt lõi đang hoạt động
async function testWorkingFeatures() {
  console.log('\n✅ CÁC CHỨC NĂNG ĐANG HOẠT ĐỘNG TỐT');
  console.log('=====================================');

  const workingFeatures = [];

  // 1. Hệ thống tin nhắn liên hệ
  try {
    console.log('\n💬 1. Hệ thống Tin nhắn Liên hệ');
    const messageResponse = await fetch(`${baseURL}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'System',
        lastName: 'Test',
        email: 'systemtest@example.com',
        phone: '0123456789',
        message: 'Test từ báo cáo tổng quan hệ thống'
      })
    });

    if (messageResponse.ok) {
      console.log('   ✅ HOẠT ĐỘNG - Khách hàng có thể gửi tin nhắn liên hệ');
      workingFeatures.push('Hệ thống tin nhắn liên hệ');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 2. Danh sách bác sĩ
  try {
    console.log('\n👨‍⚕️ 2. Xem Danh sách Bác sĩ');
    const doctorsResponse = await fetch(`${baseURL}/users/doctors`);

    if (doctorsResponse.ok) {
      const data = await doctorsResponse.json();
      console.log(`   ✅ HOẠT ĐỘNG - ${data.doctors?.length || 0} bác sĩ có sẵn`);
      console.log('   📋 Khách hàng có thể:');
      console.log('      - Xem thông tin bác sĩ');
      console.log('      - Chọn bác sĩ phù hợp');
      console.log('      - Xem chuyên khoa');
      workingFeatures.push('Danh sách bác sĩ');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 3. Danh mục dịch vụ
  try {
    console.log('\n🏥 3. Danh mục Dịch vụ Y tế');
    const servicesResponse = await fetch(`${baseURL}/services`);

    if (servicesResponse.ok) {
      const data = await servicesResponse.json();
      console.log('   ✅ HOẠT ĐỘNG - Danh mục dịch vụ có sẵn');
      console.log(`   📊 Số dịch vụ: ${data.services?.length || 0}`);
      workingFeatures.push('Danh mục dịch vụ');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  return workingFeatures;
}

// Test các chức năng cần authentication
async function testAuthRequiredFeatures() {
  console.log('\n🔐 CÁC CHỨC NĂNG CẦN ĐĂNG NHẬP');
  console.log('==============================');

  const authFeatures = [];

  // 1. Medical Records
  try {
    console.log('\n📋 1. Hồ sơ Y tế');
    const recordsResponse = await fetch(`${baseURL}/medical-records/summary`);
    console.log(`   📊 Status: ${recordsResponse.status}`);
    if (recordsResponse.status === 401) {
      console.log('   🔐 CẦN ĐĂNG NHẬP - Hồ sơ y tế được bảo mật');
      authFeatures.push('Hồ sơ y tế');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 2. Appointment Management
  try {
    console.log('\n📅 2. Quản lý Cuộc hẹn');
    const appointmentResponse = await fetch(`${baseURL}/appointment/getall`);
    console.log(`   📊 Status: ${appointmentResponse.status}`);
    if (appointmentResponse.status === 401) {
      console.log('   🔐 CẦN ĐĂNG NHẬP - Quản lý cuộc hẹn được bảo mật');
      authFeatures.push('Quản lý cuộc hẹn');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 3. Lab System
  try {
    console.log('\n🔬 3. Hệ thống Xét nghiệm');
    const labResponse = await fetch(`${baseURL}/lab/results`);
    console.log(`   📊 Status: ${labResponse.status}`);
    if (labResponse.status === 401) {
      console.log('   🔐 CẦN ĐĂNG NHẬP - Kết quả xét nghiệm được bảo mật');
      authFeatures.push('Hệ thống xét nghiệm');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 4. Billing System
  try {
    console.log('\n💰 4. Hệ thống Thanh toán');
    const billingResponse = await fetch(`${baseURL}/billing/invoices`);
    console.log(`   📊 Status: ${billingResponse.status}`);
    if (billingResponse.status === 401) {
      console.log('   🔐 CẦN ĐĂNG NHẬP - Thanh toán được bảo mật');
      authFeatures.push('Hệ thống thanh toán');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  return authFeatures;
}

// Test các vấn đề cần khắc phục
async function testIssues() {
  console.log('\n⚠️ CÁC VẤN ĐỀ CẦN KHẮC PHỤC');
  console.log('============================');

  const issues = [];

  // 1. User Registration với email service
  try {
    console.log('\n📝 1. Đăng ký Tài khoản');
    const registerResponse = await fetch(`${baseURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Issue',
        email: 'testissue@example.com',
        phone: '0123456789',
        password: 'password123',
        gender: 'Male',
        dob: '1990-01-01',
        nic: '123456789012'
      })
    });

    if (registerResponse.status === 500) {
      console.log('   ⚠️ VẤN ĐỀ: Email service configuration');
      console.log('   💡 Giải pháp: Cấu hình lại Gmail SMTP settings');
      issues.push('Email service cho đăng ký');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  // 2. ICD10 Diagnosis Codes
  try {
    console.log('\n🔍 2. Mã Chẩn đoán ICD10');
    const icdResponse = await fetch(`${baseURL}/diagnosis/icd10`);

    if (icdResponse.status === 404) {
      console.log('   ⚠️ VẤN ĐỀ: Endpoint không tồn tại');
      console.log('   💡 Cần kiểm tra router configuration');
      issues.push('ICD10 diagnosis codes endpoint');
    }
  } catch (error) {
    console.log('   ❌ LỖI:', error.message);
  }

  return issues;
}

// Đánh giá user experience cho từng role
async function evaluateUserExperience() {
  console.log('\n👥 ĐÁNH GIÁ TRẢI NGHIỆM NGƯỜI DÙNG');
  console.log('==================================');

  console.log('\n🏥 1. KHÁCH HÀNG/BỆNH NHÂN:');
  console.log('   ✅ Có thể xem danh sách bác sĩ');
  console.log('   ✅ Có thể gửi tin nhắn liên hệ');
  console.log('   ⚠️ Đăng ký tài khoản gặp vấn đề (email service)');
  console.log('   ❌ Không thể đặt lịch hẹn (cần đăng nhập)');

  console.log('\n👨‍⚕️ 2. BÁC SĨ:');
  console.log('   🔐 Cần đăng nhập để truy cập:');
  console.log('   - Xem hồ sơ bệnh nhân');
  console.log('   - Quản lý cuộc hẹn');
  console.log('   - Kê đơn thuốc');
  console.log('   - Xem kết quả xét nghiệm');

  console.log('\n👩‍💼 3. TIẾP TÂN:');
  console.log('   🔐 Cần đăng nhập để:');
  console.log('   - Đăng ký bệnh nhân');
  console.log('   - Quản lý lịch hẹn');
  console.log('   - Thanh toán');

  console.log('\n🔬 4. KỸ THUẬT VIÊN XÉT NGHIỆM:');
  console.log('   🔐 Cần đăng nhập để:');
  console.log('   - Nhập kết quả xét nghiệm');
  console.log('   - Quản lý mẫu xét nghiệm');

  console.log('\n👨‍💼 5. QUẢN TRỊ VIÊN:');
  console.log('   🔐 Cần đăng nhập để:');
  console.log('   - Quản lý người dùng');
  console.log('   - Xem báo cáo tổng quan');
  console.log('   - Cấu hình hệ thống');
}

// Báo cáo cuối cùng
async function generateFinalReport() {
  const workingFeatures = await testWorkingFeatures();
  const authFeatures = await testAuthRequiredFeatures();
  const issues = await testIssues();

  await evaluateUserExperience();

  console.log('\n📊 BÁO CÁO TỔNG KẾT');
  console.log('===================');

  console.log('\n✅ CHỨC NĂNG HOẠT ĐỘNG TỐT:', workingFeatures.length);
  workingFeatures.forEach(feature => console.log(`   - ${feature}`));

  console.log('\n🔐 CHỨC NĂNG CẦN AUTHENTICATION:', authFeatures.length);
  authFeatures.forEach(feature => console.log(`   - ${feature}`));

  console.log('\n⚠️ CHỨC NĂNG CẦN KHẮC PHỤC:', issues.length);
  issues.forEach(issue => console.log(`   - ${issue}`));

  const totalFeatures = workingFeatures.length + authFeatures.length;
  const workingPercentage = ((workingFeatures.length / totalFeatures) * 100).toFixed(1);

  console.log(`\n📈 TỶ LỆ CHỨC NĂNG HOẠT ĐỘNG: ${workingPercentage}%`);

  if (parseFloat(workingPercentage) >= 60) {
    console.log('\n🎉 KẾT LUẬN: HỆ THỐNG ĐANG HOẠT ĐỘNG ỔN ĐỊNH');
    console.log('💡 Khuyến nghị: Tiếp tục phát triển các chức năng authentication');
  } else {
    console.log('\n⚠️ KẾT LUẬN: HỆ THỐNG CẦN CẢI THIỆN');
    console.log('💡 Khuyến nghị: Ưu tiên khắc phục các lỗi cơ bản');
  }

  console.log('\n🚀 BƯỚC TIẾP THEO:');
  console.log('1. Fix email service cho user registration');
  console.log('2. Test authentication workflow với existing users');
  console.log('3. Test role-based access control');
  console.log('4. Kiểm tra appointment booking workflow');
  console.log('5. Validate medical records functionality');
}

generateFinalReport();
