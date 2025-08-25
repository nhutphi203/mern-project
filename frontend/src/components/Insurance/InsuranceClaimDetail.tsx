import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
    FileText,
    Calendar,
    DollarSign,
    User,
    Stethoscope,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Save,
    Send,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCurrentUser } from '@/hooks/useAuth';
import {
    InsuranceClaimsAPI,
    type InsuranceClaim
} from '@/api/insurance';

interface InsuranceClaimDetailProps {
    claimId: string;
    onBack?: () => void;
}

const InsuranceClaimDetail: React.FC<InsuranceClaimDetailProps> = ({
    claimId,
    onBack
}) => {
    const { data: currentUser } = useCurrentUser();

    // State management
    const [claim, setClaim] = useState<InsuranceClaim | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Status update states
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [approvedAmount, setApprovedAmount] = useState<number | ''>('');
    const [paidAmount, setPaidAmount] = useState<number | ''>('');
    const [denialReason, setDenialReason] = useState('');
    const [updating, setUpdating] = useState(false);

    // Load claim details
    const loadClaim = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await InsuranceClaimsAPI.getClaimById(claimId);

            if (response.success && response.data) {
                setClaim(response.data);
            } else {
                setError('Failed to load claim details');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading claim');
            console.error('Error loading claim:', err);
        } finally {
            setLoading(false);
        }
    }, [claimId]);

    useEffect(() => {
        loadClaim();
    }, [loadClaim]);

    // Update claim status
    const handleStatusUpdate = async () => {
        if (!claim || !newStatus) return;

        try {
            setUpdating(true);

            const statusData: {
                status: string;
                reason?: string;
                notes?: string;
                insuranceResponse?: {
                    responseDate?: string;
                    approvedAmount?: number;
                    paidAmount?: number;
                    denialReason?: string;
                };
            } = {
                status: newStatus,
                reason: statusReason,
                notes: statusNotes
            };

            // Add insurance response data for certain statuses
            if (['Approved', 'Partially Approved', 'Paid'].includes(newStatus)) {
                statusData.insuranceResponse = {
                    responseDate: new Date().toISOString(),
                    approvedAmount: typeof approvedAmount === 'number' ? approvedAmount : undefined,
                    paidAmount: typeof paidAmount === 'number' ? paidAmount : undefined
                };
            }

            if (newStatus === 'Denied') {
                statusData.insuranceResponse = {
                    responseDate: new Date().toISOString(),
                    denialReason
                };
            }

            const response = await InsuranceClaimsAPI.updateClaimStatus(claim._id, statusData);

            if (response.success) {
                toast.success('Claim status updated successfully');
                setIsStatusDialogOpen(false);
                loadClaim(); // Refresh claim data

                // Reset form
                setNewStatus('');
                setStatusReason('');
                setStatusNotes('');
                setApprovedAmount('');
                setPaidAmount('');
                setDenialReason('');
            } else {
                toast.error('Failed to update claim status');
            }
        } catch (error) {
            toast.error('Error updating claim status');
            console.error('Error updating claim status:', error);
        } finally {
            setUpdating(false);
        }
    };

    // Get status badge color and icon
    const getStatusInfo = (status: string) => {
        const statusMap = {
            'Draft': {
                color: 'bg-gray-100 text-gray-800',
                icon: FileText
            },
            'Submitted': {
                color: 'bg-blue-100 text-blue-800',
                icon: Send
            },
            'Under Review': {
                color: 'bg-yellow-100 text-yellow-800',
                icon: Clock
            },
            'Approved': {
                color: 'bg-green-100 text-green-800',
                icon: CheckCircle
            },
            'Partially Approved': {
                color: 'bg-orange-100 text-orange-800',
                icon: AlertCircle
            },
            'Denied': {
                color: 'bg-red-100 text-red-800',
                icon: XCircle
            },
            'Paid': {
                color: 'bg-emerald-100 text-emerald-800',
                icon: DollarSign
            },
            'Closed': {
                color: 'bg-gray-100 text-gray-800',
                icon: FileText
            }
        };

        return statusMap[status] || statusMap['Draft'];
    };

    // Check permissions
    const canUpdateStatus = () => {
        if (!currentUser) return false;
        return ['Admin', 'Insurance Staff'].includes(currentUser.user.role);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading claim details...</p>
                </div>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="space-y-6">
                {onBack && (
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                )}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Failed to Load Claim
                            </h3>
                            <p className="text-gray-500">
                                {error || 'Claim not found'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusInfo = getStatusInfo(claim.status);
    const StatusIcon = statusInfo.icon;

    const patientName = typeof claim.patientId === 'string'
        ? 'Patient'
        : `${claim.patientId.firstName} ${claim.patientId.lastName}`;

    const providerName = typeof claim.providerId === 'string'
        ? 'Doctor'
        : `Dr. ${claim.providerId.firstName} ${claim.providerId.lastName}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
                        <p className="text-gray-600">Insurance Claim Details</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge className={statusInfo.color}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {claim.status}
                    </Badge>
                    {canUpdateStatus() && !['Paid', 'Closed'].includes(claim.status) && (
                        <Button onClick={() => setIsStatusDialogOpen(true)}>
                            Update Status
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Patient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{patientName}</p>
                        {typeof claim.patientId !== 'string' && claim.patientId.email && (
                            <p className="text-sm text-gray-600">{claim.patientId.email}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Provider
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{providerName}</p>
                        {typeof claim.providerId !== 'string' && claim.providerId.specialization && (
                            <p className="text-sm text-gray-600">{claim.providerId.specialization}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Service Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">
                            {format(new Date(claim.serviceDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                            Submitted: {format(new Date(claim.submissionDate), 'MMM dd, yyyy')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Financial
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">${claim.totalClaimAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                            {claim.approvedAmount > 0 && `Approved: $${claim.approvedAmount.toFixed(2)}`}
                            {claim.paidAmount > 0 && ` | Paid: $${claim.paidAmount.toFixed(2)}`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Card>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="codes">Codes</TabsTrigger>
                            <TabsTrigger value="financial">Financial</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                    </CardHeader>

                    <CardContent>
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Insurance Information</h3>
                                    <div className="space-y-2 text-sm">
                                        {typeof claim.patientInsuranceId !== 'string' && (
                                            <>
                                                <p><strong>Policy Number:</strong> {claim.patientInsuranceId.policyNumber}</p>
                                                <p><strong>Group Number:</strong> {claim.patientInsuranceId.groupNumber || 'N/A'}</p>
                                                <p><strong>Subscriber:</strong> {claim.patientInsuranceId.subscriberName}</p>
                                                <p><strong>Relationship:</strong> {claim.patientInsuranceId.relationship}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Prior Authorization</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Required:</strong> {claim.priorAuthorization?.isRequired ? 'Yes' : 'No'}</p>
                                        {claim.priorAuthorization?.authorizationNumber && (
                                            <p><strong>Auth Number:</strong> {claim.priorAuthorization.authorizationNumber}</p>
                                        )}
                                        {claim.priorAuthorization?.status && (
                                            <p><strong>Auth Status:</strong> {claim.priorAuthorization.status}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {claim.notes && (
                                <div>
                                    <h3 className="font-semibold mb-3">Notes</h3>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md">{claim.notes}</p>
                                </div>
                            )}

                            {claim.insuranceResponse && (
                                <div>
                                    <h3 className="font-semibold mb-3">Insurance Response</h3>
                                    <div className="bg-blue-50 p-4 rounded-md space-y-2 text-sm">
                                        {claim.insuranceResponse.responseDate && (
                                            <p><strong>Response Date:</strong> {format(new Date(claim.insuranceResponse.responseDate), 'MMM dd, yyyy')}</p>
                                        )}
                                        {claim.insuranceResponse.explanationOfBenefits && (
                                            <p><strong>EOB:</strong> {claim.insuranceResponse.explanationOfBenefits}</p>
                                        )}
                                        {claim.insuranceResponse.denialReason && (
                                            <p><strong>Denial Reason:</strong> {claim.insuranceResponse.denialReason}</p>
                                        )}
                                        {claim.insuranceResponse.adjustmentReason && (
                                            <p><strong>Adjustment Reason:</strong> {claim.insuranceResponse.adjustmentReason}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Codes Tab */}
                        <TabsContent value="codes" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Diagnosis Codes</h3>
                                    <div className="space-y-2">
                                        {claim.diagnosisCodes.map((diagnosis, index) => (
                                            <div key={index} className="border rounded p-3 bg-gray-50">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                                                        {diagnosis.icd10Code}
                                                    </code>
                                                    {diagnosis.isPrimary && (
                                                        <Badge variant="default" className="text-xs">Primary</Badge>
                                                    )}
                                                </div>
                                                {diagnosis.description && (
                                                    <p className="text-sm text-gray-700">{diagnosis.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Procedure Codes</h3>
                                    <div className="space-y-2">
                                        {claim.procedureCodes.map((procedure, index) => (
                                            <div key={index} className="border rounded p-3 bg-gray-50">
                                                <div className="flex justify-between items-start mb-1">
                                                    <code className="text-sm font-mono bg-green-100 px-2 py-1 rounded">
                                                        {procedure.cptCode}
                                                    </code>
                                                    <span className="text-sm font-semibold">
                                                        ${procedure.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                {procedure.description && (
                                                    <p className="text-sm text-gray-700 mb-1">{procedure.description}</p>
                                                )}
                                                <div className="flex justify-between text-xs text-gray-600">
                                                    <span>Qty: {procedure.quantity}</span>
                                                    <span>Unit: ${procedure.unitPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Financial Tab */}
                        <TabsContent value="financial" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Claim Amounts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Total Claim Amount:</span>
                                            <span className="font-semibold">${claim.totalClaimAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Approved Amount:</span>
                                            <span className="font-semibold text-green-600">${claim.approvedAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Paid Amount:</span>
                                            <span className="font-semibold text-blue-600">${claim.paidAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span>Remaining Balance:</span>
                                            <span className="font-semibold">${(claim.remainingBalance || 0).toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Patient Responsibility</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Copay:</span>
                                            <span className="font-semibold">${claim.patientResponsibility.copay.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Deductible:</span>
                                            <span className="font-semibold">${claim.patientResponsibility.deductible.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Coinsurance:</span>
                                            <span className="font-semibold">${claim.patientResponsibility.coinsurance.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span>Total Patient Responsibility:</span>
                                            <span className="font-semibold">${(claim.totalPatientResponsibility || 0).toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4">
                            <h3 className="font-semibold">Status History</h3>
                            <div className="space-y-3">
                                {claim.statusHistory && claim.statusHistory.length > 0 ? (
                                    claim.statusHistory.map((entry, index) => (
                                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{entry.status}</p>
                                                    {entry.reason && (
                                                        <p className="text-sm text-gray-600">{entry.reason}</p>
                                                    )}
                                                    {entry.notes && (
                                                        <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {format(new Date(entry.date), 'MMM dd, yyyy HH:mm')}
                                                    </p>
                                                    {typeof entry.updatedBy !== 'string' && entry.updatedBy && (
                                                        <p className="text-xs text-gray-400">
                                                            {entry.updatedBy.firstName} {entry.updatedBy.lastName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No status history available</p>
                                )}
                            </div>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

            {/* Status Update Dialog */}
            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Claim Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update the status of claim {claim.claimNumber}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">New Status</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Partially Approved">Partially Approved</SelectItem>
                                    <SelectItem value="Denied">Denied</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {['Approved', 'Partially Approved', 'Paid'].includes(newStatus) && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">Approved Amount</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={approvedAmount}
                                        onChange={(e) => setApprovedAmount(e.target.value ? parseFloat(e.target.value) : '')}
                                        placeholder="0.00"
                                    />
                                </div>
                                {newStatus === 'Paid' && (
                                    <div>
                                        <label className="text-sm font-medium">Paid Amount</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(e.target.value ? parseFloat(e.target.value) : '')}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {newStatus === 'Denied' && (
                            <div>
                                <label className="text-sm font-medium">Denial Reason</label>
                                <Textarea
                                    value={denialReason}
                                    onChange={(e) => setDenialReason(e.target.value)}
                                    placeholder="Reason for denial..."
                                    rows={3}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Reason</label>
                            <Input
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                placeholder="Brief reason for status change"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                placeholder="Additional notes..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusUpdate}
                            disabled={!newStatus || updating}
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default InsuranceClaimDetail;
