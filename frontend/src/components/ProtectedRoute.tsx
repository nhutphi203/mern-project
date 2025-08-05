// src/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth'; // Import hook của bạn

interface ProtectedRouteProps {
    allowedRoles?: string[]; // Thêm tùy chọn để giới hạn vai trò nếu cần
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    // --- SỬA LẠI DÒNG NÀY ---
    // Lấy `data` từ hook và đổi tên nó thành `currentUserData` cho dễ hiểu
    const { data: currentUserData, isLoading, isError } = useCurrentUser();

    // TRƯỜNG HỢP 1: Đang tải dữ liệu người dùng
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div>Loading authentication...</div>
            </div>
        );
    }

    // TRƯỜNG HỢP 2: Lỗi hoặc không có user sau khi đã tải xong
    // Kiểm tra `currentUserData` và `currentUserData.user`
    if (isError || !currentUserData?.user) {
        return <Navigate to="/login" replace />;
    }

    // TRƯỜNG HỢP 3 (Nâng cao): Kiểm tra vai trò (role)
    // Lấy role từ `currentUserData.user.role`
    const userRole = currentUserData.user.role;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Có thể chuyển hướng về trang "Không có quyền" hoặc trang chủ
        return <Navigate to="/" replace />;
    }

    // TRƯỜNG HỢP 4: Tất cả đều ổn
    // Hiển thị component con (trang được bảo vệ)
    return <Outlet />;
};

export default ProtectedRoute;