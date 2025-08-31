// src/api/doctors.ts
import { apiRequest, apiUploadRequest } from './config'; // Thêm apiRequest
import type { User } from './types';

export interface AddDoctorRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    gender: 'Male' | 'Female';
    dob: string;
    nic: string;
    doctorDepartment: string;
    docAvatar: File;
}

export const doctorApi = {
    /**
     * Lấy danh sách tất cả các bác sĩ.
     * @returns Promise<{ doctors: User[] }>
     */
    getAllDoctors: async () => {
        // Gọi đến API cuối cùng và chính xác: /api/v1/users/doctors
        return apiRequest<{ doctors: User[] }>('/api/v1/users/doctors');
    },

    /**
     * Thêm một bác sĩ mới (chỉ dành cho Admin).
     * @param data Dữ liệu của bác sĩ mới
     * @returns Promise<{ doctor: User }>
     */
    addNewDoctor: async (data: AddDoctorRequest) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'docAvatar') {
                formData.append(key, value as File);
            } else {
                formData.append(key, value as string);
            }
        });
        formData.append('role', 'Doctor');

        // Endpoint này có thể cần được điều chỉnh cho phù hợp với router của bạn
        return apiUploadRequest<{ doctor: User }>('/user/doctor/addnew', formData);
    },
};
