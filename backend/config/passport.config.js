// backend/config/passport.config.js

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/userScheme.js';
// JWT Strategy for API authentication


console.log('JWT_SECRET in passport:', process.env.JWT_SECRET); passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Extract JWT from cookies based on user role
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        // Try to get token from different cookie names
                        token = req.cookies.patientToken ||
                            req.cookies.adminToken ||
                            req.cookies.doctorToken;
                    }
                    return token;
                },
                // Fallback to Authorization header
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            secretOrKey: process.env.JWT_SECRET
        },
        async (payload, done) => {
            try {
                console.log('🔐 [JWT Strategy] Processing payload:', {
                    id: payload.id,
                    role: payload.role
                });

                const user = await User.findById(payload.id);
                if (user) {
                    console.log('✅ [JWT Strategy] User found:', {
                        id: user._id,
                        role: user.role,
                        email: user.email
                    });
                    return done(null, user);
                }

                console.log('❌ [JWT Strategy] User not found for ID:', payload.id);
                return done(null, false);
            } catch (error) {
                console.error('❌ [JWT Strategy] Error:', error);
                return done(error, false);
            }
        }
    )
);

// Gmail OAuth Strategy (sử dụng Google OAuth vì Gmail là sản phẩm của Google)
passport.use('gmail', new GoogleStrategy({
    clientID: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/v1/users/auth/gmail/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm user đã có với Gmail ID
        let user = await User.findOne({
            providerId: profile.id,
            authType: 'gmail'
        });

        if (user) {
            return done(null, user);
        }

        // Kiểm tra email đã tồn tại với tài khoản truyền thống
        const email = profile.emails && profile.emails[0].value;
        if (!email) {
            return done(new Error("No email provided by Gmail"), false);
        }

        const existingEmailUser = await User.findOne({ email: email });
        if (existingEmailUser && existingEmailUser.authType === 'traditional') {
            // Liên kết tài khoản thay vì từ chối
            existingEmailUser.authType = 'gmail';
            existingEmailUser.providerId = profile.id;
            existingEmailUser.isVerified = true;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
        }

        // Tạo user mới từ Gmail profile
        user = await User.create({
            firstName: profile.name.givenName || 'User',
            lastName: profile.name.familyName || '',
            email: email,
            authType: 'gmail',
            providerId: profile.id,
            role: 'Patient',
            isVerified: true,
            phone: '0000000000',
            nic: '000000000000',
            dob: new Date('1990-01-01'),
            gender: 'Other'
        });

        return done(null, user);
    } catch (error) {
        console.error('Gmail OAuth error:', error);
        return done(error, null);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // ✅ SỬA LẠI: Sử dụng absolute URL thay vì relative URL
    callbackURL: `${process.env.BACKEND_URL}/api/v1/users/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm user đã có với Google ID
        let user = await User.findOne({
            providerId: profile.id,
            authType: 'google'
        });

        if (user) {
            return done(null, user);
        }

        // Kiểm tra email đã tồn tại với tài khoản truyền thống
        const email = profile.emails && profile.emails[0].value;
        if (!email) {
            return done(new Error("No email provided by Google"), false);
        }

        const existingEmailUser = await User.findOne({ email: email });
        if (existingEmailUser && existingEmailUser.authType === 'traditional') {
            // ✅ IMPROVED: Liên kết tài khoản thay vì từ chối
            existingEmailUser.authType = 'google';
            existingEmailUser.providerId = profile.id;
            existingEmailUser.isVerified = true;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
        }

        // Tạo user mới từ Google profile
        user = await User.create({
            firstName: profile.name.givenName || 'User',
            lastName: profile.name.familyName || '',
            email: email,
            authType: 'google',
            providerId: profile.id,
            role: 'Patient',
            isVerified: true,
            // ✅ THÊM: Các trường bắt buộc với giá trị mặc định
            phone: '0000000000', // Placeholder, user có thể cập nhật sau
            nic: '000000000000', // Placeholder, user có thể cập nhật sau
            dob: new Date('1990-01-01'), // Placeholder
            gender: 'Other' // Default gender
        });

        return done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

// ✅ REMOVED: Facebook OAuth Strategy - thay bằng Gmail
// Facebook đã được thay thế bằng Gmail OAuth

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/v1/users/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({
            providerId: profile.id,
            authType: 'github'
        });

        if (user) {
            return done(null, user);
        }

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.local`;

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.authType === 'traditional') {
            existingUser.authType = 'github';
            existingUser.providerId = profile.id;
            existingUser.isVerified = true;
            existingUser.avatar = profile.photos[0]?.value;
            await existingUser.save();
            return done(null, existingUser);
        }

        const nameParts = profile.displayName ? profile.displayName.split(' ') : [profile.username, ''];

        user = await User.create({
            firstName: nameParts[0] || profile.username,
            lastName: nameParts.slice(1).join(' ') || 'User',
            email,
            authType: 'github',
            providerId: profile.id,
            avatar: profile.photos[0]?.value,
            role: 'Patient',
            isVerified: true,
            phone: '0000000000',
            nic: '000000000000',
            dob: new Date('1990-01-01'),
            gender: 'Other'
        });

        return done(null, user);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return done(error, null);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
export default passport; 