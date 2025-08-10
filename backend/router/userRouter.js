import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// Import các controller
import {
    login,
    register,
    addNewAdmin,
    getAllDoctors,
    getUserDetails,
    logout,
    addNewDoctor,
    verifyOtp,
    resendOtp,
    getUserById,
} from '../controller/userController.js';

import { isAdminAuthenticated, isPatientAuthenticated, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// --- HÀM HELPER (GIỮ NGUYÊN) ---
const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, authType: user.authType },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );
};
const setCookie = (res, user, token) => {
    const cookieName = `${user.role.toLowerCase()}Token`;
    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    };
    res.cookie(cookieName, token, cookieOptions);
};


// --- CÁC ROUTE POST (CỤ THỂ) ---
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.post('/auth/token-exchange', (req, res) => { /* ... code của bạn ... */ });


// --- CÁC ROUTE GET (CỤ THỂ) ---
router.get("/doctors", getAllDoctors);
router.get("/logout", isAuthenticated, logout);
router.get("")
// FIX: Sửa lại route để khớp với frontend.
// Frontend đang gọi '/api/v1/users/me' để lấy thông tin người dùng hiện tại.
router.get("/me", isAuthenticated, getUserDetails);


// --- CÁC ROUTE OAUTH (CỤ THỂ) ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`, session: false }), (req, res) => { /* ... code của bạn ... */ });
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`, session: false }), (req, res) => { /* ... code của bạn ... */ });
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`, session: false }), (req, res) => { /* ... code của bạn ... */ });


// --- ROUTE ĐỘNG (ĐẶT Ở CUỐI CÙNG) ---
// Route này sẽ bắt tất cả các request GET không khớp với các route GET cụ thể ở trên
router.get("/:id", isAuthenticated, getUserById);


export default router;
