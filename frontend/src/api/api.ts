// src/api/axios.ts
import axios from "axios";

// Tạo một instance axios được cấu hình sẵn
const api = axios.create({
    // Lấy URL cơ sở từ biến môi trường
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    // Gửi cookie và token cùng với request
    withCredentials: true,

});

export default api;
