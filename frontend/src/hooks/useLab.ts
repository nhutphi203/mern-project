// frontend/src/hooks/useLab.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { labService } from '@/api/lab.service';
import { LabTest, LabOrder, LabResult } from '@/api/lab.types';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/api/apiClient';

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

    // Sử dụng ref để tránh re-renders không cần thiết
    const filtersRef = useRef(filters);
    const initialMountRef = useRef(true);

    const fetchTests = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getAllTests(filtersRef.current);
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
    }, []);

    useEffect(() => {
        filtersRef.current = filters;

        // Chỉ fetch khi thực sự cần thiết
        if (!initialMountRef.current) {
            fetchTests();
        } else {
            initialMountRef.current = false;
        }
    }, [filters, fetchTests]);

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

    const { checkAuthRedirect } = useAuthRedirect();
    const navigate = useNavigate();

    // Sử dụng một ref để theo dõi các lần mount đầu tiên
    const initialMountRef = useRef(true);

    // Lưu filters vào ref để tránh re-renders không cần thiết
    const filtersRef = useRef(filters);

    // Tạo fetch function không phụ thuộc vào filters
    const fetchQueue = useCallback(async () => {
        // Use a function to get current state to avoid dependency on state.loading
        setState(prevState => {
            // Prevent multiple concurrent requests
            if (prevState.loading) return prevState;

            return { ...prevState, loading: true, error: null };
        });

        try {
            // Sử dụng filtersRef.current thay vì memoizedFilters
            const response = await labService.getLabQueue(filtersRef.current);
            setState({
                data: response.orders || [], // Ensure it's always an array
                loading: false,
                error: null,
            });
        } catch (error) {
            // Xử lý lỗi xác thực
            if (error instanceof Error && error.message.includes('unauthorized')) {
                // Đã được chuyển hướng bởi interceptor, không cần xử lý thêm
                return;
            }

            setState({
                data: [],  // Empty array instead of null
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lab queue',
            });

            // Show toast thông báo lỗi
            toast.error(`Error fetching lab queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, []); // No dependencies needed now

    // Cập nhật filtersRef khi filters thay đổi
    useEffect(() => {
        filtersRef.current = filters;

        // Chỉ fetch khi thực sự cần thiết
        if (!initialMountRef.current) {
            // Use setTimeout to break any potential render loops
            const timeoutId = setTimeout(() => {
                fetchQueue();
            }, 0);
            return () => clearTimeout(timeoutId);
        } else {
            initialMountRef.current = false;
            fetchQueue(); // Load data on initial mount
        }
    }, [filters, fetchQueue]);
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
            // Gọi trực tiếp và không phụ thuộc vào fetchQueue để tránh re-render
            setTimeout(() => {
                fetchQueue();
            }, 0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update test status';
            toast.error(errorMessage);
            throw error;
        }
    }, [fetchQueue]); // Add fetchQueue as dependency

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
    status?: string; // Thêm tham số status vào interface
}) => {
    const [state, setState] = useState<ApiState<LabResult[]>>({
        data: [],  // Initialize as empty array instead of null
        loading: false,
        error: null,
    });

    // Memoize filters để chỉ fetch khi thực sự thay đổi
    const stableFilters = useMemo(() => ({
        patientId: filters?.patientId,
        orderId: filters?.orderId,
        status: filters?.status
    }), [
        filters?.patientId,
        filters?.orderId,
        filters?.status
    ]);

    const fetchResults = useCallback(async (currentFilters?: typeof filters) => {
        // Use a function to get current state to avoid dependency on state.loading
        setState(prevState => {
            // Prevent multiple concurrent requests
            if (prevState.loading) return prevState;

            return { ...prevState, loading: true, error: null };
        });

        try {
            // Cho phép lấy tất cả results nếu patientId = 'all'
            const allowAllResults = currentFilters?.patientId === 'all';

            // Trước khi gọi API, kiểm tra xem có đủ thông tin cần thiết không
            if (!allowAllResults && !currentFilters?.patientId && !currentFilters?.orderId) {
                // Nếu không có patientId hoặc orderId, và không phải 'all', không thực hiện gọi API
                setState({
                    data: [],
                    loading: false,
                    error: 'Please select a patient or order to view lab results',
                });
                return [];
            }

            // Kiểm tra và tạo tham số truy vấn với các giá trị mặc định
            const queryParams = {
                ...currentFilters,
                // Không thêm giá trị mặc định cho patientId nữa
                status: currentFilters?.status || 'Completed',
                limit: 100, // Số kết quả tối đa mặc định
                page: 1     // Trang mặc định
            };

            // Gọi API với đầy đủ tham số
            const response = await labService.getLabResults(queryParams);

            // Đảm bảo dữ liệu luôn là mảng và có cấu trúc đúng từ backend
            const safeResults: LabResult[] = Array.isArray(response.results)
                ? response.results.filter(Boolean) // Loại bỏ các phần tử null/undefined
                : [];

            setState({
                data: safeResults,
                loading: false,
                error: null,
            });

            return safeResults;
        } catch (error) {
            console.error('Lab results fetch error:', error);

            // Thông báo lỗi cụ thể hơn cho người dùng
            let errorMessage = 'Failed to fetch lab results';

            if (error instanceof Error) {
                if (error.message.includes('Patient ID or Order ID is required')) {
                    errorMessage = 'Please select a patient or order to view lab results';
                } else {
                    errorMessage = error.message;
                }
            }

            setState({
                data: [],  // Empty array instead of null
                loading: false,
                error: errorMessage,
            });
            return [];
        }
    }, []); // Empty dependencies

    useEffect(() => {
        // Only fetch when filters actually change
        fetchResults(stableFilters);
    }, [stableFilters, fetchResults]);

    return {
        results: state.data,
        loading: state.loading,
        error: state.error,
        refetch: () => fetchResults(stableFilters),
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

    // Sử dụng ref để tránh re-renders không cần thiết
    const dateRangeRef = useRef(dateRange);
    const initialMountRef = useRef(true);

    const fetchStats = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await labService.getLabStats(dateRangeRef.current);
            setState({
                data: {
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
    }, []);

    useEffect(() => {
        dateRangeRef.current = dateRange;

        // Chỉ fetch khi thực sự cần thiết
        if (!initialMountRef.current) {
            fetchStats();
        } else {
            initialMountRef.current = false;
        }
    }, [dateRange, fetchStats]);

    return {
        stats: state.data?.stats,
        categoryStats: state.data?.categoryStats,
        loading: state.loading,
        error: state.error,
        refetch: fetchStats,
    };
};