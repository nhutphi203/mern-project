// src/hooks/useAuth.ts - FIXED VERSION

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import type { LoginRequest, RegisterRequest, User } from '@/api/types';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/api/config';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type UserDetailsResponse = {
    user: User;
};

export type LoginCredentials = LoginRequest;

export const useAuth = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();

    // 🔧 FIX: Remove the old handleSocialAuth function

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            console.log("LOGIN SUCCESS: API data received:", data);
            queryClient.setQueryData(['currentUser'], data);

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${data.user.firstName}!`,
            });

            if (data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else if (data.user.role === 'Doctor') {
                navigate('/doctor-dashboard'); // Chuyển hướng Bác sĩ
            } else {
                navigate('/dashboard'); // Chuyển hướng Bệnh nhân
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

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            toast({
                title: 'Registration Successful',
                description: 'Please check your email to verify your account.',
            });
            navigate('/login');
        },
        onError: (error: unknown) => {
            let errorMessage = "An unexpected error occurred.";
            if (error instanceof ApiError || error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                title: 'Registration Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: (data) => {
            toast({ title: "Logout Successful", description: data.message });
            queryClient.removeQueries({ queryKey: ['currentUser'] });
            navigate('/login');
        },
        onError: (error: ApiError) => {
            toast({ title: "Logout Failed", description: error.message, variant: 'destructive' });
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

// 🔧 FIX: Updated useCurrentUser hook to not depend on localStorage
export const useCurrentUser = () => {
    return useQuery<{ user: User }, Error>({
        queryKey: ['currentUser'],
        queryFn: authApi.getUserDetails,
        retry: (failureCount, error) => {
            // Don't retry if it's an authentication error (401)
            if (error instanceof ApiError && error.status === 401) {
                return false;
            }
            return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        // 🔧 REMOVED: enabled condition based on localStorage
        // Now it will always try to fetch user details if cookie exists
    });
};