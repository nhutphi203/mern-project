import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Users, 
    Activity, 
    BarChart3, 
    Shield, 
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Settings
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types for Lab Supervisor
interface TeamMember {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: 'Online' | 'Offline' | 'Break';
    testsCompleted: number;
    accuracy: number;
    avgTurnaroundTime: number;
    workload: number;
}

interface LabSupervisorStats {
    totalStaff: number;
    activeStaff: number;
    totalTestsToday: number;
    completionRate: number;
    rejectionRate: number;
    avgTurnaroundTime: number;
    qualityScore: number;
    totalTests: number;
    pendingTests: number;
    completedTests: number;
    cancelledTests: number;
}

interface DepartmentPerformance {
    department: string;
    testsCompleted: number;
    avgTurnaroundTime: number;
    accuracy: number;
    workload: number;
}

interface QualityMetric {
    _id: string;
    testId: string;
    testName: string;
    patientName: string;
    technicianName: string;
    flaggedReason: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Pending Review' | 'Resolved' | 'Escalated';
    createdAt: string;
}

// API functions
const labSupervisorApi = {
    getTeamPerformance: async (): Promise<TeamMember[]> => {
        try {
            const response = await apiRequest<{ success: boolean; data: TeamMember[] }>('/api/v1/lab/team-performance');
            return response.data || [];
        } catch (error) {
            console.warn('Team performance endpoint not available:', error);
            return [];
        }
    },
    
    getSupervisorStats: async (): Promise<LabSupervisorStats> => {
        try {
            const response = await apiRequest<{ success: boolean; data: LabSupervisorStats }>('/api/v1/lab/supervisor-stats');
            return response.data || {
                totalStaff: 0,
                activeStaff: 0,
                totalTestsToday: 0,
                completionRate: 0,
                rejectionRate: 0,
                avgTurnaroundTime: 0,
                qualityScore: 0,
                totalTests: 0,
                pendingTests: 0,
                completedTests: 0,
                cancelledTests: 0
            };
        } catch (error) {
            // Fallback to regular lab stats if supervisor-specific endpoint not available
            try {
                const response = await apiRequest<{ success: boolean; data: {
                    completedToday?: number;
                    completionRate?: number;
                    averageTurnaroundTime?: number;
                    totalTests?: number;
                    pendingTests?: number;
                } }>('/api/v1/lab/stats');
                return {
                    totalStaff: 8,
                    activeStaff: 6,
                    totalTestsToday: response.data?.completedToday || 0,
                    completionRate: response.data?.completionRate || 0,
                    rejectionRate: 2.1,
                    avgTurnaroundTime: response.data?.averageTurnaroundTime || 0,
                    qualityScore: 97.5,
                    totalTests: response.data?.totalTests || 0,
                    pendingTests: response.data?.pendingTests || 0,
                    completedTests: response.data?.completedToday || 0,
                    cancelledTests: 0
                };
            } catch (fallbackError) {
                console.warn('Lab stats endpoint not available:', fallbackError);
                return {
                    totalStaff: 0,
                    activeStaff: 0,
                    totalTestsToday: 0,
                    completionRate: 0,
                    rejectionRate: 0,
                    avgTurnaroundTime: 0,
                    qualityScore: 0,
                    totalTests: 0,
                    pendingTests: 0,
                    completedTests: 0,
                    cancelledTests: 0
                };
            }
        }
    },
    
    getQualityFlags: async (): Promise<QualityMetric[]> => {
        try {
            const response = await apiRequest<{ success: boolean; data: QualityMetric[] }>('/api/v1/lab/quality-flags');
            return response.data || [];
        } catch (error) {
            console.warn('Quality flags endpoint not available:', error);
            return [];
        }
    },
    
    getDepartmentPerformance: async (): Promise<DepartmentPerformance[]> => {
        try {
            const response = await apiRequest<{ success: boolean; data: DepartmentPerformance[] }>('/api/v1/lab/department-performance');
            return response.data || [];
        } catch (error) {
            console.warn('Department performance endpoint not available:', error);
            return [];
        }
    }
};

// Sample data for charts when endpoints are not available
const sampleVolumeData = [
    { hour: '08:00', tests: 12 },
    { hour: '09:00', tests: 19 },
    { hour: '10:00', tests: 23 },
    { hour: '11:00', tests: 18 },
    { hour: '12:00', tests: 15 },
    { hour: '13:00', tests: 8 },
    { hour: '14:00', tests: 25 },
    { hour: '15:00', tests: 22 },
    { hour: '16:00', tests: 20 },
];

