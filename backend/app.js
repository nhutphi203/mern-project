// backend/app.js

// QUAN TRỌNG: Load environment variables TRƯỚC KHI import bất cứ thứ gì khác
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import passport from "passport";
import rateLimit from "express-rate-limit";
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
import enhancedMedicalRecordRouter from "./router/enhancedMedicalRecordRouter.js";
import fixedMedicalRecordsRouter from "./router/fixedMedicalRecordsRouter.js";
import { receptionRouter } from './router/receptionRouter.js';
import serviceCatalogRouter from './router/serviceCatalogRouter.js';
import diagnosisRouter from './router/diagnosisRouter.js';
import icd10Router from './router/icd10Router.js';
import insuranceRouter from './router/insuranceRouter.js';
import "./config/passport.config.js";
import encounterRouter from './router/encounterRouter.js';
import vitalSignsRouter from './router/vitalSigns.routes.js';
import chatRouter from './routes/chatRoutes.js';
const app = express();

// TEMPORARILY DISABLED: Rate limiting to debug frontend infinite loop
// const emergencyRateLimit = rateLimit({
//     windowMs: 5000, // 5 seconds window  
//     max: 500, // Max 500 requests per 5 seconds (100 requests/second)
//     message: {
//         success: false,
//         message: 'Too many requests - Please slow down',
//         code: 'RATE_LIMITED'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     skipSuccessfulRequests: true, // Don't count successful requests
//     skip: (req) => {
//         // Skip rate limiting for essential API calls
//         return req.originalUrl.includes('/auth/') || 
//                req.originalUrl.includes('/users/me') ||
//                req.originalUrl.includes('/medical-records/enhanced') ||
//                req.originalUrl.includes('/statistics');
//     }
// });

// Apply emergency rate limiting to API routes
// app.use('/api/', emergencyRateLimit);

// DEBUGGING: Track infinite loop requests
const requestTracker = {};
const MAX_REQUESTS_PER_MINUTE = 100;

app.use('/api/', (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}-${req.originalUrl}`;

    // Clean old entries (older than 1 minute)
    Object.keys(requestTracker).forEach(k => {
        requestTracker[k] = requestTracker[k].filter(timestamp => now - timestamp < 60000);
        if (requestTracker[k].length === 0) delete requestTracker[k];
    });

    // Track current request
    if (!requestTracker[key]) requestTracker[key] = [];
    requestTracker[key].push(now);

    // Log excessive requests
    if (requestTracker[key].length > MAX_REQUESTS_PER_MINUTE) {
        console.log(`⚠️  INFINITE LOOP DETECTED: ${req.method} ${req.originalUrl}`);
        console.log(`   IP: ${req.ip}`);
        console.log(`   Requests in last minute: ${requestTracker[key].length}`);
        console.log(`   User-Agent: ${req.get('User-Agent')}`);
        console.log(`   Headers:`, req.headers);
        console.log('---');
    } else if (requestTracker[key].length % 10 === 0) {
        console.log(`📊 Request count for ${req.originalUrl}: ${requestTracker[key].length}/min`);
    }

    next();
});

// Cài đặt các middleware cho Express
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.DASHBOARD_URL,
        'http://localhost:8080',  // Add frontend dev server
        'http://localhost:3000',  // Alternative port
        'http://127.0.0.1:8080',  // Alternative localhost
        'http://localhost:5173',  // Vite dev server
        'http://127.0.0.1:5173'   // Vite alternative
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS", "HEAD"],
    credentials: true,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['Set-Cookie', 'X-Total-Count', 'X-Rate-Limit-Remaining'],
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
// TEMPORARILY DISABLED: app.use("/api/v1/prescriptions", prescriptionRouter);

// Kết nối DB
dbConnection();

// Sử dụng các router
// MEDICAL RECORDS - Use both for backward compatibility and new features
app.use("/api/v1/medical-records", fixedMedicalRecordsRouter); // Main working router
app.use("/api/v1/medical-records", enhancedMedicalRecordRouter); // Enhanced features
// Legacy support
app.use("/api/v1/legacy-medical-records", medicalRecordRouter);
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
app.use("/api/v1/vital-signs", vitalSignsRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/services", serviceCatalogRouter);
app.use("/api/v1/diagnosis", diagnosisRouter);
app.use("/api/v1/icd10", icd10Router);
app.use("/api/v1/insurance", insuranceRouter);
app.use("/api/v1/chat", chatRouter);
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