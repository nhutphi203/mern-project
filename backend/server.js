import mongoose from "mongoose";
import app from "./app.js";
import cloudinary from "cloudinary";
import dotenv from 'dotenv';
import cors from 'cors';

// Tải biến môi trường từ file .env
dotenv.config();

// Cấu hình Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⭐ Cập nhật cấu hình CORS để cho phép frontend truy cập với credentials
// Lấy URL frontend từ biến môi trường
const frontendUrl = process.env.FRONTEND_URL;

// Cấu hình CORS với origin và credentials
app.use(cors({
    origin: frontendUrl, // Cho phép truy cập từ URL của frontend
    credentials: true,   // Cho phép gửi cookie và header xác thực
}));

// ⭐ Thêm một route đơn giản để kiểm tra kết nối API
// Bạn nên đặt route này trong file app.js
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

// Kết nối MongoDB và khởi động server
mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => {
        console.log("✅ MongoDB connected successfully to 'hospitalDB'");
        app.listen(process.env.PORT || 4000, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT || 4000}`);
        });
    })
    .catch((err) => {
        console.log(`❌ MongoDB connection error: ${err}`);
        process.exit(1);
    });