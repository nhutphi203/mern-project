
// src/api/messages.ts
import { apiRequest } from './config';
import type { Message, MessageRequest } from './types';

export const messageApi = {
    // Send message (public)
    sendMessage: async (data: MessageRequest) => {
        return apiRequest('/message/send', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all messages (admin only)
    getAllMessages: async () => {
        return apiRequest<{ messages: Message[] }>('/message/getall');
    },
};
