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

// Hàm để hiển thị tất cả các route đã đăng ký
const listEndpoints = (app) => {
    const routes = [];

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Route được đăng ký trực tiếp
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods).join(', ').toUpperCase()
            });
        } else if (middleware.name === 'router') {
            // Router-level middleware
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = handler.route.path;
                    const basePath = middleware.regexp.toString()
                        .replace('\\^', '')
                        .replace('\\/?(?=\\/|$)', '')
                        .replace(/\\\//g, '/');
                    
                    const fullPath = basePath.replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, '') + path;
                    routes.push({
                        path: fullPath,
                        methods: Object.keys(handler.route.methods).join(', ').toUpperCase()
                    });
                }
            });
        }
    });

    console.log('📋 API Routes:');
    routes.forEach(route => {
        console.log(`${route.methods.padEnd(8)} ${route.path}`);
    });
};

// Kết nối DB và khởi động server
mongoose.connect(process.env.MONGO_URI, { dbName: "hospitalDB" })
    .then(() => {
        console.log("✅ MongoDB connected successfully!");
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT}`);
            // In ra tất cả các route đã đăng ký
            if (process.env.NODE_ENV !== 'production') {
                listEndpoints(app);
            }
        });
    })
    .catch((err) => {
        console.log(`❌ MongoDB connection error: ${err}`);
        process.exit(1);
    });