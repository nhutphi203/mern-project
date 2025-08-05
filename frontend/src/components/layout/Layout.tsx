// src/components/layout/Layout.tsx
import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 HealthCare Center. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
