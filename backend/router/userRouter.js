// backend/routes/user.js - Phiên bản hoàn chỉnh

import express from 'express';
import passport from 'passport'; // <-- Thêm passport
import jwt from 'jsonwebtoken';   // <-- Thêm jsonwebtoken

// Import các controller hiện có của bạn
import {
    login,
    register,
    addNewAdmin,
    getAllDoctors,
    getUserDetails,
    logout,
    addNewDoctor,
    verifyOtp,
    resendOtp
} from '../controller/userController.js';

import { isAdminAuthenticated, isPatientAuthenticated, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// --- HÀM TIỆN ÍCH TẠO TOKEN ---
// Bạn có thể đặt hàm này trong file utils và import vào nếu muốn
const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET_KEY, // Đảm bảo có khóa này trong .env
        { expiresIn: '1d' }
    );
};

// ==============================================
// --- CÁC ROUTE HIỆN CÓ CỦA BẠN (GIỮ NGUYÊN) ---
// ==============================================
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/me", getUserDetails);
router.get("/logout", isAuthenticated, logout);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// ==============================================
// --- CÁC ROUTE MỚI CHO SOCIAL LOGIN ---
// ==============================================

// --- GOOGLE ---
// 1. Bắt đầu đăng nhập: Chuyển hướng đến Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=social_failed`,
        session: false,
    }),
    (req, res) => {
        // --- BẮT ĐẦU THAY ĐỔI ---

        // 1. Lấy user từ passport
        const user = req.user;

        // 2. Tạo token
        const token = createToken(user);

        // 3. Xác định tên cookie dựa trên vai trò
        const cookieName = `${user.role.toLowerCase()}Token`;

        // 4. Gửi cookie về cho trình duyệt
        res.cookie(cookieName, token, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
            // secure: true, // Bật khi deploy
            // sameSite: "None" // Bật khi deploy
        });

        // 5. Chuyển hướng thẳng về trang dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

        // --- KẾT THÚC THAY ĐỔI ---
    }
);

// --- FACEBOOK (Tương tự) ---
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: process.env.SOCIAL_LOGIN_FAILURE_REDIRECT,
        session: false,
    }),
    (req, res) => {
        const token = createToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// --- GITHUB (Tương tự) ---
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get(
    '/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: process.env.SOCIAL_LOGIN_FAILURE_REDIRECT,
        session: false,
    }),
    (req, res) => {
        const token = createToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

export default router;