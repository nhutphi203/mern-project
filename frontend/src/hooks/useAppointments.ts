// frontend/src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/api';
import type {
    Appointment,
    AppointmentRequest,
    AppointmentFilter,
    PopulatedAppointment
} from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/api/config';
import { useCurrentUser } from './useAuth';

export const useAppointments = (filter?: AppointmentFilter) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: currentUser } = useCurrentUser();

    const userRole = currentUser?.user?.role;

    // Get appointments based on user role
    const appointmentsQuery = useQuery({
        queryKey: ['appointments', userRole, filter],
        queryFn: () => {
            // Nếu có filter, sử dụng filterAppointments API
            if (filter && Object.keys(filter).length > 0) {
                return appointmentApi.filterAppointments(filter);
            }

            // Nếu không có filter, sử dụng API theo role
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
        enabled: !!userRole,
        retry: false,
    });

    // Get appointment statistics (Admin only)
    const statsQuery = useQuery({
        queryKey: ['appointment-stats'],
        queryFn: appointmentApi.getAppointmentStats,
        enabled: userRole === 'Admin',
        select: (data) => data.stats,
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
            queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
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
            queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
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
        appointments: appointmentsQuery.data as PopulatedAppointment[] | undefined,
        isLoading: appointmentsQuery.isLoading,
        error: appointmentsQuery.error,
        fetchAppointments: appointmentsQuery.refetch,

        // Statistics (Admin only)
        stats: statsQuery.data,
        isLoadingStats: statsQuery.isLoading,
        statsError: statsQuery.error,

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

// Hook riêng cho filter appointments
export const useFilteredAppointments = (filter: AppointmentFilter) => {
    return useQuery({
        queryKey: ['filtered-appointments', filter],
        queryFn: () => appointmentApi.filterAppointments(filter),
        enabled: Object.keys(filter).length > 0,
    });
};