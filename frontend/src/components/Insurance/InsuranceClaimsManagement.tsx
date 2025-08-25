import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Eye,
    Send,
    Plus,
    FileText,
    Calendar,
    DollarSign,
    Activity,
    Loader2,
    Download,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCurrentUser } from '@/hooks/useAuth';
import {
    InsuranceClaimsAPI,
    type InsuranceClaim,
    type ApiResponse
} from '@/api/insurance';

const InsuranceClaimsManagement: React.FC = () => {
    const { data: currentUser } = useCurrentUser();

    // State management
    const [claims, setClaims] = useState<InsuranceClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);

    // Filters and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    // Dialog states
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

    // Action loading states
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Load claims
    const loadClaims = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Build filter parameters
            const params: {
                page: number;
                limit: number;
                sortBy: string;
                sortOrder: 'asc' | 'desc';
                claimNumber?: string;
                patientName?: string;
                status?: string;
                dateFrom?: string;
                dateTo?: string;
            } = {
                page: currentPage,
                limit: 10,
                sortBy: 'submissionDate',
                sortOrder: 'desc'
            };

            if (searchTerm) {
                if (searchTerm.startsWith('CLM-')) {
                    params.claimNumber = searchTerm;
                } else {
                    params.patientName = searchTerm;
                }
            }

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (dateFilter !== 'all') {
                const now = new Date();
                switch (dateFilter) {
                    case 'today': {
                        params.dateFrom = format(now, 'yyyy-MM-dd');
                        break;
                    }
                    case 'week': {
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        params.dateFrom = format(weekAgo, 'yyyy-MM-dd');
                        break;
                    }
                    case 'month': {
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        params.dateFrom = format(monthAgo, 'yyyy-MM-dd');
                        break;
                    }
                }
            }

            const response = await InsuranceClaimsAPI.getClaims(params);

            if (response.success && response.data) {
                setClaims(response.data);
                setPagination({
                    totalRecords: response.totalRecords || 0,
                    totalPages: response.totalPages || 0,
                    currentPage: response.page || 1
                });
            } else {
                setError('Failed to load claims');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading claims');
            console.error('Error loading claims:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, dateFilter, searchTerm]);

    useEffect(() => {
        loadClaims();
    }, [loadClaims]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        loadClaims();
    };

    // Submit claim to insurance
    const handleSubmitClaim = async (claimId: string) => {
        try {
            setSubmittingId(claimId);

            const response = await InsuranceClaimsAPI.submitClaim(claimId);

            if (response.success) {
                toast.success('Claim submitted successfully');
                loadClaims(); // Refresh the list
            } else {
                toast.error('Failed to submit claim');
            }
        } catch (error) {
            toast.error('Error submitting claim');
            console.error('Error submitting claim:', error);
        } finally {
            setSubmittingId(null);
            setIsSubmitDialogOpen(false);
        }
    };

    // View claim details
    const handleViewDetails = (claim: InsuranceClaim) => {
        setSelectedClaim(claim);
        setIsDetailDialogOpen(true);
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

    // Check permissions
    const canSubmitClaim = (claim: InsuranceClaim) => {
        if (!currentUser) return false;
        const userRole = currentUser.user.role;

        if (userRole === 'Admin') return true;
        if (userRole === 'Doctor') {
            const providerId = typeof claim.providerId === 'string'
                ? claim.providerId
                : claim.providerId._id;
            return providerId === currentUser.user._id;
        }

        return false;
    };

    const canViewClaim = (claim: InsuranceClaim) => {
        if (!currentUser) return false;
        const userRole = currentUser.user.role;

        if (['Admin', 'Insurance Staff'].includes(userRole)) return true;
        if (userRole === 'Doctor') {
            const providerId = typeof claim.providerId === 'string'
                ? claim.providerId
                : claim.providerId._id;
            return providerId === currentUser.user._id;
        }
        if (userRole === 'Patient') {
            const patientId = typeof claim.patientId === 'string'
                ? claim.patientId
                : claim.patientId._id;
            return patientId === currentUser.user._id;
        }

        return false;
    };

    if (loading && claims.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading insurance claims...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Insurance Claims Management</h1>
                    <p className="text-gray-600">
                        Manage and track insurance claims throughout their lifecycle
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={loadClaims}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {['Doctor', 'Admin'].includes(currentUser?.user.role || '') && (
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Claim
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Claim number or patient name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch} size="sm">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Denied">Denied</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All dates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Dates</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">Last 7 days</SelectItem>
                                    <SelectItem value="month">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Actions</label>
                            <Button variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Claims List */}
            <Card>
                <CardHeader>
                    <CardTitle>Claims ({pagination.totalRecords})</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {claims && claims.length > 0 ? (
                            <>
                                {claims.map((claim) => (
                                    <div key={claim._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-semibold text-lg">
                                                        {claim.claimNumber}
                                                    </h3>
                                                    <Badge className={getStatusBadge(claim.status)}>
                                                        {claim.status}
                                                    </Badge>
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    <p>
                                                        <strong>Patient:</strong> {
                                                            typeof claim.patientId === 'string'
                                                                ? 'Patient'
                                                                : `${claim.patientId.firstName} ${claim.patientId.lastName}`
                                                        }
                                                    </p>
                                                    <p>
                                                        <strong>Provider:</strong> {
                                                            typeof claim.providerId === 'string'
                                                                ? 'Doctor'
                                                                : `Dr. ${claim.providerId.firstName} ${claim.providerId.lastName}`
                                                        }
                                                    </p>
                                                    <p><strong>Amount:</strong> ${claim.totalClaimAmount.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <span>Service: {format(new Date(claim.serviceDate), 'MMM dd, yyyy')}</span>
                                                    <span>Submitted: {format(new Date(claim.submissionDate), 'MMM dd, yyyy')}</span>
                                                    {claim.approvedAmount > 0 && (
                                                        <span>Approved: ${claim.approvedAmount.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    {canViewClaim(claim) && (
                                                        <DropdownMenuItem onClick={() => handleViewDetails(claim)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canSubmitClaim(claim) && claim.status === 'Draft' && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedClaim(claim);
                                                                setIsSubmitDialogOpen(true);
                                                            }}
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Submit Claim
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canSubmitClaim(claim) && (
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Claim
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalRecords)} of {pagination.totalRecords} claims
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage <= 1}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm">
                                                Page {currentPage} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                                disabled={currentPage >= pagination.totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Claims Found</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                        ? 'No claims match your current filters.'
                                        : 'There are no insurance claims in the system yet.'
                                    }
                                </p>
                                <Button onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                    loadClaims();
                                }}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Submit Claim Confirmation Dialog */}
            <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Insurance Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to submit claim {selectedClaim?.claimNumber} to the insurance provider?
                            This action cannot be undone and the claim status will change to "Submitted".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedClaim && handleSubmitClaim(selectedClaim._id)}
                            disabled={submittingId === selectedClaim?._id}
                        >
                            {submittingId === selectedClaim?._id ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Claim'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default InsuranceClaimsManagement;
