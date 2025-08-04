// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'patient';
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = '/login'
}) => {
    const { data: currentUser, isLoading, error } = useCurrentUser(requiredRole);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If there's an error or no user data, redirect to login
    if (error || !currentUser?.user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check if user has required role
    if (requiredRole) {
        const userRole = currentUser.user.role.toLowerCase();
        if (userRole !== requiredRole) {
            // Redirect admin to admin dashboard, patient to patient dashboard
            const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';
            return <Navigate to={redirectPath} replace />;
        }
    }

    // User is authenticated and has correct role, render children
    return <>{children}</>;
};

export default ProtectedRoute;