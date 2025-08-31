import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config/config.env' });

console.log('📧 TESTING GMAIL OAUTH LOGIN');
console.log('============================');

async function testGmailOAuth() {
  try {
    await import('./models/userScheme.js');
    await mongoose.connect(process.env.MONGO_URI);

    const User = mongoose.model('User');

    console.log('🔍 Current OAuth users in database:');
    console.log('====================================');

    const googleUsers = await User.find({ authType: 'google' }).select('firstName lastName email authType');
    const gmailUsers = await User.find({ authType: 'gmail' }).select('firstName lastName email authType');
    const githubUsers = await User.find({ authType: 'github' }).select('firstName lastName email authType');

    console.log(`📊 Google Users: ${googleUsers.length}`);
    googleUsers.forEach(user => {
      console.log(`   • ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log(`📧 Gmail Users: ${gmailUsers.length}`);
    gmailUsers.forEach(user => {
      console.log(`   • ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log(`🐙 GitHub Users: ${githubUsers.length}`);
    githubUsers.forEach(user => {
      console.log(`   • ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log('\n🚀 Test Gmail OAuth URL:');
    console.log('========================');
    console.log('🔗 Gmail OAuth: http://localhost:4000/api/v1/users/auth/gmail');
    console.log('🔗 Google OAuth: http://localhost:4000/api/v1/users/auth/google');
    console.log('🔗 GitHub OAuth: http://localhost:4000/api/v1/users/auth/github');

    console.log('\n💡 Note: Gmail OAuth sử dụng cùng Google credentials');
    console.log('   Nhưng sẽ tạo user với authType: "gmail"');

    mongoose.disconnect();

  } catch (error) {
    console.log('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

testGmailOAuth();
