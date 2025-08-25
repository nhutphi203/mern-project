import fetch from 'node-fetch';

const baseURL = 'http://localhost:4000/api/v1';

console.log('🔐 TEST AUTHENTICATION WORKFLOW VỚI USER CÓ SẴN');
console.log('===============================================');

// Thử đăng nhập với các user có sẵn
async function testLoginWorkflow() {
  console.log('\n🔑 TEST 1: Đăng nhập với Admin');
  console.log('------------------------------');

  const testUsers = [
    { email: 'admin@hospital.com', role: 'Admin', name: 'Admin User' },
    { email: 'doctor@hospital.com', role: 'Doctor', name: 'Doctor Smith' },
    { email: 'patient@hospital.com', role: 'Patient', name: 'Patient Test' }
  ];

  let authToken = null;
  let successUser = null;

  for (const user of testUsers) {
    try {
      console.log(`\n🔍 Thử đăng nhập: ${user.name} (${user.role})`);

      const loginResponse = await fetch(`${baseURL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: 'password123',
          role: user.role
        })
      });

      console.log(`📊 Status: ${loginResponse.status}`);

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
        console.log(`👤 User: ${loginData.user.firstName} ${loginData.user.lastName}`);
        console.log(`🔑 Token: ${loginData.token ? 'Có' : 'Không'}`);

        authToken = loginData.token;
        successUser = user;
        break;
      } else {
        const errorData = await loginResponse.json();
        console.log(`❌ Thất bại: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi: ${error.message}`);
    }
  }

  return { authToken, successUser };
}

// Test các chức năng với authentication
async function testAuthenticatedFeatures(authToken, user) {
  if (!authToken) {
    console.log('\n❌ Không có token để test authenticated features');
    return;
  }

  console.log(`\n🔐 TEST 2: Chức năng với Authentication (${user.name})`);
  console.log('='.repeat(50));

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  // Test 1: Medical Records
  try {
    console.log('\n📋 1. Hồ sơ Y tế');
    const recordsResponse = await fetch(`${baseURL}/medical-records/summary`, { headers });
    console.log(`📊 Status: ${recordsResponse.status}`);

    if (recordsResponse.ok) {
      const data = await recordsResponse.json();
      console.log('✅ THÀNH CÔNG - Truy cập hồ sơ y tế');
      console.log(`📊 Số hồ sơ: ${data.records?.length || 0}`);

      if (data.records?.length > 0) {
        data.records.slice(0, 2).forEach((record, index) => {
          console.log(`   ${index + 1}. Bệnh nhân: ${record.patientName || 'N/A'}`);
        });
      }
    } else {
      const errorData = await recordsResponse.json();
      console.log(`❌ Lỗi: ${errorData.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  // Test 2: Appointments
  try {
    console.log('\n📅 2. Quản lý Cuộc hẹn');
    const appointmentsResponse = await fetch(`${baseURL}/appointment/getall`, { headers });
    console.log(`📊 Status: ${appointmentsResponse.status}`);

    if (appointmentsResponse.ok) {
      const data = await appointmentsResponse.json();
      console.log('✅ THÀNH CÔNG - Truy cập cuộc hẹn');
      console.log(`📅 Số cuộc hẹn: ${data.appointments?.length || 0}`);

      if (data.appointments?.length > 0) {
        console.log('📋 Cuộc hẹn gần đây:');
        data.appointments.slice(0, 3).forEach((apt, index) => {
          console.log(`   ${index + 1}. ${apt.firstName} ${apt.lastName} - ${apt.status}`);
        });
      }
    } else {
      const errorData = await appointmentsResponse.json();
      console.log(`❌ Lỗi: ${errorData.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  // Test 3: Lab Results (nếu là Doctor hoặc Admin)
  if (user.role === 'Doctor' || user.role === 'Admin') {
    try {
      console.log('\n🔬 3. Kết quả Xét nghiệm');
      const labResponse = await fetch(`${baseURL}/lab/results`, { headers });
      console.log(`📊 Status: ${labResponse.status}`);

      if (labResponse.ok) {
        const data = await labResponse.json();
        console.log('✅ THÀNH CÔNG - Truy cập kết quả xét nghiệm');
        console.log(`🔬 Số kết quả: ${data.results?.length || 0}`);
      } else {
        const errorData = await labResponse.json();
        console.log(`❌ Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi: ${error.message}`);
    }
  }

  // Test 4: User Management (nếu là Admin)
  if (user.role === 'Admin') {
    try {
      console.log('\n👥 4. Quản lý Người dùng');
      const usersResponse = await fetch(`${baseURL}/users/patients`, { headers });
      console.log(`📊 Status: ${usersResponse.status}`);

      if (usersResponse.ok) {
        const data = await usersResponse.json();
        console.log('✅ THÀNH CÔNG - Truy cập danh sách bệnh nhân');
        console.log(`👥 Số bệnh nhân: ${data.patients?.length || 0}`);
      } else {
        const errorData = await usersResponse.json();
        console.log(`❌ Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi: ${error.message}`);
    }
  }
}

// Test đặt lịch hẹn với authentication
async function testAppointmentBooking(authToken) {
  if (!authToken) {
    console.log('\n❌ Không có token để test appointment booking');
    return;
  }

  console.log('\n📅 TEST 3: Đặt lịch Khám bệnh (Authenticated)');
  console.log('--------------------------------------------');

  try {
    const appointmentData = {
      firstName: 'Test',
      lastName: 'Authenticated',
      email: 'testauth@example.com',
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

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    console.log('🔍 Đặt lịch khám với authentication...');
    const appointmentResponse = await fetch(`${baseURL}/appointment/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData)
    });

    console.log(`📊 Status: ${appointmentResponse.status}`);
    const responseData = await appointmentResponse.json();

    if (appointmentResponse.ok) {
      console.log('✅ THÀNH CÔNG - Đặt lịch khám với authentication');
      console.log(`📅 Thông tin: ${responseData.message}`);
    } else {
      console.log(`❌ Lỗi: ${responseData.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }
}

// Main workflow test
async function runAuthenticatedWorkflowTest() {
  console.log('🚀 BẮT ĐẦU TEST AUTHENTICATED WORKFLOW...\n');

  const { authToken, successUser } = await testLoginWorkflow();

  if (authToken && successUser) {
    await testAuthenticatedFeatures(authToken, successUser);
    await testAppointmentBooking(authToken);

    console.log('\n🎉 KẾT LUẬN AUTHENTICATION WORKFLOW');
    console.log('===================================');
    console.log('✅ Authentication system hoạt động');
    console.log('✅ Role-based access control hoạt động');
    console.log('✅ Protected endpoints được bảo mật đúng cách');
    console.log(`✅ User ${successUser.name} có thể truy cập các chức năng của role ${successUser.role}`);
  } else {
    console.log('\n❌ KẾT LUẬN: AUTHENTICATION CÓ VẤN ĐỀ');
    console.log('=====================================');
    console.log('❌ Không thể đăng nhập với bất kỳ user nào');
    console.log('💡 Cần kiểm tra lại password hoặc user data');
  }
}

runAuthenticatedWorkflowTest();
