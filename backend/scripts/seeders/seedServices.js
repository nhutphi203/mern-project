// File: backend/scripts/seeders/seedServices.js

import mongoose from 'mongoose';
// Đảm bảo đường dẫn đến model của bạn là chính xác
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { config } from "dotenv";

// Load các biến môi trường từ file config
config({ path: "./config/config.env" });

const services = [
    {
        serviceId: 'CONSULT-001',
        name: 'Khám Tổng quát',
        description: 'Kiểm tra sức khỏe toàn diện với bác sĩ đa khoa để phát hiện sớm các vấn đề sức khỏe tiềm ẩn.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
        department: 'Consultation',
        price: 150000,
        isActive: true
    },
    {
        serviceId: 'LAB-001',
        name: 'Xét nghiệm Máu',
        description: 'Phân tích các chỉ số máu quan trọng để đánh giá chức năng gan, thận và các nguy cơ bệnh lý khác.',
        imageUrl: 'https://images.unsplash.com/photo-1631599142436-0e39665792ac?q=80&w=2070&auto=format&fit=crop',
        department: 'Laboratory',
        price: 120000,
        isActive: true
    },
    {
        serviceId: 'XRAY-001',
        name: 'Chụp X-quang Ngực',
        description: 'Chẩn đoán hình ảnh giúp phát hiện các bệnh lý về phổi, tim và lồng ngực một cách chính xác.',
        imageUrl: 'https://images.unsplash.com/photo-1581093402462-b9841b5188f6?q=80&w=2070&auto=format&fit=crop',
        department: 'Radiology',
        price: 250000,
        isActive: true
    },
    {
        serviceId: 'DENTAL-001',
        name: 'Chăm sóc Răng miệng',
        description: 'Cung cấp các dịch vụ nha khoa từ cơ bản đến chuyên sâu như cạo vôi, trám răng, tẩy trắng.',
        imageUrl: 'https://images.unsplash.com/photo-1606206364357-a92a43b96e8d?q=80&w=2070&auto=format&fit=crop',
        department: 'Other', // Hoặc tạo department 'Dentistry'
        price: 200000,
        isActive: true
    }
];

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in your .env file!");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại script
        await ServiceCatalog.deleteMany({});
        console.log('🚮 Old services deleted.');

        // Chèn dữ liệu mới
        await ServiceCatalog.insertMany(services);
        console.log('🌱 New services seeded successfully.');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        // Luôn ngắt kết nối sau khi hoàn thành
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

seedDatabase();