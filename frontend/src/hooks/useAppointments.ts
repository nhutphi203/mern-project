// frontend/src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/api';
import type {
    Appointment,
    AppointmentRequest,
    AppointmentFilter,
    PopulatedAppointment,
    // << Đảm bảo bạn đã import ApiResponse
} from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { ApiError, ApiResponse } from '@/api/config';
import { useCurrentUser } from './useAuth';

type PossibleAppointmentResponses =
    | ApiResponse<{ appointments: PopulatedAppointment[] }>
    | { appointments: PopulatedAppointment[] };
export const useAppointments = (filter?: AppointmentFilter) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: currentUser } = useCurrentUser();

    const userRole = currentUser?.user?.role;

    // ✅ BƯỚC 1: Thêm kiểu dữ liệu tường minh để TypeScript kiểm tra giúp bạn
    const appointmentsQuery = useQuery<ApiResponse<{ appointments: PopulatedAppointment[] }>, ApiError>({
        queryKey: ['appointments', filter],
        // ✅ SỬA Ở ĐÂY: Dùng async/await để xử lý và chuẩn hóa dữ liệu
        queryFn: async () => {
            let result: PossibleAppointmentResponses;

            // Lấy dữ liệu thô từ API
            if (filter && Object.keys(filter).length > 0) {
                result = await appointmentApi.filterAppointments(filter);
            } else {
                switch (userRole) {
                    case 'Admin':
                        result = await appointmentApi.getAllAppointments();
                        break;
                    case 'Patient':
                    case 'Doctor':
                        result = await appointmentApi.getMyAppointments();
                        break;
                    default:
                        // Trường hợp mặc định trả về cấu trúc chuẩn
                        return {
                            success: true,
                            message: "No user role or filter provided.",
                            data: { appointments: [] }
                        };
                }
            }

            // ✅ BƯỚC 3: Dùng type guard để "chuẩn hóa" dữ liệu một cách an toàn
            // 'in' operator là một type guard an toàn trong TypeScript
            if (result && 'success' in result && 'data' in result) {
                // Nếu 'result' đã là một ApiResponse đầy đủ, trả về luôn
                return result as ApiResponse<{ appointments: PopulatedAppointment[] }>;
            } else if (result && 'appointments' in result) {
                // Nếu 'result' chỉ là object { appointments: [...] }, hãy bọc nó lại
                return {
                    success: true,
                    message: "Data normalized in hook.",
                    data: { appointments: result.appointments }
                };
            }

            // Trường hợp dự phòng nếu API trả về lỗi không mong muốn
            throw new Error("Unexpected API response format.");
        },
        enabled: !!userRole || !!filter,
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
        // Trả về dữ liệu từ appointmentsQuery
        appointments: appointmentsQuery.data?.data?.appointments,
        isLoading: appointmentsQuery.isLoading,
        error: appointmentsQuery.error,
        fetchAppointments: appointmentsQuery.refetch,

        stats: statsQuery.data?.stats,
        isLoadingStats: statsQuery.isLoading,
        statsError: statsQuery.error,

        createAppointment: createAppointmentMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteAppointment: deleteAppointmentMutation.mutate,

        isCreating: createAppointmentMutation.isPending,
        isUpdating: updateStatusMutation.isPending,
        isDeleting: deleteAppointmentMutation.isPending,
    };
};