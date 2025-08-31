import { useState, useEffect } from 'react';

interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

export const useMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    // TODO: Implement actual API call
    useEffect(() => {
        setMessages([]); // Placeholder
    }, []);

    return { messages, loading };
};