// backend/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import passport from "passport";
import labRouter from './router/labRouter.js';
import billingRouter from './router/billingRouter.js';
// Import các router và middleware
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import prescriptionRouter from './router/prescriptionRouter.js';
import medicalRecordRouter from "./router/medicalRecordRouter.js";
import { receptionRouter } from './router/receptionRouter.js';
import serviceCatalogRouter from './router/serviceCatalogRouter.js';
import "./config/passport.config.js";
import encounterRouter from './router/encounterRouter.js';
const app = express();

// Cài đặt các middleware cho Express
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
app.use("/api/v1/prescriptions", prescriptionRouter);

// Kết nối DB
dbConnection();

// Sử dụng các router
app.use("/api/v1/medical-records", medicalRecordRouter);
// In app.js
// ... các router khác


// Thêm sau dòng 59
// Add support for both /api/lab and /api/v1/lab routes for backward compatibility
import labRouterV1 from './router/labRouterV1.js';
app.use("/api/v1/lab", labRouter);
app.use("/api/lab", labRouterV1);
app.use("/api/v1/billing", billingRouter);
app.use('/api/v1/reception', receptionRouter);
app.use('/api/v1/encounters', encounterRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/services", serviceCatalogRouter);
// Middleware xử lý lỗi phải nằm ở cuối cùng
app.use((err, req, res, next) => {
    // Nếu là API request, luôn đảm bảo trả về JSON
    if (req.originalUrl.startsWith('/api/')) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || 'Internal server error',
            code: err.code || 'SERVER_ERROR',
            timestamp: new Date().toISOString()
        });
    }
    // Cho các request khác, tiếp tục đến errorMiddleware tiếp theo
    next(err);
});

// Xử lý 404 cho API endpoints
app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint ${req.originalUrl} not found`,
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString()
        });
    }
    // Cho các request khác, chuyển đến page 404 hoặc middleware khác
    next();
});
app.use(errorMiddleware);

export default app;