import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';

config({ path: './config/config.env' });

console.log('🔍 KIỂM TRA USER DATA VÀ PASSWORD');
console.log('=================================');

async function checkUserData() {
  try {
    // Import model properly
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Lấy một số user để test
    const testUsers = await User.find({
      email: { $in: ['admin@hospital.com', 'doctor@hospital.com', 'patient@hospital.com'] }
    }).select('firstName lastName email role password');

    console.log('📊 Tìm thấy', testUsers.length, 'test users:');

    for (const user of testUsers) {
      console.log(`\n👤 User: ${user.firstName} ${user.lastName}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🔒 Has password: ${user.password ? 'Yes' : 'No'}`);

      if (user.password) {
        // Test password
        const testPasswords = ['testpassword123', 'password123', '123456', 'admin123'];

        for (const testPass of testPasswords) {
          try {
            const isMatch = await bcrypt.compare(testPass, user.password);
            if (isMatch) {
              console.log(`✅ Password match: "${testPass}"`);
              break;
            }
          } catch (error) {
            console.log(`❌ Password test error: ${error.message}`);
          }
        }
      }
    }

    // Nếu không tìm thấy test users, lấy một số users khác
    if (testUsers.length === 0) {
      console.log('\n⚠️ Không tìm thấy test users, lấy users khác...');

      const otherUsers = await User.find({}).limit(5).select('firstName lastName email role');

      console.log('📋 Users có sẵn:');
      otherUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      });
    }

    mongoose.disconnect();
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }
}

checkUserData();
