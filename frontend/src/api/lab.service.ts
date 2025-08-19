// frontend/src/api/lab.service.ts

import { LabTest, LabOrder, LabResult } from './lab.types.ts';
import { apiRequest } from './apiClient.ts';
import { AxiosError } from 'axios';

const API_BASE = '/api/v1/lab';

export const labService = {
    // Get all available lab tests
    async getAllTests(params?: {
        category?: string;
        search?: string;
    }): Promise<{ success: boolean; tests: LabTest[]; count: number }> {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.append('category', params.category);
        if (params?.search) searchParams.append('search', params.search);

        return apiRequest(`${API_BASE}/tests?${searchParams}`);
    },

    // Create new lab order (Doctor only)
    async createLabOrder(orderData: {
        encounterId: string;
        patientId: string;
        tests: Array<{
            testId: string;
            priority?: 'Routine' | 'Urgent' | 'STAT';
            instructions?: string;
        }>;
        clinicalInfo?: string;
    }): Promise<{ success: boolean; message: string; order: LabOrder }> {
        return apiRequest(`${API_BASE}/orders`, {
            method: 'POST',
            data: orderData,
        });
    },

    // Get lab queue for technicians
    async getLabQueue(params?: {
        status?: string;
        priority?: string;
        category?: string;
    }): Promise<{ success: boolean; orders: LabOrder[]; count: number }> {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.priority) searchParams.append('priority', params.priority);
        if (params?.category) searchParams.append('category', params.category);

        return apiRequest(`${API_BASE}/queue?${searchParams}`);
    },

    // Update test status
    async updateTestStatus(
        orderId: string,
        testId: string,
        status: string,
        notes?: string
    ): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/orders/${orderId}/tests/${testId}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, notes }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update test status');
        }

        return response.json();
    },

    // Enter lab results (Technician only)
    async enterLabResult(resultData: {
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
    }): Promise<{ success: boolean; message: string; result: LabResult }> {
        const response = await fetch(`${API_BASE}/results`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resultData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to enter lab result');
        }

        return response.json();
    },

    // Get lab results
    async getLabResults(params?: {
        patientId?: string;
        orderId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ success: boolean; results: LabResult[]; count: number }> {
        // Cho phép lấy tất cả results nếu patientId = 'all' (cho doctor/admin view)
        const allowAllResults = params?.patientId === 'all';

        // Kiểm tra xem có ít nhất một trong hai tham số patientId hoặc orderId không
        if (!params || (!params.patientId && !params.orderId && !allowAllResults)) {
            console.warn('getLabResults called without patientId or orderId');
            // Trả về kết quả rỗng thay vì throw lỗi
            return {
                success: true,
                results: [],
                count: 0
            };
        }

        const searchParams = new URLSearchParams();

        // Thêm tham số query từ params (không thêm patientId nếu là 'all')
        if (params?.patientId && params.patientId !== 'all') {
            searchParams.append('patientId', params.patientId);
        }
        if (params?.orderId) searchParams.append('orderId', params.orderId);

        // Thêm status mặc định là 'Completed' nếu không có
        if (params?.status) {
            searchParams.append('status', params.status);
        } else {
            searchParams.append('status', 'Completed'); // Mặc định chỉ lấy kết quả đã hoàn thành
        }

        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        // Luôn thêm limit mặc định nếu không có, để tránh lấy quá nhiều dữ liệu
        if (!params?.limit) searchParams.append('limit', '50');

        try {
            // Log chi tiết request để debug
            console.log(`Calling lab results API with params:`, Object.fromEntries(searchParams.entries()));

            // Sử dụng apiRequest thay vì fetch trực tiếp
            const response = await apiRequest<{ success: boolean; results: LabResult[]; count: number }>(`${API_BASE}/results?${searchParams}`);

            // Đảm bảo results luôn là array, ngay cả khi backend trả về null hoặc undefined
            return {
                success: response.success,
                results: Array.isArray(response.results) ? response.results : [],
                count: response.count || 0
            };
        } catch (error) {
            // Ghi log chi tiết hơn về lỗi
            const axiosError = error as AxiosError;
            console.error('Error fetching lab results:', {
                message: axiosError?.message,
                statusCode: axiosError?.response?.status,
                responseData: axiosError?.response?.data,
                stack: axiosError instanceof Error ? axiosError.stack : undefined
            });

            // Nếu có response data từ server, sử dụng message từ đó  
            // FIX: Proper type checking without type assertion
            if (axiosError.response?.data &&
                typeof axiosError.response.data === 'object' &&
                'message' in axiosError.response.data) {
                const errorData = axiosError.response.data as { message: string };
                throw new Error(errorData.message);
            }

            // Mặc định throw original message
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch lab results');
        }
    },

    // Generate lab report
    async generateLabReport(orderId: string): Promise<{ success: boolean; report: unknown }> {
        try {
            // Sử dụng apiRequest thay vì fetch trực tiếp
            return await apiRequest(`${API_BASE}/reports/${orderId}`);
        } catch (error) {
            console.error('Error generating lab report:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate lab report');
        }
    },

    // Download lab report as PDF
    async downloadLabReportPdf(orderId: string, filename = `lab-report-${orderId}.pdf`): Promise<void> {
        const response = await fetch(`${API_BASE}/reports/${orderId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/pdf',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download lab report');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },

    // Get lab statistics
    async getLabStats(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{ success: boolean; stats: unknown; categoryStats: [] }> {
        const searchParams = new URLSearchParams();
        if (params?.startDate) searchParams.append('startDate', params.startDate);
        if (params?.endDate) searchParams.append('endDate', params.endDate);

        try {
            // Sử dụng apiRequest thay vì fetch trực tiếp
            return await apiRequest(`${API_BASE}/stats?${searchParams}`);
        } catch (error) {
            console.error('Error fetching lab stats:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch lab stats');
        }
    },
};