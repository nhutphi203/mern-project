// src/components/layout/Navbar.tsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Home, Info, Stethoscope, Users, Phone, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Giả sử bạn có hook này để kiểm tra đăng nhập

const navItems = [
    { to: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { to: "/about", label: "About", icon: <Info className="h-5 w-5" /> },
    { to: "/services", label: "Services", icon: <Stethoscope className="h-5 w-5" /> },
    { to: "/doctors", label: "Doctors", icon: <Users className="h-5 w-5" /> },
    { to: "/contact", label: "Contact", icon: <Phone className="h-5 w-5" /> },
];

const Navbar = () => {
    // Logic kiểm tra đăng nhập có thể thêm ở đây nếu cần
    // const { currentUser } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* ✅ SỬA ĐỔI: Thêm justify-between để căn chỉnh các mục */}
            <div className="container flex h-16 items-center justify-between">
                {/* 1. Logo (bên trái) */}
                <Link to="/" className="flex items-center space-x-2">
                    <Stethoscope className="h-6 w-6 text-emerald-600" />
                    <span className="font-bold text-lg">HealthCare</span>
                </Link>

                {/* 2. Navigation (sẽ được đẩy ra giữa) */}
                <nav className="hidden md:flex items-center space-x-2">
                    <TooltipProvider>
                        {navItems.map((item) => (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2
                                            ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`
                                        }
                                    >
                                        {item.icon}
                                    </NavLink>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{item.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </nav>

                {/* 3. Nút Login (bên phải) - ✅ SỬA ĐỔI: Xóa flex-1 */}
                <div className="flex items-center space-x-4">
                    <Button asChild>
                        <Link to="/login">
                            <LogIn className="mr-2 h-4 w-4" /> Login / Register
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
