// backend/middlewares/auth.js - ENHANCED VERSION
import passport from 'passport';
import ErrorHandler from './errorMiddleware.js';
import { catchAsyncErrors } from './catchAsyncErrors.js';

// 🔧 FIX: Enhanced authentication middleware with better error handling
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('🔐 [isAuthenticated] Processing request:', {
        method: req.method,
        url: req.originalUrl,
        headers: {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            cookie: req.headers.cookie ? 'Present' : 'Missing'
        }
    });

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        console.log('🔐 [isAuthenticated] Passport result:', {
            err: err ? err.message : null,
            user: user ? { id: user._id, role: user.role } : null,
            info: info ? info.message : null
        });

        if (err) {
            console.error('❌ [isAuthenticated] Passport error:', err);
            return next(err);
        }

        if (!user) {
            console.warn('⚠️ [isAuthenticated] No user found - authentication failed');
            // More specific error message based on info
            const message = info?.message === 'No auth token'
                ? 'Authentication token is required. Please login first.'
                : 'Invalid or expired authentication token. Please login again.';

            return next(new ErrorHandler(message, 401));
        }

        // 🔧 CRITICAL FIX: Ensure user object has required fields
        if (!user._id) {
            console.error('❌ [isAuthenticated] User object missing _id field:', user);
            return next(new ErrorHandler('Invalid user data. Please login again.', 401));
        }

        console.log('✅ [isAuthenticated] Authentication successful for user:', {
            id: user._id,
            role: user.role,
            email: user.email
        });

        req.user = user;
        next();
    })(req, res, next);
});

// Patient-specific authentication
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('🏥 [isPatientAuthenticated] Checking patient access');

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new ErrorHandler("Unauthorized. Please log in to access this resource.", 401));
        }
        if (user.role !== 'Patient') {
            return next(new ErrorHandler(`Forbidden. Your role (${user.role}) is not authorized for this resource.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

// Admin-specific authentication
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('👑 [isAdminAuthenticated] Checking admin access');

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new ErrorHandler("Unauthorized. Please log in to access this resource.", 401));
        }
        if (user.role !== 'Admin') {
            return next(new ErrorHandler(`Forbidden. Your role (${user.role}) is not authorized for this resource.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

// Doctor-specific authentication
export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('👨‍⚕️ [isDoctorAuthenticated] Checking doctor access');

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new ErrorHandler("Unauthorized. Please log in to access this resource.", 401));
        }
        if (user.role !== 'Doctor') {
            return next(new ErrorHandler(`Forbidden. Your role (${user.role}) is not authorized for this resource.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

// 🔧 NEW: Multi-role authentication middleware
export const requireRole = (allowedRoles) => {
    return catchAsyncErrors(async (req, res, next) => {
        console.log('🔑 [requireRole] Checking roles:', { allowedRoles, userRole: req.user?.role });

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            const message = req.user
                ? `Forbidden. Your role (${req.user.role}) is not authorized for this resource.`
                : 'Unauthorized. Please log in to access this resource.';

            return next(new ErrorHandler(message, req.user ? 403 : 401));
        }
        next();
    });
};

// 🔧 NEW: Enhanced route protection for patients endpoint
export const canAccessPatients = catchAsyncErrors(async (req, res, next) => {
    console.log('📋 [canAccessPatients] Checking patient list access for role:', req.user?.role);

    const allowedRoles = ['Admin', 'Doctor', 'Receptionist'];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
        const message = req.user
            ? `Access denied. Only ${allowedRoles.join(', ')} can view patient lists.`
            : 'Authentication required to access patient data.';

        return next(new ErrorHandler(message, req.user ? 403 : 401));
    }

    console.log('✅ [canAccessPatients] Access granted for role:', req.user.role);
    next();
});

// 🔧 NEW: Error handling for invalid ObjectId
export const validateObjectId = (paramName = 'id') => {
    return catchAsyncErrors(async (req, res, next) => {
        const id = req.params[paramName];

        if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('❌ [validateObjectId] Invalid ObjectId format:', id);
            return next(new ErrorHandler('Invalid ID format provided.', 400));
        }

        next();
    });
};

export const isDoctor = (req, res, next) => {
    if (req.user.role !== 'Doctor') {
        return next(new ErrorHandler(`Forbidden. Your role (${req.user.role}) is not authorized for this resource.`, 403));
    }
    next();
};