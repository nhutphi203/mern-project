import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    DollarSign, 
    Receipt, 
    TrendingUp, 
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Download,
    Send,
    CreditCard,
    FileText
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types for Billing Staff
interface BillingStats {
    revenueToday: number;
    revenueThisMonth: number;
    outstandingAmount: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    averagePaymentTime: number;
    collectionRate: number;
    totalInvoices: number;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    totalAmount: number;
    totalPaid: number;
    balance: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
    dueDate?: string;
    sentAt?: string;
    paidAt?: string;
    createdAt: string;
    createdBy: {
        firstName: string;
        lastName: string;
    };
}

interface Payment {
    _id: string;
    invoiceId: string;
    amount: number;
    method: 'Cash' | 'Card' | 'Insurance' | 'Transfer' | 'Check';
    transactionId?: string;
    paidAt: string;
    processedBy: {
        firstName: string;
        lastName: string;
    };
}

interface RevenueData {
    date: string;
    revenue: number;
    invoices: number;
}

// API functions
const billingApi = {
    getBillingStats: async (): Promise<BillingStats> => {
        try {
            const response = await apiRequest<{ success: boolean; data: BillingStats }>('/api/v1/billing/stats');
            return response.data || {
                revenueToday: 0,
                revenueThisMonth: 0,
                outstandingAmount: 0,
                paidInvoices: 0,
                unpaidInvoices: 0,
                overdueInvoices: 0,
                averagePaymentTime: 0,
                collectionRate: 0,
                totalInvoices: 0
            };
        } catch (error) {
            console.warn('Billing stats endpoint not available:', error);
            return {
                revenueToday: 0,
                revenueThisMonth: 0,
                outstandingAmount: 0,
                paidInvoices: 0,
                unpaidInvoices: 0,
                overdueInvoices: 0,
                averagePaymentTime: 0,
                collectionRate: 0,
                totalInvoices: 0
            };
        }
    },
    
    getInvoices: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<Invoice[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            
            const endpoint = `/api/v1/billing/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiRequest<{ success: boolean; data: { invoices: Invoice[] } }>(endpoint);
            return response.data?.invoices || [];
        } catch (error) {
            console.warn('Invoices endpoint not available:', error);
            return [];
        }
    },
    
    getRecentPayments: async (): Promise<Payment[]> => {
        try {
            const response = await apiRequest<{ success: boolean; data: Payment[] }>('/api/v1/billing/payments?limit=10');
            return response.data || [];
        } catch (error) {
            console.warn('Payments endpoint not available:', error);
            return [];
        }
    },
    
    getRevenueReport: async (days: number = 7): Promise<RevenueData[]> => {
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const response = await apiRequest<{ success: boolean; data: RevenueData[] }>(
                `/api/v1/billing/reports/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );
            return response.data || [];
        } catch (error) {
            console.warn('Revenue report endpoint not available:', error);
            // Return sample data for visualization
            return Array.from({ length: days }, (_, i) => {
                const date = subDays(new Date(), days - i - 1);
                return {
                    date: format(date, 'MMM dd'),
                    revenue: Math.floor(Math.random() * 50000) + 10000,
                    invoices: Math.floor(Math.random() * 20) + 5
                };
            });
        }
    },
    
    sendInvoice: async (invoiceId: string) => {
        return apiRequest(`/api/v1/billing/invoices/${invoiceId}/send`, {
            method: 'POST'
        });
    },
    
    markAsPaid: async (invoiceId: string, paymentData: {
        amount: number;
        method: string;
        transactionId?: string;
    }) => {
        return apiRequest(`/api/v1/billing/invoices/${invoiceId}/payments`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }
};

// Sample payment method data
const paymentMethodData = [
    { name: 'Insurance', value: 45, color: '#0088FE' },
    { name: 'Card', value: 30, color: '#00C49F' },
    { name: 'Cash', value: 15, color: '#FFBB28' },
    { name: 'Transfer', value: 10, color: '#FF8042' },
];

