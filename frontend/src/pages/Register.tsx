// src/pages/Register.tsx - Đã được cập nhật theo yêu cầu

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- CÁC COMPONENT CÓ SẴN CỦA BẠN ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCog, Stethoscope, User as PatientIcon, Mail, Lock, Phone, Calendar as CalendarIcon, UserCircle, KeyRound } from 'lucide-react';

// --- CÁC COMPONENT MỚI CẦN THÊM ---
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Component cho lựa chọn OTP
import { MessageSquareQuote } from 'lucide-react'; // Icon cho SMS
// Đảm bảo bạn đã tạo các icon này trong `src/components/icons/`
import { IconGoogle } from '@/components/icons/IconGoogle';
import { IconGithub } from '@/components/icons/IconGithub';
import { IconGmail } from '@/components/icons/IconGmail';


// --- LOGIC VÀ TYPES (GIỮ NGUYÊN) ---
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/api/types';
const backendUrl = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_BASE}`;

/**
 * Panel bên trái với hình ảnh nền và lớp phủ gradient (KHÔNG THAY ĐỔI)
 */
const BrandPanel = () => (
    <div className="hidden lg:flex relative h-full w-full items-end justify-start bg-cover bg-center p-12" style={{ backgroundImage: "url('/images/hero-hospital.jpg')" }}>
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
 * Component Form đăng ký, chứa toàn bộ logic và state của form. (ĐÃ CẬP NHẬT)
 */
const RegisterForm = ({ onSubmit, isRegistering }: { onSubmit: (payload: unknown) => void, isRegistering: boolean }) => {
    const { toast } = useToast();
    const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nic: '',
        dob: '',
        gender: '' as 'Male' | 'Female' | 'Other' | '',
        password: '',
        confirmPassword: '',
        specialization: '',
        licenseNumber: '',
        doctorDepartment: '',
        otpMethod: 'email', // <<< THÊM STATE MỚI cho phương thức OTP
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // <<< HANDLER MỚI để thay đổi phương thức OTP
    const handleOtpMethodChange = (value: 'email' | 'sms') => {
        setFormData(prev => ({ ...prev, otpMethod: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
            return;
        }
        if (!formData.gender) {
            toast({ title: "Validation Error", description: "Please select a gender.", variant: "destructive" });
            return;
        }
        // <<< THÊM KIỂM TRA SĐT KHI CHỌN SMS
        if (formData.otpMethod === 'sms' && (!formData.phone || formData.phone.length < 9)) {
            toast({ title: "Validation Error", description: "A valid phone number is required for SMS verification.", variant: "destructive" });
            return;
        }

        const { confirmPassword, ...payload } = { ...formData, role };
        onSubmit(payload);
    };

    const handleSocialLogin = (provider: 'google' | 'github' | 'gmail') => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/${provider}`;
    };

    return (
        <Card className="w-full max-w-4xl mx-auto border-0 shadow-none lg:border lg:shadow-2xl lg:rounded-2xl">
            <CardHeader className="text-center pt-8 pb-4">
                <CardTitle className="text-2xl lg:text-3xl">Create Your Account</CardTitle>
                <CardDescription>Begin your journey with MediFlow today.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">

                {/* ================================================================= */}
                {/* ============= PHẦN MỚI: ĐĂNG KÝ BẰNG MẠNG XÃ HỘI ============= */}
                {/* ================================================================= */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="h-11" onClick={() => handleSocialLogin('google')}><IconGoogle className="mr-2 h-5 w-5" /> Google</Button>
                    <Button variant="outline" className="h-11" onClick={() => handleSocialLogin('github')}><IconGithub className="mr-2 h-5 w-5" /> GitHub</Button>
                    <Button variant="outline" className="h-11" onClick={() => handleSocialLogin('gmail')}><IconGmail className="mr-2 h-5 w-5" /> Gmail</Button>
                </div>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with email</span></div>
                </div>
                {/* ================================================================= */}
                {/* ======================= KẾT THÚC PHẦN MỚI ======================= */}
                {/* ================================================================= */}


                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* --- CÁC TRƯỜNG INPUT HIỆN CÓ CỦA BẠN (KHÔNG THAY ĐỔI) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {/* Left Column */}
                        <div className="space-y-3">
                            <div className="space-y-1"><Label>Registering as</Label><Select value={role} onValueChange={(value: 'Patient' | 'Doctor' | 'Admin') => setRole(value)}><SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Patient"><div className="flex items-center"><PatientIcon className="h-4 w-4 mr-2" />Patient</div></SelectItem><SelectItem value="Doctor"><div className="flex items-center"><Stethoscope className="h-4 w-4 mr-2" />Doctor</div></SelectItem><SelectItem value="Admin"><div className="flex items-center"><UserCog className="h-4 w-4 mr-2" />Admin</div></SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label htmlFor="firstName">First Name</Label><div className="relative"><UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., Nguyễn" id="firstName" name="firstName" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="lastName">Last Name</Label><div className="relative"><UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., Văn A" id="lastName" name="lastName" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="you@example.com" id="email" name="email" type="email" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input id="password" name="password" placeholder="At least 8 characters" type="password" onChange={handleInputChange} required minLength={8} className="h-11 pl-10 text-base" /></div></div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-3">
                            <div className="space-y-1"><Label htmlFor="phone">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., 0912345678" id="phone" name="phone" type="tel" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="nic">National ID</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., 123456789012" id="nic" name="nic" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="dob">Date of Birth</Label><div className="relative"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="yyyy-mm-dd" id="dob" name="dob" type="date" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label>Gender</Label><Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)}><SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label htmlFor="confirmPassword">Confirm Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input id="confirmPassword" placeholder="Re-enter your password" name="confirmPassword" type="password" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                        </div>
                    </div>

                    {/* --- THÔNG TIN BÁC SĨ (KHÔNG THAY ĐỔI) --- */}
                    {role === 'Doctor' && (
                        <div className="space-y-3 border-t pt-4 mt-4">
                            <h3 className="text-md font-semibold text-gray-700">Doctor Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                <div className="space-y-1 md:col-span-2"><Label>Department</Label><Input name="doctorDepartment" onChange={handleInputChange} required placeholder="e.g., Cardiology" className="h-11 text-base" /></div>
                                <div className="space-y-1"><Label>Specialization</Label><Input name="specialization" onChange={handleInputChange} required placeholder="e.g., Cardiologist" className="h-11 text-base" /></div>
                                <div className="space-y-1"><Label>License Number</Label><Input name="licenseNumber" onChange={handleInputChange} required className="h-11 text-base" /></div>
                            </div>
                        </div>
                    )}

                    {/* ================================================================= */}
                    {/* ============ PHẦN MỚI: CHỌN PHƯƠNG THỨC XÁC THỰC ============ */}
                    {/* ================================================================= */}
                    <div className="space-y-2 border-t pt-4">
                        <Label>Send Verification Code via</Label>
                        <RadioGroup defaultValue="email" name="otpMethod" onValueChange={handleOtpMethodChange} className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="email" id="otp-email" />
                                <Label htmlFor="otp-email" className="font-normal flex items-center gap-2 cursor-pointer"><Mail className="h-4 w-4" /> Email</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sms" id="otp-sms" disabled={!formData.phone} />
                                <Label htmlFor="otp-sms" className={`font-normal flex items-center gap-2 ${!formData.phone ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}`}><MessageSquareQuote className="h-4 w-4" /> SMS</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {/* ================================================================= */}
                    {/* ======================= KẾT THÚC PHẦN MỚI ======================= */}
                    {/* ================================================================= */}


                    <Button type="submit" className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-lg transition-all" disabled={isRegistering}>
                        {isRegistering ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</> : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="pt-4 pb-6">
                <p className="text-center text-sm text-muted-foreground w-full">
                    Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login here</Link>
                </p>
            </CardFooter>
        </Card>
    );
};

// Component Register chính (KHÔNG THAY ĐỔI)
const Register = () => {
    const { register, isRegistering } = useAuth();
    const handleRegister = (payload: RegisterRequest) => {
        register(payload);
    };

    return (
        <>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }`}
            </style>
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                <BrandPanel />
                <div className="flex items-center justify-center p-4 lg:p-6">
                    <RegisterForm onSubmit={handleRegister} isRegistering={isRegistering} />
                </div>
            </div>
        </>
    );
};

export default Register;