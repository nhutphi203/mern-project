// src/pages/AdminDashboard.tsx
import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
    ClipboardList,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useMessages } from '@/hooks/useMessages';
import { useDoctors } from '@/hooks/useDoctors';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// Vital Signs Admin View Component
const VitalSignsAdminView = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vital Signs Overview Cards */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Total Readings</p>
                                <p className="text-2xl font-bold">1,247</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <MessageSquare className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Patients Monitored</p>
                                <p className="text-2xl font-bold">156</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Today's Records</p>
                                <p className="text-2xl font-bold">47</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Critical Alerts Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-red-600" />
                        Critical Vital Signs Alerts
                    </CardTitle>
                    <CardDescription>
                        Patients requiring immediate attention based on abnormal vital signs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                            <div>
                                <p className="font-semibold">John Smith - Room 302</p>
                                <p className="text-sm text-muted-foreground">Blood Pressure: 180/95 mmHg</p>
                                <p className="text-xs text-red-600">Recorded 15 minutes ago</p>
                            </div>
                            <Badge variant="destructive">Critical</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                            <div>
                                <p className="font-semibold">Maria Garcia - Room 205</p>
                                <p className="text-sm text-muted-foreground">Heart Rate: 105 BPM</p>
                                <p className="text-xs text-orange-600">Recorded 30 minutes ago</p>
                            </div>
                            <Badge variant="secondary">Elevated</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                            <div>
                                <p className="font-semibold">Robert Johnson - Room 410</p>
                                <p className="text-sm text-muted-foreground">Temperature: 38.5°C</p>
                                <p className="text-xs text-yellow-600">Recorded 1 hour ago</p>
                            </div>
                            <Badge variant="outline">Monitoring</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Vital Signs System Statistics</CardTitle>
                    <CardDescription>
                        Overview of vital signs monitoring across the hospital
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">98.5%</div>
                            <p className="text-sm text-muted-foreground">Normal Readings</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">1.2%</div>
                            <p className="text-sm text-muted-foreground">Requires Monitoring</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">0.3%</div>
                            <p className="text-sm text-muted-foreground">Critical</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Export Report
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            View Trends
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const AdminDashboard = () => {
    const { data: currentUser, isLoading } = useCurrentUser();
    const { logoutMutation } = useAuth();
    const { appointments, updateStatus, deleteAppointment, isUpdating, isDeleting } = useAppointments();
    const { messages } = useMessages();
    const { doctors } = useDoctors();
    const { stats, isLoadingStats } = useDashboardStats();

    // States cho phân trang và tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Số lịch hẹn trên mỗi trang

    // Logic lọc và phân trang
    const { filteredAppointments, totalPages, paginatedAppointments } = useMemo(() => {
        if (!appointments) return { filteredAppointments: [], totalPages: 0, paginatedAppointments: [] };

        // Bước 1: Lọc theo từ khóa tìm kiếm
        const filtered = appointments.filter(appointment => {
            const searchLower = searchTerm.toLowerCase();
            const fullName = `${appointment.firstName} ${appointment.lastName}`.toLowerCase();
            const doctorName = appointment.doctor
                ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase()
                : '';

            return (
                fullName.includes(searchLower) ||
                appointment.email.toLowerCase().includes(searchLower) ||
                appointment.phone.includes(searchTerm) ||
                doctorName.includes(searchLower) ||
                appointment.status.toLowerCase().includes(searchLower) ||
                appointment.department.toLowerCase().includes(searchLower)
            );
        });

        // Bước 2: Tính toán phân trang
        const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        return {
            filteredAppointments: filtered,
            totalPages: totalPagesCount,
            paginatedAppointments: paginated
        };
    }, [appointments, searchTerm, currentPage, itemsPerPage]);

    // Reset về trang 1 khi tìm kiếm
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    // Functions cho phân trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Render pagination controls
    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);


        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} trong tổng số {filteredAppointments.length} lịch hẹn
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    {pageNumbers.map(pageNum => (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
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

                    {/* Card: Accepted Appointments */}
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

                    {/* Card: Doctors */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {doctors?.length ?? 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Bác sĩ</p>
                                </div>
                            </div>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="appointments" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="doctors">Doctors</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Enhanced Appointments Tab với Phân trang và Tìm kiếm */}
                    <TabsContent value="appointments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Appointments</CardTitle>
                                <CardDescription>
                                    Review and manage patient appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Search Input */}
                                <div className="mb-6">
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Tìm kiếm theo tên, email, bác sĩ, trạng thái..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    {searchTerm && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Tìm thấy {filteredAppointments.length} kết quả cho "{searchTerm}"
                                        </p>
                                    )}
                                </div>

                                {paginatedAppointments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {searchTerm ? "Không tìm thấy lịch hẹn phù hợp" : "No appointments found"}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Appointments List */}
                                        <div className="space-y-4">
                                            {paginatedAppointments.map((appointment) => (
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
                                                                {appointment.doctor
                                                                    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} • ${appointment.department}`
                                                                    : `Unknown Doctor • ${appointment.department}`
                                                                }
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

                                        {/* Pagination Controls */}
                                        {renderPaginationControls()}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vital Signs Tab */}
                    <TabsContent value="vitals">
                        <VitalSignsAdminView />
                    </TabsContent>

                    {/* Messages Tab - Không thay đổi */}
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

                    {/* Doctors Tab - Không thay đổi */}
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

                    {/* Settings Tab - Không thay đổi */}
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