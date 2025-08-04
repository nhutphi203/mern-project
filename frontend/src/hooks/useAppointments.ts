// src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/api'; // Assuming you have this
import type { Appointment } from '@/api/types';
import { useToast } from '@/components/ui/use-toast'; // Corrected import path
import { ApiError } from '@/api/config';

export const useAppointments = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Get all appointments (admin only)
    const appointmentsQuery = useQuery({
        queryKey: ['appointments'],
        queryFn: () => appointmentApi.getAllAppointments(),
        select: (data) => data.appointments,
        enabled: false, // 1. Prevents automatic API call
        retry: false,   // Optional: Prevents retrying on initial failure
    });

    const createAppointmentMutation = useMutation({
        mutationFn: appointmentApi.createAppointment,
        onSuccess: () => {
            toast({
                title: "Appointment Booked",
                description: "Your appointment has been successfully scheduled.",
            });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
        // 2. Standardized error handling
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Booking failed. Please try again.";
            toast({
                title: "Booking Failed",
                description: message,
                variant: "destructive",
            });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) =>
            appointmentApi.updateAppointmentStatus(id, status),
        onSuccess: () => {
            toast({
                title: "Status Updated",
                description: "Appointment status has been updated successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
        // 2. Standardized error handling
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Update failed. Please try again.";
            toast({
                title: "Update Failed",
                description: message,
                variant: "destructive",
            });
        }
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: appointmentApi.deleteAppointment,
        onSuccess: () => {
            toast({
                title: "Appointment Deleted",
                description: "The appointment has been removed successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
        // 2. Standardized error handling (and fixed the nested toast)
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Deletion failed. Please try again.";
            toast({
                title: "Deletion Failed",
                description: message,
                variant: "destructive",
            });
        },
    });

    return {
        // Data and status for displaying appointments
        appointments: appointmentsQuery.data,
        isLoading: appointmentsQuery.isLoading,
        error: appointmentsQuery.error,
        fetchAppointments: appointmentsQuery.refetch, // 3. Expose the refetch function

        // Functions to modify appointments
        createAppointment: createAppointmentMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteAppointment: deleteAppointmentMutation.mutate,

        // Status flags for UI feedback
        isCreating: createAppointmentMutation.isPending,
        isUpdating: updateStatusMutation.isPending,
        isDeleting: deleteAppointmentMutation.isPending,
    };
};