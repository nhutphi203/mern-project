import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    TestTube, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Users, 
    BarChart3,
    FileText,
    Plus,
    Search
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import { format } from 'date-fns';

// Types based on existing lab APIs
interface LabTest {
    _id: string;
    testCode: string;
    testName: string;
    category: string;
    normalRange: {
        min?: number;
        max?: number;
        unit?: string;
        textRange?: string;
    };
    price: number;
    turnaroundTime: number;
    specimen: string;
    isActive: boolean;
}

interface LabOrder {
    _id: string;
    orderId: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        doctorDepartment: string;
    };
    tests: Array<{
        testId: LabTest;
        status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
        priority: 'Normal' | 'Urgent' | 'STAT';
        results?: {
            value: string;
            unit: string;
            isAbnormal: boolean;
            notes?: string;
        };
        completedAt?: string;
        completedBy?: string;
    }>;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

interface LabStats {
    pendingTests: number;
    completedToday: number;
    inProgressTests: number;
    averageTurnaroundTime: number;
    completionRate: number;
    totalTests: number;
}

// API functions
const labTechApi = {
    getLabQueue: async (): Promise<LabOrder[]> => {
        const response = await apiRequest<{ success: boolean; data: LabOrder[] }>('/api/v1/lab/queue');
        return response.data || [];
    },
    
    getLabStats: async (): Promise<LabStats> => {
        const response = await apiRequest<{ success: boolean; data: LabStats }>('/api/v1/lab/stats');
        return response.data || {
            pendingTests: 0,
            completedToday: 0,
            inProgressTests: 0,
            averageTurnaroundTime: 0,
            completionRate: 0,
            totalTests: 0
        };
    },
    
    updateTestStatus: async (orderId: string, testId: string, status: string) => {
        return apiRequest(`/api/v1/lab/orders/${orderId}/tests/${testId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },
    
    enterResults: async (orderId: string, testId: string, results: {
        value: string;
        unit: string;
        isAbnormal: boolean;
        notes?: string;
    }) => {
        return apiRequest('/api/v1/lab/results', {
            method: 'POST',
            body: JSON.stringify({ orderId, testId, ...results })
        });
    }
};

const LabTechnicianDashboard: React.FC = () => {
    // Fetch data using TanStack Query
    const { data: labQueue = [], isLoading: queueLoading, refetch: refetchQueue } = useQuery({
        queryKey: ['lab-queue'],
        queryFn: labTechApi.getLabQueue,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['lab-stats'],
        queryFn: labTechApi.getLabStats,
        refetchInterval: 60000, // Refresh every minute
    });

    // Filter functions
    const pendingTests = labQueue.filter(order => order.status === 'Pending');
    const inProgressTests = labQueue.filter(order => order.status === 'InProgress');
    const urgentTests = labQueue.filter(order => 
        order.tests.some(test => test.priority === 'Urgent' || test.priority === 'STAT')
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'STAT': return 'bg-red-100 text-red-800 border-red-200';
            case 'Urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'InProgress': return 'bg-yellow-100 text-yellow-800';
            case 'Pending': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStartTest = async (orderId: string, testId: string) => {
        try {
            await labTechApi.updateTestStatus(orderId, testId, 'InProgress');
            refetchQueue();
        } catch (error) {
            console.error('Error starting test:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Lab Technician Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Laboratory operations and test processing
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search Tests
                    </Button>
                    <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Reports
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
                        <TestTube className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.pendingTests || pendingTests.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tests awaiting processing
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.completedToday || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tests completed today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg TAT</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : `${stats?.averageTurnaroundTime || 0}h`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average turnaround time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Urgent Tests</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {urgentTests.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            High priority tests
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="queue" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="queue">Lab Queue</TabsTrigger>
                    <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                    <TabsTrigger value="urgent">Urgent</TabsTrigger>
                    <TabsTrigger value="completed">Completed Today</TabsTrigger>
                </TabsList>

                {/* Lab Queue Tab */}
                <TabsContent value="queue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TestTube className="h-5 w-5" />
                                Pending Tests Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {queueLoading ? (
                                <div className="text-center py-8">Loading queue...</div>
                            ) : pendingTests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No pending tests
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingTests.map((order) => (
                                        <div key={order._id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">
                                                        {order.patientId.firstName} {order.patientId.lastName}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Order ID: {order.orderId}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Doctor: Dr. {order.doctorId.firstName} {order.doctorId.lastName}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">
                                                        Ordered: {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                                                    </p>
                                                    <Badge variant="outline">
                                                        {order.tests.length} test(s)
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {order.tests.map((test, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{test.testId.testName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {test.testId.testCode} • {test.testId.specimen}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={getPriorityColor(test.priority)}>
                                                                {test.priority}
                                                            </Badge>
                                                            <Badge className={getStatusColor(test.status)}>
                                                                {test.status}
                                                            </Badge>
                                                            {test.status === 'Pending' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleStartTest(order._id, test.testId._id)}
                                                                >
                                                                    Start Test
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* In Progress Tab */}
                <TabsContent value="inprogress" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Tests In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {inProgressTests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No tests in progress
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {inProgressTests.map((order) => (
                                        <div key={order._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold">
                                                        {order.patientId.firstName} {order.patientId.lastName}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Order ID: {order.orderId}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="outline">
                                                    Enter Results
                                                </Button>
                                            </div>
                                            
                                            {order.tests.filter(test => test.status === 'InProgress').map((test, index) => (
                                                <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                                    <p className="font-medium">{test.testId.testName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Expected TAT: {test.testId.turnaroundTime} hours
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Urgent Tab */}
                <TabsContent value="urgent" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Urgent Tests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {urgentTests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No urgent tests
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {urgentTests.map((order) => (
                                        <div key={order._id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-red-900">
                                                        {order.patientId.firstName} {order.patientId.lastName}
                                                    </h4>
                                                    <p className="text-sm text-red-700">
                                                        Order ID: {order.orderId}
                                                    </p>
                                                </div>
                                                <Badge className="bg-red-100 text-red-800">
                                                    URGENT
                                                </Badge>
                                            </div>
                                            
                                            {order.tests.filter(test => 
                                                test.priority === 'Urgent' || test.priority === 'STAT'
                                            ).map((test, index) => (
                                                <div key={index} className="bg-white p-3 rounded border">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{test.testId.testName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {test.testId.testCode}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={getPriorityColor(test.priority)}>
                                                                {test.priority}
                                                            </Badge>
                                                            <Badge className={getStatusColor(test.status)}>
                                                                {test.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Completed Tab */}
                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Completed Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Completed tests will be shown here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LabTechnicianDashboard;
