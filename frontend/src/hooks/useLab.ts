// frontend/src/hooks/useLab.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { labService } from '@/api/lab.service';
import { LabTest, LabOrder, LabResult } from '@/api/lab.types';
import { toast } from 'sonner';

interface ILabStatsData {
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    // Thêm bất kỳ thuộc tính nào khác mà API trả về cho stats
}

// Generic API state interface
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Hook for managing lab tests
export const useLabTests = (filters?: { category?: string; search?: string }) => {
    const [state, setState] = useState<ApiState<LabTest[]>>({
        data: null,
        loading: false,
        error: null,
    });

    // Memoize filters to prevent unnecessary re-renders
    const memoizedFilters = useMemo(() => filters, [filters?.category, filters?.search]);

    const fetchTests = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getAllTests(memoizedFilters);
            setState({
                data: response.tests,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch tests',
            });
        }
    }, [memoizedFilters]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    return {
        tests: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchTests,
    };
};

// Hook for creating lab orders
export const useCreateLabOrder = () => {
    const [state, setState] = useState<ApiState<LabOrder>>({
        data: null,
        loading: false,
        error: null,
    });

    const createOrder = useCallback(async (orderData: {
        encounterId: string;
        patientId: string;
        tests: Array<{
            testId: string;
            priority?: 'Routine' | 'Urgent' | 'STAT';
            instructions?: string;
        }>;
        clinicalInfo?: string;
    }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.createLabOrder(orderData);
            setState({
                data: response.order,
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.order;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create lab order';
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
        createOrder,
        loading: state.loading,
        error: state.error,
        createdOrder: state.data,
    };
};

// Hook for managing lab queue
export const useLabQueue = (filters?: {
    status?: string;
    priority?: string;
    category?: string;
}) => {
    const [state, setState] = useState<ApiState<LabOrder[]>>({
        data: null,
        loading: false,
        error: null,
    });

    // Memoize filters to prevent unnecessary re-renders
    const memoizedFilters = useMemo(() => filters, [filters?.status, filters?.priority, filters?.category]);

    const fetchQueue = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getLabQueue(memoizedFilters);
            setState({
                data: response.orders,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lab queue',
            });
        }
    }, [memoizedFilters]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const updateTestStatus = useCallback(async (
        orderId: string,
        testId: string,
        status: string,
        notes?: string
    ) => {
        try {
            const response = await labService.updateTestStatus(orderId, testId, status, notes);
            toast.success(response.message);
            // Refresh the queue after successful update
            fetchQueue();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update test status';
            toast.error(errorMessage);
            throw error;
        }
    }, [fetchQueue]);

    return {
        orders: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchQueue,
        updateTestStatus,
    };
};

// Hook for entering lab results
export const useEnterLabResult = () => {
    const [state, setState] = useState<ApiState<LabResult>>({
        data: null,
        loading: false,
        error: null,
    });

    const enterResult = useCallback(async (resultData: {
        orderId: string;
        testId: string;
        result: {
            value: number | string;
            unit?: string;
        };
        interpretation?: string;
        comments?: string;
        methodology?: string;
        instrument?: string;
    }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.enterLabResult(resultData);
            setState({
                data: response.result,
                loading: false,
                error: null,
            });
            toast.success(response.message);
            return response.result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to enter lab result';
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
        enterResult,
        loading: state.loading,
        error: state.error,
        enteredResult: state.data,
    };
};

// Hook for viewing lab results
export const useLabResults = (filters?: {
    patientId?: string;
    orderId?: string;
}) => {
    const [state, setState] = useState<ApiState<LabResult[]>>({
        data: null,
        loading: false,
        error: null,
    });

    // Memoize filters to prevent unnecessary re-renders
    const memoizedFilters = useMemo(() => filters, [filters?.patientId, filters?.orderId]);

    const fetchResults = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getLabResults(memoizedFilters);
            setState({
                data: response.results,
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lab results',
            });
        }
    }, [memoizedFilters]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return {
        results: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchResults,
    };
};

// Hook for generating lab reports
export const useLabReport = () => {
    const [state, setState] = useState<ApiState<unknown>>({
        data: null,
        loading: false,
        error: null,
    });

    const generateReport = useCallback(async (orderId: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.generateLabReport(orderId);
            setState({
                data: response.report,
                loading: false,
                error: null,
            });
            return response.report;
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

export const useLabStats = (dateRange?: { startDate?: string; endDate?: string }) => {
    const [state, setState] = useState<ApiState<{
        stats: ILabStatsData | null;
        categoryStats: [];
    }>>({
        data: null,
        loading: false,
        error: null,
    });

    // Memoize dateRange to prevent unnecessary re-renders
    const memoizedDateRange = useMemo(() => dateRange, [dateRange?.startDate, dateRange?.endDate]);

    const fetchStats = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getLabStats(memoizedDateRange);
            setState({
                data: {
                    // SỬA Ở ĐÂY: Thêm "as ILabStatsData"
                    stats: response.stats as ILabStatsData,
                    categoryStats: response.categoryStats,
                },
                loading: false,
                error: null,
            });
        } catch (error) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lab stats',
            });
        }
    }, [memoizedDateRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats: state.data?.stats,
        categoryStats: state.data?.categoryStats,
        loading: state.loading,
        error: state.error,
        refetch: fetchStats,
    };
};