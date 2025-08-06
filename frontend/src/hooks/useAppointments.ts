// src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/api';
import type { Appointment, AppointmentRequest } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/api/config';
import { useCurrentUser } from './useAuth';

export const useAppointments = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: currentUser } = useCurrentUser();

    const userRole = currentUser?.user?.role;

    // Get appointments based on user role
    const appointmentsQuery = useQuery({
        queryKey: ['appointments', userRole],
        queryFn: () => {
            switch (userRole) {
                case 'Admin':
                    return appointmentApi.getAllAppointments();
                case 'Patient':
                    return appointmentApi.getMyAppointments();
                case 'Doctor':
                    return appointmentApi.getDoctorAppointments();
                default:
                    throw new Error('Unauthorized access');
            }
        },
        select: (data) => data.appointments,
        enabled: !!userRole, // Only fetch when user role is available
        retry: false,
    });

    const createAppointmentMutation = useMutation({
        mutationFn: (data: AppointmentRequest) => appointmentApi.createAppointment(data),
        onSuccess: () => {
            toast({
                title: "Appointment Booked",
                description: "Your appointment has been successfully scheduled.",
            });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
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
        fetchAppointments: appointmentsQuery.refetch,

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