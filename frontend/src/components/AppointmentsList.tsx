import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Filter,
    Calendar,
    Users,
    Clock,
    TrendingUp
} from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useCurrentUser } from '@/hooks/useAuth';
import AppointmentCard from '../pages/AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppointmentFilter } from '@/api/types';

const AppointmentsList: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const userRole = currentUser?.user?.role;
    type StatusType = "Pending" | "Accepted" | "Rejected";

    // State cho filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    // Sử dụng kiểu union cho state
    // Tạo filter object
    const filter: AppointmentFilter = {
        // Giờ đây có thể ép kiểu trực tiếp và an toàn
        ...(statusFilter !== 'all' && { status: statusFilter as StatusType }),
        ...(departmentFilter !== 'all' && { department: departmentFilter }),
    };
    const {
        appointments,
        isLoading,
        error,
        stats,
        isLoadingStats,
        updateStatus,
        deleteAppointment,
        isUpdating,
        isDeleting
    } = useAppointments(Object.keys(filter).length > 0 ? filter : undefined);
    const handleUpdateStatus = (id: string, status: "Pending" | "Accepted" | "Rejected") => {
        // Gọi hàm `updateStatus` gốc với đúng cấu trúc object
        updateStatus({ id, status });
    };
    // Departments list
    const departments = [
        'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
        'Ophthalmology', 'General Medicine', 'Emergency Medicine',
        'Dermatology', 'Psychiatry', 'Radiology'
    ];

    // Filter appointments by search term
    const filteredAppointments = appointments?.filter(appointment => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const doctor = appointment.doctorId;
        const patient = appointment.patientId;

        return (
            doctor.firstName.toLowerCase().includes(searchLower) ||
            doctor.lastName.toLowerCase().includes(searchLower) ||
            patient.firstName.toLowerCase().includes(searchLower) ||
            patient.lastName.toLowerCase().includes(searchLower) ||
            appointment.department.toLowerCase().includes(searchLower)
        );
    });

    // Statistics cards (for Admin)
    const renderStatsCards = () => {
        if (userRole !== 'Admin' || isLoadingStats || !stats) return null;

        const totalAppointments = stats.byStatus.reduce((sum, stat) => sum + stat.count, 0);
        const pendingCount = stats.byStatus.find(s => s._id === 'Pending')?.count || 0;
        const acceptedCount = stats.byStatus.find(s => s._id === 'Accepted')?.count || 0;
        const rejectedCount = stats.byStatus.find(s => s._id === 'Rejected')?.count || 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{totalAppointments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Accepted</p>
                                <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Loading skeleton
    const renderSkeletons = () => (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-red-500">Error loading appointments: {error.message}</p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {renderStatsCards()}

            {/* Header và Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>
                            {userRole === 'Patient' ? 'My Appointments' :
                                userRole === 'Doctor' ? 'Patient Appointments' :
                                    'All Appointments'}
                        </span>
                        {filteredAppointments && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredAppointments.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Search và Filters */}
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder={`Search ${userRole === 'Patient' ? 'doctors' : 'patients or doctors'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Accepted">Accepted</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Department Filter */}
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Clear Filters Button */}
                        {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDepartmentFilter('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Appointments List */}
            {isLoading ? renderSkeletons() : (
                <div className="space-y-4">
                    {filteredAppointments?.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-500">
                                    No appointments found
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'There are no appointments scheduled yet'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAppointments?.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                userRole={userRole}
                                onUpdateStatus={handleUpdateStatus} // <-- Sửa ở đây
                                onDelete={deleteAppointment}
                                isUpdating={isUpdating}
                                isDeleting={isDeleting}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentsList;