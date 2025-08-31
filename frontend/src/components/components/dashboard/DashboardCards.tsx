
// frontend/src/components/dashboard/DashboardCards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useAuth';
import { useLabQueue, useLabStats } from '@/hooks/useLab';
import { useInvoices, useBillingReports } from '@/hooks/useBilling';
import { Link } from 'react-router-dom';
import {
    TestTube,
    Microscope,
    Receipt,
    CreditCard,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

export const LabDashboardCards: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const userRole = currentUser?.user?.role;

    const { orders: labQueue, loading: queueLoading } = useLabQueue();
    const { stats: labStats, loading: statsLoading } = useLabStats();

    if (userRole === 'Lab Technician' || userRole === 'Admin') {
        const pendingTests = labQueue?.filter(order => order.status === 'Pending') || [];
        const inProgressTests = labQueue?.filter(order => order.status === 'InProgress') || [];
        const completedToday = labStats?.completedOrders || 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {queueLoading ? '...' : pendingTests.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tests awaiting processing
                        </p>
                        <Button asChild size="sm" className="mt-2">
                            <Link to="/lab/queue?status=Pending">View Queue</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {queueLoading ? '...' : inProgressTests.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently being processed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {statsLoading ? '...' : completedToday}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tests completed today
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (userRole === 'Doctor') {
        const recentResults = labQueue?.filter(order => order.status === 'Completed').slice(0, 5) || [];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className="h-5 w-5" />
                            Lab Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link to="/lab/orders/create">Create New Lab Order</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/lab/results">View Lab Results</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Lab Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentResults.length > 0 ? (
                            <div className="space-y-2">
                                {recentResults.map(result => (
                                    <div key={result._id} className="flex items-center justify-between p-2 border rounded">
                                        <span className="text-sm">{result.patientId?.firstName} {result.patientId?.lastName}</span>
                                        <Badge variant="secondary">Completed</Badge>
                                    </div>
                                ))}
                                <Button asChild variant="link" size="sm" className="w-full">
                                    <Link to="/lab/results">View All Results</Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent results</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
};

export const BillingDashboardCards: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const userRole = currentUser?.user?.role;

    const { invoices, loading: invoicesLoading } = useInvoices();
    const { generateReport } = useBillingReports();

    if (userRole === 'Admin' || userRole === 'Insurance Staff') {
        const pendingInvoices = invoices?.filter(inv => inv.status === 'Sent') || [];
        const overdueInvoices = invoices?.filter(inv => inv.status === 'Overdue') || [];
        const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) || 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {invoicesLoading ? '...' : pendingInvoices.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting payment
                        </p>
                        <Button asChild size="sm" className="mt-2">
                            <Link to="/billing/invoices?status=Sent">Review</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {invoicesLoading ? '...' : overdueInvoices.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Past due invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${invoicesLoading ? '...' : totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                {userRole === 'Insurance Staff' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Claims to Review</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {/* This would need a specific claims hook */}
                                12
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pending insurance claims
                            </p>
                            <Button asChild size="sm" className="mt-2">
                                <Link to="/billing/insurance">Review Claims</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    if (userRole === 'Patient') {
        const myInvoices = invoices?.filter(inv => inv.patientId._id === currentUser?.user?._id) || [];
        const unpaidAmount = myInvoices.reduce((sum, inv) => sum + inv.balance, 0);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            My Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-2">
                            ${unpaidAmount.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Outstanding balance</p>
                        <Button asChild className="w-full">
                            <Link to="/billing/my-invoices">View Bills</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/billing/payments">Make Payment</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/lab/results/my">View Lab Results</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
};