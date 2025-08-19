// frontend/src/hooks/useLabResults.ts - Fixed version without infinite loop

import { useState, useEffect, useCallback, useRef } from 'react';
import { labService } from '@/api/lab.service';
import { LabResult } from '@/api/lab.types';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseLabResultsFilters {
    patientId?: string;
    orderId?: string;
    status?: string;
}

export const useLabResults = (filters?: UseLabResultsFilters) => {
    const [state, setState] = useState<ApiState<LabResult[]>>({
        data: [],
        loading: false,
        error: null,
    });

    // Use refs to track the last filters and prevent unnecessary fetches
    const lastFiltersRef = useRef<string>('');
    const mountedRef = useRef(true);
    const fetchingRef = useRef(false);

    // Create a stable string representation of filters for comparison
    const filtersKey = JSON.stringify(filters || {});

    const fetchResults = useCallback(async () => {
        // Prevent multiple concurrent requests
        if (fetchingRef.current || !mountedRef.current) {
            return;
        }

        // Check if filters actually changed
        if (lastFiltersRef.current === filtersKey) {
            return;
        }

        fetchingRef.current = true;
        lastFiltersRef.current = filtersKey;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const allowAllResults = filters?.patientId === 'all';

            // Validate required filters
            if (!allowAllResults && !filters?.patientId && !filters?.orderId) {
                setState({
                    data: [],
                    loading: false,
                    error: 'Please select a patient or order to view lab results',
                });
                return;
            }

            // Prepare query parameters
            const queryParams = {
                ...filters,
                status: filters?.status || 'Completed',
                limit: 100,
                page: 1
            };

            const response = await labService.getLabResults(queryParams);

            if (!mountedRef.current) return;

            // Process results safely
            const safeResults: LabResult[] = Array.isArray(response.results)
                ? response.results.filter(Boolean).map(item => ({
                    _id: item._id || '',
                    orderId: String(item.orderId || ''),
                    patientId: String(item.patientId || ''),
                    testId: {
                        _id: item.testId?._id || '',
                        testName: item.testId?.testName || 'Unknown Test',
                        category: item.testId?.category || 'Uncategorized',
                        normalRange: item.testId?.normalRange || null
                    },
                    technicianId: {
                        _id: item.technicianId?._id || '',
                        firstName: item.technicianId?.firstName || 'Unknown',
                        lastName: item.technicianId?.lastName || 'Technician'
                    },
                    result: {
                        value: item.result?.value || 'N/A',
                        unit: item.result?.unit,
                        isAbnormal: item.result?.isAbnormal || false,
                        flag: item.result?.flag || 'Normal'
                    },
                    referenceRange: item.referenceRange || '',
                    interpretation: item.interpretation,
                    comments: item.comments,
                    performedAt: item.performedAt || new Date().toISOString(),
                    verifiedBy: item.verifiedBy,
                    verifiedAt: item.verifiedAt,
                    status: item.status || 'Pending',
                    methodology: item.methodology,
                    instrument: item.instrument
                }))
                : [];

            setState({
                data: safeResults,
                loading: false,
                error: null,
            });
        } catch (error) {
            if (!mountedRef.current) return;

            let errorMessage = 'Failed to fetch lab results';
            if (error instanceof Error) {
                if (error.message.includes('Patient ID or Order ID is required')) {
                    errorMessage = 'Please select a patient or order to view lab results';
                } else {
                    errorMessage = error.message;
                }
            }

            setState({
                data: [],
                loading: false,
                error: errorMessage,
            });
        } finally {
            fetchingRef.current = false;
        }
    }, [filters, filtersKey]);

    // Effect to fetch when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 100); // Debounce rapid changes

        return () => clearTimeout(timeoutId);
    }, [fetchResults]);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        results: state.data,
        loading: state.loading,
        error: state.error,
        refetch: () => {
            lastFiltersRef.current = ''; // Force refresh
            fetchResults();
        },
    };
};
