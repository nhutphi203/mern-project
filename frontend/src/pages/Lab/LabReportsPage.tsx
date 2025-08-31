// frontend/src/pages/Lab/LabReportsPage.tsx

import React, { useState, useMemo } from 'react';
import { useLabResults } from '@/hooks/useLab';
import { LabResult } from '@/api/lab.types';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Download,
    Filter,
    FileText,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Activity
} from 'lucide-react';

interface LabReportsPageProps {
    showPatientInfo?: boolean;
}

interface StatCard {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const LabReportsPage: React.FC<LabReportsPageProps> = ({
    showPatientInfo = true,
}) => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        endDate: new Date().toISOString().split('T')[0], // today
    });

    const [filters, setFilters] = useState({
        patientId: '',
        category: '',
        status: '',
    });

    // Load all results for reports
    const { results, loading, error, refetch } = useLabResults({ patientId: 'all' });

    // Filter results by date range and other criteria
    const filteredResults = useMemo(() => {
        if (!results) return [];

        return results.filter(result => {
            const resultDate = new Date(result.performedAt).toISOString().split('T')[0];
            const isInDateRange = resultDate >= dateRange.startDate && resultDate <= dateRange.endDate;

            const matchesPatient = !filters.patientId ||
                String(result.patientId).toLowerCase().includes(filters.patientId.toLowerCase());

            const matchesCategory = !filters.category ||
                (result.testId && result.testId.category &&
                    result.testId.category.toLowerCase().includes(filters.category.toLowerCase()));

            const matchesStatus = !filters.status || result.status === filters.status;

            return isInDateRange && matchesPatient && matchesCategory && matchesStatus;
        });
    }, [results, dateRange, filters]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalTests = filteredResults.length;
        const completedTests = filteredResults.filter(r => r.status === 'Completed').length;
        const abnormalTests = filteredResults.filter(r => r.result.flag !== 'Normal').length;
        const pendingTests = filteredResults.filter(r => r.status === 'Pending').length;
        const uniquePatients = new Set(filteredResults.map(r => r.patientId)).size;

        return {
            totalTests,
            completedTests,
            abnormalTests,
            pendingTests,
            uniquePatients,
            normalTests: totalTests - abnormalTests,
        };
    }, [filteredResults]);

    // Prepare chart data
    const chartData = useMemo(() => {
        // Status distribution
        const statusDistribution = filteredResults.reduce((acc, result) => {
            acc[result.status] = (acc[result.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Result flag distribution
        const flagDistribution = filteredResults.reduce((acc, result) => {
            acc[result.result.flag] = (acc[result.result.flag] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Category distribution
        const categoryDistribution = filteredResults.reduce((acc, result) => {
            if (result.testId && result.testId.category) {
                acc[result.testId.category] = (acc[result.testId.category] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Daily trends (last 7 days)
        const dailyTrends = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = filteredResults.filter(r =>
                new Date(r.performedAt).toISOString().split('T')[0] === dateStr
            ).length;
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                count,
            };
        }).reverse();

        return {
            statusDistribution,
            flagDistribution,
            categoryDistribution,
            dailyTrends,
        };
    }, [filteredResults]);

    const handleDateRangeChange = (field: string, value: string) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const exportToCSV = () => {
        const headers = [
            'Order ID', 'Patient ID', 'Test Name', 'Category', 'Result Value',
            'Unit', 'Flag', 'Reference Range', 'Status', 'Performed At', 'Technician'
        ];

        const csvData = filteredResults.map(result => [
            result.orderId,
            result.patientId,
            result.testId ? result.testId.testName : 'Unknown Test',
            result.testId ? result.testId.category : 'Unknown Category',
            result.result.value,
            result.result.unit || '',
            result.result.flag,
            result.referenceRange,
            result.status,
            new Date(result.performedAt).toLocaleDateString(),
            `${result.technicianId.firstName} ${result.technicianId.lastName}`
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const statCards: StatCard[] = [
        {
            title: 'Total Tests',
            value: stats.totalTests,
            icon: <FileText className="h-6 w-6" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
        },
        {
            title: 'Completed Tests',
            value: stats.completedTests,
            icon: <CheckCircle className="h-6 w-6" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
        },
        {
            title: 'Abnormal Results',
            value: stats.abnormalTests,
            icon: <AlertCircle className="h-6 w-6" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
        },
        {
            title: 'Pending Tests',
            value: stats.pendingTests,
            icon: <Clock className="h-6 w-6" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 border-yellow-200',
        },
        {
            title: 'Unique Patients',
            value: stats.uniquePatients,
            icon: <Users className="h-6 w-6" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200',
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-red-600 text-lg font-medium mb-2">Error Loading Report Data</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive laboratory analytics and reporting</p>
                    </div>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Patient Filter */}
                    {showPatientInfo && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                            <input
                                type="text"
                                value={filters.patientId}
                                onChange={(e) => handleFilterChange('patientId', e.target.value)}
                                placeholder="Filter by patient"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="Blood Chemistry">Blood Chemistry</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Immunology">Immunology</option>
                            <option value="Pathology">Pathology</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className={`p-6 rounded-lg border ${stat.bgColor}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={stat.color}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">Test Status Distribution</h3>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(chartData.statusDistribution).map(([status, count]) => {
                            const percentage = stats.totalTests > 0 ? ((count / stats.totalTests) * 100).toFixed(1) : '0';
                            const colors = {
                                'Completed': 'bg-green-500',
                                'Reviewed': 'bg-blue-500',
                                'Pending': 'bg-yellow-500',
                            };
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}></div>
                                        <span className="text-sm text-gray-600">{status}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Result Flag Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">Result Flag Distribution</h3>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(chartData.flagDistribution).map(([flag, count]) => {
                            const percentage = stats.totalTests > 0 ? ((count / stats.totalTests) * 100).toFixed(1) : '0';
                            const colors = {
                                'Normal': 'bg-green-500',
                                'High': 'bg-red-500',
                                'Low': 'bg-orange-500',
                                'Critical': 'bg-red-700',
                            };
                            return (
                                <div key={flag} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${colors[flag as keyof typeof colors] || 'bg-gray-500'}`}></div>
                                        <span className="text-sm text-gray-600">{flag}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Daily Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Daily Test Volume (Last 7 Days)</h3>
                </div>
                <div className="flex items-end space-x-2 h-32">
                    {chartData.dailyTrends.map((day, index) => {
                        const maxCount = Math.max(...chartData.dailyTrends.map(d => d.count), 1);
                        const height = (day.count / maxCount) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 mt-2 text-center">
                                    <div className="font-medium">{day.count}</div>
                                    <div>{day.date}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Tests by Category</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(chartData.categoryDistribution).map(([category, count]) => {
                        const percentage = stats.totalTests > 0 ? ((count / stats.totalTests) * 100).toFixed(1) : '0';
                        return (
                            <div key={category} className="p-4 border border-gray-200 rounded-lg">
                                <div className="text-sm font-medium text-gray-900 mb-1">{category}</div>
                                <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                                <div className="text-xs text-gray-500">{percentage}% of total tests</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Report */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-md font-medium text-gray-800 mb-2">Key Metrics</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Total tests performed: <strong>{stats.totalTests}</strong></li>
                            <li>• Completion rate: <strong>{stats.totalTests > 0 ? ((stats.completedTests / stats.totalTests) * 100).toFixed(1) : 0}%</strong></li>
                            <li>• Abnormal rate: <strong>{stats.totalTests > 0 ? ((stats.abnormalTests / stats.totalTests) * 100).toFixed(1) : 0}%</strong></li>
                            <li>• Unique patients served: <strong>{stats.uniquePatients}</strong></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-medium text-gray-800 mb-2">Report Period</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Start Date: <strong>{new Date(dateRange.startDate).toLocaleDateString()}</strong></li>
                            <li>• End Date: <strong>{new Date(dateRange.endDate).toLocaleDateString()}</strong></li>
                            <li>• Duration: <strong>{Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong></li>
                            <li>• Generated: <strong>{new Date().toLocaleDateString()}</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabReportsPage;
