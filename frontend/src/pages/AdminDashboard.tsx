
// src/pages/AdminDashboard.tsx
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Calendar,
    MessageSquare,
    UserPlus,
    LogOut,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    ClipboardList // 1. THÊM ICON NÀY (thay cho ClipboardUser)

} from 'lucide-react';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useMessages } from '@/hooks/useMessages';
import { useDoctors } from '@/hooks/useDoctors';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboard = () => {
    const { data: currentUser, isLoading } = useCurrentUser();
    const { logoutMutation } = useAuth();
    const { appointments, updateStatus, deleteAppointment, isUpdating, isDeleting } = useAppointments();
    const { messages } = useMessages();
    const { doctors } = useDoctors();
    const { stats, isLoadingStats } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!currentUser?.user || currentUser.user.role !== 'Admin') {
        return <Navigate to="/login" replace />;
    }

    const user = currentUser.user;
    const pendingAppointments = appointments?.filter(apt => apt.status === 'Pending') || [];
    const acceptedAppointments = appointments?.filter(apt => apt.status === 'Accepted') || [];
    const rejectedAppointments = appointments?.filter(apt => apt.status === 'Rejected') || [];

    const handleStatusUpdate = (id: string, status: 'Accepted' | 'Rejected') => {
        updateStatus({ id, status });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Welcome back, {user.firstName}</p>
                        </div>
                        <Button variant="outline" onClick={() => logoutMutation()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card: Total Appointments */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoadingStats ? '...' : stats?.totalAppointments ?? 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Tổng Lịch hẹn</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Pending Appointments */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoadingStats ? '...' : stats?.pendingAppointments ?? 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Accepted Appointments (VÍ DỤ THÊM MỚI) */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoadingStats ? '...' : stats?.acceptedAppointments ?? 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Đã duyệt</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Doctors (Giữ nguyên, vì nó lấy từ hook khác) */}
                    <Card>
                        <CardContent className="p-6">
                            {/* ... code cho Total Doctors giữ nguyên ... */}
                        </CardContent>
                    </Card>
                </div>
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Công cụ Vận hành</CardTitle>
                            <CardDescription>
                                Lối tắt truy cập nhanh vào các chức năng nghiệp vụ.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button asChild>
                                <Link to="/reception-dashboard">
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    Màn hình Check-in (Lễ tân)
                                </Link>
                            </Button>
                            {/* Bạn có thể thêm các nút khác ở đây trong tương lai */}
                        </CardContent>
                    </Card>
                </div>
                {/* --- KẾT THÚC PHẦN THÊM --- */}
                {/* Main Content Tabs */}
                <Tabs defaultValue="appointments" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="doctors">Doctors</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Appointments Tab */}
                    <TabsContent value="appointments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Appointments</CardTitle>
                                <CardDescription>
                                    Review and manage patient appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {appointments?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No appointments found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments?.map((appointment) => (
                                            <div
                                                key={appointment._id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {appointment.firstName} {appointment.lastName}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {appointment.email} • {appointment.phone}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName} • {appointment.department}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                    <span>Date: {appointment.appointment_date}</span>
                                                    <span>NIC: {appointment.nic}</span>
                                                    <span>Gender: {appointment.gender}</span>
                                                </div>

                                                <div className="text-sm text-muted-foreground mb-3">
                                                    <p>Address: {appointment.address}</p>
                                                </div>

                                                {appointment.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(appointment._id, 'Accepted')}
                                                            disabled={isUpdating}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(appointment._id, 'Rejected')}
                                                            disabled={isUpdating}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => deleteAppointment(appointment._id)}
                                                            disabled={isDeleting}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Messages Tab */}
                    <TabsContent value="messages">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Messages</CardTitle>
                                <CardDescription>
                                    View messages from patients and visitors
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {messages?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No messages found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages?.map((message) => (
                                            <div
                                                key={message._id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium">
                                                        {message.firstName} {message.lastName}
                                                    </h4>
                                                    <Badge variant="outline">New</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {message.email} • {message.phone}
                                                </p>
                                                <p className="text-sm">{message.message}</p>
                                                <div className="mt-3 flex gap-2">
                                                    <Button size="sm">Reply</Button>
                                                    <Button size="sm" variant="outline">Mark as Read</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Doctors Tab */}
                    <TabsContent value="doctors">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Manage Doctors</CardTitle>
                                        <CardDescription>
                                            View and manage hospital doctors
                                        </CardDescription>
                                    </div>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add New Doctor
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {doctors?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No doctors found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {doctors?.map((doctor) => (
                                            <Card key={doctor._id}>
                                                <CardContent className="p-4">
                                                    {doctor.docAvatar && (
                                                        <img
                                                            src={doctor.docAvatar.url}
                                                            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                                            className="w-16 h-16 rounded-full mx-auto mb-3"
                                                        />
                                                    )}
                                                    <div className="text-center">
                                                        <h4 className="font-medium">
                                                            Dr. {doctor.firstName} {doctor.lastName}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doctor.doctorDepartment}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doctor.email}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Settings</CardTitle>
                                <CardDescription>
                                    Manage system settings and configurations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full md:w-auto">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add New Admin
                                </Button>
                                <Button variant="outline" className="w-full md:w-auto">
                                    <Activity className="mr-2 h-4 w-4" />
                                    System Health Check
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminDashboard;