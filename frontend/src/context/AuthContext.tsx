import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest } from '../api/types';
import { authApi } from '../api/auth';
import { toast } from '../hooks/use-toast';

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Kiểm tra token và user khi khởi động ứng dụng
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const response = await authApi.login(data);
            if (response.user && response.token) {
                setUser(response.user);
                setToken(response.token);
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                toast({
                    title: "Đăng nhập thành công!",
                    description: `Chào mừng trở lại, ${response.user.firstName}.`,
                });
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Vui lòng thử lại.";
            toast({
                title: "Đăng nhập thất bại",
                description: message,
                variant: "destructive",
            });
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast({
            title: "Đăng xuất thành công",
            description: "Bạn đã đăng xuất khỏi hệ thống."
        });
    };

    const value = { user, token, login, logout, isLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng ngữ cảnh xác thực
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
