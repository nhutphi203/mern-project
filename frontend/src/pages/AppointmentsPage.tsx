import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Clock, MapPin, Filter, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import { appointmentApi } from '@/api/appointments';
import { toast } from 'sonner';

const AppointmentsPage: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterDepartment, setFilterDepartment] = useState<string>('');

    // Real API query with filters
    const { data: appointmentsData, isLoading, error, refetch } = useQuery({
        queryKey: ['appointments', { searchTerm, filterStatus, filterDepartment }],
        queryFn: async () => {
            const filters: any = {};
            if (searchTerm) filters.search = searchTerm;
            if (filterStatus) filters.status = filterStatus;
            if (filterDepartment) filters.department = filterDepartment;

            if (Object.keys(filters).length > 0) {
                return await appointmentApi.filterAppointments(filters);
            } else {
                return await appointmentApi.getAllAppointments();
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const appointments = appointmentsData?.data?.appointments || appointmentsData?.appointments || [];
    const appointmentCount = appointmentsData?.data?.count || appointmentsData?.count || 0;

    // Handle search and filtering
    const handleSearch = () => {
        refetch();
    };

    const handleStatusFilter = (status: string) => {
        setFilterStatus(status);
        refetch();
    };

    const handleDepartmentFilter = (department: string) => {
        setFilterDepartment(department);
        refetch();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                    <p>Error loading appointments: {error instanceof Error ? error.message : 'Unknown error'}</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Appointment Management</h1>
                <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule New Appointment
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                            value={filterDepartment}
                            onChange={(e) => handleDepartmentFilter(e.target.value)}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">All Departments</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Pediatrics">Pediatrics</option>
                        </select>
                        <div className="text-sm text-gray-500">
                            {appointmentCount} appointments found
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments List */}
            <div className="grid gap-4">
                {appointments.map((appointment) => (
                    <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {appointment.patientId.firstName} {appointment.patientId.lastName}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-4 w-4" />
                                                <span>Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{format(new Date(appointment.appointment_date), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{appointment.department}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(appointment.status)}>
                                        {appointment.status}
                                    </Badge>
                                    <Link to={`/patient-records/${appointment.patientId._id}?appointmentId=${appointment._id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {appointments.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        {searchTerm || filterStatus || filterDepartment ? 'No appointments found matching your criteria.' : 'No appointments found.'}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AppointmentsPage;
