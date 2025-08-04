
// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Mail, Phone, CreditCard, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/api/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Lock } from "lucide-react"; // hoặc 'react-icons/fi'
const Register = () => {
    const { register, isRegistering } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();

    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        gender: 'Male',
        dob: '',
        nic: '',
        role: 'Patient',
    });

    // Check if user is already logged in
    const { data: currentUser } = useCurrentUser('patient');

    if (currentUser?.user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            toast({
                title: "Date Required",
                description: "Please select your date of birth.",
                variant: "destructive",
            });
            return;
        }

        const dataToSubmit = {
            ...formData,
            dob: selectedDate.toISOString(),
        };
        console.log('Registering with data:', dataToSubmit);

        register(dataToSubmit);
    };

    const handleInputChange = (field: keyof RegisterRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/30 p-4">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Join MediFlow and start managing your healthcare journey
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="Enter 10-digit phone number"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="pl-10"
                                        required
                                        maxLength={10}
                                        minLength={10}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nic">National ID Number</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="nic"
                                        placeholder="Enter 12-digit ID number"
                                        value={formData.nic}
                                        onChange={(e) => handleInputChange('nic', e.target.value)}
                                        className="pl-10"
                                        required
                                        maxLength={12}
                                        minLength={12}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => handleInputChange('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password (min 8 characters)"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                    minLength={8}
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

                        <Button type="submit" className="w-full" disabled={isRegistering}>
                            {isRegistering ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in here
                        </Link>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;