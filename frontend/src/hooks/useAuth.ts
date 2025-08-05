// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import type { LoginRequest, RegisterRequest, User } from '@/api/types';
// import { toast } from '@/hooks/use-toast'; // Xóa dòng import trùng lặp
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/api/config';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();


    // --- LOGIN MUTATION (ĐÃ THÊM LOG) ---
    const loginMutation = useMutation({
        mutationFn: authApi.login,

        // 1. Log ngay khi mutation được gọi
        onMutate: (variables) => {
            console.log("LOGIN ATTEMPT: Đang thử đăng nhập với dữ liệu:", variables);
        },

        // 2. Log khi mutation thành công
        onSuccess: (data) => {
            console.log("LOGIN SUCCESS: API trả về dữ liệu thành công:", data);

            // ✅ SỬA LỖI TẠI ĐÂY: Chuẩn hóa 'role' về chữ thường trước khi set cache
            const role = data.user.role.toLowerCase() as 'admin' | 'patient';
            queryClient.setQueryData(['user', role], data); // Giờ đây key sẽ là ['user', 'patient']

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${data.user.firstName}!`,
            });
        },

        // 3. Log khi mutation thất bại
        onError: (error: ApiError) => {
            console.error("LOGIN FAILED: API trả về lỗi:", error);

            // ✅ SỬA LỖI Ở ĐÂY: Dùng error.message trực tiếp vì ApiError không có thuộc tính 'response'
            const message = error.message || 'An unexpected error occurred.';
            toast({
                title: 'Login Failed',
                description: message,
                variant: 'destructive',
            });
        },
    });

    // Giữ nguyên logic registerMutation của bạn
    const registerMutation = useMutation({
        // ✅ SỬA LỖI Ở ĐÂY: Tên hàm đúng là 'registerPatient' trong authApi
        mutationFn: authApi.registerPatient,
        onSuccess: (data) => {
            toast({
                title: 'Registration Successful',
                description: data.message,
            });
            navigate('/login');
        },
        // ✅ SỬA LỖI Ở ĐÂY: Thêm kiểu dữ liệu cho 'error'
        onError: (error: ApiError) => {
            const message = error.message || 'An unexpected error occurred.';
            toast({
                title: 'Registration Failed',
                description: message,
                variant: 'destructive',
            });
        },
    });

    // Giữ nguyên logic logout của bạn
    const logoutAdminMutation = useMutation({
        mutationFn: authApi.logoutAdmin,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user', 'admin'] }); // Xóa đúng key
            toast({ title: "Logged Out Successfully" });
        },
    });

    const logoutPatientMutation = useMutation({
        mutationFn: authApi.logoutPatient,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user', 'patient'] }); // Xóa đúng key
            toast({ title: "Logged Out Successfully" });
        },
    });

    const logout = (role: 'Admin' | 'Patient' | 'Doctor') => {
        if (role === 'Admin') {
            logoutAdminMutation.mutate();
        } else {
            logoutPatientMutation.mutate();
        }
    };

    return {
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        logout,
        isLoggingOut: logoutAdminMutation.isPending || logoutPatientMutation.isPending,
        logoutAdmin: logoutAdminMutation.mutate,
        logoutPatient: logoutPatientMutation.mutate,
    };
};

// Giữ nguyên logic useCurrentUser của bạn
export const useCurrentUser = (role?: 'admin' | 'patient') => {
    return useQuery({
        queryKey: ['user', role],
        // ✅ SỬA LỖI Ở ĐÂY: Truyền 'role' vào hàm getUserDetails
        queryFn: () => (role ? authApi.getUserDetails(role) : Promise.resolve(null)),
        enabled: !!role,
        retry: false,
        refetchOnWindowFocus: false,
    });
};
