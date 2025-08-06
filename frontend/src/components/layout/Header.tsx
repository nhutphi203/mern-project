// src/components/layout/Header.tsx - Redesigned by Gemini UI Expert

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Menu, X, LayoutDashboard, LogOut
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import { useCurrentUser, useAuth } from "@/hooks/useAuth";
import DarkModeToggle from "./DarkModeToggle";

// Component cho một link điều hướng, tự động highlight khi active
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`relative text-sm font-medium transition-colors duration-300 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
        >
            {children}
            <span
                className={`absolute bottom-[-4px] left-0 h-[2px] w-full bg-teal-500 transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`}
            />
        </Link>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // --- LOGIC GỐC (GIỮ NGUYÊN) ---
    const { data: currentUser } = useCurrentUser();
    const { logoutMutation } = useAuth();
    const navigate = useNavigate();
    const isAuthenticated = !!currentUser?.user;
    const user = currentUser?.user;
    const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "G";
    // --- KẾT THÚC LOGIC ---

    const handleLogout = () => {
        logoutMutation();
        navigate('/');
    };

    // Hiệu ứng Header khi cuộn trang
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 10);
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/services", label: "Services" },
        { to: "/doctors", label: "Doctors" },
        { to: "/contact", label: "Contact" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md' : 'bg-transparent'} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="container mx-auto px-4">
                {/* Sửa lỗi layout: Bỏ `relative` và để flexbox tự căn chỉnh */}
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        Medi<span className="text-gray-800 dark:text-gray-200">Flow</span>
                    </Link>

                    {/* Navigation Links (Desktop) - Bỏ absolute positioning */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <div key={link.to} className="group">
                                <NavLink to={link.to}>{link.label}</NavLink>
                            </div>
                        ))}
                    </nav>

                    {/* Container cho các nút bên phải */}
                    <div className="flex items-center gap-2">
                        {/* Authentication Buttons / User Menu (Desktop) */}
                        <div className="hidden md:flex items-center space-x-2">
                            <DarkModeToggle />
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                                            <Avatar className="h-12 w-12 border-2 border-teal-500/50">
                                                {user.docAvatar?.url && <AvatarImage src={user.docAvatar.url} alt={`${user.firstName}`} />}
                                                <AvatarFallback className="bg-teal-100 text-teal-600 font-bold">{userInitials}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" asChild>
                                        <Link to="/login">Login</Link>
                                    </Button>
                                    <Button asChild className="bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                        <Link to="/register">Book Appointment</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            <DarkModeToggle />
                            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
                                {isMenuOpen ? <X /> : <Menu />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden py-4 border-t border-border bg-white dark:bg-gray-900">
                    <nav className="flex flex-col space-y-4 px-4">
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex flex-col space-y-2 pt-4 border-t">
                            {isAuthenticated ? (
                                <>
                                    <Button variant="outline" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>Dashboard</Button>
                                    <Button variant="destructive" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>Logout</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" asChild><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></Button>
                                    <Button asChild><Link to="/register" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link></Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
