// src/pages/DoctorDashboard.tsx (Production Version)

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctorQueue } from '@/hooks/useDoctorQueue';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, Clock, Loader2, LogOut, Stethoscope, AlertCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

import type { PopulatedAppointment } from '@/api/types';

// Vital Signs Doctor View Component
const VitalSignsDoctorView = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Vital Signs
                    </CardTitle>
                    <CardDescription>
                        Monitor patient vital signs for clinical assessment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Critical Alerts */}
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-red-800">Critical Alerts</h4>
                                        <p className="text-sm text-red-600">Abnormal vital signs requiring attention</p>
                                    </div>
                                    <div className="text-2xl font-bold text-red-700">3</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Normal Range */}
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-green-800">Normal Range</h4>
                                        <p className="text-sm text-green-600">Patients with stable vital signs</p>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">12</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Measurements */}
                    <div className="mt-6">
                        <h4 className="font-semibold mb-4">Recent Measurements</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Blood Pressure</TableHead>
                                    <TableHead>Heart Rate</TableHead>
                                    <TableHead>Temperature</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">John Smith</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4 text-red-500" />
                                            180/95
                                        </div>
                                    </TableCell>
                                    <TableCell>78 BPM</TableCell>
                                    <TableCell>37.2°C</TableCell>
                                    <TableCell>10:30 AM</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">High BP</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Maria Garcia</TableCell>
                                    <TableCell>120/80</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4 text-orange-500" />
                                            105 BPM
                                        </div>
                                    </TableCell>
                                    <TableCell>36.8°C</TableCell>
                                    <TableCell>11:15 AM</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">Elevated HR</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">David Johnson</TableCell>
                                    <TableCell>115/75</TableCell>
                                    <TableCell>72 BPM</TableCell>
                                    <TableCell>36.5°C</TableCell>
                                    <TableCell>11:45 AM</TableCell>
                                    <TableCell>
                                        <Badge variant="default">Normal</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 flex gap-4">
                        <Button className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Record Vital Signs
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            View Trends
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface AppointmentListProps {
    appointments: PopulatedAppointment[];
    title: string;
}

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Accepted':
            return 'default';
        case 'Checked-in':
            return 'secondary';
        case 'Rejected':
        case 'Cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
    const { appointments, isLoading: appointmentsLoading } = useAppointments();
    const { logoutMutation, isLogouting } = useAuth();
    const { waitingList, isLoadingQueue, queueError } = useDoctorQueue();

    const doctor = currentUserData?.user;

    // Lọc và sắp xếp các lịch hẹn
    const doctorAppointments = useMemo(() => {
        if (!appointments) return [];
        return [...appointments].sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
    }, [appointments]);

    const todayAppointments = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return doctorAppointments.filter(apt => {
            const aptDate = format(new Date(apt.appointment_date), 'yyyy-MM-dd');
            return aptDate === today;
        });
    }, [doctorAppointments]);

    if (isUserLoading || appointmentsLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    }

    if (!doctor || doctor.role !== 'Doctor') {
        navigate('/');
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Welcome back, Dr. {doctor.lastName}!</h1>
                        <p className="text-gray-500 mt-2 text-lg">Here is your patient queue and schedule.</p>
                    </div>
                    <Button variant="outline" onClick={() => logoutMutation()} disabled={isLogouting}>
                        <LogOut className="mr-2 h-4 w-4" />{isLogouting ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>

                {/* Waiting Queue Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Patient Waiting Queue ({waitingList.length})</CardTitle>
                        <CardDescription>
                            Patients who have checked-in and are ready for examination.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead>Check-in Time</TableHead>
                                    <TableHead>Appointment Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingQueue ? (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : queueError ? (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-destructive"><AlertCircle className="mx-auto h-8 w-8" /><p>Error loading queue: {queueError.message}</p></TableCell></TableRow>
                                ) : waitingList.length > 0 ? (
                                    waitingList.map((encounter, index) => (
                                        <TableRow key={encounter._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {encounter.patientId
                                                    ? `${encounter.patientId.firstName} ${encounter.patientId.lastName}`
                                                    : 'Unknown Patient'
                                                }
                                            </TableCell>
                                            <TableCell>{format(new Date(encounter.checkInTime), 'p')}</TableCell>
                                            <TableCell>{encounter.appointmentId?.appointment_date || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm"><Link to={`/examination/${encounter._id}`}><Stethoscope className="mr-2 h-4 w-4" />Examine</Link></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No patients in the queue.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Appointment Schedule Section */}
                <Tabs defaultValue="today">
                    <TabsList>
                        <TabsTrigger value="today">Today's Schedule ({todayAppointments.length})</TabsTrigger>
                        <TabsTrigger value="all">All Appointments ({doctorAppointments.length})</TabsTrigger>
                        <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today">
                        <AppointmentList appointments={todayAppointments} title="Today's Appointments" />
                    </TabsContent>
                    <TabsContent value="all">
                        <AppointmentList appointments={doctorAppointments} title="All Scheduled Appointments" />
                    </TabsContent>
                    <TabsContent value="vitals">
                        <VitalSignsDoctorView />
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
};

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, title }) => {
    if (appointments.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
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
                <CardDescription>A list of your scheduled patient appointments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {appointments.map(apt => (
                        <Link
                            to={apt.patientId?._id ? `/patient-records/${apt.patientId._id}?appointmentId=${apt._id}` : '#'}
                            key={apt._id}
                            className="block"
                        >
                            <div className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-100">
                                <div>
                                    <p className="font-semibold text-lg">
                                        {apt.patientId
                                            ? `${apt.patientId.firstName} ${apt.patientId.lastName}`
                                            : 'Unknown Patient'
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" />{format(new Date(apt.appointment_date), 'p')}
                                    </p>
                                </div>
                                <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default DoctorDashboard;