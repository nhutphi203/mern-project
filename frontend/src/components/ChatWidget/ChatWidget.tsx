// frontend/src/components/ChatWidget/ChatWidget.tsx - Hospital AI Assistant Widget

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    MessageCircle,
    Send,
    X,
    Bot,
    User,
    Loader2,
    Phone,
    AlertTriangle,
    ExternalLink,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';
import { chatApi } from '@/api/chat';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    intent?: string;
    suggestions?: string[];
    buttons?: Array<{
        text: string;
        action: string;
        path?: string;
    }>;
}

interface ChatWidgetProps {
    className?: string;
    position?: 'bottom-right' | 'bottom-left' | 'custom';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    className = '',
    position = 'bottom-right'
}) => {
    const { data: currentUser } = useCurrentUser();
    const navigate = useNavigate();

    // Chat state
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if user is authenticated
    const isAuthenticated = !!currentUser?.user;
    const userRole = currentUser?.user?.role;
    // Chat mode: 'public' or 'private'
    const chatMode = isAuthenticated ? 'private' : 'public';

    // Position styles
    const positionClasses = {
        'bottom-right': 'fixed bottom-4 right-4 z-50',
        'bottom-left': 'fixed bottom-4 left-4 z-50',
        'custom': ''
    };

    // Get role-based suggestions
    const getRoleBasedSuggestions = useCallback((role?: string) => {
        const suggestions = {
            'Patient': ['My appointments', 'Test results', 'Medical records', 'View bills'],
            'Doctor': ['Patient schedule', 'Lab results', 'Medical records', 'Prescriptions'],
            'Admin': ['System reports', 'User management', 'Financial data', 'Hospital stats'],
            'Nurse': ['Patient care', 'Vital signs', 'Medication logs', 'Care plans']
        };

        return suggestions[role as keyof typeof suggestions] || suggestions['Patient'];
    }, []);

    // Get role-based action buttons
    const getRoleBasedButtons = useCallback((role?: string) => {
        const buttons = {
            'Patient': [
                { text: 'My Dashboard', action: 'navigate', path: '/dashboard' },
                { text: 'Book Appointment', action: 'navigate', path: '/book-appointment' }
            ],
            'Doctor': [
                { text: 'Doctor Dashboard', action: 'navigate', path: '/doctor-dashboard' },
                { text: 'Patient Records', action: 'navigate', path: '/medical-records' }
            ],
            'Admin': [
                { text: 'Admin Dashboard', action: 'navigate', path: '/admin-dashboard' },
                { text: 'System Reports', action: 'navigate', path: '/reports' }
            ]
        };

        return buttons[role as keyof typeof buttons] || buttons['Patient'];
    }, []);

    // Initialize chat with welcome message
    const initializeChat = useCallback(async () => {
        // Always show public welcome if not authenticated
        let welcomeMessage: Message;
        if (chatMode === 'public') {
            welcomeMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: "Hello! I'm the AI assistant for MediFlow Health Center. I can help you with hospital information, appointment booking, and answer common questions. How can I assist you?",
                timestamp: new Date(),
                intent: 'greeting',
                suggestions: ['Hospital services', 'Book appointment', 'Visiting hours', 'Emergency info'],
                buttons: [
                    { text: 'Login', action: 'navigate', path: '/login' },
                    { text: 'Register', action: 'navigate', path: '/register' }
                ]
            };
        } else {
            welcomeMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Hello ${currentUser?.user?.firstName}! I'm your AI assistant. How can I help you today?`,
                timestamp: new Date(),
                intent: 'greeting',
                suggestions: getRoleBasedSuggestions(userRole),
                buttons: getRoleBasedButtons(userRole)
            };
        }
        setMessages([welcomeMessage]);
    }, [chatMode, currentUser?.user?.firstName, userRole, getRoleBasedSuggestions, getRoleBasedButtons]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeChat();
        }
    }, [isOpen, messages.length, initializeChat]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || inputValue.trim();
        if (!text || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Always pass mode and role as query param
            let response;
            if (chatMode === 'private') {
                response = await chatApi.sendPrivateMessage(text, undefined, chatMode, userRole);
            } else {
                response = await chatApi.sendPublicMessage(text, undefined, chatMode);
            }

            if (response.success) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    content: response.data.message,
                    timestamp: new Date(),
                    intent: response.data.intent,
                    suggestions: response.data.suggestions,
                    buttons: response.data.buttons
                };

                setMessages(prev => [...prev, botMessage]);

                // Mark as unread if chat is minimized
                if (isMinimized) {
                    setHasUnreadMessages(true);
                }
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team if the issue persists.",
                timestamp: new Date(),
                intent: 'error'
            };

            setMessages(prev => [...prev, errorMessage]);

            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const handleButtonClick = (button: { text: string; action: string; path?: string }) => {
        if (button.action === 'navigate' && button.path) {
            // Only redirect if user clicks login/register in chat
            if (button.path === '/login' || button.path === '/register') {
                navigate(button.path);
                setIsOpen(false);
            } else if (isAuthenticated) {
                // Only allow private navigation if authenticated
                navigate(button.path);
                setIsOpen(false);
            }
        } else if (button.action === 'show_emergency_info') {
            showEmergencyInfo();
        }
    };

    const showEmergencyInfo = () => {
        const emergencyMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: "🚨 EMERGENCY INFORMATION 🚨\n\nFor LIFE-THREATENING emergencies, call 911 immediately!\n\n📍 Emergency Department: Open 24/7\n📞 Emergency Line: +1-555-EMERGENCY\n🏥 Address: 123 Healthcare Avenue, Medical District",
            timestamp: new Date(),
            intent: 'emergency_info'
        };

        setMessages(prev => [...prev, emergencyMessage]);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        if (isMinimized) {
            setHasUnreadMessages(false);
        }
    };

    const openChat = () => {
        setIsOpen(true);
        setHasUnreadMessages(false);
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <div className={`${positionClasses[position]} ${className}`}>
                <Button
                    onClick={openChat}
                    className="h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative"
                >
                    <MessageCircle className="h-6 w-6" />
                    {hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">•</span>
                        </span>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className={`${positionClasses[position]} ${className}`}>
            <Card className={`w-96 transition-all duration-300 shadow-2xl ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-teal-600 text-white rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5" />
                        <CardTitle className="text-sm font-medium">
                            {isAuthenticated ? `AI Assistant (${userRole})` : 'Hospital AI Assistant'}
                        </CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMinimize}
                            className="h-8 w-8 p-0 text-white hover:bg-teal-700"
                        >
                            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeChat}
                            className="h-8 w-8 p-0 text-white hover:bg-teal-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <CardContent className="flex flex-col h-[calc(600px-4rem)] p-0">
                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                {message.type === 'bot' && (
                                                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                                    {/* Suggestions */}
                                                    {message.suggestions && message.suggestions.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {message.suggestions.map((suggestion, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="secondary"
                                                                    className="cursor-pointer hover:bg-teal-100 text-xs"
                                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                                >
                                                                    {suggestion}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {message.buttons && message.buttons.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {message.buttons.map((button, index) => (
                                                                <Button
                                                                    key={index}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleButtonClick(button)}
                                                                >
                                                                    {button.text}
                                                                    {button.action === 'navigate' && (
                                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                <Bot className="h-4 w-4" />
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-gray-600">Typing...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t p-4">
                            <div className="flex space-x-2">
                                <Input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => sendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    size="sm"
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Emergency Notice */}
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                For medical emergencies, call 911 immediately
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default ChatWidget;
