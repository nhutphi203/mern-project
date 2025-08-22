import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MedicalRecordsAPI, MedicalRecord, MedicalRecordSummary, MedicalRecordsStats, CreateMedicalRecordRequest, PaginationInfo } from '@/api/medicalRecords';

// Hook for medical records overview/dashboard
export const useMedicalRecordsOverview = () => {
    const [data, setData] = useState<MedicalRecordSummary[]>([]);
    const [stats, setStats] = useState<MedicalRecordsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getRecordsSummary();
            if (response.success) {
                setData(response.data);
                setStats(response.stats);
            } else {
                setError('Failed to fetch medical records overview');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching medical records overview');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    return {
        data,
        stats,
        loading,
        error,
        refetch: fetchOverview
    };
};

// Hook for paginated medical records
export const useMedicalRecords = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    patientId?: string;
    doctorId?: string;
    dateFrom?: string;
    dateTo?: string;
}) => {
    const [data, setData] = useState<MedicalRecord[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FIXED: Create a stable dependency key to prevent infinite loops
    const paramsRef = useRef(params);
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(paramsRef.current);

    if (paramsChanged) {
        paramsRef.current = params;
    }

    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getAllRecords(paramsRef.current);
            if (response.success) {
                setData(response.data);
                setPagination(response.pagination);
            } else {
                setError('Failed to fetch medical records');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching medical records');
        } finally {
            setLoading(false);
        }
    }, []); // Remove params dependency to prevent infinite loop

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords, paramsChanged]); // Use paramsChanged flag instead

    return {
        data,
        pagination,
        loading,
        error,
        refetch: fetchRecords
    };
};

// Hook for single medical record
export const useMedicalRecord = (id: string) => {
    const [data, setData] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecord = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getRecordById(id);
            if (response.success) {
                setData(response.data);
            } else {
                setError('Failed to fetch medical record');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching medical record');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    return {
        data,
        loading,
        error,
        refetch: fetchRecord
    };
};

// Hook for patient's medical records (for patient role)
export const useMyMedicalRecords = (params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
}) => {
    const [data, setData] = useState<MedicalRecord[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FIXED: Create a stable dependency key to prevent infinite loops
    const paramsRef = useRef(params);
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(paramsRef.current);

    if (paramsChanged) {
        paramsRef.current = params;
    }

    const fetchMyRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getMyRecords(paramsRef.current);
            if (response.success) {
                setData(response.data);
                setPagination(response.pagination);
            } else {
                setError('Failed to fetch your medical records');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching your medical records');
        } finally {
            setLoading(false);
        }
    }, []); // Remove params dependency to prevent infinite loop

    useEffect(() => {
        fetchMyRecords();
    }, [fetchMyRecords, paramsChanged]); // Use paramsChanged flag instead

    return {
        data,
        pagination,
        loading,
        error,
        refetch: fetchMyRecords
    };
};

// Hook for medical records summary
export const useMedicalRecordsSummary = () => {
    const [data, setData] = useState<MedicalRecordSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getRecordsSummary();
            if (response.success) {
                setData(response.data);
            } else {
                setError('Failed to fetch medical records summary');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching medical records summary');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return {
        data,
        loading,
        error,
        refetch: fetchSummary
    };
};

// Hook for medical records statistics
export const useMedicalRecordsStats = () => {
    const [data, setData] = useState<MedicalRecordsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getStatistics();
            if (response.success) {
                setData(response.data);
            } else {
                setError('Failed to fetch medical records statistics');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error fetching medical records statistics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        data,
        loading,
        error,
        refetch: fetchStats
    };
};

// Hook for medical records search
export const useMedicalRecordsSearch = () => {
    const [data, setData] = useState<MedicalRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchRecords = async (searchParams: {
        query?: string;
        patientName?: string;
        diagnosis?: string;
        icd10Code?: string;
        doctorName?: string;
        dateFrom?: string;
        dateTo?: string;
        status?: string;
        priority?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.searchRecords(searchParams);
            if (response.success) {
                setData(response.data);
                setTotal(response.total);
            } else {
                setError('Failed to search medical records');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error searching medical records');
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setData([]);
        setTotal(0);
        setError(null);
    };

    return {
        data,
        total,
        loading,
        error,
        searchRecords,
        clearSearch
    };
};

// Hook for creating medical records
export const useCreateMedicalRecord = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createRecord = async (recordData: CreateMedicalRecordRequest) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await MedicalRecordsAPI.createRecord(recordData);
            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError('Failed to create medical record');
                return null;
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error creating medical record');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        createRecord,
        loading,
        error,
        success,
        resetState
    };
};

// Hook for updating medical records
export const useUpdateMedicalRecord = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateRecord = async (id: string, recordData: Partial<CreateMedicalRecordRequest>) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await MedicalRecordsAPI.updateRecord(id, recordData);
            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError('Failed to update medical record');
                return null;
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error updating medical record');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        updateRecord,
        loading,
        error,
        success,
        resetState
    };
};

// Hook for adding progress notes
export const useAddProgressNote = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const addProgressNote = async (recordId: string, noteData: {
        note: string;
        type: 'Progress' | 'Consultation' | 'Procedure' | 'Discharge';
    }) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await MedicalRecordsAPI.addProgressNote(recordId, noteData);
            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError('Failed to add progress note');
                return null;
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error adding progress note');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        addProgressNote,
        loading,
        error,
        success,
        resetState
    };
};

// Hook for signing medical records
export const useSignMedicalRecord = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const signRecord = async (recordId: string) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await MedicalRecordsAPI.signRecord(recordId);
            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError('Failed to sign medical record');
                return null;
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error signing medical record');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        signRecord,
        loading,
        error,
        success,
        resetState
    };
};