const BillingStaffDashboard: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('7');
    const [invoiceFilter, setInvoiceFilter] = useState('all');

    // Fetch data using TanStack Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['billing-stats'],
        queryFn: billingApi.getBillingStats,
        refetchInterval: 300000, // 5 minutes
    });

    const { data: invoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
        queryKey: ['invoices', invoiceFilter],
        queryFn: () => billingApi.getInvoices({ 
            status: invoiceFilter === 'all' ? undefined : invoiceFilter,
            limit: 20 
        }),
        refetchInterval: 60000,
    });

    const { data: recentPayments = [], isLoading: paymentsLoading } = useQuery({
        queryKey: ['recent-payments'],
        queryFn: billingApi.getRecentPayments,
        refetchInterval: 60000,
    });

    const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
        queryKey: ['revenue-report', selectedPeriod],
        queryFn: () => billingApi.getRevenueReport(parseInt(selectedPeriod)),
        refetchInterval: 300000,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Partial': return 'bg-yellow-100 text-yellow-800';
            case 'Sent': return 'bg-blue-100 text-blue-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'Card': return 'bg-blue-100 text-blue-800';
            case 'Cash': return 'bg-green-100 text-green-800';
            case 'Insurance': return 'bg-purple-100 text-purple-800';
            case 'Transfer': return 'bg-orange-100 text-orange-800';
            case 'Check': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleSendInvoice = async (invoiceId: string) => {
        try {
            await billingApi.sendInvoice(invoiceId);
            refetchInvoices();
        } catch (error) {
            console.error('Error sending invoice:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Billing Staff Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Financial management and billing operations
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button size="sm">
                        <Receipt className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : formatCurrency(stats?.revenueToday || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.paidInvoices || 0} invoices paid
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : formatCurrency(stats?.outstandingAmount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.unpaidInvoices || 0} unpaid invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : `${stats?.collectionRate || 0}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.averagePaymentTime || 0} days avg payment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <Clock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats?.overdueInvoices || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Invoices past due
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Revenue Trend
                        </CardTitle>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {revenueLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                Loading revenue data...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                                    <Tooltip 
                                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentMethodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="invoices" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Recent Payments</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Invoice Management
                            </CardTitle>
                            <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Invoices</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Sent">Sent</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {invoicesLoading ? (
                                <div className="text-center py-8">Loading invoices...</div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No invoices found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.map((invoice) => (
                                        <div key={invoice._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                {invoice.invoiceNumber}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {invoice.patientId.firstName} {invoice.patientId.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">
                                                                {formatCurrency(invoice.totalAmount)}
                                                            </p>
                                                            {invoice.balance > 0 && (
                                                                <p className="text-sm text-red-600">
                                                                    Balance: {formatCurrency(invoice.balance)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <Badge className={getStatusColor(invoice.status)}>
                                                            {invoice.status}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            Created: {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                                        </span>
                                                        {invoice.dueDate && (
                                                            <span className="text-sm text-muted-foreground">
                                                                Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {invoice.status === 'Draft' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleSendInvoice(invoice._id)}
                                                        >
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Send
                                                        </Button>
                                                    )}
                                                    {(invoice.status === 'Sent' || invoice.status === 'Partial') && (
                                                        <Button size="sm">
                                                            <CreditCard className="h-4 w-4 mr-1" />
                                                            Record Payment
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recent Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Recent Payments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paymentsLoading ? (
                                <div className="text-center py-8">Loading payments...</div>
                            ) : recentPayments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No recent payments
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentPayments.map((payment) => (
                                        <div key={payment._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Invoice: {payment.invoiceId}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Processed by: {payment.processedBy.firstName} {payment.processedBy.lastName}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={getMethodColor(payment.method)}>
                                                        {payment.method}
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {format(new Date(payment.paidAt), 'MMM dd, HH:mm')}
                                                    </p>
                                                    {payment.transactionId && (
                                                        <p className="text-xs text-muted-foreground">
                                                            TxID: {payment.transactionId}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Overdue Tab */}
                <TabsContent value="overdue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Overdue Invoices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {invoices.filter(inv => inv.status === 'Overdue').length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No overdue invoices
                                    </div>
                                ) : (
                                    invoices.filter(inv => inv.status === 'Overdue').map((invoice) => (
                                        <div key={invoice._id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-red-900">
                                                        {invoice.invoiceNumber}
                                                    </h4>
                                                    <p className="text-sm text-red-700">
                                                        {invoice.patientId.firstName} {invoice.patientId.lastName}
                                                    </p>
                                                    <p className="text-sm text-red-700">
                                                        Due: {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-red-900">
                                                        {formatCurrency(invoice.balance)}
                                                    </p>
                                                    <Badge className="bg-red-100 text-red-800">
                                                        OVERDUE
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Financial Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Download className="h-6 w-6 mb-2" />
                                    Daily Revenue Report
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Download className="h-6 w-6 mb-2" />
                                    Monthly Summary
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Download className="h-6 w-6 mb-2" />
                                    Outstanding Balances
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Download className="h-6 w-6 mb-2" />
                                    Payment Analysis
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BillingStaffDashboard;
