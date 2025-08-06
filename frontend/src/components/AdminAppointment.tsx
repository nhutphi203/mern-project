// src/pages/AdminAppointments.tsx
import React from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppointmentsList from '@/components/AppointmentsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, Stethoscope } from 'lucide-react';

const AdminAppointmentsPage: React.FC = () => {
    const { data: currentUser, isLoading } = useCurrentUser();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-28 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center">Loading...</div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Redirect if not admin
    if (!currentUser?.user || currentUser.user.role !== 'Admin') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-28 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <p>Access denied. Admin privileges required.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="pt-28 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <CalendarCheck className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Appointment Management
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage and monitor all appointments across departments
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <CalendarCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Today's Appointments
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            View scheduled appointments for today
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Patient Records
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Access patient profiles and history
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <Stethoscope className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Doctor Schedule
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Manage doctor availability
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Appointments List */}
                    <AppointmentsList />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminAppointmentsPage;