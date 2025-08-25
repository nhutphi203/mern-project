import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Shield, 
    FileCheck, 
    Clock, 
    AlertCircle,
    CheckCircle,
    XCircle,
    DollarSign,
    TrendingUp,
    Phone,
    Mail,
    FileText,
    Search,
    Download
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import { format, subDays, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Types for Insurance Staff
interface InsuranceStats {
    claimsToday: number;
    claimsPending: number;
    claimsApproved: number;
    claimsDenied: number;
    totalClaimValue: number;
    averageProcessingTime: number;
    approvalRate: number;
    preAuthsToday: number;
    preAuthsPending: number;
}

interface Claim {
    _id: string;
    claimNumber: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        dateOfBirth: string;
    };
    providerId: {
        firstName: string;
        lastName: string;
        specialization: string;
    };
    insurancePolicy: {
        policyNumber: string;
        provider: string;
        type: string;
        coverageLimit: number;
        deductible: number;
        copayment: number;
    };
    serviceDate: string;
    services: Array<{
        code: string;
        description: string;
        billedAmount: number;
        allowedAmount: number;
        copay: number;
        deductible: number;
    }>;
    totalBilled: number;
    totalAllowed: number;
    totalPaid: number;
    patientResponsibility: number;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Denied' | 'Partial' | 'Paid';
    submittedAt: string;
    reviewedAt?: string;
    paidAt?: string;
    denialReason?: string;
    reviewNotes?: string;
    diagnosisCodes: string[];
    procedureCodes: string[];
}

interface PreAuthorization {
    _id: string;
    authNumber: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    providerId: {
        firstName: string;
        lastName: string;
        specialization: string;
    };
    requestedService: {
        code: string;
        description: string;
        estimatedCost: number;
    };
    urgency: 'Routine' | 'Urgent' | 'Emergency';
    status: 'Pending' | 'Approved' | 'Denied' | 'Expired';
    requestedAt: string;
    responseDate?: string;
    expiryDate?: string;
    approvedAmount?: number;
    conditions?: string;
    denialReason?: string;
}

interface ClaimTrend {
    date: string;
    submitted: number;
    approved: number;
    denied: number;
    amount: number;
}

