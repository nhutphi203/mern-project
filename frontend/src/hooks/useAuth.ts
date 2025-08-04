// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import type { LoginRequest, RegisterRequest, User } from '@/api/types';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/api/config'; // 1. Import ApiError vào đây
import { useNavigate } from 'react-router-dom'; // 2. Import useNavigate    
export const useAuth = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate(); // 2. Khởi tạo navigate


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

            queryClient.setQueryData(['user', data.user.role], data.user);
            toast({
                title: 'Login Successful',
                description: `Welcome back, ${data.user.firstName}!`,
            });

            console.log("LOGIN SUCCESS: Chuẩn bị chuyển trang...");

            if (data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
            console.log("LOGIN SUCCESS: Đã gọi lệnh chuyển trang.");
        },

        // 3. Log khi mutation thất bại
        onError: (error) => {
            console.error("LOGIN FAILED: API trả về lỗi:", error);

            const message = error instanceof ApiError ? error.message : 'An unexpected error occurred.';
            toast({
                title: 'Login Failed',
                description: message,
                variant: 'destructive',
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: authApi.registerPatient,
        onSuccess: (data) => {
            // Hiển thị thông báo đăng ký thành công
            toast({
                title: 'Registration Successful',
                description: data.message, // Lấy thông báo từ backend
            });
            // Chuyển người dùng đến trang đăng nhập
            navigate('/login');
        },
        onError: (error) => {
            // Xử lý lỗi nếu có
            const message = error instanceof ApiError ? error.message : 'An unexpected error occurred.';
            toast({
                title: 'Registration Failed',
                description: message,
                variant: 'destructive',
            });
        },
    });

    const logoutAdminMutation = useMutation({
        mutationFn: authApi.logoutAdmin,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user'] });
            toast({ title: "Logged Out Successfully" });
        },
    });

    const logoutPatientMutation = useMutation({
        mutationFn: authApi.logoutPatient,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user'] });
            toast({ title: "Logged Out Successfully" });
        },
    });

    // === BẮT ĐẦU SỬA: Sửa lại hàm logout ===
    const logout = (role: 'Admin' | 'Patient' | 'Doctor') => {
        if (role === 'Admin') {
            logoutAdminMutation.mutate();
        } else {
            // Coi Patient và Doctor có cùng luồng đăng xuất
            logoutPatientMutation.mutate();
        }
    };
    // === KẾT THÚC SỬA ===
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

// Get current user hook
export const useCurrentUser = (role?: 'admin' | 'patient') => {
    return useQuery({
        queryKey: ['user', role],
        queryFn: () => role ? authApi.getUserDetails(role) : null,
        enabled: !!role,
        retry: false, // Tắt tính năng tự động thử lại khi có lỗi
        refetchOnWindowFocus: false, // Tắt tính năng gọi lại API khi focus vào cửa sổ
    });
};