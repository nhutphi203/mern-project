// src/components/layout/Layout.tsx
import React from 'react';
import Header from './Header'; // Đổi tên import thành Header cho nhất quán

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            {/* Sửa lỗi: Thêm padding top (pt-20) để đẩy nội dung xuống dưới Header */}
            {/* Header có chiều cao là h-20 (5rem), nên ta thêm padding tương ứng */}
            <main className="flex-grow pt-20">{children}</main>

            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 HealthCare Center. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
