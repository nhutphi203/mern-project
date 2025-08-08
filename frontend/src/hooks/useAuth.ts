// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import type { LoginRequest, RegisterRequest, User } from '@/api/types';
// import { toast } from '@/hooks/use-toast'; // Xóa dòng import trùng lặp
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/api/config';
import { useNavigate } from 'react-router-dom';
type UserDetailsResponse = {
    user: User;
};
export type LoginCredentials = LoginRequest; // <--- THÊM DÒNG NÀY
export const useAuth = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSocialAuth = async (token: string) => {
        // 1. Lưu token nhận được từ URL vào localStorage
        localStorage.setItem('authToken', token);

        // 2. Vô hiệu hóa cache cũ và yêu cầu React Query fetch lại dữ liệu user
        // Interceptor của axios sẽ tự động đính kèm token mới vào request này.
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

        // 3. Điều hướng người dùng đến trang chính
        navigate('/dashboard');
        toast({ title: "Login Successful", description: "Welcome to MediFlow!" });
    };

    const loginMutation = useMutation({
        mutationFn: authApi.login,

        // --- SỬA LẠI HOÀN TOÀN HÀM ONSUCCESS ---
        onSuccess: (data) => {
            console.log("LOGIN SUCCESS: API data received:", data);

            // Cập nhật cache cho ĐÚNG key là ['currentUser']
            // mà hook useCurrentUser đang sử dụng.
            queryClient.setQueryData(['currentUser'], data);

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${data.user.firstName}!`,
            });

            // Tự động điều hướng sau khi đăng nhập thành công
            if (data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        },
        onError: (error: ApiError) => {
            console.error("LOGIN FAILED: API error:", error);
            toast({
                title: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        },
    });

    // Giữ nguyên logic registerMutation của bạn
    const registerMutation = useMutation({
        mutationFn: authApi.register, // Đã sửa thành hàm register chung
        onSuccess: (data) => {
            toast({
                title: 'Registration Successful',
            });
            navigate('/login');
        },
        // --- SỬA LẠI HÀM ONERROR TẠI ĐÂY ---
        onError: (error: unknown) => { // 1. Nhận error với kiểu `unknown`
            let errorMessage = "An unexpected error occurred.";

            // 2. Kiểm tra xem error có phải là ApiError hoặc Error không
            if (error instanceof ApiError || error instanceof Error) {
                errorMessage = error.message;
            }

            // 3. Hiển thị thông báo lỗi đã được xử lý an toàn
            toast({
                title: 'Registration Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authApi.logout, // Gọi đến hàm logout duy nhất
        onSuccess: (data) => {
            toast({ title: "Logout Successful", description: data.message });
            // Xóa cache của user
            queryClient.removeQueries({ queryKey: ['currentUser'] });
            // Điều hướng về trang login
            navigate('/login');
        },
        onError: (error: ApiError) => {
            // Xử lý khi logout lỗi (ví dụ: token đã hết hạn)
            toast({ title: "Logout Failed", description: error.message, variant: 'destructive' });
            // Vẫn xóa cache và điều hướng về login để đảm bảo an toàn
            queryClient.removeQueries({ queryKey: ['currentUser'] });
            navigate('/login');
        },
    });
    return {
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        logoutMutation: logoutMutation.mutate,
        isLogouting: logoutMutation.isPending,
        loginMutation: loginMutation,
        isLoginMutation: loginMutation.isPending,
        handleSocialAuth,

    };
};
export const useCurrentUser = () => {
    return useQuery<{ user: User }, Error>({
        queryKey: ['currentUser'], // Chỉ cần 1 key duy nhất
        queryFn: authApi.getUserDetails, // Gọi hàm không cần tham số
        retry: false,
        refetchOnWindowFocus: false,
        enabled: !!localStorage.getItem('authToken'), // Chỉ chạy query này nếu có token

    });
};