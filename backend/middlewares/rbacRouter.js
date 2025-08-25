// backend/middlewares/rbacRouter.js - PRODUCTION RBAC ROUTER WRAPPER
import express from 'express';
import { isAuthenticated, requireEndpointAccess } from './auth.js';
import { hasAccess } from '../config/rolesConfig.js';

/**
 * 🚀 PRODUCTION: RBAC-enforced Router Factory
 * Creates Express routers with automatic role-based access control
 * 
 * @param {string} module - Module name (e.g., 'medical-records', 'lab', 'billing')
 * @param {object} options - Configuration options
 * @returns {object} Express router with RBAC middleware
 */
export function createRBACRouter(module, options = {}) {
    const router = express.Router();
    const {
        requireAuth = true,
        logAccess = true,
        validateIds = true
    } = options;

    // 🔒 FORCE: All routes require authentication by default
    if (requireAuth) {
        router.use(isAuthenticated);
    }

    // 🔍 LOG: Access attempts for audit
    if (logAccess) {
        router.use((req, res, next) => {
            console.log(`🔍 [RBAC-${module}] ${req.method} ${req.originalUrl} - User: ${req.user?.role || 'Anonymous'}`);
            next();
        });
    }

    // 🛡️ OVERRIDE: Add RBAC-enforced route method
    router.secureRoute = function(method, path, endpoint, ...handlers) {
        // Extract actual endpoint name from path if not provided
        const endpointName = endpoint || path.replace(/^\//, '').replace(/[/:]/g, '-') || 'root';
        
        // Create RBAC middleware for this specific endpoint
        const rbacMiddleware = requireEndpointAccess(module, endpointName, method.toUpperCase());
        
        // Apply the route with RBAC middleware
        return this[method.toLowerCase()](path, rbacMiddleware, ...handlers);
    };

    // 🛡️ SECURE: Add convenience methods with automatic RBAC
    ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
        router[`secure${method.charAt(0).toUpperCase() + method.slice(1)}`] = function(path, endpoint, ...handlers) {
            return this.secureRoute(method, path, endpoint, ...handlers);
        };
    });

    return router;
}

/**
 * 🔧 UTILITY: Check if user has access to specific endpoint
 * @param {object} user - User object with role
 * @param {string} module - Module name
 * @param {string} endpoint - Endpoint name
 * @returns {boolean} Access allowed
 */
export function checkEndpointAccess(user, module, endpoint) {
    if (!user || !user.role) {
        return false;
    }
    
    return hasAccess(user.role, module, endpoint);
}

/**
 * 🔍 AUDIT: Middleware to log all access attempts
 * @param {string} module - Module name for logging
 * @returns {function} Express middleware
 */
export function auditMiddleware(module) {
    return (req, res, next) => {
        const startTime = Date.now();
        const originalSend = res.send;
        
        res.send = function(data) {
            const duration = Date.now() - startTime;
            console.log(`📊 [AUDIT-${module}] ${req.method} ${req.originalUrl}`, {
                user: req.user?.role || 'Anonymous',
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                userAgent: req.get('User-Agent')?.substring(0, 100)
            });
            
            return originalSend.call(this, data);
        };
        
        next();
    };
}

/**
 * 🔒 SECURITY: Auto-apply security headers
 * @returns {function} Express middleware
 */
export function securityHeaders() {
    return (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    };
}

export default createRBACRouter;
