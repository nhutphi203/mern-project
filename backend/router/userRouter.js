// backend/routes/user.js - Fixed Google Callback

import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// Import các controller hiện có
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

// HÀM TẠO TOKEN (giữ nguyên)
const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            authType: user.authType
        },
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


// Routes hiện có (giữ nguyên)
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/me", isAuthenticated, getUserDetails);
router.get("/logout", isAuthenticated, logout);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// === FIXED GOOGLE LOGIN ===
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

// 🔧 FIX: Google callback - SET COOKIE PROPERLY

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        session: false,
    }),
    (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_data`);
            }

            // Tạo JWT token
            const token = createToken(user);

            // Set cookie
            setCookie(res, user, token);

            // ✅ IMPROVED: Redirect based on user role
            const redirectPath = user.role === 'Admin' ? '/admin-dashboard' : '/dashboard';

            // Redirect to frontend with success
            res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?auth=success`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_error`);
        }
    }
);

router.get('/auth/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
        session: false
    })
);


router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`,
        session: false,
    }),
    (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_data`);
            }

            const token = createToken(user);
            setCookie(res, user, token);

            const redirectPath = user.role === 'Admin' ? '/admin-dashboard' : '/dashboard';
            res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?auth=success`);
        } catch (error) {
            console.error('Facebook OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_error`);
        }
    }
);
// --- GITHUB OAUTH ---
router.get('/auth/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false
    })
);

router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`,
        session: false,
    }),
    (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_data`);
            }

            const token = createToken(user);
            setCookie(res, user, token);

            const redirectPath = user.role === 'Admin' ? '/admin-dashboard' : '/dashboard';
            res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?auth=success`);
        } catch (error) {
            console.error('GitHub OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_error`);
        }
    }
);

// ✅ NEW: Manual token exchange endpoint (optional, for SPA flow)
router.post('/auth/token-exchange', (req, res) => {
    const { tempToken } = req.body;

    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET_KEY);
        // Return user data for frontend
        res.json({
            success: true,
            user: decoded,
            token: tempToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

export default router;