const sampleTestTypeData = [
    { name: 'Hematology', value: 35, color: '#0088FE' },
    { name: 'Chemistry', value: 28, color: '#00C49F' },
    { name: 'Microbiology', value: 20, color: '#FFBB28' },
    { name: 'Immunology', value: 17, color: '#FF8042' },
];

const LabSupervisorDashboard: React.FC = () => {
    // Fetch data using TanStack Query
    const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
        queryKey: ['team-performance'],
        queryFn: labSupervisorApi.getTeamPerformance,
        refetchInterval: 60000,
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['supervisor-stats'],
        queryFn: labSupervisorApi.getSupervisorStats,
        refetchInterval: 60000,
    });

    const { data: qualityFlags = [], isLoading: qualityLoading } = useQuery({
        queryKey: ['quality-flags'],
        queryFn: labSupervisorApi.getQualityFlags,
        refetchInterval: 300000, // 5 minutes
    });

    const { data: deptPerformance = [], isLoading: deptLoading } = useQuery({
        queryKey: ['department-performance'],
        queryFn: labSupervisorApi.getDepartmentPerformance,
        refetchInterval: 300000,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Online': return 'bg-green-100 text-green-800';
            case 'Break': return 'bg-yellow-100 text-yellow-800';
            case 'Offline': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Lab Supervisor Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Laboratory management and team oversight
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Lab Settings
                    </Button>
                    <Button size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.totalStaff || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeStaff || 0} currently active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tests Today</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.totalTestsToday || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.completionRate || 0}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                        <Shield className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : `${stats?.qualityScore || 0}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.rejectionRate || 0}% rejection rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg TAT</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : `${stats?.avgTurnaroundTime || 0}h`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Turnaround time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Test Volume Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sampleVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="tests" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Test Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sampleTestTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sampleTestTypeData.map((entry, index) => (
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
            <Tabs defaultValue="team" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="team">Team Performance</TabsTrigger>
                    <TabsTrigger value="quality">Quality Control</TabsTrigger>
                    <TabsTrigger value="department">Department View</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                {/* Team Performance Tab */}
                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Performance Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {teamLoading ? (
                                <div className="text-center py-8">Loading team data...</div>
                            ) : teamMembers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Team performance data not available
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {teamMembers.map((member) => (
                                        <div key={member._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">
                                                            {member.firstName} {member.lastName}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(member.status)}>
                                                    {member.status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {member.testsCompleted}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Tests Done</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {member.accuracy}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Accuracy</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {member.avgTurnaroundTime}h
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Avg TAT</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {member.workload}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Workload</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quality Control Tab */}
                <TabsContent value="quality" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Quality Control Flags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {qualityLoading ? (
                                <div className="text-center py-8">Loading quality data...</div>
                            ) : qualityFlags.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No quality issues flagged
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {qualityFlags.map((flag) => (
                                        <div key={flag._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{flag.testName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Patient: {flag.patientName} • Tech: {flag.technicianName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getSeverityColor(flag.severity)}>
                                                        {flag.severity}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {flag.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm bg-gray-50 p-2 rounded">
                                                {flag.flaggedReason}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Flagged: {format(new Date(flag.createdAt), 'MMM dd, HH:mm')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Department View Tab */}
                <TabsContent value="department" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deptLoading ? (
                                <div className="text-center py-8">Loading department data...</div>
                            ) : deptPerformance.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Department performance data not available
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {deptPerformance.map((dept, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-4">{dept.department}</h4>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {dept.testsCompleted}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Tests Completed</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {dept.accuracy}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Accuracy</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {dept.avgTurnaroundTime}h
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Avg TAT</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {dept.workload}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Workload</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                System Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-l-4 border-red-500 bg-red-50 p-4">
                                    <div className="flex items-center">
                                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                        <p className="font-medium text-red-800">Equipment Maintenance Due</p>
                                    </div>
                                    <p className="text-sm text-red-700 mt-1">
                                        Hematology analyzer requires scheduled maintenance
                                    </p>
                                </div>
                                
                                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                                    <div className="flex items-center">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                        <p className="font-medium text-yellow-800">High Volume Alert</p>
                                    </div>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Test volume is 120% above normal for this time
                                    </p>
                                </div>
                                
                                <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                                        <p className="font-medium text-blue-800">All Critical Tests On Track</p>
                                    </div>
                                    <p className="text-sm text-blue-700 mt-1">
                                        All STAT and urgent tests are within target TAT
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LabSupervisorDashboard;
