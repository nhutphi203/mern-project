// src/pages/Services.tsx
import React, { useEffect, useState } from 'react';
import { getServicesData } from '@/api/mockApi';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface Service {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getServicesData();
                setServices(result);
            } catch (error) {
                console.error("Failed to fetch services data:", error);
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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {renderSkeletons()}
                </div>
            </div>
        );
    }

    return (
        // Sửa lỗi: Bỏ class `bg-gray-50` để component nhận màu nền từ Layout cha
        <div className="bg-background text-foreground">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center mb-10 text-emerald-800 dark:text-emerald-300">Dịch vụ của chúng tôi</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
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