// API functions
const insuranceApi = {
    getInsuranceStats: async (): Promise<InsuranceStats> => {
        try {
            const response = await apiRequest<{ success: boolean; data: InsuranceStats }>('/api/v1/insurance/stats');
            return response.data || {
                claimsToday: 0,
                claimsPending: 0,
                claimsApproved: 0,
                claimsDenied: 0,
                totalClaimValue: 0,
                averageProcessingTime: 0,
                approvalRate: 0,
                preAuthsToday: 0,
                preAuthsPending: 0
            };
        } catch (error) {
            console.warn('Insurance stats endpoint not available:', error);
            return {
                claimsToday: 0,
                claimsPending: 0,
                claimsApproved: 0,
                claimsDenied: 0,
                totalClaimValue: 0,
                averageProcessingTime: 0,
                approvalRate: 0,
                preAuthsToday: 0,
                preAuthsPending: 0
            };
        }
    },
    
    getClaims: async (params?: {
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
    }): Promise<Claim[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.priority) queryParams.append('priority', params.priority);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            
            const endpoint = `/api/v1/insurance/claims${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiRequest<{ success: boolean; data: { claims: Claim[] } }>(endpoint);
            return response.data?.claims || [];
        } catch (error) {
            console.warn('Claims endpoint not available:', error);
            return [];
        }
    },
    
    getPreAuthorizations: async (params?: {
        status?: string;
        urgency?: string;
    }): Promise<PreAuthorization[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.urgency) queryParams.append('urgency', params.urgency);
            
            const endpoint = `/api/v1/insurance/pre-auth${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiRequest<{ success: boolean; data: PreAuthorization[] }>(endpoint);
            return response.data || [];
        } catch (error) {
            console.warn('Pre-auth endpoint not available:', error);
            return [];
        }
    },
    
    getClaimTrends: async (days: number = 7): Promise<ClaimTrend[]> => {
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const response = await apiRequest<{ success: boolean; data: ClaimTrend[] }>(
                `/api/v1/insurance/reports/trends?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );
            return response.data || [];
        } catch (error) {
            console.warn('Claim trends endpoint not available:', error);
            // Return sample data for visualization
            return Array.from({ length: days }, (_, i) => {
                const date = subDays(new Date(), days - i - 1);
                const submitted = Math.floor(Math.random() * 30) + 10;
                const approved = Math.floor(submitted * 0.8);
                const denied = submitted - approved;
                return {
                    date: format(date, 'MMM dd'),
                    submitted,
                    approved,
                    denied,
                    amount: Math.floor(Math.random() * 500000) + 100000
                };
            });
        }
    },
    
    updateClaimStatus: async (claimId: string, status: string, notes?: string, denialReason?: string) => {
        return apiRequest(`/api/v1/insurance/claims/${claimId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes, denialReason })
        });
    },
    
    updatePreAuth: async (preAuthId: string, status: string, approvedAmount?: number, conditions?: string, denialReason?: string) => {
        return apiRequest(`/api/v1/insurance/pre-auth/${preAuthId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, approvedAmount, conditions, denialReason })
        });
    }
};

// Sample claim status data
const claimStatusData = [
    { name: 'Approved', value: 65, color: '#00C49F' },
    { name: 'Under Review', value: 20, color: '#FFBB28' },
    { name: 'Denied', value: 10, color: '#FF8042' },
    { name: 'Partial', value: 5, color: '#8884D8' },
];

const InsuranceStaffDashboard: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('7');
    const [claimFilter, setClaimFilter] = useState('all');
    const [preAuthFilter, setPreAuthFilter] = useState('all');

    // Fetch data using TanStack Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['insurance-stats'],
        queryFn: insuranceApi.getInsuranceStats,
        refetchInterval: 300000, // 5 minutes
    });

    const { data: claims = [], isLoading: claimsLoading, refetch: refetchClaims } = useQuery({
        queryKey: ['claims', claimFilter],
        queryFn: () => insuranceApi.getClaims({ 
            status: claimFilter === 'all' ? undefined : claimFilter,
            limit: 20 
        }),
        refetchInterval: 60000,
    });

    const { data: preAuths = [], isLoading: preAuthsLoading, refetch: refetchPreAuths } = useQuery({
        queryKey: ['pre-auths', preAuthFilter],
        queryFn: () => insuranceApi.getPreAuthorizations({
            status: preAuthFilter === 'all' ? undefined : preAuthFilter
        }),
        refetchInterval: 60000,
    });

    const { data: trendData = [], isLoading: trendLoading } = useQuery({
        queryKey: ['claim-trends', selectedPeriod],
        queryFn: () => insuranceApi.getClaimTrends(parseInt(selectedPeriod)),
        refetchInterval: 300000,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Denied': return 'bg-red-100 text-red-800';
            case 'Under Review': return 'bg-yellow-100 text-yellow-800';
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'Partial': return 'bg-orange-100 text-orange-800';
            case 'Paid': return 'bg-gray-100 text-gray-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'Emergency': return 'bg-red-100 text-red-800';
            case 'Urgent': return 'bg-orange-100 text-orange-800';
            case 'Routine': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getDaysOld = (date: string) => {
        return differenceInDays(new Date(), new Date(date));
    };

    const handleUpdateClaimStatus = async (claimId: string, newStatus: string) => {
        try {
            await insuranceApi.updateClaimStatus(claimId, newStatus);
            refetchClaims();
        } catch (error) {
            console.error('Error updating claim status:', error);
        }
    };

    const handleUpdatePreAuth = async (preAuthId: string, newStatus: string) => {
        try {
            await insuranceApi.updatePreAuth(preAuthId, newStatus);
            refetchPreAuths();
        } catch (error) {
            console.error('Error updating pre-auth status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Insurance Staff Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Claims processing and pre-authorization management
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Claims
                    </Button>
                    <Button size="sm">
                        <FileCheck className="h-4 w-4 mr-2" />
                        New Pre-Auth
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Claims Today</CardTitle>
                        <FileCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.claimsToday || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.claimsPending || 0} pending review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : `${stats?.approvalRate || 0}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.claimsApproved || 0} approved today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Claim Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : formatCurrency(stats?.totalClaimValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg processing: {stats?.averageProcessingTime || 0} days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pre-Authorizations</CardTitle>
                        <Shield className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.preAuthsToday || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.preAuthsPending || 0} pending review
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
                            Claims Trend
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
                        {trendLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                Loading trend data...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="submitted" stroke="#8884d8" name="Submitted" />
                                    <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="Approved" />
                                    <Line type="monotone" dataKey="denied" stroke="#ffc658" name="Denied" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            Claim Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={claimStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {claimStatusData.map((entry, index) => (
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
            <Tabs defaultValue="claims" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="claims">Claims Review</TabsTrigger>
                    <TabsTrigger value="pre-auth">Pre-Authorizations</TabsTrigger>
                    <TabsTrigger value="coverage">Coverage Verification</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Claims Tab */}
                <TabsContent value="claims" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5" />
                                Claims Processing Queue
                            </CardTitle>
                            <Select value={claimFilter} onValueChange={setClaimFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Claims</SelectItem>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Denied">Denied</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {claimsLoading ? (
                                <div className="text-center py-8">Loading claims...</div>
                            ) : claims.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No claims found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {claims.map((claim) => (
                                        <div key={claim._id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                Claim #{claim.claimNumber}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {claim.patientId.firstName} {claim.patientId.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Provider: Dr. {claim.providerId.firstName} {claim.providerId.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">
                                                                Billed: {formatCurrency(claim.totalBilled)}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Allowed: {formatCurrency(claim.totalAllowed)}
                                                            </p>
                                                            <p className="text-sm text-green-600">
                                                                Paid: {formatCurrency(claim.totalPaid)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-medium mb-1">Insurance Policy:</h5>
                                                        <div className="text-sm text-muted-foreground">
                                                            <p>{claim.insurancePolicy.provider} - {claim.insurancePolicy.policyNumber}</p>
                                                            <p>Type: {claim.insurancePolicy.type} | Deductible: {formatCurrency(claim.insurancePolicy.deductible)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-medium mb-1">Services:</h5>
                                                        <div className="space-y-1">
                                                            {claim.services.slice(0, 2).map((service, index) => (
                                                                <div key={index} className="text-sm flex justify-between">
                                                                    <span>{service.code} - {service.description}</span>
                                                                    <span>{formatCurrency(service.billedAmount)}</span>
                                                                </div>
                                                            ))}
                                                            {claim.services.length > 2 && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    +{claim.services.length - 2} more services
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <Badge className={getStatusColor(claim.status)}>
                                                            {claim.status}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            Service Date: {format(new Date(claim.serviceDate), 'MMM dd, yyyy')}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {getDaysOld(claim.submittedAt)} days old
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col space-y-2">
                                                    {claim.status === 'Submitted' && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => handleUpdateClaimStatus(claim._id, 'Under Review')}
                                                        >
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            Start Review
                                                        </Button>
                                                    )}
                                                    {claim.status === 'Under Review' && (
                                                        <div className="flex flex-col space-y-1">
                                                            <Button 
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleUpdateClaimStatus(claim._id, 'Approved')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleUpdateClaimStatus(claim._id, 'Denied')}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Deny
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Phone className="h-4 w-4 mr-1" />
                                                        Contact
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

                {/* Pre-Authorizations Tab */}
                <TabsContent value="pre-auth" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Pre-Authorization Requests
                            </CardTitle>
                            <Select value={preAuthFilter} onValueChange={setPreAuthFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Requests</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Denied">Denied</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {preAuthsLoading ? (
                                <div className="text-center py-8">Loading pre-authorizations...</div>
                            ) : preAuths.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No pre-authorization requests found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {preAuths.map((preAuth) => (
                                        <div key={preAuth._id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                Auth #{preAuth.authNumber}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {preAuth.patientId.firstName} {preAuth.patientId.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Requesting: Dr. {preAuth.providerId.firstName} {preAuth.providerId.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">
                                                                {formatCurrency(preAuth.requestedService.estimatedCost)}
                                                            </p>
                                                            {preAuth.approvedAmount && (
                                                                <p className="text-sm text-green-600">
                                                                    Approved: {formatCurrency(preAuth.approvedAmount)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-medium mb-1">Requested Service:</h5>
                                                        <p className="text-sm text-muted-foreground">
                                                            {preAuth.requestedService.code} - {preAuth.requestedService.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <Badge className={getStatusColor(preAuth.status)}>
                                                            {preAuth.status}
                                                        </Badge>
                                                        <Badge className={getUrgencyColor(preAuth.urgency)}>
                                                            {preAuth.urgency}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            Requested: {format(new Date(preAuth.requestedAt), 'MMM dd, yyyy')}
                                                        </span>
                                                        {preAuth.expiryDate && (
                                                            <span className="text-sm text-muted-foreground">
                                                                Expires: {format(new Date(preAuth.expiryDate), 'MMM dd, yyyy')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {preAuth.denialReason && (
                                                        <div className="mt-2 p-2 bg-red-50 rounded">
                                                            <p className="text-sm text-red-800">
                                                                Denial Reason: {preAuth.denialReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col space-y-2">
                                                    {preAuth.status === 'Pending' && (
                                                        <div className="flex flex-col space-y-1">
                                                            <Button 
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleUpdatePreAuth(preAuth._id, 'Approved')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleUpdatePreAuth(preAuth._id, 'Denied')}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Deny
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Details
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

                {/* Coverage Verification Tab */}
                <TabsContent value="coverage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Coverage Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Insurance Coverage Verification
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Verify patient insurance coverage and benefits
                                    </p>
                                    <Button>
                                        <Search className="h-4 w-4 mr-2" />
                                        Verify Coverage
                                    </Button>
                                </div>
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
                                Insurance Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <FileCheck className="h-6 w-6 mb-2" />
                                    Claims Processing Report
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <TrendingUp className="h-6 w-6 mb-2" />
                                    Approval Rate Analysis
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <DollarSign className="h-6 w-6 mb-2" />
                                    Financial Impact Report
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Clock className="h-6 w-6 mb-2" />
                                    Processing Time Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InsuranceStaffDashboard;
