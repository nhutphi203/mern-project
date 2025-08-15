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
// --- NÂNG CẤP HÀM apiRequest ---
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    // 1. Lấy token từ localStorage
    // Tên key 'token' này phải khớp với tên bạn dùng để lưu khi đăng nhập
    const token = localStorage.getItem('token');

    // 2. Xây dựng headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 3. Nếu có token, đính kèm vào header 'Authorization'
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Debug logging
    console.log('🔍 [apiRequest] Request details:', {
        url,
        method: options.method || 'GET',
        headers,
        hasToken: !!token,
        tokenLength: token ? token.length : 0
    });

    try {
        const response = await fetch(url, {
            ...options,
            headers, // Sử dụng headers đã được xây dựng
            credentials: 'include', // Giữ lại để xử lý cookie nếu có
        });

        console.log('🔍 [apiRequest] Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error('❌ [apiRequest] API Error:', {
                status: response.status,
                data
            });
            throw new ApiError(data.message || 'API request failed', response.status);
        }

        console.log('✅ [apiRequest] Success:', data);

        // 4. Trả về toàn bộ object data từ API
        // Điều này quan trọng vì các hàm API của bạn đang mong đợi { success, data, message }
        return data as T;

    } catch (error) {
        console.error('❌ [apiRequest] Request failed:', error);
        // Xử lý các lỗi mạng hoặc lỗi không phải JSON
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('An unexpected error occurred. Please check the network connection.', 500);
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