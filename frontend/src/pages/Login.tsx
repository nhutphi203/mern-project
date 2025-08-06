// src/pages/Login.tsx - Redesigned and Optimized by Gemini UI Expert

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- SHADCN/UI & LUCIDE ICONS ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserCog, Stethoscope, User as PatientIcon } from 'lucide-react';

// --- AUTH LOGIC & TYPES ---
// Import type `LoginCredentials` đã được export từ useAuth.ts
import { useAuth, LoginCredentials } from '@/hooks/useAuth';

/**
 * Component cho panel bên trái, chứa thông tin thương hiệu.
 */
const BrandPanel = () => (
    <div style={{ backgroundImage: "url('/images/hero-hospital.jpg')" }} className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 text-center">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-md mb-6" >
            <Stethoscope className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            MediFlow
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
            Your Health, Our Priority.
        </p>
    </div>
);

// Định nghĩa kiểu cho props của LoginForm
interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => void;
    isLoggingIn: boolean;
}

/**
 * Component Form đăng nhập.
 */
const LoginForm = ({ onSubmit, isLoggingIn }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password, role });
    };

    return (
        <div className="ml-auto mr-10 grid w-full max-w-sm gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Sign In</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your credentials to access your dashboard
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-blue-400"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>

                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-blue-400"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Sign in as</Label>
                    <Select value={role} onValueChange={(value: 'Patient' | 'Doctor' | 'Admin') => setRole(value)}>
                        <SelectTrigger id="role" className="h-11">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Patient"><div className="flex items-center"><PatientIcon className="h-4 w-4 mr-2" />Patient</div></SelectItem>
                            <SelectItem value="Doctor"><div className="flex items-center"><Stethoscope className="h-4 w-4 mr-2" />Doctor</div></SelectItem>
                            <SelectItem value="Admin"><div className="flex items-center"><UserCog className="h-4 w-4 mr-2" />Admin</div></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center">
                    <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <Button type="submit" className="w-full h-11 text-base transition-all hover:shadow-lg hover:bg-blue-700" disabled={isLoggingIn}>
                    {isLoggingIn ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...</> : 'Sign In'}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline font-semibold">
                    Register Now
                </Link>
            </div>
        </div>
    );
};


const Login = () => {
    // --- LOGIC GỐC ---
    // Lấy hàm login và trạng thái isLoggingIn từ hook
    const { login, isLoggingIn } = useAuth();

    // --- TỐI ƯU HÀM XỬ LÝ ---
    // Hàm handleLogin giờ chỉ cần gọi `login(credentials)`.
    // Mọi logic về toast và điều hướng đã được xử lý bên trong useAuth.
    const handleLogin = (credentials: LoginCredentials) => {
        login(credentials);
    };
    // --- KẾT THÚC LOGIC ---

    return (
        <>
            {/* Import font Inter */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }`}
            </style>
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-5">
                {/* Panel bên trái */}
                <BrandPanel />

                {/* Panel bên phải */}
                <div className="flex items-center justify-center py-12 lg:col-span-3">
                    <LoginForm onSubmit={handleLogin} isLoggingIn={isLoggingIn} />
                </div>
            </div>
        </>
    );
};

export default Login;
