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
export const useAuth = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();



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
    };
};
export const useCurrentUser = () => {
    return useQuery<{ user: User }, Error>({
        queryKey: ['currentUser'], // Chỉ cần 1 key duy nhất
        queryFn: authApi.getUserDetails, // Gọi hàm không cần tham số
        retry: false,
        refetchOnWindowFocus: false,
    });
};