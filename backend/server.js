import mongoose from "mongoose";
import app from "./app.js";
import cloudinary from "cloudinary";
import dotenv from 'dotenv';
dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⭐⭐⭐ Thêm phần kết nối MongoDB ⭐⭐⭐
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
    });
