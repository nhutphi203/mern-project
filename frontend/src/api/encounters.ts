import { apiRequest, ApiResponse } from './config';

export interface Encounter {
    _id: string;
    appointmentId: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    receptionistId: string;
    checkInTime: string;
    status: 'InProgress' | 'Finished' | 'Cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const encountersApi = {
    getRecentEncounters: async (doctorId?: string) => {
        const endpoint = doctorId
            ? `/api/v1/encounters?doctorId=${doctorId}&limit=10`
            : '/api/v1/encounters?limit=10';

        return apiRequest<ApiResponse<{ encounters: Encounter[] }>>(endpoint);
    },

    getEncounterById: async (encounterId: string) => {
        return apiRequest<ApiResponse<{ encounter: Encounter }>>(`/api/v1/encounters/${encounterId}`);
    }
};