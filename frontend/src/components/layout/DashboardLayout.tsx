// src/components/layout/DashboardLayout.tsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* Header cố định trên cùng */}
            <div className="fixed top-0 left-0 right-0 z-[100]">
                <Header />
            </div>

            {/* Sidebar với hover effect - ẩn hoàn toàn */}
            <Sidebar />

            {/* Main content - không cần padding-left vì sidebar không chiếm chỗ */}
            <main
                className="pt-20 min-h-screen transition-all duration-300 ease-in-out"
                style={{
                    // Content luôn chiếm full width vì sidebar overlay
                    width: '100%',
                    paddingLeft: '0'
                }}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;