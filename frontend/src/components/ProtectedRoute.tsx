import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

// Định nghĩa kiểu dữ liệu cho props
interface ProtectedRouteProps {
    children: React.ReactNode; // Cho phép nhận các component con
    allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { data: currentUser, isLoading } = useCurrentUser();

    if (isLoading) {
        // Hiển thị màn hình loading trong khi chờ lấy thông tin người dùng
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isAuthenticated = !!currentUser?.user;
    const userRole = currentUser?.user?.role;

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển về trang login
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        // Nếu đã đăng nhập nhưng sai vai trò, chuyển về trang dashboard mặc định của họ
        if (userRole === 'Admin') return <Navigate to="/admin-dashboard" replace />;
        if (userRole === 'Doctor') return <Navigate to="/doctor-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    // Nếu mọi thứ đều ổn, hiển thị component con
    return <>{children}</>;
};

export default ProtectedRoute;
