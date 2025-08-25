/**
 * Enhanced Authentication & Authorization Middleware
 * Centralized, robust, and scalable RBAC implementation
 */

import passport from 'passport';
import ErrorHandler from './errorMiddleware.js';
import { catchAsyncErrors } from './catchAsyncErrors.js';
import { 
    hasAccess, 
    getModuleFromPath, 
    buildEndpointKey,
    ROLES 
} from '../config/rolesConfig.js';

// ==========================================
// CORE AUTHENTICATION MIDDLEWARE
// ==========================================

/**
 * Enhanced authentication middleware with better logging and error handling
 */
export const authenticateToken = catchAsyncErrors(async (req, res, next) => {
    console.log('🔐 [authenticateToken] Processing request:', {
        method: req.method,
        url: req.originalUrl,
        hasAuthHeader: !!req.headers.authorization,
        hasCookie: !!req.headers.cookie
    });

    const isApiRequest = req.originalUrl.startsWith('/api/');

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        console.log('🔐 [authenticateToken] Passport result:', {
            err: err ? err.message : null,
            user: user ? { id: user._id, role: user.role, email: user.email } : null,
            info: info ? info.message : null
        });

        if (err) {
            console.error('🔐 [authenticateToken] Passport error:', err);
            return next(err);
        }

        if (!user) {
            const message = 'Authentication required. Please log in to access this resource.';
            console.warn('🔐 [authenticateToken] Authentication failed:', info?.message || 'No user');
            
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message,
                    code: 'UNAUTHORIZED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        // Verify user is active and verified
        if (!user.isVerified) {
            const message = 'Account not verified. Please verify your account.';
            console.warn('🔐 [authenticateToken] User not verified:', user.email);
            
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message,
                    code: 'NOT_VERIFIED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        req.user = user;
        console.log('✅ [authenticateToken] Authentication successful for:', user.role, user.email);
        next();
    })(req, res, next);
});

// ==========================================
// SMART ROLE-BASED AUTHORIZATION
// ==========================================

/**
 * Smart authorization middleware using centralized role matrix
 */
export const authorizeRoles = (allowedRoles = []) => {
    return catchAsyncErrors(async (req, res, next) => {
        const user = req.user;
        const method = req.method;
        const path = req.originalUrl;
        
        console.log('🔑 [authorizeRoles] Checking authorization:', {
            userRole: user?.role,
            allowedRoles,
            method,
            path
        });

        if (!user) {
            const message = 'Authentication required for authorization check.';
            console.error('🔑 [authorizeRoles] No user in request');
            
            const isApiRequest = req.originalUrl.startsWith('/api/');
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message,
                    code: 'UNAUTHORIZED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        // Check if user role is in allowed roles
        if (!allowedRoles.includes(user.role)) {
            const message = `Access denied. Role '${user.role}' is not authorized for this resource.`;
            console.warn('🔑 [authorizeRoles] Authorization failed:', {
                userRole: user.role,
                allowedRoles,
                endpoint: path
            });

            const isApiRequest = req.originalUrl.startsWith('/api/');
            if (isApiRequest) {
                return res.status(403).json({
                    success: false,
                    message,
                    code: 'FORBIDDEN',
                    debug: {
                        userRole: user.role,
                        requiredRoles: allowedRoles,
                        endpoint: path
                    }
                });
            }
            return next(new ErrorHandler(message, 403));
        }

        console.log('✅ [authorizeRoles] Authorization successful');
        next();
    });
};

/**
 * Matrix-based authorization using centralized role configuration
 */
export const authorizeByMatrix = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const method = req.method;
    const path = req.originalUrl;
    
    console.log('🎯 [authorizeByMatrix] Matrix-based authorization:', {
        userRole: user?.role,
        method,
        path
    });

    if (!user) {
        console.error('🎯 [authorizeByMatrix] No user in request');
        return next(new ErrorHandler('Authentication required.', 401));
    }

    // Get module and endpoint key
    const module = getModuleFromPath(path);
    const endpointKey = buildEndpointKey(method, path);
    
    console.log('🎯 [authorizeByMatrix] Checking matrix:', {
        module,
        endpointKey,
        userRole: user.role
    });

    if (!module) {
        console.warn('🎯 [authorizeByMatrix] Module not found, allowing access');
        return next();
    }

    // Check access using matrix
    const hasPermission = hasAccess(user.role, module, endpointKey);
    
    if (!hasPermission) {
        const message = `Access denied. Role '${user.role}' cannot access ${method} ${path}`;
        console.warn('🎯 [authorizeByMatrix] Matrix authorization failed:', {
            userRole: user.role,
            module,
            endpointKey
        });

        const isApiRequest = req.originalUrl.startsWith('/api/');
        if (isApiRequest) {
            return res.status(403).json({
                success: false,
                message,
                code: 'FORBIDDEN',
                debug: {
                    userRole: user.role,
                    module,
                    endpoint: endpointKey
                }
            });
        }
        return next(new ErrorHandler(message, 403));
    }

    console.log('✅ [authorizeByMatrix] Matrix authorization successful');
    next();
});

