// File: src/api/encounterApi.ts (Phiên bản tối ưu)

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
        const response = await apiRequest<ApiResponse<{ encounters: PopulatedEncounter[] }>>(
            DOCTOR_QUEUE_ENDPOINT,
            { method: 'GET' }
        );
        // Trực tiếp trả về mảng 'encounters' hoặc một mảng rỗng
        return response.data?.encounters || [];
    }
};