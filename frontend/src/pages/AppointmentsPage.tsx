import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Clock, MapPin, Loader2, CheckCircle, XCircle, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAppointments } from '@/hooks/useAppointments'; // SỬA LỖI 1: Dùng custom hook chuẩn
import { Appointment, PopulatedAppointment } from '@/api/types';
import { toast } from 'sonner';

const AppointmentsPage: React.FC = () => {
    // SỬA LỖI 2: Lấy dữ liệu và các hàm xử lý từ custom hook `useAppointments`
    const {
        appointments = [],
        isLoading,
        error,
        updateStatus,
        deleteAppointment,
        isUpdating,
        isDeleting
    } = useAppointments();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;

    // SỬA LỖI 3: Lọc dữ liệu trên client-side bằng `useMemo` để đơn giản và hiệu quả
    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(app => {
                const searchLower = searchTerm.toLowerCase();
                const patientName = app.patientId
                    ? `${app.patientId.firstName} ${app.patientId.lastName}`.toLowerCase()
                    : '';
                const doctorName = app.doctorId
                    ? `${app.doctorId.firstName} ${app.doctorId.lastName}`.toLowerCase()
                    : '';
                return patientName.includes(searchLower) || doctorName.includes(searchLower);
            })
            .filter(app => {
                return filterStatus ? app.status === filterStatus : true;
            });
    }, [appointments, searchTerm, filterStatus]);

    // Logic phân trang
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
    const currentAppointments = filteredAppointments.slice(
        (currentPage - 1) * appointmentsPerPage,
        currentPage * appointmentsPerPage
    );

    const handleUpdateStatus = (id: string, status: Appointment['status']) => {
        // Hook `useAppointments` đã tự xử lý toast, nên chỉ cần gọi hàm
        updateStatus({ id, status });
    };

    // SỬA LỖI: Cập nhật hàm để gọi trực tiếp mutation từ hook
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            // Hook `useAppointments` đã tự xử lý toast, nên chỉ cần gọi hàm
            deleteAppointment(id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'Cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Appointments</CardTitle>
                    <CardDescription>View, manage, and update patient appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by patient or doctor name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-md px-3 py-2 bg-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="divide-y">
                            {currentAppointments.map((appointment) => (
                                <div key={appointment._id} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-muted/50">
                                    <div className="md:col-span-2 space-y-2">
                                        <div className="font-semibold text-lg">
                                            {appointment.patientId
                                                ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                                                : 'Unknown Patient'
                                            }
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center">
                                                <User className="mr-1 h-4 w-4" />
                                                Dr. {appointment.doctorId?.firstName || 'Unknown Doctor'}
                                            </span>
                                            <span className="flex items-center"><Clock className="mr-1 h-4 w-4" />{format(new Date(appointment.appointment_date), 'PPpp')}</span>
                                            <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" />{appointment.department}</span>
                                        </div>
                                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                    </div>
                                    <div className="flex flex-col md:items-end justify-center space-y-2">
                                        {appointment.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(appointment._id, 'Accepted')} disabled={isUpdating}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Accept
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(appointment._id, 'Rejected')} disabled={isUpdating}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                        <Link to={`/patient-records/${appointment.patientId?._id || 'unknown'}?appointmentId=${appointment._id}`}>
                                            <Button variant="ghost" size="sm" className="w-full justify-start md:justify-end">View Details</Button>
                                        </Link>
                                        <Button size="sm" variant="ghost" className="text-red-500 w-full justify-start md:justify-end" onClick={() => handleDelete(appointment._id)} disabled={isDeleting}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {filteredAppointments.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">No appointments found.</div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>
                            <span className="text-sm">Page {currentPage} of {totalPages}</span>
                            <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AppointmentsPage;
