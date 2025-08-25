import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    FileText,
    TrendingUp,
    Users,
    Calendar as CalendarIcon,
    Download,
    Filter,
    Activity,
    Heart,
    Stethoscope,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2,
    BarChart3
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { useMedicalRecordsSummary, useMedicalRecordsStats } from '@/hooks/useMedicalRecords';
import { useCurrentUser } from '@/hooks/useAuth';

const MedicalReports = () => {
    const { data: currentUser } = useCurrentUser();
    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });
    const [reportType, setReportType] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const {
        data: summaryData,
        loading: summaryLoading,
        error: summaryError
    } = useMedicalRecordsSummary();

    const {
        data: statsData,
        loading: statsLoading,
        error: statsError
    } = useMedicalRecordsStats();

    // Mock data for charts (replace with real data from API)
    const diagnosisData = [
        { name: 'Hypertension', count: 45, percentage: 25 },
        { name: 'Diabetes', count: 38, percentage: 21 },
        { name: 'Respiratory Infection', count: 32, percentage: 18 },
        { name: 'Cardiovascular Disease', count: 28, percentage: 16 },
        { name: 'Others', count: 35, percentage: 20 }
    ];

    const monthlyTrends = [
        { month: 'Jan', records: 120, resolved: 95, pending: 25 },
        { month: 'Feb', records: 135, resolved: 110, pending: 25 },
        { month: 'Mar', records: 148, resolved: 125, pending: 23 },
        { month: 'Apr', records: 162, resolved: 140, pending: 22 },
        { month: 'May', records: 178, resolved: 155, pending: 23 },
        { month: 'Jun', records: 195, resolved: 170, pending: 25 }
    ];

    const departmentStats = [
        { department: 'Cardiology', records: 45, avgTime: '2.3 days' },
        { department: 'Internal Medicine', records: 89, avgTime: '1.8 days' },
        { department: 'Emergency', records: 123, avgTime: '0.5 days' },
        { department: 'Pediatrics', records: 67, avgTime: '1.2 days' },
        { department: 'Surgery', records: 34, avgTime: '4.1 days' }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const handleExportReport = () => {
        toast.success('Report export functionality will be implemented');
    };

    const setPeriod = (period: string) => {
        setSelectedPeriod(period);
        const now = new Date();
        switch (period) {
            case 'week':
                setDateRange({
                    from: subDays(now, 7),
                    to: now
                });
                break;
            case 'month':
                setDateRange({
                    from: startOfMonth(now),
                    to: endOfMonth(now)
                });
                break;
            case 'quarter':
                setDateRange({
                    from: subDays(now, 90),
                    to: now
                });
                break;
            case 'year':
                setDateRange({
                    from: subDays(now, 365),
                    to: now
                });
                break;
        }
    };

    if (summaryLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading medical reports...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Medical Reports</h1>
                    <p className="text-muted-foreground">
                        Generate comprehensive medical reports and analytics
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExportReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Button>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">Report Type</label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="overview">Overview Report</SelectItem>
                                    <SelectItem value="diagnosis">Diagnosis Analysis</SelectItem>
                                    <SelectItem value="department">Department Statistics</SelectItem>
                                    <SelectItem value="trends">Trend Analysis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">Time Period</label>
                            <Select value={selectedPeriod} onValueChange={setPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Last Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="quarter">Last Quarter</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Custom Date Range</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from && dateRange.to
                                            ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                                            : 'Select dates'
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="range"
                                        selected={{
                                            from: dateRange.from,
                                            to: dateRange.to
                                        }}
                                        onSelect={(range) => {
                                            if (range?.from && range?.to) {
                                                setDateRange({ from: range.from, to: range.to });
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData?.totalRecords || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData?.activeCases || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently under treatment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData?.resolvedToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Cases completed today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData?.pendingReview || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Diagnosis Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Diagnoses</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Most common diagnoses this period
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={diagnosisData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {diagnosisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Trends</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Monthly record creation and resolution
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="records"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    name="Total Records"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="resolved"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    name="Resolved"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Department Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Medical records by department and average processing time
                    </p>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="records" fill="#8884d8" name="Total Records" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Records Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Latest medical records in the system
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {summaryData && summaryData.length > 0 ? (
                            summaryData.slice(0, 10).map((record) => (
                                <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="font-medium">
                                                {record.patientName || `Patient ID: ${record.patientId}` || 'Unknown Patient'}
                                            </h3>
                                            <Badge variant={
                                                record.status === 'Resolved' ? 'default' :
                                                    record.status === 'Under Treatment' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {record.status}
                                            </Badge>
                                            <Badge variant={
                                                record.priority === 'High' ? 'destructive' :
                                                    record.priority === 'Medium' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {record.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {record.diagnosis || 'No diagnosis recorded'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Chief Complaint: {record.chiefComplaint || 'Not specified'}
                                        </p>
                                        {record.icd10Code && (
                                            <Badge variant="outline" className="text-xs">
                                                {record.icd10Code}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        <p>Dr. {record.doctor || 'Unknown Doctor'}</p>
                                        <p>{format(new Date(record.lastUpdated), 'MMM dd, yyyy')}</p>
                                        <Button variant="ghost" size="sm" className="mt-2">
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    No Recent Records
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    No medical records found for the selected period.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MedicalReports;
