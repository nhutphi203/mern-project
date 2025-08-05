// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import BrowserRouter
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { Toaster } from './components/ui/toaster.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 2. Bọc toàn bộ ứng dụng bằng <Router> */}
        <Router>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster />
            </QueryClientProvider>
        </Router>
    </React.StrictMode>
);