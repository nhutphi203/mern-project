// frontend/src/api/lab.service.ts

import { LabTest, LabOrder, LabResult } from './lab.types.ts';

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

        const response = await fetch(`${API_BASE}/tests?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lab tests');
        }

        return response.json();
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
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create lab order');
        }

        return response.json();
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

        const response = await fetch(`${API_BASE}/queue?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lab queue');
        }

        return response.json();
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
    }): Promise<{ success: boolean; results: LabResult[]; count: number }> {
        const searchParams = new URLSearchParams();
        if (params?.patientId) searchParams.append('patientId', params.patientId);
        if (params?.orderId) searchParams.append('orderId', params.orderId);

        const response = await fetch(`${API_BASE}/results?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lab results');
        }

        return response.json();
    },

    // Generate lab report
    async generateLabReport(orderId: string): Promise<{ success: boolean; report: unknown }> {
        const response = await fetch(`${API_BASE}/reports/${orderId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to generate lab report');
        }

        return response.json();
    },

    // Get lab statistics
    async getLabStats(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{ success: boolean; stats: unknown; categoryStats: [] }> {
        const searchParams = new URLSearchParams();
        if (params?.startDate) searchParams.append('startDate', params.startDate);
        if (params?.endDate) searchParams.append('endDate', params.endDate);

        const response = await fetch(`${API_BASE}/stats?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lab stats');
        }

        return response.json();
    },
};