// src/pages/Dashboard.tsx - Redesigned by Gemini UI Expert

import React, { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
    Calendar, Clock, User, LogOut, Phone, Mail, ArrowRight, PlusCircle, AlertTriangle, MessageSquare, HeartPulse
} from 'lucide-react';

// --- CÁC HELPER COMPONENTS ĐỂ GIÚP GIAO DIỆN SẠCH SẼ HƠN ---

// 1. Avatar Component: Tự động tạo avatar từ tên nếu không có ảnh
const Avatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
        <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-2xl border-4 border-white dark:border-gray-800 shadow-md">
            {initials}
        </div>
    );
};

// 2. Empty State Component: Hiển thị khi không có lịch hẹn
const AppointmentsEmptyState = () => {
    const navigate = useNavigate();
    return (
        <div className="text-center py-16 px-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="mx-auto h-16 w-16 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />
                </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">No appointments scheduled</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Book your first appointment to see it here.</p>
            <div className="mt-6">
                <Button onClick={() => navigate('/book-appointment')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-lg transition-all">
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
    const { appointments, isLoading: appointmentsLoading, fetchAppointments, error: appointmentsError } = useAppointments();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUserData) {
            fetchAppointments();
        }
    }, [currentUserData, fetchAppointments]);

    const user = currentUserData?.user;
    const userAppointments = useMemo(() =>
        appointments?.filter(apt => apt.patientId === user?._id) || [],
        [appointments, user]
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Accepted': return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
            case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="secondary">Pending</Badge>;
        }
    };

    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // --- KẾT THÚC PHẦN LOGIC ---

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Thêm font Inter từ Google Fonts */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }`}
            </style>

            <Header />

            {/* Hiệu ứng nền Gradient tinh tế */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-indigo-100 via-white to-white dark:from-indigo-900/30 dark:via-gray-900 dark:to-gray-900 -z-10" />

            <main className="pt-28 pb-16 animate-fade-in">
                <div className="container mx-auto px-4">

                    {/* Phần Header của Dashboard */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                Welcome back, {user.firstName}!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Here's your health summary for today.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => logoutMutation()} disabled={isLogouting}>
                            <LogOut className="mr-2 h-4 w-4" />
                            {isLogouting ? 'Logging out...' : 'Logout'}
                        </Button>
                    </div>

                    {/* Bố cục 2 cột chính */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Cột bên trái: Profile & Quick Actions */}
                        <div className="lg:col-span-1 space-y-8">

                            {/* Card Profile mới */}
                            <Card className="rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border-0 bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg transition-all hover:shadow-xl">
                                <CardHeader className="text-center items-center pt-8">
                                    <Avatar name={`${user.firstName} ${user.lastName}`} />
                                    <CardTitle className="mt-4 text-xl">{user.firstName} {user.lastName}</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </CardHeader>
                                <CardContent className="pt-2 pb-6 px-6">
                                    <div className="text-sm space-y-3 text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center"><Phone className="h-4 w-4 mr-3 text-indigo-500" /> {user.phone}</div>
                                        <div className="flex items-center"><HeartPulse className="h-4 w-4 mr-3 text-indigo-500" /> {user.gender}</div>
                                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-indigo-500" /> Born on {new Date(user.dob).toLocaleDateString()}</div>
                                    </div>
                                    <Button
                                        className="w-full mt-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-300"
                                        variant="secondary"
                                        onClick={() => navigate(`/patient-profile/${user._id}`)}
                                    >
                                        View Full Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <Link to="/book-appointment" className="block">
                                    <Card className="rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group">
                                        <CardContent className="p-6 flex items-center gap-5">
                                            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                                                <PlusCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Book Appointment</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Schedule your next visit</p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardContent>
                                    </Card>
                                </Link>
                                <Card className="rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group">
                                    <CardContent className="p-6 flex items-center gap-5">
                                        <div className="h-12 w-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Emergency Care</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">24/7 services available</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>

                        {/* Cột bên phải: Lịch hẹn */}
                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border-0 h-full bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle>My Appointments</CardTitle>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">You have {userAppointments.length} upcoming appointments.</p>
                                </CardHeader>
                                <CardContent>
                                    {appointmentsLoading ? (
                                        <div className="text-center py-10">Loading appointments...</div>
                                    ) : userAppointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {userAppointments.map((apt) => (
                                                <div key={apt._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200">Dr. {apt.doctor.firstName} {apt.doctor.lastName}</p>
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
