// backend/scripts/check-oauth-config.js
// Chạy file này để kiểm tra cấu hình OAuth

import dotenv from 'dotenv';
dotenv.config();

console.log("=== KIỂM TRA CẤU HÌNH GOOGLE OAUTH ===\n");

// 1. Kiểm tra environment variables
console.log("1. Environment Variables:");
console.log("✅ GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✓ Có" : "❌ Thiếu");
console.log("✅ GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("✅ GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✓ Có" : "❌ Thiếu");
console.log("✅ BACKEND_URL:", process.env.BACKEND_URL || "❌ Thiếu - Cần thêm vào .env");
console.log("✅ FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Thiếu - Cần thêm vào .env");

console.log("\n2. URLs được sử dụng:");
const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
const callbackUrl = `${backendUrl}/api/v1/users/auth/google/callback`;
console.log("✅ Callback URL:", callbackUrl);
console.log("✅ Frontend URL:", process.env.FRONTEND_URL || "http://localhost:3000");

console.log("\n3. Google Client ID Format Check:");
if (process.env.GOOGLE_CLIENT_ID) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    console.log("✅ Client ID Length:", clientId.length, "characters");
    console.log("✅ Ends with .googleusercontent.com:", clientId.endsWith('.googleusercontent.com') ? "✓ Đúng" : "❌ Sai format");
    console.log("✅ Client ID Preview:", clientId.substring(0, 20) + "..." + clientId.substring(clientId.length - 30));
} else {
    console.log("❌ Không tìm thấy GOOGLE_CLIENT_ID trong .env");
}

console.log("\n4. Google Client Secret Check:");
if (process.env.GOOGLE_CLIENT_SECRET) {
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    console.log("✅ Secret Length:", secret.length, "characters");
    console.log("✅ Secret Preview:", secret.substring(0, 8) + "..." + secret.substring(secret.length - 8));
} else {
    console.log("❌ Không tìm thấy GOOGLE_CLIENT_SECRET trong .env");
}

console.log("\n=== HƯỚNG DẪN TIẾP THEO ===");
console.log("1. Copy URL callback này và paste vào Google Console:");
console.log(`   🔗 ${callbackUrl}`);
console.log("\n2. Truy cập Google Cloud Console:");
console.log("   🔗 https://console.cloud.google.com/apis/credentials");
console.log("\n3. Trong phần 'Authorized redirect URIs', đảm bảo có URL:");
console.log(`   ✅ ${callbackUrl}`);

// Test connection tới Google OAuth endpoint
console.log("\n5. Test OAuth Endpoint:");
const testUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=profile email`;
console.log("✅ Test URL (paste vào browser để test):");
console.log(testUrl.substring(0, 100) + "...");