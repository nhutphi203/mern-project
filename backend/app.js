// backend/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import passport from "passport";

// Import các router và middleware
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import prescriptionRouter from './router/prescriptionRouter.js';
import medicalRecordRouter from "./router/medicalRecordRouter.js";

// Dòng này sẽ được chạy SAU KHI dotenv đã được nạp ở server.js
import "./config/passport.config.js";

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

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/users", userRouter);

// Middleware xử lý lỗi phải nằm ở cuối cùng
app.use(errorMiddleware);

export default app;