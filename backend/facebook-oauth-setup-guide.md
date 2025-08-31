# 📘 Facebook OAuth Setup Guide

## Tạo Facebook App để lấy Client ID và Client Secret

### 🔗 Links quan trọng:
- Facebook Developers: https://developers.facebook.com/
- App Dashboard: https://developers.facebook.com/apps/

### 📋 Các bước thực hiện:

#### 1. Truy cập Facebook Developers Console
```
https://developers.facebook.com/
```

#### 2. Tạo App mới
- Click "Create App" hoặc "My Apps" → "Create App"
- Chọn "Build Connected Experiences" (cho web app)
- Điền thông tin:
  * App Name: `Hospital Management System`
  * App Contact Email: [your-email]
  * Business Account: (optional)

#### 3. Cấu hình Facebook Login
- Trong Dashboard, tìm "Facebook Login" → Click "Set Up"
- Chọn "Web" platform
- Thêm Site URL: `http://localhost:3000`

#### 4. Cấu hình OAuth Redirect URIs
- Vào Facebook Login → Settings
- Thêm Valid OAuth Redirect URIs:
  ```
  http://localhost:4000/api/v1/users/auth/facebook/callback
  ```

#### 5. Lấy App Credentials
- Vào Settings → Basic
- Copy:
  * App ID (đây là FACEBOOK_CLIENT_ID)
  * App Secret (click Show để xem - đây là FACEBOOK_CLIENT_SECRET)

### 🔧 Cấu hình trong project:

#### Thêm vào config.env:
```env
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

#### Thêm Facebook OAuth strategy vào passport.config.js:
```javascript
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/v1/users/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'name', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  // Facebook OAuth logic
}));
```

### 📝 Notes:
- App sẽ ở chế độ Development ban đầu
- Chỉ có thể test với tài khoản developer
- Để go live cần Facebook App Review
- Valid domains: localhost được phép trong development
