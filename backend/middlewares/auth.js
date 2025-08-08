import passport from 'passport';
import ErrorHandler from './errorMiddleware.js';
import { catchAsyncErrors } from './catchAsyncErrors.js';

// Middleware này sẽ sử dụng 'jwt' strategy mà bạn đã cấu hình trong passport.config.js
// (strategy này đã được dạy cách đọc token từ cookie)

// 1. Middleware cho Patient
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
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

// 2. Middleware cho Admin
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
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

// 3. Middleware cho Doctor (dựa trên router của bạn)
export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
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
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        // Nếu token không hợp lệ hoặc không có, chặn truy cập
        if (!user) {
            return next(new ErrorHandler("Unauthorized. You must be logged in to perform this action.", 401));
        }
        // Nếu token hợp lệ, gắn user vào request và cho đi tiếp
        req.user = user;
        next();
    })(req, res, next);
});
