// Test lab service without authentication
import { LabResult } from './lab.types';

const API_BASE = '/api/v1/lab';

export const labTestService = {
    // Get lab results without authentication (for testing only)
    async getTestResults(params?: {
        patientId?: string;
        orderId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ success: boolean; results: LabResult[]; count: number }> {
        const searchParams = new URLSearchParams();

        // Add query parameters if provided
        if (params?.patientId && params.patientId !== 'all') {
            searchParams.append('patientId', params.patientId);
        }
        if (params?.orderId) searchParams.append('orderId', params.orderId);
        if (params?.status) searchParams.append('status', params.status);
        else searchParams.append('status', 'Completed'); // Default status
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        // Always add limit default
        if (!params?.limit) searchParams.append('limit', '50');

        try {
            console.log(`Calling test lab results API with params:`, Object.fromEntries(searchParams.entries()));
            console.log(`Full URL: ${API_BASE}/results?${searchParams}`);

            const response = await fetch(`${API_BASE}/results?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // Check content type to detect HTML responses
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            if (!response.ok) {
                let errorMessage = 'Failed to fetch lab results';
                try {
                    if (contentType?.includes('application/json')) {
                        const error = await response.json();
                        errorMessage = error.message || errorMessage;
                    } else {
                        const text = await response.text();
                        console.log('Non-JSON response:', text.substring(0, 200));
                        errorMessage = `Server returned HTML instead of JSON. Check if backend is running on port 4000.`;
                    }
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Check if response is JSON
            if (!contentType?.includes('application/json')) {
                const text = await response.text();
                console.log('Expected JSON but got:', text.substring(0, 200));
                throw new Error('Server returned HTML instead of JSON. Backend may not be running.');
            }

            const data = await response.json();
            console.log('API Response data:', data);

            // Ensure results is always an array
            return {
                success: data.success,
                results: Array.isArray(data.results) ? data.results : [],
                count: data.count || 0
            };
        } catch (error) {
            console.error('Error fetching test lab results:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch lab results');
        }
    },
};
