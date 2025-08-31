// src/pages/Dashboard.tsx - Sử dụng DashboardLayout mới

import React, { useMemo, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { LabDashboardCards, BillingDashboardCards } from '@/components/components/dashboard/DashboardCards';
import { Calendar, Clock, ArrowRight, PlusCircle, LogOut, Phone, HeartPulse, AlertTriangle, ClipboardList } from 'lucide-react';

// Avatar Component
const Avatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
        <div className="h-20 w-20 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-3xl border-4 border-white dark:border-gray-800 shadow-lg">
            {initials}
        </div>
    );
};

// Empty State Component
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

const Dashboard = () => {
    const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
    const { logoutMutation, isLogouting } = useAuth();
    const { appointments, isLoading: appointmentsLoading, fetchAppointments } = useAppointments();
    const navigate = useNavigate();

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

    // Kiểm tra role để hiển thị đúng dashboard
    if (user.role === 'Admin') {
        return <Navigate to="/admin-dashboard" replace />;
    }

    if (user.role === 'Doctor') {
        return <Navigate to="/doctor-dashboard" replace />;
    }

    // Dashboard cho Patient
    if (user.role === 'Patient') {
        return (
            <div className="space-y-8">
                {/* Dashboard header với logout */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Welcome back, {user.firstName}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Here's your health summary for today.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => logoutMutation()}
                        disabled={isLogouting}
                        className="shadow-sm"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLogouting ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>

                {/* Main dashboard content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Profile & Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="text-center items-center pt-8">
                                <Avatar name={`${user.firstName} ${user.lastName}`} />
                                <CardTitle className="mt-4 text-xl">{user.firstName} {user.lastName}</CardTitle>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </CardHeader>
                            <CardContent className="pt-2 pb-6 px-6">
                                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 border-t pt-4">
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-3 text-teal-500" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center">
                                        <HeartPulse className="h-4 w-4 mr-3 text-teal-500" />
                                        {user.gender}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-3 text-teal-500" />
                                        Born on {new Date(user.dob).toLocaleDateString()}
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-4 bg-teal-50 hover:bg-teal-100 text-teal-700"
                                    variant="secondary"
                                    onClick={() => navigate(`/patient-profile/${user._id}`)}
                                >
                                    View Full Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Medical Records Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ClipboardList className="h-5 w-5 text-blue-500" />
                                    My Medical Records
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
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

                        {/* Vital Signs Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HeartPulse className="h-5 w-5 text-red-500" />
                                    My Vital Signs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Monitor your latest vital signs and health metrics.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Last Reading:</span>
                                        <span className="font-medium">2 hours ago</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-blue-50 p-2 rounded">
                                            <div className="text-blue-600 font-medium">BP</div>
                                            <div className="text-blue-800">120/80</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                            <div className="text-green-600 font-medium">HR</div>
                                            <div className="text-green-800">72 BPM</div>
                                        </div>
                                        <div className="bg-orange-50 p-2 rounded">
                                            <div className="text-orange-600 font-medium">Temp</div>
                                            <div className="text-orange-800">36.5°C</div>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                            <div className="text-purple-600 font-medium">O2</div>
                                            <div className="text-purple-800">98%</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to="/my-vital-signs" className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View All Readings <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <Link to="/book-appointment" className="block">
                                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                            <PlusCircle className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Book Appointment</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Schedule your next visit</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardContent>
                                </Card>
                            </Link>
                            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Emergency Care</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">24/7 services available</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right column - Appointments */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg h-full">
                            <CardHeader>
                                <CardTitle className="text-xl">My Appointments</CardTitle>
                                <p className="text-muted-foreground text-sm">
                                    You have {userAppointments.length} appointments.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {appointmentsLoading ? (
                                    <div className="text-center py-10">Loading appointments...</div>
                                ) : userAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {userAppointments.map((apt) => (
                                            <div key={apt._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {apt.doctor
                                                            ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
                                                            : 'Dr. Unknown'
                                                        }
                                                    </p>
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
        );
    }

    // Dashboard cho các role khác (Lab Technician, Insurance Staff, etc.)
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {user.role} Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {user.firstName} {user.lastName}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => logoutMutation()}
                    disabled={isLogouting}
                    className="shadow-sm"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLogouting ? 'Logging out...' : 'Logout'}
                </Button>
            </div>

            {/* Role-specific dashboard cards */}
            {(['Lab Technician', 'Admin'].includes(user.role)) && <LabDashboardCards />}
            {(['Admin', 'Insurance Staff', 'Patient'].includes(user.role)) && <BillingDashboardCards />}

            {/* Additional content for each role can be added here */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Role-specific quick action buttons */}
                        {user.role === 'Lab Technician' && (
                            <>
                                <Button asChild className="w-full">
                                    <Link to="/lab/queue">Lab Queue</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to="/lab/results">Lab Results</Link>
                                </Button>
                            </>
                        )}
                        {user.role === 'Insurance Staff' && (
                            <>
                                <Button asChild className="w-full">
                                    <Link to="/billing/insurance">Insurance Claims</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to="/billing/invoices">Invoices</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;