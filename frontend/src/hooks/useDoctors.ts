// src/hooks/useDoctors.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/api'; // Sửa: Chỉ import doctorApi
import type { AddDoctorRequest } from '@/api/doctors';
import { useToast } from '@/components/ui/use-toast'; // Sửa đường dẫn nếu cần
import { apiRequest } from '@/api/config';

export const useDoctors = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data, isLoading, error } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => apiRequest('/api/v1/users/doctors'),
    });
    // Get all doctors
    const doctorsQuery = useQuery({
        queryKey: ['doctors'],
        // Sửa: Gọi đến doctorApi.getAllDoctors() cho nhất quán
        queryFn: doctorApi.getAllDoctors,
        // Dữ liệu trả về từ API là { success: true, doctors: [...] }
        // nên chúng ta cần select ra mảng doctors
        select: (data) => data.doctors,
    });

    // Add new doctor mutation (admin only)
    const addDoctorMutation = useMutation({
        mutationFn: doctorApi.addNewDoctor,
        onSuccess: () => {
            toast({
                title: "Doctor Added",
                description: "New doctor has been successfully registered.",
            });
            // Invalidate query 'doctors' để tự động fetch lại danh sách mới
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
        },
        onError: (error: unknown) => {
            toast({
                title: "Registration Failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    return {
        doctors: doctorsQuery.data,
        isLoading: doctorsQuery.isLoading,
        error: doctorsQuery.error,
        addDoctor: addDoctorMutation.mutate,
        isAdding: addDoctorMutation.isPending,
    };
};
