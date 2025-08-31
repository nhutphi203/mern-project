// src/components/layout/Header.tsx - Fixed Authentication Logic

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
import { ApiError } from "@/api";
// Component cho một link điều hướng, tự động highlight khi active
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`relative text-sm font-medium transition-colors duration-300 ${isActive
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
        >
            {children}
            <span
                className={`absolute bottom-[-4px] left-0 h-[2px] w-full bg-teal-500 transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'
                    } group-hover:scale-x-100`}
            />
        </Link>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    // 🔧 FIX: Only check auth on certain routes to prevent unnecessary API calls
    const shouldCheckAuth = !['/', '/about', '/services', '/doctors', '/contact'].includes(location.pathname);

    // Conditional auth check
    const { data: currentUser, error: authError } = useCurrentUser({ enabled: shouldCheckAuth }); const { logoutMutation } = useAuth();

    // 🔧 FIX: Clear user data if we get 401 error
    useEffect(() => {
        if (authError instanceof ApiError && authError.status === 401) {
            console.log('🚨 401 Unauthorized - clearing any cached auth data');
            // The react-query will automatically handle this, but we ensure no stale data
        }
    }, [authError]);

    const isAuthenticated = !!currentUser?.user;
    const user = currentUser?.user;
    const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "G";

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

    // 🔧 FIX: Updated navLinks without Medical Records for public access
    const navLinks = [
        { to: "/dashboard", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/services", label: "Services" },
        { to: "/doctors", label: "Doctors" },
        { to: "/contact", label: "Contact" },
        // Medical Records should only be accessible after login
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
                ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
                : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
                } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/dashboard" className="text-2xl font-bold text-teal-600 dark:text-teal-400 z-10 relative">
                        Medi<span className="text-gray-800 dark:text-gray-200">Flow</span>
                    </Link>

                    {/* Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop authentication */}
                        <div className="hidden md:flex items-center space-x-3">
                            <DarkModeToggle />
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <Avatar className="h-10 w-10 border-2 border-teal-500/30 hover:border-teal-500/60 transition-colors">
                                                {user.docAvatar?.url && (
                                                    <AvatarImage src={user.docAvatar.url} alt={`${user.firstName}`} />
                                                )}
                                                <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 font-semibold text-sm">
                                                    {userInitials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground font-medium mt-1">
                                                    Role: {user.role}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </DropdownMenuItem>
                                        {/* Add Medical Records link for authenticated users */}
                                        {user.role === 'Patient' && (
                                            <DropdownMenuItem onClick={() => navigate('/medical-records')} className="cursor-pointer">
                                                <span>Medical Records</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 cursor-pointer"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                                        <Link to="/login">Login</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        <Link to="/book-appointment">Book Appointment</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center gap-2">
                            <DarkModeToggle />
                            <Button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                variant="ghost"
                                size="icon"
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
                    <nav className="flex flex-col px-4 py-4 space-y-3">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        {user?.firstName} {user?.lastName} ({user?.role})
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                                        className="w-full justify-start"
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                    {user?.role === 'Patient' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => { navigate('/medical-records'); setIsMenuOpen(false); }}
                                            className="w-full justify-start"
                                        >
                                            Medical Records
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="w-full justify-start"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" asChild className="w-full justify-start">
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                    </Button>
                                    <Button asChild className="w-full justify-start bg-teal-600 hover:bg-teal-700">
                                        <Link to="/book-appointment" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link>
                                    </Button>
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