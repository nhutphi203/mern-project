import { apiRequest } from './config';
import type { ApiResponse } from './config';

export interface Encounter {
    _id: string;
    appointmentId: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    status: 'InProgress' | 'Finished' | 'Cancelled';
    checkInTime: string;
    checkOutTime?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EncountersResponse {
    encounters: Encounter[];
    count: number;
}

export interface EncounterFilters {
    status?: string;
    doctorId?: string;
    patientId?: string;
    date?: string;
    page?: number;
    limit?: number;
}

export const encountersApi = {
    // Get doctor's queue (for Doctor role)
    getDoctorQueue: async () => {
        return apiRequest<ApiResponse<{ encounters: Encounter[] }>>('/api/v1/encounters/doctor-queue');
    },

    // Get all encounters (for Admin)
    getAllEncounters: async (filters?: EncounterFilters) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });
        }

        const url = filters && Object.keys(filters).length > 0
            ? `/api/v1/encounters?${queryParams.toString()}`
            : '/api/v1/encounters';

        return apiRequest<ApiResponse<EncountersResponse>>(url);
    },

    // Get encounter by ID
    getEncounterById: async (encounterId: string) => {
        return apiRequest<ApiResponse<{ encounter: Encounter }>>(`/api/v1/encounters/${encounterId}`);
    },

    // Get encounters for a specific patient
    getPatientEncounters: async (patientId: string) => {
        return apiRequest<ApiResponse<{ encounters: Encounter[] }>>(`/api/v1/encounters/patient/${patientId}`);
    },

    // Get recent encounters for lab order creation
    getRecentEncounters: async (doctorId?: string, limit: number = 10) => {
        const queryParams = new URLSearchParams();
        if (doctorId) queryParams.append('doctorId', doctorId);
        queryParams.append('limit', limit.toString());
        queryParams.append('status', 'InProgress');

        return apiRequest<ApiResponse<{ encounters: Encounter[] }>>(`/api/v1/encounters/recent?${queryParams.toString()}`);
    },

    // Update encounter status
    updateEncounterStatus: async (encounterId: string, status: string) => {
        return apiRequest<ApiResponse<{ encounter: Encounter }>>(`/api/v1/encounters/${encounterId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
};
