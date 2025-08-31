// src/hooks/useReception.ts (Final Corrected Version)

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInPatient } from '@/api/receptionApi';
import { appointmentApi } from '@/api/appointments'; // Dùng api chung
import { useToast } from '@/components/ui/use-toast';
import type { PopulatedAppointment, Encounter } from '@/api/types';
import type { ApiError, ApiResponse } from '@/api/config';

export const useReception = (selectedDate: Date) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // ✅ SỬA Ở ĐÂY: Thêm kiểu dữ liệu cho useQuery
    // Chỉ định rằng `rawData` sẽ có kiểu ApiResponse<{ appointments: PopulatedAppointment[] }>
    const { data: rawData, isLoading, error } = useQuery<ApiResponse<{ appointments: PopulatedAppointment[] }>, ApiError>({
        queryKey: ['appointments_all'],
        queryFn: () => appointmentApi.getAllAppointments(),
    });

    // ✅ SỬA Ở ĐÂY: Dùng useMemo để lấy ra mảng appointments một cách an toàn
    // Điều này sẽ giải quyết cảnh báo `exhaustive-deps`
    const allAppointments = useMemo(() => rawData?.data?.appointments || [], [rawData]);

    // Lọc ra danh sách cần hiển thị (chỉ Accepted & theo ngày đã chọn)
    const appointmentsToShow = useMemo(() => {
        const selectedDateString = selectedDate.toLocaleDateString('en-CA');
        // `allAppointments` giờ đã là một dependency ổn định
        return allAppointments.filter(app => {
            const isAccepted = app.status === 'Accepted';
            const appointmentDateString = new Date(app.appointment_date).toLocaleDateString('en-CA');
            const isSameDay = appointmentDateString === selectedDateString;
            return isAccepted && isSameDay;
        });
    }, [allAppointments, selectedDate]);

    // Logic mutation để check-in (không đổi)
    const checkInMutation = useMutation<
        ApiResponse<Encounter>,
        ApiError,
        PopulatedAppointment
    >({
        mutationFn: (appointment) => checkInPatient(appointment._id),
        onSuccess: () => {
            toast({ title: "Thành công", description: "Bệnh nhân đã được check-in." });
            queryClient.invalidateQueries({ queryKey: ['appointments_all'] });
        },
        onError: (err: ApiError) => {
            toast({ title: "Lỗi", description: err.message, variant: 'destructive' });
        }
    });

    return {
        appointments: appointmentsToShow,
        isLoading,
        error,
        checkIn: checkInMutation.mutate,
        isCheckingIn: checkInMutation.isPending,
    };
};