import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config/config.env' });

const baseURL = 'http://localhost:4000/api/v1';

console.log('📅 KIỂM TRA CHI TIẾT APPOINTMENT MANAGEMENT');
console.log('==========================================');

// Lấy user data từ database
async function getUsersFromDatabase() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Lấy một số users để test
    const doctors = await User.find({ role: 'Doctor' }).limit(3).select('firstName lastName email role');
    const patients = await User.find({ role: 'Patient' }).limit(3).select('firstName lastName email role');
    const admins = await User.find({ role: 'Admin' }).limit(1).select('firstName lastName email role');

    mongoose.disconnect();

    return { doctors, patients, admins };
  } catch (error) {
    console.log('❌ Lỗi kết nối database:', error.message);
    return { doctors: [], patients: [], admins: [] };
  }
}

// Test login với từng role
async function loginAsRole(email, role) {
  try {
    const loginResponse = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123',
        role: role
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test appointment endpoints với từng role
async function testAppointmentEndpoints(token, userRole, userName) {
  console.log(`\n📋 Testing Appointment Management - ${userName} (${userRole})`);
  console.log('─'.repeat(60));

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Test GET all appointments
  try {
    console.log('🔍 1. Lấy danh sách appointments...');
    const getResponse = await fetch(`${baseURL}/appointment/getall`, { headers });
    console.log(`📊 Status: ${getResponse.status}`);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`✅ Thành công - ${data.appointments?.length || 0} appointments`);

      if (data.appointments?.length > 0) {
        console.log('📋 Appointment mẫu:');
        data.appointments.slice(0, 2).forEach((apt, i) => {
          console.log(`   ${i + 1}. ${apt.firstName} ${apt.lastName} - ${apt.status}`);
          console.log(`      📅 ${new Date(apt.appointment_date).toLocaleDateString('vi-VN')}`);
          console.log(`      👨‍⚕️ Dr. ${apt.doctor?.firstName || apt.doctor_firstName} ${apt.doctor?.lastName || apt.doctor_lastName}`);
        });
      }
    } else {
      const error = await getResponse.json();
      console.log(`❌ Lỗi: ${error.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  // 2. Test POST new appointment (nếu có quyền)
  try {
    console.log('\n📝 2. Tạo appointment mới...');
    const appointmentData = {
      firstName: 'Test',
      lastName: `${userRole}User`,
      email: `test${userRole.toLowerCase()}@example.com`,
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

    console.log(`📊 Status: ${postResponse.status}`);

    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log(`✅ Thành công - Tạo appointment: ${data.message}`);
    } else {
      const error = await postResponse.json();
      console.log(`❌ Lỗi: ${error.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  // 3. Test update appointment (nếu có appointment ID)
  try {
    console.log('\n✏️ 3. Kiểm tra update appointment...');
    // Lấy appointment đầu tiên để test update
    const getResponse = await fetch(`${baseURL}/appointment/getall`, { headers });

    if (getResponse.ok) {
      const data = await getResponse.json();
      if (data.appointments?.length > 0) {
        const appointmentId = data.appointments[0]._id;

        const updateResponse = await fetch(`${baseURL}/appointment/update/${appointmentId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: 'Confirmed' })
        });

        console.log(`📊 Status: ${updateResponse.status}`);

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log(`✅ Thành công - Update appointment: ${updateData.message || 'Updated'}`);
        } else {
          const error = await updateResponse.json();
          console.log(`❌ Lỗi: ${error.message}`);
        }
      } else {
        console.log('ℹ️ Không có appointment để test update');
      }
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  // 4. Test delete appointment
  try {
    console.log('\n🗑️ 4. Kiểm tra delete appointment...');
    const getResponse = await fetch(`${baseURL}/appointment/getall`, { headers });

    if (getResponse.ok) {
      const data = await getResponse.json();
      if (data.appointments?.length > 0) {
        // Tìm appointment có thể delete (status pending hoặc mới tạo)
        const deletableApt = data.appointments.find(apt =>
          apt.status === 'Pending' || apt.firstName === 'Test'
        );

        if (deletableApt) {
          const deleteResponse = await fetch(`${baseURL}/appointment/delete/${deletableApt._id}`, {
            method: 'DELETE',
            headers
          });

          console.log(`📊 Status: ${deleteResponse.status}`);

          if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            console.log(`✅ Thành công - Delete appointment: ${deleteData.message || 'Deleted'}`);
          } else {
            const error = await deleteResponse.json();
            console.log(`❌ Lỗi: ${error.message}`);
          }
        } else {
          console.log('ℹ️ Không có appointment phù hợp để test delete');
        }
      }
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }
}

// Main test function
async function testAppointmentManagementWithRealUsers() {
  console.log('🚀 Bắt đầu test Appointment Management với user data thực...\n');

  // Lấy users từ database
  const { doctors, patients, admins } = await getUsersFromDatabase();

  console.log('👥 Users có sẵn trong database:');
  console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
  console.log(`   👤 Patients: ${patients.length}`);
  console.log(`   👨‍💼 Admins: ${admins.length}`);

  // Test với Admin role
  if (admins.length > 0) {
    const admin = admins[0];
    console.log(`\n🔑 Login as Admin: ${admin.firstName} ${admin.lastName}`);
    const adminToken = await loginAsRole(admin.email, 'Admin');

    if (adminToken) {
      await testAppointmentEndpoints(adminToken, 'Admin', `${admin.firstName} ${admin.lastName}`);
    } else {
      console.log('❌ Không thể login as Admin');
    }
  }

  // Test với Doctor role
  if (doctors.length > 0) {
    const doctor = doctors[0];
    console.log(`\n🔑 Login as Doctor: ${doctor.firstName} ${doctor.lastName}`);
    const doctorToken = await loginAsRole(doctor.email, 'Doctor');

    if (doctorToken) {
      await testAppointmentEndpoints(doctorToken, 'Doctor', `${doctor.firstName} ${doctor.lastName}`);
    } else {
      console.log('❌ Không thể login as Doctor');
    }
  }

  // Test với Patient role
  if (patients.length > 0) {
    const patient = patients[0];
    console.log(`\n🔑 Login as Patient: ${patient.firstName} ${patient.lastName}`);
    const patientToken = await loginAsRole(patient.email, 'Patient');

    if (patientToken) {
      await testAppointmentEndpoints(patientToken, 'Patient', `${patient.firstName} ${patient.lastName}`);
    } else {
      console.log('❌ Không thể login as Patient');
    }
  }

  // Test appointment booking không cần auth (nếu có)
  console.log('\n🔓 Test appointment booking không cần authentication...');
  try {
    const publicAppointmentData = {
      firstName: 'Public',
      lastName: 'User',
      email: 'publicuser@example.com',
      phone: '0987654321',
      nic: '987654321098',
      dob: '1985-05-15',
      gender: 'Female',
      appointment_date: '2025-08-27',
      department: 'Đa khoa',
      doctor_firstName: 'Thanh',
      doctor_lastName: 'Sơn',
      hasVisited: false,
      address: '456 Public Street'
    };

    const publicResponse = await fetch(`${baseURL}/appointment/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publicAppointmentData)
    });

    console.log(`📊 Public booking status: ${publicResponse.status}`);

    if (publicResponse.ok) {
      const data = await publicResponse.json();
      console.log(`✅ Thành công - Public appointment booking: ${data.message}`);
    } else {
      const error = await publicResponse.json();
      console.log(`❌ Lỗi: ${error.message}`);
    }
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }

  console.log('\n🎯 TỔNG KẾT APPOINTMENT MANAGEMENT TEST');
  console.log('========================================');
  console.log('✅ Đã test với các role: Admin, Doctor, Patient');
  console.log('✅ Đã test các operations: GET, POST, PUT, DELETE');
  console.log('✅ Đã test cả public và authenticated access');
  console.log('💡 Kết quả sẽ cho thấy role permissions và endpoint behavior');
}

testAppointmentManagementWithRealUsers();
