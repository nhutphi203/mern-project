// src/hooks/useDoctors.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, doctorApi } from '@/api';
import type { AddDoctorRequest } from '@/api/doctors';
import { toast } from '@/hooks/use-toast';

export const useDoctors = () => {
    const queryClient = useQueryClient();

    // Get all doctors
    const doctorsQuery = useQuery({
        queryKey: ['doctors'],
        queryFn: () => authApi.getAllDoctors(),
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