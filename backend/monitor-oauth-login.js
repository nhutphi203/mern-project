import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config/config.env' });

console.log('👀 MONITORING GOOGLE OAUTH LOGIN RESULT');
console.log('=======================================');

let isMonitoring = true;
let previousUserCount = 0;

async function monitorOAuthResult() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Lấy current count
    const currentUsers = await User.find({ authType: 'google' }).select('firstName lastName email createdAt');
    const currentCount = currentUsers.length;

    if (currentCount > previousUserCount) {
      console.log('\n🎉 NEW GOOGLE USER DETECTED!');
      console.log('============================');

      // Lấy user mới nhất
      const latestUser = currentUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      console.log(`👤 Name: ${latestUser.firstName} ${latestUser.lastName}`);
      console.log(`📧 Email: ${latestUser.email}`);
      console.log(`🕐 Created: ${new Date(latestUser.createdAt).toLocaleString('vi-VN')}`);
      console.log(`🔑 Auth Type: Google OAuth`);

      console.log('\n✅ GOOGLE OAUTH LOGIN THÀNH CÔNG!');
      console.log('=================================');

      isMonitoring = false;
      mongoose.disconnect();
      return;
    }

    console.log(`📊 Current Google users: ${currentCount} (waiting for new login...)`);
    previousUserCount = currentCount;

  } catch (error) {
    console.log('❌ Monitoring error:', error.message);
  }
}

// Monitor mỗi 3 giây
console.log('🔍 Waiting for Google OAuth login...');
console.log('💡 Complete the Google login in your browser');

const monitorInterval = setInterval(async () => {
  if (!isMonitoring) {
    clearInterval(monitorInterval);
    return;
  }

  await monitorOAuthResult();
}, 3000);

// Stop monitoring sau 2 phút
setTimeout(() => {
  if (isMonitoring) {
    clearInterval(monitorInterval);
    console.log('\n⏰ Monitoring timeout. OAuth login không hoàn thành trong 2 phút.');
    console.log('💡 Nếu bạn đã login, hãy check database manually');
    mongoose.disconnect();
    process.exit(0);
  }
}, 120000);
