// src/pages/BookAppointment.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, Phone, Mail, Stethoscope, ArrowRight, Loader2 } from 'lucide-react'; // Thêm icon mới
import { format } from 'date-fns';
import { useCurrentUser } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import type { AppointmentRequest, User as DoctorUser } from '@/api/types'; // Import User và đổi tên thành DoctorUser
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/components/ui/use-toast';

// Giữ nguyên các hằng số
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Ophthalmology', 'General Medicine', 'Emergency Medicine', 'Dermatology', 'Psychiatry', 'Radiology'];
const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

// Component Step để làm giao diện đẹp hơn
const Step = ({ number, title, children, isActive }: { number: number, title: string, children: React.ReactNode, isActive: boolean }) => (
    <Card className={cn("transition-all", isActive ? "border-primary shadow-lg" : "border-border/40 bg-muted/20")}>
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold", isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground")}>
                    {number}
                </span>
                {title}
            </CardTitle>
        </CardHeader>
        {isActive && <CardContent>{children}</CardContent>}
    </Card>
);

const BookAppointment = () => {
    const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
    const { createAppointment, isCreating } = useAppointments();
    const { doctors, isLoading: isDoctorsLoading } = useDoctors();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
    const [address, setAddress] = useState('');

    // Filter doctors theo khoa đã chọn
    const departmentDoctors = useMemo(() => doctors?.filter(doctor =>
        doctor.doctorDepartment === selectedDepartment
    ) || [], [doctors, selectedDepartment]);

    // Reset lựa chọn bác sĩ và ngày giờ khi đổi khoa
    useEffect(() => {
        setSelectedDoctor(null);
        setSelectedDate(undefined);
        setSelectedTime('');
    }, [selectedDepartment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.user || !selectedDoctor || !selectedDate || !selectedTime || !address) {
            toast({
                title: "Incomplete Information",
                description: "Please complete all steps before booking.",
                variant: "destructive",
            });
            return;
        }
        const appointmentData: AppointmentRequest = {
            firstName: currentUser.user.firstName,
            lastName: currentUser.user.lastName,
            email: currentUser.user.email,
            phone: currentUser.user.phone,
            nic: currentUser.user.nic,
            dob: currentUser.user.dob,
            gender: currentUser.user.gender,
            appointment_date: `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`, // Sửa lại tên trường
            department: selectedDepartment,
            doctor_firstName: selectedDoctor.firstName,
            doctor_lastName: selectedDoctor.lastName,
            hasVisited: false,
            address: address,
            doctorId: selectedDoctor._id, // Dòng này giờ đã hợp lệ
        };

        createAppointment(appointmentData, {
            onSuccess: () => {
                toast({ title: "Appointment Booked!", description: "Your appointment has been successfully scheduled." });
                navigate('/dashboard');
            }
        });
    };

    if (isUserLoading) return <div>Loading...</div>;
    if (!currentUser?.user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-28 pb-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">Book an Appointment</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Follow the steps below to schedule your visit.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* --- STEP 1: CHỌN KHOA & BÁC SĨ --- */}
                            <Step number={1} title="Choose Department & Doctor" isActive={currentStep >= 1}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="department">Department</Label>
                                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                            <SelectTrigger id="department"><SelectValue placeholder="Select a department" /></SelectTrigger>
                                            <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    {isDoctorsLoading && <p>Loading doctors...</p>}
                                    {selectedDepartment && !isDoctorsLoading && (
                                        <div>
                                            <Label htmlFor="doctor">Doctor</Label>
                                            <Select onValueChange={(id) => setSelectedDoctor(departmentDoctors.find(d => d._id === id) || null)}>
                                                <SelectTrigger id="doctor"><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                                                <SelectContent>
                                                    {departmentDoctors.length > 0 ? departmentDoctors.map(d => (
                                                        <SelectItem key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</SelectItem>
                                                    )) : <p className="p-4 text-sm text-muted-foreground">No doctors in this department.</p>}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </Step>

                            {/* --- STEP 2: CHỌN NGÀY GIỜ --- */}
                            {selectedDoctor && (
                                <Step number={2} title="Select Date & Time" isActive={currentStep >= 2}>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date() || date.getDay() === 0} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        {selectedDate && (
                                            <div className="space-y-2">
                                                <Label>Time</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {timeSlots.map(time => (
                                                        <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} size="sm" onClick={() => setSelectedTime(time)}>
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Step>
                            )}

                            {/* --- STEP 3: XÁC NHẬN VÀ ĐỊA CHỈ --- */}
                            {selectedDate && selectedTime && (
                                <Step number={3} title="Confirm & Submit" isActive={currentStep >= 3}>
                                    <div className='space-y-4'>
                                        <Card className="bg-muted/50">
                                            <CardHeader><CardTitle className='text-base'>Appointment Summary</CardTitle></CardHeader>
                                            <CardContent className='text-sm space-y-2'>
                                                <p><strong>Doctor:</strong> Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
                                                <p><strong>Department:</strong> {selectedDepartment}</p>
                                                <p><strong>On:</strong> {format(selectedDate, "PPP")} at {selectedTime}</p>
                                            </CardContent>
                                        </Card>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Your Address</Label>
                                            <Textarea id="address" placeholder="Enter your full address for our records" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                        </div>
                                    </div>
                                </Step>
                            )}

                            <Button type="submit" className="w-full text-lg py-6" disabled={isCreating}>
                                {isCreating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Booking...</> : <>Confirm and Book Appointment <ArrowRight className="ml-2 h-5 w-5" /></>}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BookAppointment;