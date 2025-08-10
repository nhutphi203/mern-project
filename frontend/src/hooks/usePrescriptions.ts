import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionApi, CreatePrescriptionRequest } from '@/api/prescriptions';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/api/config';

// Hook để lấy tất cả đơn thuốc của một bệnh nhân
export const usePatientPrescriptions = (patientId: string | undefined) => {
    return useQuery({
        queryKey: ['prescriptions', 'patient', patientId],
        queryFn: () => prescriptionApi.getForPatient(patientId!),
        enabled: !!patientId, // Chỉ chạy query khi patientId tồn tại
    });
};

// Hook để xử lý việc tạo đơn thuốc mới
export const useCreatePrescription = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreatePrescriptionRequest) => prescriptionApi.create(data),
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: "Prescription created successfully.",
                variant: "default",
            });
            // Làm mới lại danh sách đơn thuốc của bệnh nhân liên quan
            // Giả sử data trả về có chứa thông tin prescription mới
            if (data.prescription) {
                queryClient.invalidateQueries({ queryKey: ['prescriptions', 'patient', data.prescription.patientId] });
            }
        },
        onError: (error: ApiError) => {
            toast({
                title: "Error Creating Prescription",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });
};
