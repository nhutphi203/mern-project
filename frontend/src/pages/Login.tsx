// src/pages/Login.tsx - Redesigned by Gemini UI Expert

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- SHADCN/UI & LUCIDE ICONS ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Lock, UserCog, Stethoscope, User as PatientIcon } from 'lucide-react';

// --- CÁC ICON MẠNG XÃ HỘI MỚI (bạn sẽ tạo các file này ở bước sau) ---
import { IconGoogle } from '@/components/icons/IconGoogle';
import { IconGithub } from '@/components/icons/IconGithub';
import { IconGmail } from '@/components/icons/IconGmail';
// --- AUTH LOGIC & TYPES (KHÔNG THAY ĐỔI) ---
import { useAuth, LoginCredentials } from '@/hooks/useAuth';

/**
 * Panel bên trái với hình ảnh nền và lớp phủ gradient
 */
const BrandPanel = () => (
    <div className="hidden lg:flex relative h-full w-full items-end justify-start bg-cover bg-center p-12" style={{ backgroundImage: "url('/images/hero-hospital.jpg')" }}>
        {/* Lớp phủ gradient để làm nổi bật text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                    <Stethoscope className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    MediFlow
                </h1>
            </div>
            <p className="max-w-md text-lg text-white/80">
                Your Health, Our Priority. The future of healthcare management is here.
            </p>
        </div>
    </div>
);

/**
 * Component Form đăng nhập được thiết kế lại
 */
const LoginForm = ({ onSubmit, isLoggingIn }: { onSubmit: (credentials: LoginCredentials) => void; isLoggingIn: boolean; }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
    const [showPassword, setShowPassword] = useState(false);
    const backendUrl = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_BASE}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password, role });
    };

    return (
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-2xl lg:rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
                <CardDescription>Sign in to continue to your MediFlow dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 pl-10 text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 pl-10 text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Sign in as</Label>
                        <Select value={role} onValueChange={(value: 'Patient' | 'Doctor' | 'Admin') => setRole(value)}>
                            <SelectTrigger id="role" className="h-12 text-base">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Patient"><div className="flex items-center"><PatientIcon className="h-4 w-4 mr-2" />Patient</div></SelectItem>
                                <SelectItem value="Doctor"><div className="flex items-center"><Stethoscope className="h-4 w-4 mr-2" />Doctor</div></SelectItem>
                                <SelectItem value="Admin"><div className="flex items-center"><UserCog className="h-4 w-4 mr-2" />Admin</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" tabIndex={-1} className="text-sm text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <Button type="submit" className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-lg transition-all" disabled={isLoggingIn}>
                        {isLoggingIn ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...</> : 'Sign In'}
                    </Button>
                </form>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const googleLoginUrl = 'http://localhost:4000/api/v1/users/auth/google';
                            console.log('Đang chuyển hướng đến:', googleLoginUrl);
                            window.location.href = googleLoginUrl;
                        }}
                    >
                        <IconGoogle className="mr-2 h-5 w-5" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1/users/auth/github`}>
                        <IconGithub className="mr-2 h-5 w-5" /> GitHub
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1/users/auth/gmail`}>
                        <IconGmail className="mr-2 h-5 w-5" /> Gmail
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-center text-sm text-muted-foreground w-full">
                    Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Register Now</Link>
                </p>
            </CardFooter>
        </Card>
    );
};

const Login = () => {
    // --- LOGIC GỐC (GIỮ NGUYÊN) ---
    const { login, isLoggingIn } = useAuth();
    const handleLogin = (credentials: LoginCredentials) => {
        login(credentials);
    };

    return (
        <>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }`}
            </style>
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                {/* Panel bên trái */}
                <BrandPanel />

                {/* Panel bên phải */}
                <div className="flex items-center justify-center p-6 lg:p-12">
                    <LoginForm onSubmit={handleLogin} isLoggingIn={isLoggingIn} />
                </div>
            </div>
        </>
    );
};

export default Login;
