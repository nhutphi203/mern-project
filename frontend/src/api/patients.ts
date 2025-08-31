import { apiRequest } from './config';
import type { ApiResponse } from './config';

export interface Patient {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    gender: 'Male' | 'Female';
    address?: string;
    createdAt: string;
    role: string;
}

export interface PatientsResponse {
    patients: Patient[];
    count: number;
}

export interface PatientFilters {
    search?: string;
    gender?: string;
    role?: string;
    page?: number;
    limit?: number;
}

export const patientsApi = {
    // Get all patients (for Admin, Doctor, Receptionist)
    getAllPatients: async (filters?: PatientFilters) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });
        }

        const url = filters && Object.keys(filters).length > 0
            ? `/api/v1/users/patients?${queryParams.toString()}`
            : '/api/v1/users/patients';

        return apiRequest<ApiResponse<PatientsResponse>>(url);
    },

    // Get patient by ID
    getPatientById: async (patientId: string) => {
        return apiRequest<ApiResponse<{ patient: Patient }>>(`/api/v1/users/patients/${patientId}`);
    },

    // Create new patient (Admin only)
    createPatient: async (patientData: Omit<Patient, '_id' | 'createdAt'>) => {
        return apiRequest<ApiResponse<{ patient: Patient }>>('/api/v1/users/patients', {
            method: 'POST',
            body: JSON.stringify(patientData),
        });
    },

    // Update patient (Admin only)
    updatePatient: async (patientId: string, updateData: Partial<Patient>) => {
        return apiRequest<ApiResponse<{ patient: Patient }>>(`/api/v1/users/patients/${patientId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    },

    // Delete patient (Admin only)
    deletePatient: async (patientId: string) => {
        return apiRequest<ApiResponse<{ message: string }>>(`/api/v1/users/patients/${patientId}`, {
            method: 'DELETE',
        });
    },

    // Search patients
    searchPatients: async (searchTerm: string, filters?: Omit<PatientFilters, 'search'>) => {
        const queryParams = new URLSearchParams({ search: searchTerm });
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });
        }

        return apiRequest<ApiResponse<PatientsResponse>>(`/api/v1/users/patients/search?${queryParams.toString()}`);
    }
};

