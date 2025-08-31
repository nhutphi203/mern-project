import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth'; // Hoặc đường dẫn đến file hook

/**
 * @description Component PrivateRoute để bảo vệ các route cần đăng nhập.
 * @param {object} props - Children component cần render.
 */

const PrivateRoute = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser(); // Sử dụng đúng hook

    if (isLoading) {
        return <div>Đang tải dữ liệu người dùng...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
export default PrivateRoute;