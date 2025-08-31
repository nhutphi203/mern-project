// File: src/hooks/useDoctorQueue.ts (Phiên bản mới)

import { useQuery } from '@tanstack/react-query';
import { encounterApi } from '@/api/encounterApi';
import { ApiError } from '@/api/config';
import type { PopulatedEncounter } from '@/api/types';

export const useDoctorQueue = () => {
    const {
        data: waitingList, // Dữ liệu trả về từ queryFn giờ chính là waitingList
        isLoading: isLoadingQueue,
        error: queueError,
    } = useQuery<PopulatedEncounter[], ApiError>({
        // Khóa cache cho dữ liệu này
        queryKey: ['doctorQueue'],
        // Hàm API để fetch dữ liệu
        queryFn: encounterApi.getDoctorQueue,
        // Tự động làm mới mỗi 15 giây để cập nhật hàng chờ
        refetchInterval: 15000,
    });

    return {
        // Luôn đảm bảo trả về một mảng, kể cả khi đang tải hoặc lỗi
        waitingList: waitingList || [],
        isLoadingQueue,
        queueError,
    };
};