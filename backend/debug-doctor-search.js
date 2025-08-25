import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config/config.env' });

console.log('🔍 KIỂM TRA DOCTOR DATA VÀ FIX APPOINTMENT ISSUE');
console.log('===============================================');

async function checkDoctorData() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Lấy tất cả doctors
    const doctors = await User.find({ role: 'Doctor' }).select('firstName lastName email department doctorDepartment');

    console.log(`👨‍⚕️ Found ${doctors.length} doctors:`);

    doctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   📧 Email: ${doctor.email}`);
      console.log(`   🏥 department: ${doctor.department || 'null'}`);
      console.log(`   🏥 doctorDepartment: ${doctor.doctorDepartment || 'null'}`);
    });

    // Kiểm tra xem appointment controller tìm doctor thế nào
    console.log('\n🔍 Testing doctor search logic:');

    const testDepartment = 'Đa khoa';
    const testFirstName = 'Ngọc';
    const testLastName = 'Hà';

    // Test với doctorDepartment (như trong code hiện tại)
    const currentLogic = await User.find({
      firstName: testFirstName,
      lastName: testLastName,
      role: "Doctor",
      doctorDepartment: testDepartment
    });

    console.log(`\n🔬 Current search logic (doctorDepartment): ${currentLogic.length} results`);

    // Test với department 
    const alternativeLogic = await User.find({
      firstName: testFirstName,
      lastName: testLastName,
      role: "Doctor",
      department: testDepartment
    });

    console.log(`🔬 Alternative search logic (department): ${alternativeLogic.length} results`);

    // Test chỉ với tên (bỏ department)
    const nameOnlyLogic = await User.find({
      firstName: testFirstName,
      lastName: testLastName,
      role: "Doctor"
    });

    console.log(`🔬 Name-only search logic: ${nameOnlyLogic.length} results`);

    if (nameOnlyLogic.length > 0) {
      console.log('\n✅ Found doctor with name-only search:');
      nameOnlyLogic.forEach(doc => {
        console.log(`   👨‍⚕️ ${doc.firstName} ${doc.lastName}`);
        console.log(`   🏥 department: ${doc.department || 'null'}`);
        console.log(`   🏥 doctorDepartment: ${doc.doctorDepartment || 'null'}`);
      });
    }

    mongoose.disconnect();

    // Đề xuất fix
    console.log('\n💡 KHUYẾN NGHỊ FIX:');
    if (currentLogic.length === 0 && nameOnlyLogic.length > 0) {
      console.log('🔧 Vấn đề: doctorDepartment field không có dữ liệu');
      console.log('🔧 Giải pháp 1: Update appointment controller để không check department');
      console.log('🔧 Giải pháp 2: Populate doctorDepartment cho existing doctors');
      console.log('🔧 Giải pháp 3: Sử dụng department thay vì doctorDepartment');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkDoctorData();
