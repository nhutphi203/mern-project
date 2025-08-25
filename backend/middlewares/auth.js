// backend/middlewares/auth.js - PRODUCTION-READY RBAC ENGINE
import passport from 'passport';
import ErrorHandler from './errorMiddleware.js';
import { catchAsyncErrors } from './catchAsyncErrors.js';
import { ACCESS_MATRIX, ROLES, hasAccess, getEndpointConfig } from '../config/rolesConfig.js';

// 🔧 CORE: Production-ready authentication middleware
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log('🔐 [isAuthenticated] Processing request:', {
        method: req.method,
        url: req.originalUrl,
        headers: {
            authorization: req.headers.authorization ? 'Present' : 'Missing'
        }
    });
    
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
// 🚀 PRODUCTION: Centralized Role-Based Authorization Engine
export const requireEndpointAccess = (module, endpoint, method = 'GET') => {
    return catchAsyncErrors(async (req, res, next) => {
        const isApiRequest = req.originalUrl.startsWith('/api/');
        
        if (!req.user) {
            const message = 'Authentication required to access this resource.';
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message,
                    code: 'UNAUTHORIZED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        const userRole = req.user.role;
        const hasPermission = hasAccess(userRole, module, endpoint);
        
        console.log('� [requireEndpointAccess] Access check:', {
            user: { id: req.user._id, role: userRole },
            module,
            endpoint,
            method,
            hasPermission,
            url: req.originalUrl
        });

        if (!hasPermission) {
            const message = `Access denied. Role '${userRole}' cannot access ${module}/${endpoint}.`;
            
            if (isApiRequest) {
                return res.status(403).json({
                    success: false,
                    message,
                    code: 'FORBIDDEN',
                    details: {
                        userRole,
                        module,
                        endpoint,
                        requiredPermissions: getEndpointConfig(module, endpoint)
                    }
                });
            }
            return next(new ErrorHandler(message, 403));
        }

        next();
    });
};

// 🔧 LEGACY: Simple role-based access (deprecated - use requireEndpointAccess)
export const requireRole = (allowedRoles) => {
    return catchAsyncErrors(async (req, res, next) => {
        console.log('🔑 [requireRole] Checking roles:', { allowedRoles, userRole: req.user?.role });

        const isApiRequest = req.originalUrl.startsWith('/api/');

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            const message = req.user
                ? `Forbidden. Your role (${req.user.role}) is not authorized for this resource.`
                : 'Unauthorized. Please log in to access this resource.';
                
            if (isApiRequest) {
                return res.status(req.user ? 403 : 401).json({
                    success: false,
                    message: message,
                    code: req.user ? 'FORBIDDEN' : 'UNAUTHORIZED'
                });
            }
            
            return next(new ErrorHandler(message, req.user ? 403 : 401));
        }
        next();
    });
};

// 🔧 SPECIALIZED: Resource ownership validation
export const requireResourceOwnership = (resourceField = 'patientId') => {
    return catchAsyncErrors(async (req, res, next) => {
        const isApiRequest = req.originalUrl.startsWith('/api/');
        
        if (!req.user) {
            const message = 'Authentication required.';
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message,
                    code: 'UNAUTHORIZED'
                });
            }
            return next(new ErrorHandler(message, 401));
        }

        // Admin and Doctor bypass ownership check
        if (['Admin', 'Doctor'].includes(req.user.role)) {
            return next();
        }

        // Patient must access only their own resources
        if (req.user.role === 'Patient') {
            const resourceOwnerId = req.params[resourceField] || req.body[resourceField] || req.query[resourceField];
            
            if (resourceOwnerId && resourceOwnerId !== req.user._id.toString()) {
                const message = 'Access denied. You can only access your own resources.';
                
                if (isApiRequest) {
                    return res.status(403).json({
                        success: false,
                        message,
                        code: 'FORBIDDEN_OWNERSHIP'
                    });
                }
                return next(new ErrorHandler(message, 403));
            }
        }

        next();
    });
};

// 🔧 UTILITY: Object ID validation
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

// 🔧 LEGACY COMPATIBILITY: Single role authentication (deprecated)
export const isPatientAuthenticated = requireRole(['Patient']);
export const isAdminAuthenticated = requireRole(['Admin']);
export const isDoctorAuthenticated = requireRole(['Doctor']);
export const isDoctor = requireRole(['Doctor']);
export const isDoctorOrAdminAuthenticated = requireRole(['Doctor', 'Admin']);
export const canAccessPatients = requireRole(['Admin', 'Doctor', 'Receptionist']);