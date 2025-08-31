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

    // Check if this is an API request
    const isApiRequest = req.originalUrl.startsWith('/api/');

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        console.log('🔐 [isAuthenticated] Passport result:', {
            err: err ? err.message : null,
            user: user ? { id: user._id, role: user.role } : null,
            info: info ? info.message : null
        });

        if (err) {
            console.error('❌ [isAuthenticated] Passport error:', err);

            if (isApiRequest) {
                return res.status(500).json({
                    success: false,
                    message: 'Authentication error',
                    code: 'AUTH_ERROR'
                });
            }
            return next(err);
        }

        if (!user) {
            console.warn('⚠️ [isAuthenticated] No user found - authentication failed');
            // More specific error message based on info
            const message = info?.message === 'No auth token'
                ? 'Authentication token is required. Please login first.'
                : 'Invalid or expired authentication token. Please login again.';

            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message: message,
                    code: 'UNAUTHORIZED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        // 🔧 CRITICAL FIX: Ensure user object has required fields
        if (!user._id) {
            console.error('❌ [isAuthenticated] User object missing _id field:', user);

            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid user data. Please login again.',
                    code: 'INVALID_USER'
                });
            }
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

export const requireRole = (allowedRoles) => {
    return catchAsyncErrors(async (req, res, next) => {
        console.log('🔑 [requireRole] Checking roles:', { allowedRoles, userRole: req.user?.role });
        // Kiểm tra nếu API request hay không dựa vào đường dẫn
        const isApiRequest = req.originalUrl.startsWith('/api/');

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            const message = req.user
                ? `Forbidden. Your role (${req.user.role}) is not authorized for this resource.`
                : 'Unauthorized. Please log in to access this resource.';

            // Nếu là API request, luôn trả về JSON error response
            if (isApiRequest) {
                return res.status(req.user ? 403 : 401).json({
                    success: false,
                    message: message,
                    code: req.user ? 'FORBIDDEN' : 'UNAUTHORIZED'
                });
            }

            // Nếu không, tiếp tục với error handler thông thường
            return next(new ErrorHandler(message, req.user ? 403 : 401));
        }
        next();
    });
};

export const canAccessPatients = catchAsyncErrors(async (req, res, next) => {
    const allowedRoles = ['Admin', 'Doctor', 'Receptionist'];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new ErrorHandler(
            `Access denied. Your role (${req.user?.role || 'Unknown'}) cannot access patient data.`,
            403
        ));
    }

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
export const isDoctorOrAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const userRole = req.user.role;
    if (userRole !== "Doctor" && userRole !== "Admin") {
        return next(
            new ErrorHandler(`${userRole} not authorized for this resource!`, 403)
        );
    }
    next();
});