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
import { Calendar, Users, Clock, Loader2, LogOut, Stethoscope, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import type { PopulatedAppointment } from '@/api/types';

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
                                            <TableCell>{`${encounter.patientId.firstName} ${encounter.patientId.lastName}`}</TableCell>
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
                    </TabsList>
                    <TabsContent value="today">
                        <AppointmentList appointments={todayAppointments} title="Today's Appointments" />
                    </TabsContent>
                    <TabsContent value="all">
                        <AppointmentList appointments={doctorAppointments} title="All Scheduled Appointments" />
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
                        <Link to={`/patient-records/${apt.patientId._id}?appointmentId=${apt._id}`} key={apt._id} className="block">
                            <div className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-100">
                                <div>
                                    <p className="font-semibold text-lg">{apt.patientId.firstName} {apt.patientId.lastName}</p>
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