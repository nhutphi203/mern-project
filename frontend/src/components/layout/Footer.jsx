import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    HeartPulse
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-teal-600 dark:text-teal-400 select-none bg-primary text-primary-foreground">
            {/* Tăng padding dọc (py-20) để thoáng hơn */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Giảm gap một chút để các cột gần nhau hơn, tạo cảm giác cân đối */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* === Cột 1: Thông tin công ty === */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center space-x-2">
                            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                                <HeartPulse className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-2xl font-bold">MediFlow</span>
                        </Link>
                        <p className="text-primary-foreground/80 text-sm leading-relaxed">
                            Your trusted partner in health, providing compassionate and innovative medical care.
                        </p>
                        <div className="flex space-x-2 pt-2">
                            <a href="#" className="p-2 rounded-full hover:bg-white/20 transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="p-2 rounded-full hover:bg-white/20 transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="p-2 rounded-full hover:bg-white/20 transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="p-2 rounded-full hover:bg-white/20 transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* === Cột 2: Các liên kết nhanh === */}
                    <div className="select-none space-y-4">
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Quick Links</h3>
                        <nav className="flex flex-col space-y-3">
                            <Link to="/about" className="text-primary-foreground/80 hover:text-white hover:underline transition-colors">About Us</Link>
                            <Link to="/services" className="text-primary-foreground/80 hover:text-white hover:underline transition-colors">Services</Link>
                            <Link to="/doctors" className="text-primary-foreground/80 hover:text-white hover:underline transition-colors">Find a Doctor</Link>
                            <Link to="/contact" className="text-primary-foreground/80 hover:text-white hover:underline transition-colors">Contact</Link>
                        </nav>
                    </div>

                    {/* === Cột 3: Thông tin liên hệ (ĐÃ SỬA CĂN CHỈNH) === */}
                    <div className="select-none space-y-4">
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Contact Us</h3>
                        <div className="flex flex-col space-y-4 text-sm">

                            {/* Address */}
                            <div className="flex items-center gap-4"> {/* Sửa: items-start -> items-center */}
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-white/10">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                                {/* Sửa: Bỏ pt-2 */}
                                <span className="text-primary-foreground/80">123 Health St, Wellness City, 90001</span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4"> {/* Sửa: items-start -> items-center */}
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-white/10">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                                {/* Sửa: Bỏ pt-2 */}
                                <span className="text-primary-foreground/80">contact@mediflow.com</span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-4"> {/* Sửa: items-start -> items-center */}
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-white/10">
                                    <Phone className="h-5 w-5 text-white" />
                                </div>
                                {/* Sửa: Bỏ pt-2 */}
                                <span className="text-primary-foreground/80">+84 123 456 789</span>
                            </div>

                        </div>
                    </div>
                    {/* === Cột 4: Giờ làm việc (với icon màu) === */}
                    <div className="select-none space-y-4">
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Opening Hours</h3>
                        <div className="flex flex-col space-y-4 text-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-white/10">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-primary-foreground/80 pt-2">
                                    <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
                                    <p>Sun: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


                {/* === Phần chân trang cuối cùng === */}
                <div className="select-none flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/70">
                    <p>© {new Date().getFullYear()} MediFlow. All Rights Reserved.</p>
                    <div className="flex gap-x-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;