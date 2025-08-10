import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// Giả định bạn có một file định nghĩa các hàm gọi API cho đơn thuốc
import { prescriptionApi } from '@/api/prescriptions';

// --- Type Definitions ---
// Các kiểu dữ liệu này nên được định nghĩa ở một nơi tập trung,
// nhưng tôi định nghĩa ở đây để file này được hoàn chỉnh.

// Dữ liệu cần thiết để tạo đơn thuốc, khớp với file API
export interface CreatePrescriptionRequest {
    medicalRecordId: string;
    appointmentId?: string; // Dùng cho hàm createForAppointment
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        notes?: string;
    }>;
}

// Dữ liệu cần thiết để ký số
export interface SignPrescriptionRequest {
    prescriptionId: string;
    signature: string;
}

interface MedicationData {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
}

interface PrescriptionData {
    _id: string;
    medicalRecordId: string;
    patientId: string;
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        doctorDepartment: string;
    };
    medications: MedicationData[];
    digitalSignature?: string;
    status: 'Active' | 'Cancelled' | 'Completed';
    createdAt: string;
}

// Kiểu dữ liệu cho response trả về một danh sách
interface PrescriptionsResponse {
    success: boolean;
    prescriptions: PrescriptionData[];
}

// Kiểu dữ liệu cho response trả về một đối tượng đơn lẻ
interface SinglePrescriptionResponse {
    success: boolean;
    prescription: PrescriptionData;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

// --- Query Hook để lấy danh sách đơn thuốc của một bệnh nhân ---
export const usePatientPrescriptions = (patientId?: string) => {
    return useQuery<PrescriptionsResponse, ApiError>({
        queryKey: ['prescriptions', 'patient', patientId],
        queryFn: async (): Promise<PrescriptionsResponse> => {
            if (!patientId) {
                return { success: true, prescriptions: [] };
            }
            // FIX: Sử dụng type assertion để báo cho TypeScript biết kiểu dữ liệu trả về
            const response = await prescriptionApi.getForPatient(patientId);
            return response as PrescriptionsResponse;
        },
        enabled: !!patientId,
    });
};

// --- Query Hook để lấy đơn thuốc theo ID lịch hẹn ---
export const usePrescriptionsForAppointment = (appointmentId?: string) => {
    return useQuery<PrescriptionsResponse, ApiError>({
        queryKey: ['prescriptions', 'appointment', appointmentId],
        queryFn: async (): Promise<PrescriptionsResponse> => {
            if (!appointmentId) {
                return { success: true, prescriptions: [] };
            }
            // FIX: Sử dụng type assertion
            const response = await prescriptionApi.getForAppointment(appointmentId);
            return response as PrescriptionsResponse;
        },
        enabled: !!appointmentId,
    });
};

// --- Mutation Hook để tạo đơn thuốc ---
export const useCreatePrescription = () => {
    const queryClient = useQueryClient();
    return useMutation<SinglePrescriptionResponse, ApiError, CreatePrescriptionRequest>({
        mutationFn: async (data: CreatePrescriptionRequest): Promise<SinglePrescriptionResponse> => {
            // FIX: Sử dụng type assertion cho kết quả trả về
            const response = await prescriptionApi.createForAppointment(data);
            return response as SinglePrescriptionResponse;
        },
        onSuccess: () => {
            toast.success("Đã tạo đơn thuốc thành công!");
            // Vô hiệu hóa query key chung để làm mới tất cả danh sách đơn thuốc
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        },
        onError: (error: ApiError) => {
            toast.error(error.response?.data?.message || "Lỗi khi tạo đơn thuốc.");
        }
    });
};

// --- Mutation Hook để ký số đơn thuốc ---
export const useSignPrescription = () => {
    const queryClient = useQueryClient();
    return useMutation<SinglePrescriptionResponse, ApiError, SignPrescriptionRequest>({
        mutationFn: async (data: SignPrescriptionRequest): Promise<SinglePrescriptionResponse> => {
            // FIX: Sử dụng type assertion
            const response = await prescriptionApi.sign(data.prescriptionId, data.signature);
            return response as SinglePrescriptionResponse;
        },
        onSuccess: () => {
            toast.success("Đã ký số thành công!");
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        },
        onError: (error: ApiError) => {
            toast.error(error.response?.data?.message || "Lỗi khi ký số.");
        }
    });
};
