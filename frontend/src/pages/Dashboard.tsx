
// src/pages/Dashboard.tsx
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, LogOut, Phone, Mail, Loader2 } from 'lucide-react';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';
// Thêm vào khu vực import ở đầu file Dashboard.tsx
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersonStanding, Cake } from 'lucide-react'; // Icon mới cho Giới tính và Ngày sinh
const Dashboard = () => {
    const { data: currentUser, isLoading } = useCurrentUser();
    const { logoutMutation, isLogouting } = useAuth();

    const navigate = useNavigate(); // Khởi tạo hook navigate

    const {
        appointments,
        isLoading: appointmentsLoading,
        fetchAppointments,
        error: appointmentsError, // Lấy cả lỗi để hiển thị nếu cần
    } = useAppointments();
    useEffect(() => {
        // Chỉ gọi API khi đã xác định được người dùng
        if (currentUser) {
            fetchAppointments();
        }
    }, [currentUser, fetchAppointments]); // Chạy lại khi currentUser hoặc fetchAppointments thay đổi
    if (!currentUser?.user) {
        return <Navigate to="/login" replace />;
    }
    if (isLoading) {
        return <div>Loading user...</div>; // Thêm màn hình chờ cho user
    }

    const user = currentUser.user;
    const userAppointments = appointments?.filter(apt => apt.patientId === user._id) || [];
    console.log("USER OBJECT ON DASHBOARD:", user);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="select-none min-h-screen bg-background">
            <Header />

            <main className="pt-28 pb-10">
                <div className="container mx-auto px-4">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">
                                    Welcome back, {user.firstName}!
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage your appointments and health records
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* User Profile Card */}
                        {/* User Profile Card - PHIÊN BẢN MỚI DÙNG ICON */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TooltipProvider>
                                        <div className="space-y-5"> {/* Tăng khoảng cách dọc lên space-y-5 */}

                                            {/* Full Name */}
                                            <Tooltip>
                                                <TooltipTrigger className="w-full">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                        <p className="text-lg">{user.firstName} {user.lastName}</p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Full Name</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Email */}
                                            <Tooltip>
                                                <TooltipTrigger className="w-full">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                                        <p>{user.email}</p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Email Address</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Phone */}
                                            <Tooltip>
                                                <TooltipTrigger className="w-full">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                                        <p>{user.phone}</p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Phone Number</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Gender */}
                                            <Tooltip>
                                                <TooltipTrigger className="w-full">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <PersonStanding className="h-5 w-5 text-muted-foreground" />
                                                        <p>{user.gender}</p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Gender</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Date of Birth */}
                                            <Tooltip>
                                                <TooltipTrigger className="w-full">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <Cake className="h-5 w-5 text-muted-foreground" />
                                                        <p>{new Date(user.dob).toLocaleDateString()}</p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Date of Birth</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                    <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = `/patient-profile/${user._id}`}>
                                        View Full Patient Profile
                                    </Button>

                                </CardContent>
                            </Card>
                        </div>

                        {/* Appointments Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            My Appointments
                                        </CardTitle>
                                        <Button>
                                            Book New Appointment
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        View and manage your medical appointments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {appointmentsLoading ? (
                                        <div className="text-center py-8">Loading appointments...</div>
                                    ) : appointmentsError ? ( // Hiển thị lỗi nếu có
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                                No appointments yet
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Book your first appointment to get started
                                            </p>
                                            <Button>Book Appointment</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userAppointments.map((appointment) => (
                                                <div
                                                    key={appointment._id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-medium">
                                                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {appointment.department}
                                                            </p>
                                                        </div>
                                                        <Badge className={getStatusColor(appointment.status)}>
                                                            {appointment.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{appointment.appointment_date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{appointment.hasVisited ? 'Visited' : 'Not visited'}</span>
                                                        </div>
                                                    </div>

                                                    {appointment.status === 'Pending' && (
                                                        <div className="mt-3 flex gap-2">
                                                            <Button size="sm" variant="outline">
                                                                Reschedule
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="text-destructive">
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Book Appointment</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Schedule a visit with our doctors
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                                                <Phone className="h-6 w-6 text-secondary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Emergency Care</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    24/7 emergency services available
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
