// src/pages/About.tsx
import React, { useEffect, useState } from 'react';
import { getAboutData } from '@/api/mockApi';
import { Skeleton } from '@/components/ui/skeleton';

interface AboutData {
    title: string;
    content: string;
}

const About = () => {
    const [data, setData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAboutData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch about data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-12 w-1/2 mb-6" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-20">Thông tin đang được cập nhật.</div>;
    }

    return (
        // Sửa lỗi: Bỏ class `bg-white` để component nhận màu nền từ Layout cha
        <div className="bg-background text-foreground">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center mb-4 text-emerald-800 dark:text-emerald-300">{data.title}</h1>
                <p className="text-center text-lg text-muted-foreground mb-10">Tìm hiểu thêm về hành trình và giá trị của chúng tôi.</p>
                <div
                    className="prose dark:prose-invert lg:prose-xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>
        </div>
    );
};

export default About;
