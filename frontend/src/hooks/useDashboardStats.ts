// File: src/hooks/useDashboardStats.ts

import { useQuery } from '@tanstack/react-query';
import { appointmentApi } from '@/api/appointments'; // Import từ file api
import { ApiError } from '@/api/config';
import type { AppointmentStats } from '@/api/types';

export const useDashboardStats = () => {
    const {
        data: stats,
        isLoading: isLoadingStats,
        error: statsError
    } = useQuery<AppointmentStats, ApiError>({
        queryKey: ['appointmentStats'], // Khóa cache cho dữ liệu thống kê
        queryFn: appointmentApi.getAppointmentStats,
        staleTime: 5 * 60 * 1000, // Dữ liệu được coi là "tươi" trong 5 phút
    });

    return {
        stats,
        isLoadingStats,
        statsError,
    };
};