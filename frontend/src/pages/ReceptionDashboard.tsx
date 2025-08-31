// src/pages/ReceptionDashboard.tsx (Final Corrected Version)

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useAppointments } from '@/hooks/useAppointments'; // Dùng hook chung để lấy dữ liệu
import { useReception } from '@/hooks/useReception'; // Dùng hook này CHỈ để check-in
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PopulatedAppointment } from '@/api/types';

const ReceptionDashboard: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [checkingInId, setCheckingInId] = useState<string | null>(null);

    // ✅ BƯỚC 1: LẤY TẤT CẢ DỮ LIỆU TỪ HOOK CHUNG
    // Giống hệt như AdminDashboard
    const {
        appointments: allAppointments,
        isLoading,
        error,
    } = useAppointments();

    // ✅ BƯỚC 2: LẤY CHỨC NĂNG CHECK-IN TỪ HOOK CỦA LỄ TÂN
    // Hook này giờ không cần tham số nữa
    const { checkIn, isCheckingIn } = useReception(selectedDate);

    // ✅ BƯỚC 3: LỌC DỮ LIỆU Ở FRONTEND (logic này đã đúng)
    const appointmentsToShow = useMemo(() => {
        if (!allAppointments) return [];
        const selectedDateString = selectedDate.toLocaleDateString('en-CA');
        return allAppointments.filter(app => {
            const isAccepted = app.status === 'Accepted';
            const appointmentDateString = new Date(app.appointment_date).toLocaleDateString('en-CA');
            const isSameDay = appointmentDateString === selectedDateString;
            return isAccepted && isSameDay;
        });
    }, [allAppointments, selectedDate]);

    // ✅ BƯỚC 4: HÀM XỬ LÝ CHECK-IN (logic này đã đúng)
    const handleCheckIn = (appointment: PopulatedAppointment) => {
        if (isCheckingIn) return;
        setCheckingInId(appointment._id);
        checkIn(appointment, {
            onSettled: () => setCheckingInId(null),
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-destructive">
                <AlertCircle className="mr-2 h-6 w-6" />
                <p>Lỗi: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bàn làm việc Lễ tân</CardTitle>
                    <CardDescription>
                        Chỉ hiển thị các lịch hẹn <Badge variant="default">Đã duyệt</Badge> cho ngày được chọn để làm thủ tục check-in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold mb-4">Chọn ngày</h3>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">
                                Lịch hẹn cho ngày {selectedDate.toLocaleDateString('vi-VN')}
                            </h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bệnh nhân</TableHead>
                                            <TableHead>Giờ hẹn</TableHead>
                                            <TableHead>Bác sĩ</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : appointmentsToShow.length > 0 ? (
                                            appointmentsToShow.map((app) => (
                                                <TableRow key={app._id}>
                                                    <TableCell className="font-medium">{`${app.firstName} ${app.lastName}`}</TableCell>
                                                    <TableCell>{new Date(app.appointment_date).toLocaleTimeString('vi-VN')}</TableCell>
                                                    <TableCell>
                                                        {app.doctor
                                                            ? `BS. ${app.doctor.firstName} ${app.doctor.lastName}`
                                                            : 'BS. Unknown'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCheckIn(app)}
                                                            disabled={isCheckingIn && checkingInId === app._id}
                                                        >
                                                            {isCheckingIn && checkingInId === app._id
                                                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                : <UserCheck className="mr-2 h-4 w-4" />
                                                            }
                                                            Check-in
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    Không có lịch hẹn nào đã được duyệt cho ngày này.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReceptionDashboard;