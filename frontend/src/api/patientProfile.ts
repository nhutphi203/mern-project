// src/api/patientProfile.ts
import { apiRequest } from './config';
import type { PatientProfileData } from './types';

// Định nghĩa kiểu dữ liệu cho việc cập nhật profile
export interface UpdateProfileRequest {
    patientId: string;
    bloodType?: string;
    allergies?: string[];
    // Sẽ thêm medicalHistory sau
}

export const patientProfileApi = {
    getProfile: async (patientId: string) => {
        return apiRequest<{ profile: PatientProfileData }>(`/api/v1/profiles/${patientId}`);
    },

    // --- HÀM MỚI ĐỂ TẠO/CẬP NHẬT ---
    createOrUpdateProfile: async (data: UpdateProfileRequest) => {
        return apiRequest<{ profile: PatientProfileData }>('/api/v1/profiles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};