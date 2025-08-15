import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

interface RoleGuardProps {
    allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
    const { data: currentUser, isLoading } = useCurrentUser();

    if (isLoading) {
        return <div>Loading user information...</div>; // Or a spinner
    }

    const userRole = currentUser?.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to a generic dashboard or an unauthorized page
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;