// File: backend/scripts/seeders/seedServices.js

import mongoose from 'mongoose';
import path from 'path'; // Thêm import 'path'
import { fileURLToPath } from 'url'; // Thêm import 'url'
// Đảm bảo đường dẫn đến model của bạn là chính xác
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { config } from "dotenv";

// SỬA LỖI: Lấy đường dẫn thư mục hiện tại một cách an toàn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load các biến môi trường từ file config, sử dụng đường dẫn tuyệt đối để đảm bảo luôn đúng
config({ path: path.resolve(__dirname, '../../config/config.env') });


const services = [
    {
        serviceId: 'CONSULT-001',
        name: 'Khám Tổng quát',
        description: 'Kiểm tra sức khỏe toàn diện với bác sĩ đa khoa để phát hiện sớm các vấn đề sức khỏe tiềm ẩn.',
        // Link ảnh thật: Bác sĩ đang khám cho bệnh nhân
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
        department: 'Consultation',
        price: 150000,
        isActive: true
    },
    {
        serviceId: 'LAB-001',
        name: 'Xét nghiệm Máu',
        description: 'Phân tích các chỉ số máu quan trọng để đánh giá chức năng gan, thận và các nguy cơ bệnh lý khác.',
        // Link ảnh thật: Các ống nghiệm máu trong phòng lab
        imageUrl: 'https://images.unsplash.com/photo-1628348070889-cb656235b48d?q=80&w=2070&auto=format&fit=crop',
        department: 'Laboratory',
        price: 120000,
        isActive: true
    },
    {
        serviceId: 'XRAY-001',
        name: 'Chụp X-quang Ngực',
        description: 'Chẩn đoán hình ảnh giúp phát hiện các bệnh lý về phổi, tim và lồng ngực một cách chính xác.',
        // Link ảnh thật: Bác sĩ đang xem phim X-quang
        imageUrl: 'https://images.unsplash.com/photo-1615486514339-a19d65a68750?q=80&w=1964&auto=format&fit=crop',
        department: 'Radiology',
        price: 250000,
        isActive: true
    },
    {
        serviceId: 'DENTAL-001',
        name: 'Chăm sóc Răng miệng',
        description: 'Cung cấp các dịch vụ nha khoa từ cơ bản đến chuyên sâu như cạo vôi, trám răng, tẩy trắng.',
        // Link ảnh thật: Ghế và dụng cụ nha khoa
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-da6316ac9152?q=80&w=2070&auto=format&fit=crop',
        department: 'Dentistry',
        price: 200000,
        isActive: true
    },
    {
        serviceId: 'ULTRA-001',
        name: 'Siêu âm Ổ bụng',
        description: 'Sử dụng sóng âm để tạo ra hình ảnh của các cơ quan nội tạng, giúp chẩn đoán các bệnh lý về gan, mật, tụy.',
        // Link ảnh thật: Bác sĩ đang thực hiện siêu âm
        imageUrl: 'https://images.unsplash.com/photo-1580281657527-2b2a13945a2a?q=80&w=2070&auto=format&fit=crop',
        department: 'Radiology',
        price: 180000,
        isActive: true
    },
    {
        serviceId: 'NUTRIT-001',
        name: 'Tư vấn Dinh dưỡng',
        description: 'Xây dựng chế độ ăn uống lành mạnh, phù hợp với tình trạng sức khỏe và mục tiêu cá nhân của bạn.',
        // Link ảnh thật: Bữa ăn lành mạnh với rau củ quả
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17025?q=80&w=2070&auto=format&fit=crop',
        department: 'Consultation',
        price: 300000,
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
