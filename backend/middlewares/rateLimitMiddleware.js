// Quick Rate Limiting Middleware
import rateLimit from 'express-rate-limit';

// Create rate limiter for API routes
export const apiRateLimit = rateLimit({
    windowMs: 1000, // 1 second
    max: 5, // Max 5 requests per second per IP
    message: {
        success: false,
        message: 'Too many requests, please slow down',
        code: 'RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator to include user info
    keyGenerator: (req) => {
        return `${req.ip}_${req.user?._id || 'anonymous'}`;
    },
    // Skip rate limiting for successful requests
    skip: (req, res) => {
        // Don't rate limit if user has proper role for the endpoint
        if (req.user && req.originalUrl.includes('/admin') && req.user.role === 'Admin') {
            return true;
        }
        if (req.user && req.originalUrl.includes('/patient') && req.user.role === 'Patient') {
            return true;
        }
        return false;
    }
});

// Enhanced error response for role mismatch
export const roleErrorHandler = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // If this is a 403 role error and it's happening repeatedly
        if (res.statusCode === 403 && typeof data === 'object' && data.code === 'FORBIDDEN') {
            console.log(`⚠️ Role mismatch detected: User ${req.user?.role} trying to access ${req.originalUrl}`);

            // Add debug info to response
            data.debug = {
                userRole: req.user?.role,
                requiredRoles: req.allowedRoles || 'Unknown',
                endpoint: req.originalUrl,
                suggestion: req.user?.role === 'Patient' ? 'Use patient-specific endpoints' : 'Check user role'
            };
        }

        return originalSend.call(this, data);
    };

    next();
};
