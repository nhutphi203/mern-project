import { useState, useCallback, useMemo, useEffect } from 'react';

// Ultra-fast debounce hook cho real-time search
export const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook tối ưu cho real-time search với UX tốt nhất
export const useRealTimeSearch = (initialValue = '', debounceMs = 100) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return {
        searchTerm,
        debouncedSearchTerm,
        handleSearchChange,
        clearSearch,
        isSearching: searchTerm !== debouncedSearchTerm,
    };
};

// Hook cho filter với state management tối ưu
export const useFilters = <T extends Record<string, unknown>>(initialFilters: T) => {
    const [filters, setFilters] = useState<T>(initialFilters);

    const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const resetFilter = useCallback(<K extends keyof T>(key: K) => {
        setFilters(prev => ({
            ...prev,
            [key]: initialFilters[key]
        }));
    }, [initialFilters]);

    return {
        filters,
        updateFilter,
        clearFilters,
        resetFilter,
        setFilters
    };
};

// Hook cho pagination tối ưu
export const usePagination = (totalItems: number, itemsPerPage = 10, currentPage = 1) => {
    const [page, setPage] = useState(currentPage);

    const totalPages = useMemo(() =>
        Math.ceil(totalItems / itemsPerPage),
        [totalItems, itemsPerPage]
    );

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(page + 1);
    }, [page, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(page - 1);
    }, [page, goToPage]);

    const resetPage = useCallback(() => {
        setPage(1);
    }, []);

    return {
        page,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        resetPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startItem: (page - 1) * itemsPerPage + 1,
        endItem: Math.min(page * itemsPerPage, totalItems)
    };
};

// Composite hook cho search + filter + pagination
export const useSearchAndFilter = <T extends Record<string, unknown>>(
    initialFilters: T,
    debounceMs = 100
) => {
    const search = useRealTimeSearch('', debounceMs);
    const filter = useFilters(initialFilters);

    // Combine search và filters
    const combinedFilters = useMemo(() => ({
        ...filter.filters,
        ...(search.debouncedSearchTerm && { search: search.debouncedSearchTerm })
    }), [filter.filters, search.debouncedSearchTerm]);

    return {
        ...search,
        ...filter,
        combinedFilters,
        isLoading: search.isSearching
    };
};
