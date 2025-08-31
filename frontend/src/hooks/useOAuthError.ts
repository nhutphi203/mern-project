
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useOAuthError = () => {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const error = searchParams.get('error');
        const provider = searchParams.get('provider');

        if (error) {
            let title = "Authentication Failed";
            let description = "An error occurred during social login.";

            switch (error) {
                case 'email_exists':
                    title = "Account Already Exists";
                    description = `An account with this email already exists. Please try logging in with your password or use a different ${provider} account.`;
                    break;
                case 'no_email':
                    title = "Email Required";
                    description = `${provider} didn't provide an email address. Please ensure your ${provider} account has a public email.`;
                    break;
                case 'access_denied':
                    title = "Access Denied";
                    description = `You denied access to your ${provider} account. Please try again and grant the necessary permissions.`;
                    break;
                case 'oauth_error':
                    title = "OAuth Error";
                    description = `There was an issue with ${provider} authentication. Please try again.`;
                    break;
            }

            toast({
                title,
                description,
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);
};