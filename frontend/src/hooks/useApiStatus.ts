
// src/hooks/useApiStatus.ts
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/api/config';

export const useApiStatus = () => {
    return useQuery({
        queryKey: ['api-status'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/api/ping`);
            const data = await response.json();
            return data.message;
        },
        refetchInterval: 30000, // Check every 30 seconds
        retry: 3,
    });
};