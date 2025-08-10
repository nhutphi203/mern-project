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

    const appointmentsQuery = useQuery({
        queryKey: ['appointments', userRole, filter],
        queryFn: () => {
            if (filter && Object.keys(filter).length > 0) {
                return appointmentApi.filterAppointments(filter);
            }

            switch (userRole) {
                case 'Admin':
                    return appointmentApi.getAllAppointments();
                case 'Patient':
                case 'Doctor':
                    return appointmentApi.getMyAppointments();
                default:
                    return Promise.resolve({ appointments: [] });
            }
        },
        enabled: !!userRole,
    });

    // === THÊM LẠI LOGIC LẤY THỐNG KÊ ===
    const statsQuery = useQuery({
        queryKey: ['appointment-stats'],
        queryFn: appointmentApi.getAppointmentStats,
        // Chỉ chạy query này khi người dùng là Admin
        enabled: userRole === 'Admin',
    });
    // === KẾT THÚC PHẦN THÊM MỚI ===


    const createAppointmentMutation = useMutation({
        mutationFn: appointmentApi.createAppointment,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Appointment booked successfully! Please wait for admin confirmation.",
            });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
        onError: (error: ApiError) => {
            toast({
                title: "Booking Failed",
                description: error.message || "Could not book appointment. Please try again.",
                variant: "destructive",
            });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) =>
            appointmentApi.updateAppointmentStatus(id, status),
        onSuccess: () => {
            toast({ title: "Success", description: "Appointment status updated." });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment-stats'] }); // Làm mới stats
        },
        onError: (error: ApiError) => {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update status.",
                variant: "destructive",
            });
        },
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: appointmentApi.deleteAppointment,
        onSuccess: () => {
            toast({ title: "Success", description: "Appointment deleted successfully." });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment-stats'] }); // Làm mới stats
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
        appointments: appointmentsQuery.data?.appointments as PopulatedAppointment[] | undefined,
        isLoading: appointmentsQuery.isLoading,
        error: appointmentsQuery.error,
        fetchAppointments: appointmentsQuery.refetch,

        // === THÊM LẠI CÁC GIÁ TRỊ THỐNG KÊ VÀO RETURN ===
        stats: statsQuery.data?.stats,
        isLoadingStats: statsQuery.isLoading,
        statsError: statsQuery.error,
        // === KẾT THÚC PHẦN THÊM MỚI ===

        createAppointment: createAppointmentMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteAppointment: deleteAppointmentMutation.mutate,

        isCreating: createAppointmentMutation.isPending,
        isUpdating: updateStatusMutation.isPending,
        isDeleting: deleteAppointmentMutation.isPending,
    };
};
