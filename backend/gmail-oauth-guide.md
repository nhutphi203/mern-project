# 📧 Gmail OAuth Setup Guide

## ✅ Gmail OAuth đã được cấu hình!

### 🔄 Cách hoạt động:
- Gmail OAuth sử dụng **cùng Google credentials** đã có
- Tạo user với `authType: 'gmail'` thay vì `'google'`
- Giúp phân biệt Gmail login vs Google login

### 🌐 Các URLs OAuth hiện có:
```
🔗 Gmail OAuth:  http://localhost:4000/api/v1/users/auth/gmail
🔗 Google OAuth: http://localhost:4000/api/v1/users/auth/google  
🔗 GitHub OAuth: http://localhost:4000/api/v1/users/auth/github
```

### 📋 Cần cập nhật Google Console:
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:4000/api/v1/users/auth/gmail/callback
   ```

### 📊 Database Status:
- Google Users: 2 users
- Gmail Users: 0 users (chưa test)
- GitHub Users: 1 user

### 🧪 Test Gmail OAuth:
```
http://localhost:4000/api/v1/users/auth/gmail
```

Sau khi login Gmail thành công, user sẽ được tạo với:
- `authType: 'gmail'`
- `role: 'Patient'`
- Email từ Gmail account
