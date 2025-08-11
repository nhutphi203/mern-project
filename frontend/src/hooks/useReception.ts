// File: src/hooks/useReception.ts (ĐÃ SỬA LỖI TRUY CẬP DỮ LIỆU)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInPatient } from '@/api/receptionApi';
import { appointmentApi } from '@/api/appointments';
import { useToast } from '@/components/ui/use-toast';
import { ApiError, ApiResponse } from '@/api/config';
import type { PopulatedAppointment, Encounter } from '@/api/types';

export const useReception = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // ✅ SỬA Ở ĐÂY: useQuery giờ sẽ nhận đúng kiểu dữ liệu từ queryFn
    const { data, isLoading, error } = useQuery<ApiResponse<{ appointments: PopulatedAppointment[] }>, ApiError>({
        queryKey: ['appointments', 'Accepted'],
        queryFn: () => appointmentApi.getAppointmentsByStatus('Accepted'),
    });

    // ✅ VÀ SỬA Ở ĐÂY: Truy cập vào đúng đường dẫn data.data.appointments
    const appointments = data?.data?.appointments || [];

    const checkInMutation = useMutation<
        ApiResponse<Encounter>,
        ApiError,
        PopulatedAppointment
    >({
        mutationFn: (appointment) => checkInPatient(appointment._id),

        onSettled: () => {
            toast({
                title: "Đã xử lý Check-in",
                description: "Đang làm mới lại danh sách...",
            });

            queryClient.refetchQueries({ queryKey: ['appointments', 'Accepted'] });
            queryClient.refetchQueries({ queryKey: ['doctorQueue'] });
            queryClient.refetchQueries({ queryKey: ['doctorAppointments'] });
        },
        onError: (error: ApiError) => {
            toast({
                title: "Check-in Thất bại",
                description: error.message || "Đã có lỗi xảy ra.",
                variant: "destructive",
            });
        }
    });

    return {
        appointments,
        isLoadingAppointments: isLoading,
        fetchError: error,
        checkIn: checkInMutation.mutate,
        isCheckingIn: checkInMutation.isPending,
    };
};