
import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import QueryClient và QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css'; // Hoặc file CSS global của bạn

// 2. Tạo một instance của QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 3. Bọc component <App /> bằng QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);