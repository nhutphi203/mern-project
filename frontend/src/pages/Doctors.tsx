// src/pages/Doctors.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { getDoctorsData } from '@/api/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserSearch } from 'lucide-react';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    avatarUrl: string;
    availableDays: string[];
}

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDoctorsData();
                setDoctors(result);
            } catch (error) {
                console.error("Failed to fetch doctors data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="text-center p-4">
                <Skeleton className="w-28 h-28 rounded-full mx-auto" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center gap-2 flex-wrap">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
            </Card>
        ))
    );

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center mb-4 text-emerald-800">Đội ngũ Bác sĩ</h1>
                <p className="text-center text-lg text-muted-foreground mb-8">Gặp gỡ các chuyên gia tận tâm của chúng tôi.</p>

                <div className="max-w-md mx-auto mb-10">
                    <div className="relative">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm bác sĩ hoặc chuyên khoa..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {loading ? renderSkeletons() : filteredDoctors.map(doctor => (
                        <Card key={doctor.id} className="text-center p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <img src={doctor.avatarUrl} alt={doctor.name} className="w-28 h-28 rounded-full mx-auto border-4 border-emerald-100" />
                            <CardHeader className="flex-grow">
                                <CardTitle className="text-lg text-emerald-700">{doctor.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500 mb-2">Lịch làm việc:</p>
                                <div className="flex justify-center gap-1 flex-wrap">
                                    {doctor.availableDays.map(day => (
                                        <Badge key={day} variant="outline" className="bg-emerald-50 text-emerald-800">{day}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {!loading && filteredDoctors.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        Không tìm thấy bác sĩ nào phù hợp.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorsPage;
