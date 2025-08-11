// src/pages/ReceptionDashboard.tsx (Final Corrected Version)

import React, { useState } from 'react';
import { useReception } from '@/hooks/useReception';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, Search, AlertCircle } from 'lucide-react';
// Import the type to use it
import type { PopulatedAppointment } from '@/api/types';

const ReceptionDashboard: React.FC = () => {
    const {
        appointments,
        isLoadingAppointments,
        fetchError,
        checkIn,
        isCheckingIn
    } = useReception();

    const [searchTerm, setSearchTerm] = useState('');
    const [checkingInId, setCheckingInId] = useState<string | null>(null);

    // --- STEP 1: UPDATE THE FUNCTION SIGNATURE ---
    // The function now expects the full PopulatedAppointment object
    const handleCheckIn = (appointment: PopulatedAppointment) => {
        if (isCheckingIn) return;
        setCheckingInId(appointment._id);
        // Pass the entire object to the checkIn mutation
        checkIn(appointment, {
            onSettled: () => setCheckingInId(null),
        });
    };

    const filteredAppointments = appointments.filter(app => {
        const patientName = `${app.patientId?.firstName} ${app.patientId?.lastName}`;
        const doctorName = `${app.doctorId?.firstName} ${app.doctorId?.lastName}`;
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bàn làm việc Lễ tân</CardTitle>
                    <CardDescription>
                        Tiếp nhận và check-in cho bệnh nhân có lịch hẹn đã được duyệt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm tên bệnh nhân hoặc bác sĩ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Giờ hẹn</TableHead>
                                    <TableHead>Bác sĩ</TableHead>
                                    <TableHead className="text-center">Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingAppointments ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : fetchError ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-destructive">
                                            <AlertCircle className="mx-auto h-8 w-8" /><p className="mt-2">Lỗi: {fetchError.message}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((app) => (
                                        <TableRow key={app._id}>
                                            <TableCell className="font-medium">{`${app.patientId?.firstName} ${app.patientId?.lastName}`}</TableCell>
                                            <TableCell>{new Date(app.appointment_date).toLocaleString('vi-VN')}</TableCell>
                                            <TableCell>{app.doctorId ? `BS. ${app.doctorId.firstName} ${app.doctorId.lastName}` : 'N/A'}</TableCell>
                                            <TableCell className="text-center"><Badge variant="default">{app.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    // --- STEP 2: UPDATE THE ONCLICK HANDLER ---
                                                    // Pass the entire 'app' object
                                                    onClick={() => handleCheckIn(app)}
                                                    disabled={isCheckingIn && checkingInId === app._id}
                                                >
                                                    {isCheckingIn && checkingInId === app._id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                    )}
                                                    Check-in
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Không có lịch hẹn nào đang chờ check-in.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReceptionDashboard;