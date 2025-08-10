// frontend/src/hooks/useSocialAuth.ts - NEW FILE
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useSocialAuth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const authStatus = searchParams.get('auth');
        const error = searchParams.get('error');

        if (authStatus === 'success') {
            // Social login thành công
            toast({
                title: "Login Successful",
                description: "Welcome to MediFlow!",
            });

            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Clean URL
            navigate(window.location.pathname, { replace: true });
        } else if (error) {
            // Xử lý các loại lỗi khác nhau
            let errorMessage = "An error occurred during social login.";

            switch (error) {
                case 'google_auth_failed':
                    errorMessage = "Google authentication failed. Please try again.";
                    break;
                case 'facebook_auth_failed':
                    errorMessage = "Facebook authentication failed. Please try again.";
                    break;
                case 'github_auth_failed':
                    errorMessage = "GitHub authentication failed. Please try again.";
                    break;
                case 'no_user_data':
                    errorMessage = "Failed to retrieve user data. Please try again.";
                    break;
                case 'callback_error':
                    errorMessage = "Authentication callback error. Please try again.";
                    break;
            }

            toast({
                title: "Authentication Failed",
                description: errorMessage,
                variant: "destructive",
            });

            // Clean URL and redirect to login
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, toast, queryClient]);
};