// File: src/api/serviceApi.ts (Đã cập nhật)

import axios from 'axios';

// Định nghĩa cấu trúc dữ liệu của một service trả về từ API thật
export interface IServiceAPI {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}
// --- THAY ĐỔI Ở ĐÂY ---
const API_URL = 'http://localhost:4000/api/v1/services';
/**
 * Lấy danh sách tất cả các dịch vụ đang hoạt động từ backend
 */
export const getAllServices = async (): Promise<IServiceAPI[]> => {
    try {
        const response = await axios.get(`${API_URL}`);

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch services.');
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};