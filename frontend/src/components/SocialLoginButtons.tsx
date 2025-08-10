import React from 'react';
import { Button } from '@/components/ui/button';
import { IconGoogle, IconGithub, IconFacebook } from '@/components/icons';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonsProps {
    isLoading?: boolean;
    disabled?: boolean;
    providers?: ('google' | 'github' | 'facebook')[];
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
    isLoading = false,
    disabled = false,
    providers = ['google', 'github', 'facebook']
}) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const handleSocialLogin = (provider: string) => {
        if (isLoading || disabled) return;
        window.location.href = `${baseUrl}/api/v1/users/auth/${provider}`;
    };

    const providerConfig = {
        google: {
            icon: IconGoogle,
            label: 'Google',
            color: 'bg-red-500 hover:bg-red-600'
        },
        github: {
            icon: IconGithub,
            label: 'GitHub',
            color: 'bg-gray-800 hover:bg-gray-900'
        },
        facebook: {
            icon: IconFacebook,
            label: 'Facebook',
            color: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providers.map((provider) => {
                const config = providerConfig[provider];
                const Icon = config.icon;

                return (
                    <Button
                        key={provider}
                        variant="outline"
                        onClick={() => handleSocialLogin(provider)}
                        disabled={isLoading || disabled}
                        className="h-11"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Icon className="mr-2 h-4 w-4" />
                        )}
                        {config.label}
                    </Button>
                );
            })}
        </div>
    );
};
