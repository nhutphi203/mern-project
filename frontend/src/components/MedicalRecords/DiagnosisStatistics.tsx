import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    Activity,
    Calendar,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { DiagnosisAPI } from '@/api/medicalRecords';
import { useCurrentUser } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DiagnosisStats {
    totalDiagnoses: number;
    activeDiagnoses: number;
    resolvedDiagnoses: number;
    topDiagnoses: Array<{
        icd10Code: string;
        icd10Description: string;
        count: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        count: number;
    }>;
    statusDistribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
}

const DiagnosisStatistics: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const [stats, setStats] = useState<DiagnosisStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await DiagnosisAPI.getStatistics();
            if (response.success) {
                setStats(response.data);
            } else {
                setError('Failed to load diagnosis statistics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading statistics');
            console.error('Error loading diagnosis statistics:', err);
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
            'Active': 'bg-green-100 text-green-800',
            'Resolved': 'bg-blue-100 text-blue-800',
            'Under Treatment': 'bg-yellow-100 text-yellow-800',
            'Chronic': 'bg-orange-100 text-orange-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading diagnosis statistics...</p>
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
                                {error || 'Unable to load diagnosis statistics'}
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
                    <h2 className="text-2xl font-bold">Diagnosis Statistics</h2>
                    <p className="text-gray-600">
                        Overview of diagnosis trends and patterns
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
                            Total Diagnoses
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDiagnoses}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Cases
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.activeDiagnoses}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Resolved Cases
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.resolvedDiagnoses}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Resolution Rate
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalDiagnoses > 0
                                ? Math.round((stats.resolvedDiagnoses / stats.totalDiagnoses) * 100)
                                : 0
                            }%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
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
                                    <div key={diagnosis.icd10Code} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {diagnosis.icd10Code}
                                                </span>
                                                <Badge variant="outline">#{index + 1}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {diagnosis.icd10Description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                {diagnosis.count}
                                            </div>
                                            <div className="text-xs text-gray-500">cases</div>
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

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.statusDistribution && stats.statusDistribution.length > 0 ? (
                                stats.statusDistribution.map((status) => (
                                    <div key={status.status} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusBadge(status.status)}>
                                                    {status.status}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold">{status.count}</span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    ({status.percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${status.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
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
                        <CardTitle>Monthly Diagnosis Trends</CardTitle>
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
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DiagnosisStatistics;
