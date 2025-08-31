// frontend/src/hooks/useBilling.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { billingService } from '@/api/billing.service';
import { Invoice } from '@/api/billing.types';
import { toast } from 'sonner';

// Generic API state interface
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Hook for creating invoices
export const useCreateInvoice = () => {
    const [state, setState] = useState<ApiState<Invoice>>({
        data: null,
        loading: false,
        error: null,
    });

    const createInvoice = useCallback(async (invoiceData: {
        encounterId: string;
        patientId: string;
        appointmentId: string;
        consultationFee?: number;
        labOrders?: string[];
        prescriptions?: string[];
        procedures?: Array<{
            description: string;
            code: string;
            quantity: number;
            unitPrice: number;
        }>;
        additionalItems?: Array<{
            type: string;
            description: string;
            serviceCode: string;
            quantity: number;
            unitPrice: number;
        }>;
    }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.createInvoice(invoiceData);
            setState({
                data: response.invoice,
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.invoice;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    return {
        createInvoice,
        loading: state.loading,
        error: state.error,
        createdInvoice: state.data,
    };
};

// Hook for managing invoices with pagination and filtering
export const useInvoices = (filters?: {
    status?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    const [state, setState] = useState<ApiState<{
        invoices: Invoice[];
        count: number;
        total: number;
        currentPage: number;
        totalPages: number;
    }>>({
        data: null,
        loading: false,
        error: null,
    });


    // Deep compare filters to avoid infinite loop
    const [lastFilters, setLastFilters] = useState<typeof filters | undefined>(undefined);
    useEffect(() => {
        function isEqual(
            a: typeof filters | undefined,
            b: typeof filters | undefined
        ): boolean {
            if (a === b) return true;
            if (!a || !b) return false;
            return (
                a.status === b.status &&
                a.patientId === b.patientId &&
                a.startDate === b.startDate &&
                a.endDate === b.endDate &&
                a.page === b.page &&
                a.limit === b.limit
            );
        }
        if (!isEqual(filters, lastFilters)) {
            setLastFilters(filters);
            setState(prev => ({ ...prev, loading: true, error: null }));
            billingService.getAllInvoices(filters)
                .then(response => {
                    setState({
                        data: {
                            invoices: response.invoices,
                            count: response.count,
                            total: response.total,
                            currentPage: response.currentPage,
                            totalPages: response.totalPages,
                        },
                        loading: false,
                        error: null,
                    });
                })
                .catch(error => {
                    setState({
                        data: null,
                        loading: false,
                        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
                    });
                });
        }
    }, [filters, lastFilters]);

    return {
        invoices: state.data?.invoices,
        count: state.data?.count,
        total: state.data?.total,
        currentPage: state.data?.currentPage,
        totalPages: state.data?.totalPages,
        loading: state.loading,
        error: state.error,
        // refetch: fetchInvoices, // Đã loại bỏ vì không còn fetchInvoices
    };
};

// Hook for getting invoice details
export const useInvoiceDetail = (invoiceId: string) => {
    const [state, setState] = useState<ApiState<Invoice>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetchInvoice = useCallback(async () => {
        if (!invoiceId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.getInvoiceById(invoiceId);
            setState({
                data: response.invoice,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch invoice',
            });
        }
    }, [invoiceId]);

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    return {
        invoice: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchInvoice,
    };
};

// Hook for processing payments
export const useProcessPayment = () => {
    const [state, setState] = useState<ApiState<unknown>>({
        data: null,
        loading: false,
        error: null,
    });

    const processPayment = useCallback(async (
        invoiceId: string,
        paymentData: {
            method: 'Cash' | 'Card' | 'Transfer' | 'Check';
            amount: number;
            transactionId?: string;
            cardLast4?: string;
            notes?: string;
        }
    ) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.processPayment(invoiceId, paymentData);
            setState({
                data: response.invoice,
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.invoice;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    return {
        processPayment,
        loading: state.loading,
        error: state.error,
        paymentResult: state.data,
    };
};

// Hook for insurance claim management
export const useInsuranceClaim = () => {
    const [submitState, setSubmitState] = useState<ApiState<unknown>>({
        data: null,
        loading: false,
        error: null,
    });

    const [updateState, setUpdateState] = useState<ApiState<Invoice>>({
        data: null,
        loading: false,
        error: null,
    });

    const submitClaim = useCallback(async (
        invoiceId: string,
        claimNumber: string
    ) => {
        setSubmitState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.submitInsuranceClaim(invoiceId, { claimNumber });
            setSubmitState({
                data: { claimNumber: response.claimNumber },
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.claimNumber;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit claim';
            setSubmitState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    const updateClaimStatus = useCallback(async (
        invoiceId: string,
        statusData: {
            claimStatus: 'Pending' | 'Approved' | 'Denied' | 'Partial';
            approvedAmount?: number;
            denialReason?: string;
        }
    ) => {
        setUpdateState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.updateInsuranceClaimStatus(invoiceId, statusData);
            setUpdateState({
                data: response.invoice,
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.invoice;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update claim status';
            setUpdateState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    return {
        submitClaim,
        updateClaimStatus,
        submitLoading: submitState.loading,
        updateLoading: updateState.loading,
        submitError: submitState.error,
        updateError: updateState.error,
        submittedClaim: submitState.data,
        updatedInvoice: updateState.data,
    };
};

// Hook for billing reports
export const useBillingReports = () => {
    const [state, setState] = useState<ApiState<unknown>>({
        data: null,
        loading: false,
        error: null,
    });

    const generateReport = useCallback(async (params: {
        startDate?: string;
        endDate?: string;
        reportType?: 'summary' | 'detailed';
    }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.getBillingReport(params);
            setState({
                data: response,
                loading: false,
                error: null,
            });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    return {
        generateReport,
        loading: state.loading,
        error: state.error,
        report: state.data,
    };
};

// Hook for patient billing history
export const usePatientBillingHistory = (patientId: string) => {
    const [state, setState] = useState<ApiState<{
        summary: {
            totalBilled: number;
            totalPaid: number;
            currentBalance: number;
            invoiceCount: number;
        };
        billingHistory: Invoice[];
    }>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetchBillingHistory = useCallback(async () => {
        if (!patientId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.getPatientBillingHistory(patientId);
            setState({
                data: {
                    summary: response.summary,
                    billingHistory: response.billingHistory,
                },
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch billing history',
            });
        }
    }, [patientId]);

    useEffect(() => {
        fetchBillingHistory();
    }, [fetchBillingHistory]);

    return {
        summary: state.data?.summary,
        billingHistory: state.data?.billingHistory,
        loading: state.loading,
        error: state.error,
        refetch: fetchBillingHistory,
    };
};

// Hook for insurance providers
export const useInsuranceProviders = (isActive = true) => {
    const [state, setState] = useState<ApiState<Array<{
        _id: string;
        providerName: string;
        providerCode: string;
        contractDetails?: {
            reimbursementRate: number;
        };
        isActive: boolean;
    }>>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetchProviders = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.getAllInsuranceProviders(isActive);
            setState({
                data: response.providers,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch insurance providers',
            });
        }
    }, [isActive]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    return {
        providers: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchProviders,
    };
};

// Hook for patient insurance
export const usePatientInsurance = (patientId: string) => {
    const [state, setState] = useState<ApiState<Array<{
        _id: string;
        policyNumber: string;
        groupNumber?: string;
        subscriberName: string;
        isPrimary: boolean;
        isActive: boolean;
        insuranceProviderId: {
            _id: string;
            providerName: string;
            providerCode: string;
        };
    }>>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetchPatientInsurance = useCallback(async () => {
        if (!patientId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await billingService.getPatientInsurance(patientId);
            setState({
                data: response.insurances,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch patient insurance',
            });
        }
    }, [patientId]);

    useEffect(() => {
        fetchPatientInsurance();
    }, [fetchPatientInsurance]);

    return {
        insurances: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchPatientInsurance,
    };
};