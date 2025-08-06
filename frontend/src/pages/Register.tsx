// src/pages/Register.tsx - Redesigned by Gemini UI Expert

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- SHADCN/UI & LUCIDE ICONS ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCog, Stethoscope, User as PatientIcon } from 'lucide-react';

// --- AUTH LOGIC & TYPES (KHÔNG THAY ĐỔI) ---
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/api/types';

/**
 * Component cho panel bên trái, chứa thông tin thương hiệu.
 * Sẽ được ẩn trên màn hình di động.
 */
const BrandPanel = () => (
    <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 text-center">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-md mb-6">
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
        gender: '' as 'Male' | 'Female' | 'Other' | '', // Khởi tạo rỗng để placeholder hiển thị
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

        // Validation logic (giữ nguyên)
        if (formData.password !== formData.confirmPassword) {
            toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
            return;
        }
        if (!formData.gender) {
            toast({ title: "Validation Error", description: "Please select a gender.", variant: "destructive" });
            return;
        }

        // Tạo payload, loại bỏ confirmPassword
        const { confirmPassword, ...payload } = { ...formData, role };
        onSubmit(payload);
    };

    return (
        <Card className="w-full  max-w-4xl ml-auto border-0 shadow-none lg:border lg:shadow-xl rounded-2xl">
            <CardHeader className="text-center pt-4 pb-2">
                <CardTitle className="text-2xl lg:text-3xl">Create Account</CardTitle>
                <CardDescription>Join our network of care today.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Main 2-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {/* Left Column */}
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="role">Registering as</Label>
                                <Select value={role} onValueChange={(value: 'Patient' | 'Doctor' | 'Admin') => setRole(value)}>
                                    <SelectTrigger id="role" className="transition-all focus:ring-2 focus:ring-blue-400"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Patient"><div className="flex items-center"><PatientIcon className="h-4 w-4 mr-2" />Patient</div></SelectItem>
                                        <SelectItem value="Doctor"><div className="flex items-center"><Stethoscope className="h-4 w-4 mr-2" />Doctor</div></SelectItem>
                                        <SelectItem value="Admin"><div className="flex items-center"><UserCog className="h-4 w-4 mr-2" />Admin</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" onChange={handleInputChange} required minLength={8} className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                            <div className="space-y-1"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1"><Label htmlFor="nic">National ID</Label><Input id="nic" name="nic" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" name="dob" type="date" onChange={handleInputChange} required className="block w-full transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            <div className="space-y-1">
                                <Label htmlFor="gender">Gender</Label>
                                <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)}>
                                    <SelectTrigger id="gender" className="transition-all focus:ring-2 focus:ring-blue-400"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                        </div>
                    </div>

                    {/* Doctor Specific Fields */}
                    {role === 'Doctor' && (
                        <div className="space-y-2 border-t pt-3 mt-3">
                            <h3 className="text-md font-semibold text-gray-700 text-center md:text-left">Doctor Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <div className="space-y-1 md:col-span-2"><Label htmlFor="doctorDepartment">Department</Label><Input id="doctorDepartment" name="doctorDepartment" onChange={handleInputChange} required placeholder="e.g., Cardiology" className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                                <div className="space-y-1"><Label htmlFor="specialization">Specialization</Label><Input id="specialization" name="specialization" onChange={handleInputChange} required placeholder="e.g., Cardiologist" className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                                <div className="space-y-1"><Label htmlFor="licenseNumber">License Number</Label><Input id="licenseNumber" name="licenseNumber" onChange={handleInputChange} required className="transition-all focus:ring-2 focus:ring-blue-400" /></div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-lg" disabled={isRegistering}>
                        {isRegistering ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</> : 'Create Account'}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground pt-1">
                        Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login here.</Link>
                    </p>
                </form>
            </CardContent>
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
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-5">
                {/* Panel bên trái */}
                <BrandPanel />

                {/* Panel bên phải - Chứa form đăng ký */}
                <div className="flex items-center justify-center lg:col-span-3 px-4 py-6 lg:py-8">
                    <RegisterForm onSubmit={handleRegister} isRegistering={isRegistering} />
                </div>
            </div>
        </>
    );
};

export default Register;
