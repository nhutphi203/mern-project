import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    Stethoscope,
    Badge as BadgeIcon,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { PopulatedAppointment } from '@/api/types';
import { format } from 'date-fns';

interface AppointmentCardProps {
    appointment: PopulatedAppointment;
    userRole?: 'Admin' | 'Patient' | 'Doctor';
    onUpdateStatus?: (id: string, status: 'Pending' | 'Accepted' | 'Rejected') => void;
    onDelete?: (id: string) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    userRole,
    onUpdateStatus,
    onDelete,
    isUpdating = false,
    isDeleting = false
}) => {
    // Helper function để lấy màu badge theo status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Accepted':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                    </Badge>
                );
            case 'Rejected':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    // Helper function để format ngày giờ
    const formatAppointmentDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return {
                date: format(date, 'MMM dd, yyyy'),
                time: format(date, 'hh:mm a')
            };
        } catch (error) {
            return {
                date: 'Invalid date',
                time: 'Invalid time'
            };
        }
    };

    const { date, time } = formatAppointmentDate(appointment.appointment_date);
    const doctor = appointment.doctorId;
    const patient = appointment.patientId;

    // Tạo initials cho avatar
    const getDoctorInitials = () => {
        return `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase();
    };

    const getPatientInitials = () => {
        return `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                        {/* Doctor Avatar và thông tin */}
                        {(userRole === 'Patient' || userRole === 'Admin') && (
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={doctor.docAvatar?.url}
                                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                    />
                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                        {getDoctorInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </CardTitle>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Stethoscope className="w-4 h-4" />
                                        <span>{doctor.doctorDepartment}</span>
                                        {doctor.specialization && (
                                            <>
                                                <span>•</span>
                                                <span>{doctor.specialization}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient Avatar và thông tin (cho Doctor và Admin view) */}
                        {(userRole === 'Doctor' || userRole === 'Admin') && (
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-green-100 text-green-700">
                                        {getPatientInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">
                                        {patient.firstName} {patient.lastName}
                                    </CardTitle>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>{patient.gender}</span>
                                        <span>•</span>
                                        <span>{format(new Date(patient.dob), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.status)}

                        {/* Actions menu cho Admin */}
                        {userRole === 'Admin' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {appointment.status !== 'Accepted' && (
                                        <DropdownMenuItem
                                            onClick={() => onUpdateStatus?.(appointment._id, 'Accepted')}
                                            disabled={isUpdating}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Accept
                                        </DropdownMenuItem>
                                    )}
                                    {appointment.status !== 'Rejected' && (
                                        <DropdownMenuItem
                                            onClick={() => onUpdateStatus?.(appointment._id, 'Rejected')}
                                            disabled={isUpdating}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(appointment._id)}
                                        disabled={isDeleting}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Thông tin appointment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Date:</span>
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Time:</span>
                            <span>{time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <BadgeIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Department:</span>
                            <span>{appointment.department}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Contact info (hiển thị khác nhau theo user role) */}
                        {(userRole === 'Doctor' || userRole === 'Admin') && (
                            <>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">Phone:</span>
                                    <span>{patient.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">Email:</span>
                                    <span className="text-blue-600">{patient.email}</span>
                                </div>
                            </>
                        )}

                        <div className="flex items-start space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="font-medium">Address:</span>
                            <span className="text-gray-600">{appointment.address}</span>
                        </div>
                    </div>
                </div>

                {/* Visit status */}
                {appointment.hasVisited && (
                    <div className="pt-2 border-t">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Previous visitor
                        </Badge>
                    </div>
                )}

                {/* Created date */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {format(new Date(appointment.createdAt), 'MMM dd, yyyy hh:mm a')}
                </div>
            </CardContent>
        </Card>
    );
};

export default AppointmentCard;