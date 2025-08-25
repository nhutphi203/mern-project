import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    Activity,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { InsuranceClaimsAPI } from '@/api/insurance';
import { useCurrentUser } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InsuranceStatistics {
    totalClaims: number;
    approvalRate: number;
    statusDistribution: Array<{
        _id: string;
        count: number;
    }>;
    financialSummary: {
        totalClaimAmount: number;
        totalApproved: number;
        totalPaid: number;
        avgClaimAmount: number;
        avgProcessingTime: number;
    };
    monthlyTrends: Array<{
        month: string;
        count: number;
        totalAmount: number;
    }>;
    topDiagnoses: Array<{
        _id: string;
        description: string;
        count: number;
    }>;
    topProcedures: Array<{
        _id: string;
        description: string;
        count: number;
        totalRevenue: number;
    }>;
}

const InsuranceClaimsStatistics: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const [stats, setStats] = useState<InsuranceStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await InsuranceClaimsAPI.getStatistics();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setError('Failed to load insurance statistics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading statistics');
            console.error('Error loading insurance statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatistics();
    }, []);

    const handleRefresh = () => {
        loadStatistics();
        toast.success('Statistics refreshed');
    };

    // Get status badge color
    const getStatusBadge = (status: string) => {
        const variants = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Submitted': 'bg-blue-100 text-blue-800',
            'Under Review': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Partially Approved': 'bg-orange-100 text-orange-800',
            'Denied': 'bg-red-100 text-red-800',
            'Paid': 'bg-emerald-100 text-emerald-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading insurance statistics...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Failed to Load Statistics
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {error || 'Unable to load insurance statistics'}
                            </p>
                            <Button onClick={loadStatistics}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Insurance Claims Statistics</h2>
                    <p className="text-gray-600">
                        Overview of claims performance and financial metrics
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Claims
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClaims}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Approval Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.approvalRate}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Claim Value
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ${stats.financialSummary.totalClaimAmount.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg Processing Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(stats.financialSummary.avgProcessingTime || 0)} days
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Claimed:</span>
                                <span className="text-lg font-semibold">
                                    ${stats.financialSummary.totalClaimAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Approved:</span>
                                <span className="text-lg font-semibold text-green-600">
                                    ${stats.financialSummary.totalApproved.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Paid:</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    ${stats.financialSummary.totalPaid.toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Average Claim Amount:</span>
                                    <span className="text-lg font-semibold">
                                        ${stats.financialSummary.avgClaimAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.statusDistribution && stats.statusDistribution.length > 0 ? (
                                stats.statusDistribution.map((status) => {
                                    const percentage = stats.totalClaims > 0
                                        ? Math.round((status.count / stats.totalClaims) * 100)
                                        : 0;

                                    return (
                                        <div key={status._id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusBadge(status._id)}>
                                                        {status._id}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold">{status.count}</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <Activity className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No status data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trends */}
            {stats.monthlyTrends && stats.monthlyTrends.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Claims Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {stats.monthlyTrends.map((trend) => (
                                <div key={trend.month} className="text-center">
                                    <div className="text-lg font-semibold">
                                        {trend.count}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {trend.month}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ${trend.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Diagnoses and Procedures */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Diagnoses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Common Diagnoses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topDiagnoses && stats.topDiagnoses.length > 0 ? (
                                stats.topDiagnoses.map((diagnosis, index) => (
                                    <div key={diagnosis._id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {diagnosis._id}
                                                </span>
                                                <Badge variant="outline">#{index + 1}</Badge>
                                            </div>
                                            {diagnosis.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {diagnosis.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                {diagnosis.count}
                                            </div>
                                            <div className="text-xs text-gray-500">claims</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No diagnosis data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Procedures */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Common Procedures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topProcedures && stats.topProcedures.length > 0 ? (
                                stats.topProcedures.map((procedure, index) => (
                                    <div key={procedure._id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                                                    {procedure._id}
                                                </span>
                                                <Badge variant="outline">#{index + 1}</Badge>
                                            </div>
                                            {procedure.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {procedure.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                {procedure.count}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ${procedure.totalRevenue.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <TrendingUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No procedure data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InsuranceClaimsStatistics;
