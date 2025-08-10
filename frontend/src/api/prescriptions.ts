import { apiRequest } from './config';
import type { Prescription, PopulatedPrescription } from './types'; // Giả sử bạn sẽ thêm các type này vào types.ts

// Dữ liệu cần thiết để tạo một đơn thuốc mới
export interface CreatePrescriptionRequest {
    medicalRecordId: string;
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        notes?: string;
    }>;
}

export const prescriptionApi = {
    /**
     * @desc    Bác sĩ tạo một đơn thuốc mới
     * @param   data Dữ liệu đơn thuốc
     */
    create: async (data: CreatePrescriptionRequest) => {
        return apiRequest<{ prescription: Prescription }>('/api/v1/prescriptions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * @desc    Lấy tất cả đơn thuốc của một hồ sơ bệnh án
     * @param   recordId ID của hồ sơ bệnh án
     */
    getForRecord: async (recordId: string) => {
        return apiRequest<{ prescriptions: PopulatedPrescription[] }>(`/api/v1/prescriptions/record/${recordId}`);
    },

    /**
     * @desc    Lấy tất cả đơn thuốc của một bệnh nhân
     * @param   patientId ID của bệnh nhân
     */
    getForPatient: async (patientId: string) => {
        return apiRequest<{ prescriptions: PopulatedPrescription[] }>(`/api/v1/prescriptions/patient/${patientId}`);
    },
};
