// File: backend/app.js
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";

// --- SỬA LẠI TẤT CẢ ĐƯỜNG DẪN IMPORT THEO ĐÚNG TÊN THƯ MỤC/FILE CỦA BẠN ---

// 1. Import từ thư mục `router` (số ít)
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import patientProfileRouter from "./router/patientProfile.routes.js";

// 2. Import từ file `errorMiddleware.js` (tên file chính xác)
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
config({ path: "./config/config.env" });

app.use(
    cors({
        origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        method: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// Sử dụng các router với đường dẫn API
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/profiles", patientProfileRouter); // API cho hồ sơ bệnh nhân
app.use("/api/v1/users", userRouter); // <--- ĐẢM BẢO BẠN CÓ DÒNG NÀY

dbConnection();

// Sử dụng errorMiddleware ở cuối cùng
app.use(errorMiddleware);

export default app;