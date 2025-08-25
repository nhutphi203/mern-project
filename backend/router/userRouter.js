// backend/router/userRouter.js - FIXED VERSION
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// Import các controller
import {
    login,
    register,
    addNewAdmin,
    getAllDoctors,
    getAllPatients,
    getUserDetails,
    logout,
    addNewDoctor,
    verifyOtp,
    resendOtp,
    getUserById,
} from '../controller/userController.js';

// 🔧 FIX: Import enhanced middleware functions
import {
    isAuthenticated,
    requireRole,
    canAccessPatients,
    validateObjectId
} from "../middlewares/auth.js";

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

// --- PUBLIC ROUTES (NO AUTHENTICATION REQUIRED) ---
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// --- ADMIN-ONLY ROUTES ---
router.post("/admin/addnew", isAuthenticated, requireRole(['Admin']), addNewAdmin);
router.post("/doctor/addnew", isAuthenticated, requireRole(['Admin']), addNewDoctor);

// --- GENERAL AUTHENTICATED ROUTES ---
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUserDetails);

// --- DOCTORS ROUTES ---
// Public route - anyone can view doctors list
router.get("/doctors", getAllDoctors);

// 🔧 CRITICAL FIX: Patients route with proper middleware chain
router.get("/patients",
    isAuthenticated,      // First: Check if user is authenticated
    canAccessPatients,    // Second: Check if user role can access patient data
    getAllPatients        // Finally: Execute the controller
);

// --- TOKEN EXCHANGE ROUTE (FOR OAUTH) ---
router.post('/auth/token-exchange', (req, res) => {
    const { token, user } = req.body;

    if (!token || !user) {
        return res.status(400).json({
            success: false,
            message: 'Token and user data are required'
        });
    }

    // Create JWT token
    const jwtToken = createToken(user);

    // Set cookie
    setCookie(res, user, jwtToken);

    res.status(200).json({
        success: true,
        message: 'Token exchanged successfully',
        user,
        token: jwtToken
    });
});

// --- OAUTH ROUTES ---
// Gmail OAuth - redirect to Google OAuth (Gmail = Google)
router.get('/auth/gmail', (req, res) => {
    res.redirect('/api/v1/users/auth/google');
});

router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        session: false
    }),
    (req, res) => {
        console.log('🔐 [Google OAuth] Callback received:', {
            user: req.user ? {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            } : 'No user'
        });

        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        try {
            // Create token for the authenticated user
            const token = createToken(req.user);

            // Set cookie
            setCookie(res, req.user, token);

            // Redirect to frontend with success indicator
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
        } catch (error) {
            console.error('❌ [Google OAuth] Token creation failed:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

// ❌ REMOVED: Facebook OAuth routes - đã thay bằng Gmail
/*
router.get('/auth/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
        session: false
    })
);

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`,
        session: false
    }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        try {
            const token = createToken(req.user);
            setCookie(res, req.user, token);
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
        } catch (error) {
            console.error('❌ [Facebook OAuth] Token creation failed:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);
*/

router.get('/auth/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false
    })
);

router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`,
        session: false
    }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        try {
            const token = createToken(req.user);
            setCookie(res, req.user, token);
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
        } catch (error) {
            console.error('❌ [GitHub OAuth] Token creation failed:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

// 🔧 FIX: Dynamic route should be LAST and use proper validation
router.get("/:id",
    isAuthenticated,           // Check authentication
    validateObjectId('id'),    // Validate ObjectId format
    getUserById                // Get user by ID
);

// 🔧 NEW: Health check endpoint for debugging
router.get('/health/check', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User router is healthy',
        timestamp: new Date().toISOString()
    });
});

export default router;