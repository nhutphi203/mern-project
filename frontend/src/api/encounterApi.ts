// File: src/api/encounterApi.ts (Production Version)

import { apiRequest } from './config';
import type { ApiResponse } from './config';
import type { PopulatedEncounter } from './types';

const DOCTOR_QUEUE_ENDPOINT = '/api/v1/encounters/doctor-queue';

export const encounterApi = {
    /**
     * @desc Lấy danh sách bệnh nhân đang chờ khám của bác sĩ.
     * @returns {Promise<PopulatedEncounter[]>} Một promise chứa mảng các lượt khám.
     */
    getDoctorQueue: async (): Promise<PopulatedEncounter[]> => {
        try {
            const response = await apiRequest<ApiResponse<{ encounters: PopulatedEncounter[] }>>(
                DOCTOR_QUEUE_ENDPOINT,
                { method: 'GET' }
            );

            // Trả về mảng encounters từ response.data.encounters
            return response.data?.encounters || [];

        } catch (error) {
            console.error('[Encounter API Error]:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
};