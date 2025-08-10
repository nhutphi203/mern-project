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

    create: async (data) => {
        return apiRequest('/api/v1/prescriptions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getForRecord: async (recordId) => {
        return apiRequest(`/api/v1/prescriptions/record/${recordId}`);
    },

    getForPatient: async (patientId) => {
        return apiRequest(`/api/v1/prescriptions/patient/${patientId}`);
    },

    // NEW methods for appointment-based prescriptions
    getForAppointment: async (appointmentId) => {
        return apiRequest(`/api/v1/prescriptions?appointmentId=${appointmentId}`);
    },

    createForAppointment: async (data) => {
        return apiRequest('/api/v1/prescriptions/appointment', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    sign: async (prescriptionId, digitalSignature) => {
        return apiRequest(`/api/v1/prescriptions/${prescriptionId}/sign`, {
            method: 'PUT',
            body: JSON.stringify({ digitalSignature }),
        });
    },
};
