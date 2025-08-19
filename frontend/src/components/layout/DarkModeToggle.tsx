import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const DarkModeToggle = () => {
    // 1. Khởi tạo state từ localStorage để ghi nhớ lựa chọn của người dùng
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            // Kiểm tra cả cài đặt hệ thống nếu chưa có trong localStorage
            const userPreference = localStorage.getItem("theme");
            if (userPreference) {
                return userPreference === "dark";
            }
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });

    // 2. Sử dụng useEffect để thêm/xóa class 'dark' và cập nhật localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full h-10 w-10 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle Dark Mode"
        >
            {/* Sun icon hiển thị khi isDarkMode = true */}
            <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-300 ease-in-out transform ${isDarkMode ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
            {/* Moon icon hiển thị khi isDarkMode = false */}
            <Moon className={`absolute h-5 w-5 text-slate-600 transition-all duration-300 ease-in-out transform ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

export default DarkModeToggle;
