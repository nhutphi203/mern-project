import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🏥 BẮT ĐẦU TEST CÁC CHỨC NĂNG CỐT LÕI');
console.log('==============================================');

// TEST 1: Quản lý bệnh nhân (Patient Management)
async function testPatientManagement() {
  console.log('\n📋 TEST 1: Quản lý Bệnh nhân');
  console.log('-----------------------------');

  try {
    // Lấy danh sách tất cả bệnh nhân
    console.log('🔍 Lấy danh sách bệnh nhân...');
    const patientsResponse = await fetch(`${baseURL}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', patientsResponse.status);
    if (patientsResponse.ok) {
      const data = await patientsResponse.json();
      console.log('✅ Lấy danh sách thành công');
      console.log('👥 Số lượng người dùng:', data.users?.length || 0);

      // Đếm số bệnh nhân
      const patients = data.users?.filter(user => user.role === 'Patient') || [];
      console.log('🏥 Số bệnh nhân:', patients.length);

      if (patients.length > 0) {
        console.log('📝 Bệnh nhân mẫu:', patients[0].firstName, patients[0].lastName, '|', patients[0].email);
      }
    } else {
      console.log('❌ Lỗi:', await patientsResponse.text());
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
  }
}

// TEST 2: Quản lý bác sĩ (Doctor Management)
async function testDoctorManagement() {
  console.log('\n👨‍⚕️ TEST 2: Quản lý Bác sĩ');
  console.log('-----------------------------');

  try {
    console.log('🔍 Lấy danh sách bác sĩ...');
    const doctorsResponse = await fetch(`${baseURL}/users/doctors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', doctorsResponse.status);
    if (doctorsResponse.ok) {
      const data = await doctorsResponse.json();
      console.log('✅ Lấy danh sách bác sĩ thành công');
      console.log('👨‍⚕️ Số bác sĩ:', data.doctors?.length || 0);

      if (data.doctors?.length > 0) {
        console.log('📝 Bác sĩ mẫu:', data.doctors[0].firstName, data.doctors[0].lastName);
        console.log('🏥 Chuyên khoa:', data.doctors[0].department || 'Chưa có');
      }
    } else {
      console.log('❌ Lỗi:', await doctorsResponse.text());
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
  }
}

// TEST 3: Medical Records (Chức năng đã fix)
async function testMedicalRecords() {
  console.log('\n📋 TEST 3: Hồ sơ Y tế');
  console.log('------------------------');

  try {
    console.log('🔍 Lấy tổng quan hồ sơ y tế...');
    const recordsResponse = await fetch(`${baseURL}/medical-records/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', recordsResponse.status);
    if (recordsResponse.ok) {
      const data = await recordsResponse.json();
      console.log('✅ Lấy hồ sơ y tế thành công');
      console.log('📊 Số hồ sơ:', data.records?.length || 0);

      if (data.records?.length > 0) {
        data.records.forEach((record, index) => {
          console.log(`📝 Hồ sơ ${index + 1}:`);
          console.log(`   - ID: ${record._id}`);
          console.log(`   - Bệnh nhân: ${record.patientName || 'Không có tên'}`);
          console.log(`   - Ngày tạo: ${new Date(record.createdAt).toLocaleDateString('vi-VN')}`);
        });
      }
    } else {
      console.log('❌ Lỗi:', await recordsResponse.text());
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
  }
}

// TEST 4: Appointment System
async function testAppointmentSystem() {
  console.log('\n📅 TEST 4: Hệ thống Đặt lịch');
  console.log('------------------------------');

  try {
    console.log('🔍 Lấy danh sách cuộc hẹn...');
    const appointmentsResponse = await fetch(`${baseURL}/appointment/getall`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', appointmentsResponse.status);
    if (appointmentsResponse.ok) {
      const data = await appointmentsResponse.json();
      console.log('✅ Lấy cuộc hẹn thành công');
      console.log('📅 Số cuộc hẹn:', data.appointments?.length || 0);

      if (data.appointments?.length > 0) {
        const recent = data.appointments.slice(0, 3);
        recent.forEach((apt, index) => {
          console.log(`📝 Cuộc hẹn ${index + 1}:`);
          console.log(`   - Bệnh nhân: ${apt.firstName} ${apt.lastName}`);
          console.log(`   - Ngày: ${new Date(apt.appointment_date).toLocaleDateString('vi-VN')}`);
          console.log(`   - Trạng thái: ${apt.status}`);
        });
      }
    } else {
      console.log('❌ Lỗi:', await appointmentsResponse.text());
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
  }
}

// TEST 5: Lab System
async function testLabSystem() {
  console.log('\n🔬 TEST 5: Hệ thống Xét nghiệm');
  console.log('-------------------------------');

  try {
    console.log('🔍 Lấy danh sách xét nghiệm...');
    const labResponse = await fetch(`${baseURL}/lab/results`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 Status:', labResponse.status);
    if (labResponse.ok) {
      const data = await labResponse.json();
      console.log('✅ Lấy kết quả xét nghiệm thành công');
      console.log('🔬 Số kết quả:', data.results?.length || 0);
    } else {
      console.log('❌ Lỗi:', await labResponse.text());
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:', error.message);
  }
}

// Chạy tất cả các test
async function runAllTests() {
  await testPatientManagement();
  await testDoctorManagement();
  await testMedicalRecords();
  await testAppointmentSystem();
  await testLabSystem();

  console.log('\n🎉 HOÀN THÀNH TEST CÁC CHỨC NĂNG CỐT LÕI');
  console.log('=====================================');
}

runAllTests();
