export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// API configuration with credentials for cookie handling
export const apiConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
};

// API response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ErrorResponse {
    success: false;
    message: string;
}

// Generic API error handler
export class ApiError extends Error {
    constructor(public message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        // ✅ FIX: Check content type BEFORE parsing
        const contentType = response.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
            throw new ApiError(
                `Server returned ${response.status}: Expected JSON but got ${contentType || 'unknown content type'}`,
                response.status
            );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new ApiError(data.message || 'API request failed', response.status);
        }

        return data as T;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle JSON parsing errors
        if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
            throw new ApiError('Server returned invalid response. Please check your connection or contact support.', 500);
        }

        throw new ApiError('Network error occurred. Please check your connection.', 500);
    }
};
// For file uploads (multipart/form-data)
export const apiUploadRequest = async <T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${apiConfig.baseURL}${endpoint}`;

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        method: 'POST',
        body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new ApiError(data.message || 'Upload failed', response.status);
    }

    return data;
};