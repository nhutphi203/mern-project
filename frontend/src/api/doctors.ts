
// src/api/doctors.ts
import { apiUploadRequest } from './config';
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
    // Add new doctor (admin only)
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

        return apiUploadRequest<{ doctor: User }>('/user/doctor/addnew', formData);
    },
};
