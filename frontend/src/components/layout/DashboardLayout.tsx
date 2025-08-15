// frontend/src/components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from '@/components/ui/sonner';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { data: currentUser } = useCurrentUser();

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
};

export default DashboardLayout;
