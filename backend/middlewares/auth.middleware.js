// server/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware để xác thực token
export const protect = async (req, res, next) => {
    // Check if this is an API request
    const isApiRequest = req.originalUrl.startsWith('/api/');
    
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized, token failed',
                code: 'AUTH_FAILED'
            });
        }
    }
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Not authorized, no token',
            code: 'NO_TOKEN'
        });
    }
};

// Middleware để kiểm tra quyền hạn (role)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`,
                code: 'FORBIDDEN'
            });
        }
        next();
    };
};