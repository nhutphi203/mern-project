// src/pages/BookAppointment.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Clock, MapPin, User, Phone, Mail, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrentUser } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import type { AppointmentRequest } from '@/api/types';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from '@/hooks/use-toast';
const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Ophthalmology',
    'General Medicine',
    'Emergency Medicine',
    'Dermatology',
    'Psychiatry',
    'Radiology'
];

const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const BookAppointment = () => {
    const { data: currentUser } = useCurrentUser('patient');
    const { createAppointment, isCreating } = useAppointments();
    const { doctors } = useDoctors();

    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<{ firstName: string; lastName: string }>({ firstName: '', lastName: '' });

    const [formData, setFormData] = useState<Omit<AppointmentRequest, 'appointment_data' | 'doctor_firstName' | 'doctor_lastName'>>({
        firstName: currentUser?.user?.firstName || '',
        lastName: currentUser?.user?.lastName || '',
        email: currentUser?.user?.email || '',
        phone: currentUser?.user?.phone || '',
        nic: currentUser?.user?.nic || '',
        dob: currentUser?.user?.dob || '',
        gender: currentUser?.user?.gender || 'Male',
        department: '',
        hasVisited: false,
        address: '',
    });

    // Filter doctors by selected department
    const departmentDoctors = doctors?.filter(doctor =>
        doctor.doctorDepartment === selectedDepartment
    ) || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            toast({
                title: "Date and Time Required",
                description: "Please select both date and time for your appointment.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedDoctor.firstName || !selectedDoctor.lastName) {
            toast({
                title: "Doctor Selection Required",
                description: "Please select a doctor for your appointment.",
                variant: "destructive",
            });
            return;
        }

        const appointmentDateTime = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`;

        const appointmentData: AppointmentRequest = {
            ...formData,
            department: selectedDepartment,
            appointment_data: appointmentDateTime,
            doctor_firstName: selectedDoctor.firstName,
            doctor_lastName: selectedDoctor.lastName,
        };

        createAppointment(appointmentData);
    };

    const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDoctorSelect = (doctorId: string) => {
        const doctor = departmentDoctors.find(d => d._id === doctorId);
        if (doctor) {
            setSelectedDoctor({
                firstName: doctor.firstName,
                lastName: doctor.lastName
            });
        }
    };

    if (!currentUser?.user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-20 pb-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Book an Appointment
                            </h1>
                            <p className="text-muted-foreground">
                                Schedule your visit with our expert medical team
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
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
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    required
                                                    minLength={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
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
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="pl-10"
                                                    required
                                                    maxLength={10}
                                                    minLength={10}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nic">National ID Number</Label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="nic"
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
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    id="address"
                                                    placeholder="Enter your full address"
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasVisited"
                                                checked={formData.hasVisited}
                                                onCheckedChange={(checked) => handleInputChange('hasVisited', checked as boolean)}
                                            />
                                            <Label htmlFor="hasVisited" className="text-sm">
                                                I have visited this hospital before
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Appointment Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Department Selection */}
                                        <div className="space-y-2">
                                            <Label>Department</Label>
                                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept} value={dept}>
                                                            {dept}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Doctor Selection */}
                                        {selectedDepartment && (
                                            <div className="space-y-2">
                                                <Label>Select Doctor</Label>
                                                <Select onValueChange={handleDoctorSelect}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose your doctor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departmentDoctors.map((doctor) => (
                                                            <SelectItem key={doctor._id} value={doctor._id}>
                                                                Dr. {doctor.firstName} {doctor.lastName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {departmentDoctors.length === 0 && selectedDepartment && (
                                                    <p className="text-sm text-muted-foreground">
                                                        No doctors available in this department
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Date Selection */}
                                        <div className="space-y-2">
                                            <Label>Appointment Date</Label>
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
                                                            date < new Date() || date.getDay() === 0 // Disable past dates and Sundays
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Time Selection */}
                                        {selectedDate && (
                                            <div className="space-y-2">
                                                <Label>Appointment Time</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {timeSlots.map((time) => (
                                                        <Button
                                                            key={time}
                                                            type="button"
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedTime(time)}
                                                            className="text-xs"
                                                        >
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Appointment Summary */}
                                        {selectedDate && selectedTime && selectedDoctor.firstName && (
                                            <Card className="bg-muted/50">
                                                <CardContent className="p-4">
                                                    <h4 className="font-medium mb-2">Appointment Summary</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <p><strong>Doctor:</strong> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                                        <p><strong>Department:</strong> {selectedDepartment}</p>
                                                        <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                                                        <p><strong>Time:</strong> {selectedTime}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isCreating || !selectedDate || !selectedTime || !selectedDoctor.firstName}
                                        >
                                            {isCreating ? 'Booking Appointment...' : 'Book Appointment'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookAppointment;
