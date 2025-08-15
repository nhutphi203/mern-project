// src/pages/Dashboard.tsx - Redesigned by Gemini UI Expert

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, ArrowRight, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LogOut, Phone, HeartPulse } from 'lucide-react';
// --- CÁC HELPER COMPONENTS ĐỂ GIÚP GIAO DIỆN SẠCH SẼ HƠN ---
import { useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
// 1. Avatar Component: Tự động tạo avatar từ tên nếu không có ảnh
const Avatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
        <div className="h-20 w-20 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-3xl border-4 border-white dark:border-gray-800 shadow-lg">
            {initials}
        </div>
    );
};
const AppointmentStatusBadge = ({ status }: { status: string }) => {
    const getStatusInfo = () => {
        switch (status) {
            case "Pending":
                return { text: "Đang chờ duyệt", variant: "outline" as const };
            case "Accepted":
                return { text: "Đã xác nhận", variant: "default" as const, className: "bg-blue-500" };
            case "Checked-in":
                return { text: "Đã check-in", variant: "secondary" as const, className: "bg-yellow-500 text-black" };
            case "Completed":
                return { text: "Đã hoàn tất", variant: "default" as const, className: "bg-green-500" };
            case "Rejected":
            case "Cancelled":
                return { text: "Đã hủy/Từ chối", variant: "destructive" as const };
            default:
                return { text: status, variant: "outline" as const };
        }
    };

    const { text, variant, className } = getStatusInfo();
    return <Badge variant={variant} className={className}>{text}</Badge>;
};

// 2. Empty State Component: Hiển thị khi không có lịch hẹn
const AppointmentsEmptyState = () => {
    const navigate = useNavigate();
    return (
        <div className="text-center py-16 px-6 bg-slate-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="mx-auto h-16 w-16 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />
                </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">No appointments scheduled</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Book your first appointment to see it here.</p>
            <div className="mt-6">
                <Button onClick={() => navigate('/book-appointment')} className="bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Book New Appointment
                </Button>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH: DASHBOARD ĐÃ ĐƯỢC THIẾT KẾ LẠI ---

const Dashboard = () => {
    // --- LOGIC GIỮ NGUYÊN 100% ---
    const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
    const { logoutMutation, isLogouting } = useAuth();
    // Sửa lỗi: Khôi phục lại hàm `fetchAppointments`
    const { appointments, isLoading: appointmentsLoading, fetchAppointments } = useAppointments();
    const navigate = useNavigate();

    // Sửa lỗi: Khôi phục lại useEffect để gọi fetchAppointments
    useEffect(() => {
        if (currentUserData) {
            fetchAppointments();
        }
    }, [currentUserData, fetchAppointments]);

    const user = currentUserData?.user;
    const userAppointments = useMemo(() =>
        appointments?.filter(apt => apt.patientId?._id === user?._id) || [],
        [appointments, user]
    );

    const getStatusBadge = (status: string) => {
        const baseClasses = "flex items-center gap-2 capitalize text-xs font-medium px-3 py-1 rounded-full";
        switch (status) {
            case 'Accepted': return <div className={`${baseClasses} bg-green-100 text-green-800`}><span className="h-2 w-2 rounded-full bg-green-500"></span>Accepted</div>;
            case 'Rejected': return <div className={`${baseClasses} bg-red-100 text-red-800`}><span className="h-2 w-2 rounded-full bg-red-500"></span>Rejected</div>;
            default: return <div className={`${baseClasses} bg-yellow-100 text-yellow-800`}><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Pending</div>;
        }
    };

    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50">Loading Dashboard...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // --- KẾT THÚC PHẦN LOGIC ---

    // Kiểm tra role để hiển thị đúng dashboard
    if (user.role === 'Admin') {
        return <Navigate to="/admin-dashboard" replace />;
    }

    if (user.role === 'Doctor') {
        return <Navigate to="/doctor-dashboard" replace />;
    }

    // Chỉ hiển thị Patient Dashboard nếu user là Patient
    if (user.role !== 'Patient') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900 font-sans">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                `}
            </style>

            <Header />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">

                    {/* Phần Header của Dashboard */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                                Welcome back, {user.firstName}!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                                Here's your health summary for today.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => logoutMutation()} disabled={isLogouting} className="shadow-sm">
                            <LogOut className="mr-2 h-4 w-4" />
                            {isLogouting ? 'Logging out...' : 'Logout'}
                        </Button>
                    </div>

                    {/* Bố cục 2 cột chính */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Cột bên trái: Profile & Quick Actions */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Card Profile mới */}
                            <Card className="rounded-2xl shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <CardHeader className="text-center items-center pt-8">
                                    <Avatar name={`${user.firstName} ${user.lastName}`} />
                                    <CardTitle className="mt-4 text-2xl">{user.firstName} {user.lastName}</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </CardHeader>
                                <CardContent className="pt-2 pb-6 px-6">
                                    <div className="text-base space-y-4 text-gray-700 dark:text-gray-300 border-t pt-4">
                                        <div className="flex items-center"><Phone className="h-5 w-5 mr-4 text-teal-500" /> {user.phone}</div>
                                        <div className="flex items-center"><HeartPulse className="h-5 w-5 mr-4 text-teal-500" /> {user.gender}</div>
                                        <div className="flex items-center"><Calendar className="h-5 w-5 mr-4 text-teal-500" /> Born on {new Date(user.dob).toLocaleDateString()}</div>
                                    </div>
                                    <Button
                                        className="w-full mt-6 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:hover:bg-teal-900 dark:text-teal-300 shadow-sm"
                                        variant="secondary"
                                        onClick={() => navigate(`/patient-profile/${user._id}`)}
                                    >
                                        View Full Profile
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col justify-between">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <ClipboardList className="h-6 w-6 text-blue-500" />
                                        My Medical Records
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        View your past medical history, diagnoses, and prescriptions from your doctors.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link to="/medical-records" className="w-full">
                                        <Button className="w-full">
                                            View Records <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <Link to="/book-appointment" className="block animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    <Card className="rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <CardContent className="p-6 flex items-center gap-5">
                                            <div className="h-14 w-14 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                                <PlusCircle className="h-7 w-7 text-teal-600 dark:text-teal-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Book Appointment</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Schedule your next visit</p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardContent>
                                    </Card>
                                </Link>
                                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                    <Card className="rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <CardContent className="p-6 flex items-center gap-5">
                                            <div className="h-14 w-14 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Emergency Care</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">24/7 services available</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Cột bên phải: Lịch hẹn */}
                        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <Card className="rounded-2xl shadow-lg h-full">
                                <CardHeader>
                                    <CardTitle className="text-2xl">My Appointments</CardTitle>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">You have {userAppointments.length} upcoming appointments.</p>
                                </CardHeader>
                                <CardContent>
                                    {appointmentsLoading ? (
                                        <div className="text-center py-10">Loading appointments...</div>
                                    ) : userAppointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {userAppointments.map((apt) => (
                                                <div key={apt._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <div>
                                                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Dr. {apt.doctor.firstName} {apt.doctor.lastName}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{apt.department}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span>{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(apt.status)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <AppointmentsEmptyState />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
