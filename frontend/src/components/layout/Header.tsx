import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, Clock } from "lucide-react";
// Thêm vào khu vực import ở đầu file Dashboard.tsx
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Home,
    Info,
    Stethoscope,
    Users,
    MailQuestion,
    LayoutDashboard, LogOut
} from "lucide-react";
import { PersonStanding, Cake } from 'lucide-react'; // Icon mới cho Giới tính và Ngày sinh
import { useCurrentUser, useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: currentUser } = useCurrentUser();
    const isAuthenticated = !!currentUser?.user;
    const user = currentUser?.user;
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "G";
    const navigate = useNavigate();
    const { logoutMutation } = useAuth();

    const handleLogout = () => {
        if (user?.role) {
            logoutMutation(); // <-- Gọi hàm logout chung
            navigate('/');
        }
    };
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">            {/* Top bar with contact info */}
            {/* === BẮT ĐẦU SỬA: Top bar with contact info === */}
            <div className="hidden md:block bg-primary text-primary-foreground py-2">
                <div className="container mx-auto px-4">
                    <TooltipProvider>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-6">
                                {/* Phone Tooltip */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Phone className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Emergency: +84 123 456 789</p>
                                    </TooltipContent>
                                </Tooltip>

                                {/* Mail Tooltip */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Mail className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>info@mediflow.com</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Clock Tooltip */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <Clock className="h-4 w-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Mon - Sat: 9 AM - 7 PM</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
            {/* === KẾT THÚC SỬA === */}

            {/* Main navigation */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Medi<span className="text-foreground">Flow</span>
                    </Link>

                    {/* Item 2: Nav Icons (Sẽ tự động căn giữa) */}
                    <div className="hidden md:block">
                        <TooltipProvider>
                            <nav className="flex items-center space-x-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/" className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"><Home className="h-5 w-5" /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Home</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/about" className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"><Info className="h-5 w-5" /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent><p>About</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/services" className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"><Stethoscope className="h-5 w-5" /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Services</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/doctors" className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"><Users className="h-5 w-5" /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Doctors</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/contact" className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"><MailQuestion className="h-5 w-5" /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Contact</p></TooltipContent>
                                </Tooltip>
                            </nav>
                        </TooltipProvider>
                    </div>

                    {/* === BẮT ĐẦU SỬA: Hiển thị Avatar hoặc các nút Login/Register === */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            // Nếu đã đăng nhập, hiển thị User Menu
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            {/* <AvatarImage src={user.avatarUrl} alt={user.firstName} /> */}
                                            <AvatarFallback>{userInitials}</AvatarFallback>
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
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            // Nếu chưa đăng nhập, hiển thị các nút Login/Register
                            <>
                                <Button variant="outline" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/register">Book Appointment</Link>
                                </Button>
                            </>
                        )}
                    </div>
                    {/* === KẾT THÚC SỬA === */}



                    <div className="md:hidden">
                        <Button onClick={toggleMenu} variant="ghost" size="icon">
                            {isMenuOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                to="/"
                                className="text-foreground hover:text-primary transition-colors"
                                onClick={toggleMenu}
                            >
                                Home
                            </Link>
                            <Link
                                to="/about"
                                className="text-foreground hover:text-primary transition-colors"
                                onClick={toggleMenu}
                            >
                                About
                            </Link>
                            <Link
                                to="/services"
                                className="text-foreground hover:text-primary transition-colors"
                                onClick={toggleMenu}
                            >
                                Services
                            </Link>
                            <Link
                                to="/doctors"
                                className="text-foreground hover:text-primary transition-colors"
                                onClick={toggleMenu}
                            >
                                Doctors
                            </Link>
                            <Link
                                to="/contact"
                                className="text-foreground hover:text-primary transition-colors"
                                onClick={toggleMenu}
                            >
                                Contact
                            </Link>
                            <div className="flex flex-col space-y-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link to="/login" onClick={toggleMenu}>Login</Link>
                                </Button>
                                <Button variant="hero" asChild>
                                    <Link to="/register" onClick={toggleMenu}>Book Appointment</Link>
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;