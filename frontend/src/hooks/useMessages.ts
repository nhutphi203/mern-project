
// src/hooks/useMessages.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageApi } from '@/api';
import type { MessageRequest } from '@/api/types';
import { toast } from '@/hooks/use-toast';

export const useMessages = () => {
    const queryClient = useQueryClient();

    // Get all messages (admin only)
    const messagesQuery = useQuery({
        queryKey: ['messages'],
        queryFn: () => messageApi.getAllMessages(),
        select: (data) => data.messages,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: messageApi.sendMessage,
        onSuccess: () => {
            toast({
                title: "Message Sent",
                description: "Your message has been sent successfully. We'll get back to you soon.",
            });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
        onError: (error: unknown) => {
            toast({
                title: "Message Failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    return {
        messages: messagesQuery.data,
        isLoading: messagesQuery.isLoading,
        error: messagesQuery.error,
        sendMessage: sendMessageMutation.mutate,
        isSending: sendMessageMutation.isPending,
    };
};
