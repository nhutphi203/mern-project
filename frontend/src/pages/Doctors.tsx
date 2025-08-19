// src/pages/Doctors.tsx (Refactored to use real API)

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserSearch, AlertTriangle } from 'lucide-react';
import { useDoctors } from '@/hooks/useDoctors'; // <-- 1. Import hook mới để lấy dữ liệu thật
import type { User } from '@/api/types'; // <-- 2. Import type User thật từ API

// Component Card cho từng bác sĩ, sử dụng đúng cấu trúc dữ liệu từ `User` type
export const DoctorCard = ({ doctor }: { doctor: User }) => (
    <Card className="text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <img
            src={`https://ui-avatars.com/api/?name=${doctor.firstName}&background=random`}
            alt={`${doctor.firstName} ${doctor.lastName}`}
            className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-emerald-100 mt-4"
        />
        <CardHeader className="flex-grow pb-2">
            <CardTitle className="text-lg text-emerald-700">{`Dr. ${doctor.firstName} ${doctor.lastName}`}</CardTitle>
            <p className="text-sm text-muted-foreground">{doctor.doctorDepartment}</p>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-slate-500 mb-2">Chuyên khoa:</p>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800">
                {doctor.specialization || 'Chưa cập nhật'}
            </Badge>
        </CardContent>
    </Card>
);

// Component hiển thị khi đang tải dữ liệu
const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
        ))}
    </div>
);

// Component chính của trang Doctors
const Doctors = () => {
    // 3. Sử dụng hook mới để lấy dữ liệu, không cần useEffect/useState thủ công
    const { doctors, isLoading, error } = useDoctors();
    const [searchTerm, setSearchTerm] = useState('');

    // Lọc danh sách bác sĩ dựa trên ô tìm kiếm
    const filteredDoctors = useMemo(() => {
        if (!doctors) return [];
        // 4. Lọc theo đúng trường dữ liệu của backend
        return doctors.filter(doctor =>
            `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.doctorDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header và ô tìm kiếm */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-gray-800">Meet Our Doctors</h1>
                <p className="mt-2 text-lg text-muted-foreground">Dedicated professionals committed to your health.</p>
                <div className="mt-6 max-w-lg mx-auto relative">
                    <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Search by name or department..."
                        className="w-full pl-12 h-12 rounded-full text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 5. Hiển thị trạng thái loading, error, hoặc danh sách bác sĩ */}
            {isLoading && <LoadingSkeleton />}

            {error && (
                <div className="text-center py-20 text-red-600 bg-red-50 p-6 rounded-lg">
                    <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold">Failed to load doctors</h3>
                    <p className="text-muted-foreground mt-2">Could not fetch data from the server. Please try again later.</p>
                </div>
            )}

            {!isLoading && !error && filteredDoctors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredDoctors.map(doctor => (
                        <DoctorCard key={doctor._id} doctor={doctor} />
                    ))}
                </div>
            )}

            {!isLoading && !error && filteredDoctors.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No doctors found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Doctors;
