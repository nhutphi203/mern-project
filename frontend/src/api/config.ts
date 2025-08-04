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

// Generic fetch wrapper with error handling
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${apiConfig.baseURL}${endpoint}`;

    const response = await fetch(url, {
        ...apiConfig,
        ...options,
        headers: {
            ...apiConfig.headers,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new ApiError(data.message || 'API request failed', response.status);
    }

    return data;
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