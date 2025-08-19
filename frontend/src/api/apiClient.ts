import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

// Tạo axios instance
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cho phép gửi cookies
});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Thêm token vào header nếu có
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Kiểm tra xem có phải lỗi không phân tích được JSON hay không
        if (error.message && error.message.includes('Unexpected token')) {
            console.error('Invalid JSON response received:', error);
            
            // Kiểm tra xem response có chứa HTML không (có thể là trang login)
            const response = error.response;
            if (response && 
                response.headers && 
                response.headers['content-type'] && 
                response.headers['content-type'].includes('text/html')) {
                
                console.error('Received HTML instead of JSON. Session likely expired.');
                
                // Chuyển hướng đến trang đăng nhập
                // Lưu ý: Không thể dùng useNavigate ở đây, thay vào đó set cờ và xử lý ở component
                localStorage.setItem('auth_redirect', 'session_expired');
                window.location.href = '/login?expired=true';
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }

        // Xử lý các lỗi xác thực (401, 403)
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.log('Unauthorized - Redirecting to login');
                    localStorage.setItem('auth_redirect', 'unauthorized');
                    // Chuyển hướng đến trang đăng nhập
                    window.location.href = '/login?unauthorized=true';
                    break;
                    
                case 403:
                    console.log('Forbidden - Access denied');
                    // Có thể chuyển hướng đến trang "Access Denied" hoặc Dashboard
                    localStorage.setItem('auth_redirect', 'forbidden');
                    window.location.href = '/dashboard?forbidden=true';
                    break;
            }
        }
        
        return Promise.reject(error);
    }
);

// Utility function to process API responses
export const processApiResponse = <T>(response: AxiosResponse): T => {
    // Check if response has the expected structure
    if (response.data && typeof response.data.success !== 'undefined') {
        if (!response.data.success) {
            throw new Error(response.data.message || 'API request failed');
        }
        return response.data as T;
    }
    
    // If the response doesn't have the expected structure
    return response.data as T;
};

// Generic API request function
export const apiRequest = async <T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
): Promise<T> => {
    // DEBUG: Log request details
    console.log(`API Request to: ${endpoint}`, {
        method: options.method || 'GET',
        hasData: Boolean(options.data)
    });
    
    const response = await apiClient.request({
        url: endpoint,
        ...options,
    });
    
    // DEBUG: Log response structure
    console.log(`API Response from: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        hasData: Boolean(response.data),
        dataType: response.data ? typeof response.data : 'No data',
        isSuccess: response.data?.success,
        dataKeys: response.data ? Object.keys(response.data).join(', ') : 'No keys'
    });
    
    return processApiResponse<T>(response);
};

// Hook for handling auth redirects
export const useAuthRedirect = () => {
    const navigate = useNavigate();
    
    const checkAuthRedirect = () => {
        const redirect = localStorage.getItem('auth_redirect');
        if (redirect) {
            localStorage.removeItem('auth_redirect');
            
            switch (redirect) {
                case 'session_expired':
                    // Show toast or message about expired session
                    return 'Your session has expired. Please log in again.';
                case 'unauthorized':
                    // Show toast or message about being unauthorized
                    return 'You need to be logged in to access this resource.';
                case 'forbidden':
                    // Show toast or message about being forbidden
                    return 'You do not have permission to access this resource.';
                default:
                    return null;
            }
        }
        return null;
    };
    
    return { checkAuthRedirect };
};