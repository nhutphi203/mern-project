// src/api/auth.ts

import { apiRequest } from './config';
import type { User, LoginRequest, RegisterRequest } from './types';

export const authApi = {
    // Đăng ký Patient
    registerPatient: async (data: RegisterRequest) => {
        // Thêm /api/v1/
        return apiRequest<{ user: User; token: string; message: string }>('/api/v1/user/patient/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Đăng nhập
    login: async (data: LoginRequest) => {
        // Thêm /api/v1/
        return apiRequest<{ user: User; token: string }>('/api/v1/user/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Lấy thông tin người dùng hiện tại
    getUserDetails: async (role: 'admin' | 'patient') => {
        // Thêm /api/v1/
        return apiRequest<{ user: User }>(`/api/v1/user/${role}/me`);
    },

    // Đăng xuất
    logoutAdmin: async () => {
        // Thêm /api/v1/
        return apiRequest('/api/v1/user/admin/logout');
    },

    logoutPatient: async () => {
        // Thêm /api/v1/
        return apiRequest('/api/v1/user/patient/logout');
    },

    // Thêm Admin mới
    addNewAdmin: async (data: Omit<RegisterRequest, 'role'>) => {
        // Thêm /api/v1/
        return apiRequest('/api/v1/user/admin/addnew', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Lấy danh sách bác sĩ
    getAllDoctors: async () => {
        // Thêm /api/v1/
        return apiRequest<{ doctors: User[] }>('/api/v1/user/doctors');
    },
};