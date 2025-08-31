// src/pages/Services.tsx (Phiên bản hoàn chỉnh)
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
// 1. Chỉ import từ file API thật
import { getAllServices, IServiceAPI } from '@/api/serviceApi';

// 2. Đổi tên interface để tránh nhầm lẫn (không bắt buộc nhưng nên làm)
// Hoặc bạn có thể dùng trực tiếp IServiceAPI từ file import
type ServiceType = IServiceAPI;

const Services = () => {
    // 3. Sử dụng kiểu dữ liệu đã được định nghĩa
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllServices();
                setServices(result);
            } catch (error) {
                console.error("Failed to fetch services data:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))
    );

    if (error) {
        return <div className="container mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-background text-foreground">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center mb-10 text-emerald-800 dark:text-emerald-300">Dịch vụ của chúng tôi</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? renderSkeletons() : services.map(service => (
                        <Card key={service.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <img src={service.imageUrl} alt={service.name} className="w-full h-48 object-cover" />
                            <CardHeader>
                                <CardTitle className="text-emerald-700 dark:text-emerald-400">{service.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{service.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                                    <Link to={`/book-appointment?service=${service.id}`}>Đặt lịch ngay</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;