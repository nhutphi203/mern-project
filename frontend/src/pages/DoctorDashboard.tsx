import React, { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Loader2, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
    const { appointments, isLoading: appointmentsLoading, fetchAppointments } = useAppointments();
    const { logoutMutation, isLogouting } = useAuth();

    const doctor = currentUserData?.user;

    useEffect(() => {
        if (doctor) {
            fetchAppointments();
        }
    }, [doctor, fetchAppointments]);


    // Lọc và sắp xếp các lịch hẹn của bác sĩ
    const doctorAppointments = useMemo(() => {
        if (!appointments) return [];

        // SỬA LỖI: Không cần filter lại ở đây.
        // Hook useAppointments đã tự động fetch đúng danh sách lịch hẹn cho bác sĩ.
        // Chúng ta chỉ cần sắp xếp lại chúng.
        return [...appointments].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    }, [appointments]);

    const todayAppointments = useMemo(() => {
        const today = new Date();
        return doctorAppointments.filter(apt =>
            format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        );
    }, [doctorAppointments]);

    if (isUserLoading || appointmentsLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (!doctor || doctor.role !== 'Doctor') {
        navigate('/');
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; }
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                `}
            </style>

            <Header />
            <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                            Welcome back, Dr. {doctor.lastName}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Here is your schedule and patient overview.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => logoutMutation()} disabled={isLogouting} className="shadow-sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLogouting ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todayAppointments.length}</div>
                            <p className="text-xs text-muted-foreground">scheduled for today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(doctorAppointments.map(a => a.patientId._id)).size}</div>
                            <p className="text-xs text-muted-foreground">in your care</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Tabs defaultValue="today">
                        <TabsList>
                            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
                            <TabsTrigger value="all">All Appointments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="today">
                            <AppointmentList appointments={todayAppointments} title="Today's Appointments" />
                        </TabsContent>
                        <TabsContent value="all">
                            <AppointmentList appointments={doctorAppointments} title="All Scheduled Appointments" />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const AppointmentList = ({ appointments, title }) => {
    if (appointments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <Calendar className="mx-auto h-12 w-12 mb-4" />
                    <p>No appointments found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Click on a patient to view their medical records.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {appointments.map(apt => (
                        <Link to={`/patient-records/${apt.patientId._id}`} key={apt._id} className="block">
                            <div className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-semibold text-lg">{apt.patientId.firstName} {apt.patientId.lastName}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(apt.appointment_date), 'p')}
                                    </p>
                                </div>
                                <Badge variant={apt.status === 'Accepted' ? 'default' : 'secondary'}>{apt.status}</Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default DoctorDashboard;
