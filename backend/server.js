// backend/server.js

// DÒNG NÀY LÀ QUAN TRỌNG NHẤT VÀ PHẢI NẰM ĐẦU TIÊN
import { config } from "dotenv";
config({ path: "./config/config.env" });

// Bây giờ các biến môi trường đã sẵn sàng, ta mới import các file khác
import app from "./app.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

// Cấu hình Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Kết nối DB và khởi động server
mongoose.connect(process.env.MONGO_URI, { dbName: "hospitalDB" })
    .then(() => {
        console.log("✅ MongoDB connected successfully!");
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(`❌ MongoDB connection error: ${err}`);
        process.exit(1);
    });