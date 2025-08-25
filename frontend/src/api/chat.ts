// frontend/src/api/chat.ts - Hospital AI Assistant API

import { apiClient } from './apiClient';
import type { ApiResponse } from './config';

export interface ChatMessage {
    message: string;
    intent?: string;
}

export interface ChatResponse {
    message: string;
    intent: string;
    suggestions?: string[];
    buttons?: Array<{
        text: string;
        action: string;
        path?: string;
    }>;
    contextualData?: Record<string, unknown> | null;
}


export const chatApi = {
    /**
     * Send message to public chat (no authentication required)
     * Supports mode as query param
     */
    sendPublicMessage: async (message: string, intent?: string, mode: 'public' | 'private' = 'public'): Promise<ApiResponse<ChatResponse>> => {
        const response = await apiClient.post(`/api/v1/chat/public?mode=${mode}`,
            { message, intent }
        );
        return response.data;
    },

    /**
     * Send message to private chat (authentication required)
     * Supports mode and role as query params
     */
    sendPrivateMessage: async (message: string, intent?: string, mode: 'public' | 'private' = 'private', role?: string): Promise<ApiResponse<ChatResponse>> => {
        let url = `/api/v1/chat/private?mode=${mode}`;
        if (role) url += `&role=${encodeURIComponent(role)}`;
        const response = await apiClient.post(url, { message, intent });
        return response.data;
    },

    /**
     * Check chat service status
     */
    getStatus: async (): Promise<ApiResponse<{ message: string; timestamp: string; version: string }>> => {
        const response = await apiClient.get('/api/v1/chat/status');
        return response.data;
    }
};

export default chatApi;
