// server/config/dbConnection.js (HOẶC TÊN FILE TƯƠNG TỰ)
import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        // Lấy chuỗi kết nối từ file .env
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error("❌ FATAL ERROR: MONGO_URI is not defined in .env file");
            process.exit(1); // Thoát ứng dụng nếu không có chuỗi kết nối
        }

        console.log("🔄 Attempting to connect to local MongoDB...");
        console.log(` URI: ${mongoURI}`);

        // Kết nối tới MongoDB với các tùy chọn tối thiểu và hiệu quả cho local
        const conn = await mongoose.connect(mongoURI, {
            // Các tùy chọn này là đủ cho môi trường phát triển local
            // Mongoose 6+ không cần nhiều tùy chọn cũ nữa
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        // Thoát khỏi tiến trình với lỗi
        process.exit(1);
    }
};