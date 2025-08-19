import { useState, useEffect, useCallback, useRef } from 'react';
import { labTestService } from '@/api/lab.test.service';
import { LabResult } from '@/api/lab.types';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export const useTestLabResults = (filters?: {
    patientId?: string;
    orderId?: string;
    status?: string;
}) => {
    const [state, setState] = useState<ApiState<LabResult[]>>({
        data: [],
        loading: false,
        error: null,
    });

    const filtersRef = useRef(filters);
    const initialMountRef = useRef(true);

    const fetchResults = useCallback(async () => {
        setState(prevState => {
            if (prevState.loading) return prevState;
            return { ...prevState, loading: true, error: null };
        });

        try {
            console.log('Fetching test lab results with filters:', filtersRef.current);

            const response = await labTestService.getTestResults(filtersRef.current);

            console.log('Test lab results response:', {
                success: response.success,
                resultsCount: response.results?.length || 0,
                results: response.results
            });

            setState({
                data: response.results || [],
                loading: false,
                error: null,
            });

            return response.results || [];
        } catch (error) {
            console.error('Test lab results fetch error:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lab results';
            setState({
                data: [],
                loading: false,
                error: errorMessage,
            });
            return [];
        }
    }, []);

    useEffect(() => {
        filtersRef.current = filters;

        if (!initialMountRef.current) {
            fetchResults();
        } else {
            initialMountRef.current = false;
            fetchResults();
        }
    }, [filters, fetchResults]);

    return {
        results: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchResults,
    };
};
