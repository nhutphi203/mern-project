// src/pages/Register.tsx - Redesigned by Gemini UI Expert

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- SHADCN/UI & LUCIDE ICONS ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCog, Stethoscope, User as PatientIcon, Mail, Lock, Phone, Calendar as CalendarIcon, UserCircle, KeyRound } from 'lucide-react';

// --- AUTH LOGIC & TYPES (KHÔNG THAY ĐỔI) ---
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/api/types';

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
 * Component Form đăng ký, chứa toàn bộ logic và state của form.
 */
const RegisterForm = ({ onSubmit, isRegistering }: { onSubmit: (payload: unknown) => void, isRegistering: boolean }) => {
    // --- STATE & LOGIC CỦA FORM (GIỮ NGUYÊN) ---
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
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [name]: value }));
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
        const { confirmPassword, ...payload } = { ...formData, role };
        onSubmit(payload);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto border-0 shadow-none lg:border lg:shadow-2xl lg:rounded-2xl">
            <CardHeader className="text-center pt-4 pb-2">
                <CardTitle className="text-2xl lg:text-3xl">Create Your Account</CardTitle>
                <CardDescription>Begin your journey with MediFlow today.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                        {/* Left Column */}
                        <div className="space-y-2.5">
                            <div className="space-y-1"><Label>Registering as</Label><Select value={role} onValueChange={(value: 'Patient' | 'Doctor' | 'Admin') => setRole(value)}><SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Patient"><div className="flex items-center"><PatientIcon className="h-4 w-4 mr-2" />Patient</div></SelectItem><SelectItem value="Doctor"><div className="flex items-center"><Stethoscope className="h-4 w-4 mr-2" />Doctor</div></SelectItem><SelectItem value="Admin"><div className="flex items-center"><UserCog className="h-4 w-4 mr-2" />Admin</div></SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label htmlFor="firstName">First Name</Label><div className="relative"><UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., Nguyễn" id="firstName" name="firstName" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="lastName">Last Name</Label><div className="relative"><UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., Văn A" id="lastName" name="lastName" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="you@example.com" id="email" name="email" type="email" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input id="password" name="password" placeholder="At least 8 characters" type="password" onChange={handleInputChange} required minLength={8} className="h-11 pl-10 text-base" /></div></div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2.5">
                            <div className="space-y-1"><Label htmlFor="phone">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., 0912345678" id="phone" name="phone" type="tel" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="nic">National ID</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., 123456789012" id="nic" name="nic" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label htmlFor="dob">Date of Birth</Label><div className="relative"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="yyyy-mm-dd" id="dob" name="dob" type="date" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                            <div className="space-y-1"><Label>Gender</Label><Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)}><SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label htmlFor="confirmPassword">Confirm Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input id="confirmPassword" placeholder="Re-enter your password" name="confirmPassword" type="password" onChange={handleInputChange} required className="h-11 pl-10 text-base" /></div></div>
                        </div>
                    </div>

                    {role === 'Doctor' && (
                        <div className="space-y-2.5 border-t pt-3 mt-3">
                            <h3 className="text-md font-semibold text-gray-700">Doctor Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                                <div className="space-y-1 md:col-span-2"><Label>Department</Label><Input name="doctorDepartment" onChange={handleInputChange} required placeholder="e.g., Cardiology" className="h-11 text-base" /></div>
                                <div className="space-y-1"><Label>Specialization</Label><Input name="specialization" onChange={handleInputChange} required placeholder="e.g., Cardiologist" className="h-11 text-base" /></div>
                                <div className="space-y-1"><Label>License Number</Label><Input name="licenseNumber" onChange={handleInputChange} required className="h-11 text-base" /></div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-lg transition-all" disabled={isRegistering}>
                        {isRegistering ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</> : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="pt-3 pb-4">
                <p className="text-center text-sm text-muted-foreground w-full">
                    Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login here</Link>
                </p>
            </CardFooter>
        </Card>
    );
};

const Register = () => {
    // --- LOGIC GỐC (GIỮ NGUYÊN) ---
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
                {/* Panel bên trái */}
                <BrandPanel />

                {/* Panel bên phải */}
                <div className="flex items-center justify-center p-4 lg:p-6">
                    <RegisterForm onSubmit={handleRegister} isRegistering={isRegistering} />
                </div>
            </div>
        </>
    );
};

export default Register;
