// src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { LoginRequest } from '@/api/types';
import { toast } from '@/hooks/use-toast';

const Login = () => {
    // Gọi hook useAuth
    const { login, isLoggingIn } = useAuth();

    // Các state khác của component
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('patient');
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: '',
        role: 'Patient',
    });

    // Bỏ qua hoàn toàn việc kiểm tra trạng thái user để tránh lỗi.
    // Logic này sẽ được xử lý khi người dùng bấm đăng nhập thành công.
    // Khi đó, hàm onSuccess của useMutation sẽ chuyển hướng.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        console.log('Logging in with data:', formData);

        login(formData);
    };

    const handleInputChange = (field: keyof LoginRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setFormData(prev => ({
            ...prev,
            role: value === 'admin' ? 'Admin' : 'Patient'
        }));
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
            // Sử dụng ảnh nền chuyên nghiệp từ Unsplash
            style={{ backgroundImage: "url('/images/hero-hospital.jpg')" }}

        >
            <Card className="backdrop-blur-sm w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access your MediFlow account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="patient">Patient Login</TabsTrigger>
                            <TabsTrigger value="admin">Staff Login</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline">
                            Register here
                        </Link>
                    </div>

                    {activeTab === 'patient' && (
                        <div className="text-center text-sm text-muted-foreground">
                            Need emergency care?{' '}
                            <Link to="/emergency" className="text-destructive hover:underline">
                                Emergency Services
                            </Link>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
