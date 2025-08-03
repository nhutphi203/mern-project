import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("API FAIL:", err);
        setMessage("❌ Backend not reachable");
        console.log('✅ VITE_API_URL:', import.meta.env.VITE_API_URL);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* Hiển thị kết quả ping backend */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Ping result: {message}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
