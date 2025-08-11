// File: src/api/receptionApi.ts
import { apiRequest } from './config'; // Giả sử file client của bạn tên là index.ts

import type { ApiResponse } from './index';
import type { PopulatedAppointment } from './types';
import axios from 'axios';
import type { Encounter } from './types';

const API_URL = 'http://localhost:4000/api/v1';

// Cấu hình axios instance để tự động gửi token
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để đính kèm token vào mỗi request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('receptionistToken'); // Hoặc nơi bạn lưu token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// File: src/api/receptionApi.ts (Đã sửa lỗi)



/**
 * @desc Lấy danh sách TẤT CẢ lịch hẹn từ backend, sau đó lọc ở frontend
 */
export const getAllAppointmentsForReception = async (): Promise<PopulatedAppointment[]> => {
    // SỬA Ở ĐÂY: Dùng endpoint getAllAppointments
    const response = await apiRequest<ApiResponse<{ appointments: PopulatedAppointment[] }>>(
        '/api/v1/appointment/getall',
        { method: 'GET' }
    );
    // Trả về mảng appointments bên trong data
    return response.data?.appointments || [];
};

/**
 * @desc Calls the check-in API for a patient
 * @param appointmentId The ID of the appointment to check-in
 */
export const checkInPatient = async (appointmentId: string): Promise<ApiResponse<Encounter>> => {
    // THE FIX IS HERE: We tell apiRequest what kind of 'data' to expect
    const response = await apiRequest<ApiResponse<Encounter>>(
        `/api/v1/reception/check-in/${appointmentId}`,
        { method: 'POST' }
    );
    return response;
};