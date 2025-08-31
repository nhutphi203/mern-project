console.log('🧪 QUICK GOOGLE OAUTH TEST');
console.log('==========================');

console.log('📋 Current Configuration:');
console.log('✅ Backend Server: Running on port 4000');
console.log('✅ BACKEND_URL: http://localhost:4000');
console.log('✅ Google Client ID: 212975429172-rk72qo6hdh9dcu9lv5f12mk2bh6hf0gk');
console.log('✅ OAuth Endpoints: Working');

console.log('\n🔗 Test URLs:');
console.log('Google Auth: http://localhost:4000/api/v1/users/auth/google');
console.log('GitHub Auth: http://localhost:4000/api/v1/users/auth/github');

console.log('\n🎯 REQUIRED GOOGLE CONSOLE SETUP:');
console.log('=================================');
console.log('Authorized redirect URIs cần có:');
console.log('➜ http://localhost:4000/api/v1/users/auth/google/callback');

console.log('\n📝 SAU KHI CẤU HÌNH GOOGLE CONSOLE:');
console.log('===================================');
console.log('1. Save thay đổi trong Google Console');
console.log('2. Đợi vài phút để changes có hiệu lực');
console.log('3. Test lại: http://localhost:4000/api/v1/users/auth/google');

console.log('\n💡 NẾU VẪN LỖI:');
console.log('================');
console.log('Thử thêm các URLs này vào Google Console:');
console.log('- http://localhost:4000/api/v1/users/auth/google/callback');
console.log('- http://127.0.0.1:4000/api/v1/users/auth/google/callback');
console.log('- https://localhost:4000/api/v1/users/auth/google/callback');

console.log('\n🎉 KHI THÀNH CÔNG:');
console.log('==================');
console.log('- Google sẽ redirect về backend');
console.log('- Backend sẽ tạo/update user trong database');
console.log('- User sẽ được redirect về frontend với token');
console.log('- Có thể login và có đầy đủ quyền');

console.log('\n🔍 GITHUB SETUP (sau khi Google xong):');
console.log('======================================');
console.log('GitHub OAuth App callback URL:');
console.log('➜ http://localhost:4000/api/v1/users/auth/github/callback');

console.log('\n📞 BẠN ĐANG LÀM GÌ?');
console.log('===================');
console.log('[] Đã vào Google Console?');
console.log('[] Đã tìm thấy OAuth Client ID?');
console.log('[] Đã thêm redirect URI?');
console.log('[] Đã Save changes?');

console.log('\nSẴN SÀNG TEST NGAY KHI BẠN XONG! 🚀');
