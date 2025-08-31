import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config/config.env' });

console.log('👀 MONITORING GITHUB OAUTH LOGIN');
console.log('=================================');

let isMonitoring = true;
let previousGitHubCount = 0;

async function monitorGitHubOAuth() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    // Đếm GitHub users
    const githubUsers = await User.find({ authType: 'github' }).select('firstName lastName email createdAt');
    const currentCount = githubUsers.length;

    if (currentCount > previousGitHubCount) {
      console.log('\n🎉 NEW GITHUB USER DETECTED!');
      console.log('=============================');

      const latestUser = githubUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      console.log(`👤 Name: ${latestUser.firstName} ${latestUser.lastName}`);
      console.log(`📧 Email: ${latestUser.email}`);
      console.log(`🕐 Created: ${new Date(latestUser.createdAt).toLocaleString('vi-VN')}`);
      console.log(`🔑 Auth Type: GitHub OAuth`);

      console.log('\n✅ GITHUB OAUTH LOGIN THÀNH CÔNG!');

      // Summary của cả 2 OAuth providers
      console.log('\n📊 OAUTH SUMMARY:');
      console.log('=================');

      const googleUsers = await User.find({ authType: 'google' });
      console.log(`🔴 Google Users: ${googleUsers.length}`);
      console.log(`🟢 GitHub Users: ${githubUsers.length}`);
      console.log(`📊 Total OAuth Users: ${googleUsers.length + githubUsers.length}`);

      isMonitoring = false;
      mongoose.disconnect();
      return;
    }

    console.log(`📊 Current GitHub users: ${currentCount} (waiting for login...)`);
    previousGitHubCount = currentCount;

  } catch (error) {
    console.log('❌ Monitoring error:', error.message);
  }
}

console.log('🔍 Complete GitHub login in your browser...');
console.log('💡 URL đã được mở: http://localhost:4000/api/v1/users/auth/github');

const interval = setInterval(async () => {
  if (!isMonitoring) {
    clearInterval(interval);
    return;
  }
  await monitorGitHubOAuth();
}, 3000);

setTimeout(() => {
  if (isMonitoring) {
    clearInterval(interval);
    console.log('\n⏰ GitHub OAuth monitoring timeout');
    mongoose.disconnect();
    process.exit(0);
  }
}, 120000);
