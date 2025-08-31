// src/components/layout/Layout.tsx
import React from 'react';
import Header from './Header'; // Đổi tên import thành Header cho nhất quán
import { Sidebar } from 'lucide-react';
import ChatWidget from '../ChatWidget/ChatWidget';

interface LayoutProps {
    children: React.ReactNode;
    withSidebar?: boolean; // Thêm prop để quyết định có hiển thị Sidebar hay không

}

const Layout: React.FC<LayoutProps> = ({ children, withSidebar = false }) => {
    // Nếu withSidebar là true, render layout cho trang dashboard
    if (withSidebar) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                    {/* Có thể bỏ Footer trong layout dashboard nếu muốn */}
                </div>
                {/* AI Chat Widget */}
                <ChatWidget position="bottom-right" />
            </div>
        );
    }

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

            {/* AI Chat Widget for public users */}
            <ChatWidget position="bottom-right" />
        </div>
    );
};

export default Layout;
