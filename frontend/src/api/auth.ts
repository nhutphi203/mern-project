// src/api/auth.ts

import { apiRequest } from './config';
import type { User, LoginRequest, RegisterRequest } from './types';
import type { MessageResponse } from './types';
export const authApi = {
    // Đăng ký Patient
    register: async (data: RegisterRequest) => {
        // Trỏ đến endpoint /register mới
        return apiRequest('/api/v1/users/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    // Đăng nhập
    login: async (data: LoginRequest) => {
        // Thêm /api/v1/
        return apiRequest<{ user: User; token: string }>('/api/v1/users/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getUserDetails: async () => {
        return apiRequest<{ user: User }>(`/api/v1/users/me`); // Gọi đến endpoint mới
    },
    logout: async () => {
        return apiRequest<MessageResponse>('/api/v1/users/logout'); // Gọi đến endpoint mới
    },
    // Thêm Admin mới
    addNewAdmin: async (data: Omit<RegisterRequest, 'role'>) => {
        // Thêm /api/v1/
        return apiRequest('/api/v1/users/admin/addnew', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Lấy danh sách bác sĩ
    getAllDoctors: async () => {
        // Thêm /api/v1/
        return apiRequest<{ doctors: User[] }>('/api/v1/users/doctors');
    },
};