// ==========================================
// ROLE-SPECIFIC MIDDLEWARES (Legacy Support)
// ==========================================

export const requireRole = (allowedRoles) => authorizeRoles(allowedRoles);

export const isAuthenticated = authenticateToken;

export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('👑 [isAdminAuthenticated] Admin-specific check');
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return next(new ErrorHandler("Unauthorized. Please log in.", 401));
        if (user.role !== ROLES.ADMIN) {
            return next(new ErrorHandler(`Forbidden. Role '${user.role}' is not Admin.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('👨‍⚕️ [isDoctorAuthenticated] Doctor-specific check');
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return next(new ErrorHandler("Unauthorized. Please log in.", 401));
        if (user.role !== ROLES.DOCTOR) {
            return next(new ErrorHandler(`Forbidden. Role '${user.role}' is not Doctor.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('👤 [isPatientAuthenticated] Patient-specific check');
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return next(new ErrorHandler("Unauthorized. Please log in.", 401));
        if (user.role !== ROLES.PATIENT) {
            return next(new ErrorHandler(`Forbidden. Role '${user.role}' is not Patient.`, 403));
        }
        req.user = user;
        next();
    })(req, res, next);
});

// ==========================================
// RESOURCE-SPECIFIC AUTHORIZATION
// ==========================================

/**
 * Check if user can access patient data
 */
export const canAccessPatients = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const allowedRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST];
    
    if (!allowedRoles.includes(user.role)) {
        return next(new ErrorHandler(`Role '${user.role}' cannot access patient data.`, 403));
    }
    next();
});

/**
 * Check if user can access own data or is authorized staff
 */
export const canAccessOwnDataOrAuthorized = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const targetUserId = req.params.userId || req.params.patientId;
    
    // Admin and medical staff can access any data
    const authorizedRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST];
    if (authorizedRoles.includes(user.role)) {
        return next();
    }
    
    // Users can only access their own data
    if (user._id.toString() === targetUserId) {
        return next();
    }
    
    return next(new ErrorHandler('Access denied. You can only access your own data.', 403));
});

// ==========================================
// MODULE-SPECIFIC MIDDLEWARE FACTORIES
// ==========================================

/**
 * Create module-specific middleware that applies authentication + authorization
 */
export const createModuleMiddleware = (moduleName, specificRoles = null) => {
    return [
        authenticateToken,
        specificRoles ? authorizeRoles(specificRoles) : authorizeByMatrix
    ];
};

// Pre-configured middleware for common modules
export const medicalRecordsMiddleware = createModuleMiddleware('MEDICAL_RECORDS');
export const labMiddleware = createModuleMiddleware('LAB');
export const billingMiddleware = createModuleMiddleware('BILLING');
export const userMiddleware = createModuleMiddleware('USERS');

// ==========================================
// VALIDATION HELPERS
// ==========================================

export const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new ErrorHandler('Invalid ID format', 400));
    }
    next();
};

export default {
    authenticateToken,
    authorizeRoles,
    authorizeByMatrix,
    requireRole,
    isAuthenticated,
    isAdminAuthenticated,
    isDoctorAuthenticated,
    isPatientAuthenticated,
    canAccessPatients,
    canAccessOwnDataOrAuthorized,
    createModuleMiddleware,
    medicalRecordsMiddleware,
    labMiddleware,
    billingMiddleware,
    userMiddleware,
    validateObjectId
};
