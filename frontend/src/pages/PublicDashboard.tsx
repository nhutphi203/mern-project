import ChatWidget from '../components/ChatWidget/ChatWidget';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton'; // <-- 1. Import Skeleton để làm loading UI
import { type NavigateFunction } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useDoctors } from '@/hooks/useDoctors'; // Địa chỉ hook cho API bác sĩ
import {
    Calendar, Clock, Users, Stethoscope, Heart, Activity, Shield, Phone, Mail, MapPin, Star, ArrowRight, UserPlus, LogIn, CalendarPlus, FileText, CreditCard, TestTube2, Search, Play, CheckCircle2, Award, Building2, MessageSquare, TrendingUp, Zap, HeartHandshake, AlertTriangle, Timer, Target, LifeBuoy, BookOpen, Banknote, ShieldCheck, BriefcaseMedical, Building, Globe

} from 'lucide-react';
import { getAllServices, IServiceAPI } from '@/api/serviceApi';

// Mock data cho public information
const publicStats = {
    totalDoctors: 25,
    totalServices: 12,
    yearsOfService: 15,
    happyPatients: 10000
};

const patientInfoLinks = [
    {
        title: "Appointment Guide",
        icon: <BookOpen />,
        description: "Step-by-step guide for your visit.",
        guideTitle: "How to Book an Appointment",
        guideContent: `We offer several convenient ways to schedule your appointment:\n\nOnline Booking:\n1. Use the "Book an Appointment" form on our homepage for quick scheduling.\n2. For more options, log in to the Patient Portal to select your specific doctor and view their availability.\n\nBy Phone:\n- Call our hotline at (123) 456-7890 to speak with a scheduling coordinator.\n\nBefore you book, please have the following information ready:\n- Full Name and Date of Birth\n- Insurance Information (if applicable)\n- Preferred Doctor or Department\n\nAfter booking, you will receive a confirmation email and a reminder SMS 24 hours before your appointment.`
    },
    {
        title: "Service Pricing",
        icon: <Banknote />,
        description: "Transparent pricing for all services.",
        guideTitle: "Understanding Our Service Pricing",
        guideContent: `We are committed to price transparency. While the final cost may vary based on your specific needs and insurance plan, we provide estimates for common services.\n\nA standard consultation fee typically ranges from $6 to $15.\n\nFor a detailed price list or a personalized estimate, please contact our billing department at billing@mediflow.com or call (123) 456-7891. Our team is happy to assist you with any financial questions.`
    },
    {
        title: "Insurance Information",
        icon: <ShieldCheck />,
        description: "List of affiliated insurance partners.",
        guideTitle: "Insurance Coverage Guide",
        guideContent: `We partner with a wide range of national and international insurance providers to make your care more accessible. Some of our major partners include:\n\n- Bao Viet Insurance\n- Prudential\n- Manulife\n- AIA\n\nTo verify your coverage, please call the number on the back of your insurance card or contact our insurance verification team at (123) 456-7892. We will help you understand your benefits and any out-of-pocket costs.`
    },
    {
        title: "Payment Process",
        icon: <CreditCard />,
        description: "Easy and secure payment methods.",
        guideTitle: "How to Make a Payment",
        guideContent: `We offer multiple convenient payment options for your bills:\n\n1. Online Portal: The easiest way is to pay through our secure Patient Portal after your visit.\n2. In-Person: You can pay at our billing department via cash, credit/debit card, or QR code.\n3. Bank Transfer: Please contact our billing office for bank transfer details.\n\nCo-payments are typically due at the time of service. For any questions regarding your bill, our financial counselors are available to assist you.`
    },
];
const achievements = [
    { value: "ISO 9001:2015", label: "Quality Management", icon: <Award /> },
    { value: "Top 10", label: "Hospitals in Vietnam", icon: <TrendingUp /> },
    { value: "50,000+", label: "Successful Surgeries", icon: <CheckCircle2 /> },
    { value: "JCI Accredited", label: "International Standards", icon: <Globe /> },
];

type Partner = {
    name: string;
    domain?: string;   // dùng cho Clearbit
    logo?: string;     // URL ảnh chính chủ (nếu có)
};

// danh sách partners
const partners: Partner[] = [
    {
        name: "World Health Organization",
        logo: "https://www.who.int/ResourcePackages/WHO/assets/dist/images/logos/en/h-logo-blue.svg"
    },
    { name: "Vinamilk", domain: "vinamilk.com.vn" },
    { name: "Bao Viet Insurance", domain: "baoviet.com.vn" },
    { name: "Prudential", domain: "prudential.com.vn" },
];

// hàm lấy link logo
const getLogoUrl = (p: Partner) =>
    p.logo ?? (p.domain ? `https://logo.clearbit.com/${p.domain}` : "/assets/partner-fallback.png")
const extendedTestimonials = [
    { name: "Emily Johnson", review: "The care I received was exceptional. The staff were attentive, and the facilities are top-notch. I felt safe and well-cared for throughout my stay.", image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { name: "Michael Chen", review: "Booking an appointment was seamless, and the follow-up care has been fantastic. Dr. Tran is incredibly knowledgeable and compassionate.", image: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { name: "Sophia Nguyen", review: "A truly world-class hospital. From the technology to the expertise of the doctors, everything exceeded my expectations. Highly recommended!", image: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
];
interface AuthActionProps {
    isAuthenticated: boolean;
    navigate: NavigateFunction;
}
const QuickAppointmentForm = ({ isAuthenticated, navigate }: AuthActionProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            // Mock API call
            alert('Your appointment request has been submitted!');
        }
    };

    return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg mt-12">
            <CardHeader>
                <CardTitle className="text-white text-2xl text-center">Book an Appointment</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Input đã được thêm dark variant */}
                    <Input placeholder="Your Name" className="bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 md:col-span-2" />
                    <Input placeholder="Phone Number" className="bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 md:col-span-2" />
                    <Input type="date" className="bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600" />
                    <select className="w-full p-2 rounded-md bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 md:col-span-4">
                        <option>Select Department</option>
                        <option>Cardiology</option>
                        <option>Neurology</option>
                    </select>
                    {/* Button đã được thêm dark variant */}
                    <Button type="submit" className="w-full bg-white text-emerald-600 hover:bg-gray-200 dark:bg-emerald-500 dark:text-gray-900 dark:hover:bg-emerald-400 md:col-span-1">Submit</Button>
                </form>
            </CardContent>
        </Card>
    );
};
const AchievementsSection = () => (
    <section className="py-20 bg-teal-700 text-white dark:text-gray-100">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {achievements.map(ach => (
                    <div key={ach.label}>
                        {React.cloneElement(ach.icon, { className: "h-12 w-12 mx-auto mb-4 text-yellow-300" })}
                        <div className="text-3xl font-bold">{ach.value}</div>
                        <div className="text-teal-200">{ach.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const LiveChatButton = ({ isAuthenticated, navigate }: AuthActionProps) => (
    <button
        onClick={() => !isAuthenticated ? navigate('/login') : alert('Opening chat...')}
        className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-transform hover:scale-110 z-50"
    >
        <MessageSquare className="h-6 w-6" />
    </button>
);

const healthTips = [
    {
        title: '5 Ways to Boost Your Immune System',
        excerpt: 'Simple daily habits that can strengthen your natural defenses against illness...',
        readTime: '3 min read',
        category: 'Wellness',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
        url: 'https://vinmec.com/vi/tin-tuc/thong-tin-suc-khoe/5-cach-tang-cuong-he-mien-dich/'

    },
    {
        title: 'Understanding Blood Pressure Numbers',
        excerpt: 'What your blood pressure readings mean for your heart health...',
        readTime: '4 min read',
        category: 'Heart Health',
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop',
        url: 'https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/blood-pressure/art-20050982'

    },
    {
        title: 'Mental Health in the Digital Age',
        excerpt: 'Managing stress and anxiety in our hyper-connected world...',
        readTime: '5 min read',
        category: 'Mental Health',
        image: 'https://images.unsplash.com/photo-1559757164-f5fd3ed47a7d?w=400&h=250&fit=crop',
        url: 'https://my.clevelandclinic.org/health/articles/mental-health-digital-age'
    },
];


// Component để hiển thị các chức năng yêu cầu đăng nhập
const PrivateFeatureCard = ({ title, description, icon, action, loginRequired = true }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    loginRequired?: boolean;
}) => {
    const navigate = useNavigate();
    const { doctors, isLoading, error } = useDoctors();

    const handleClick = () => {
        if (loginRequired) {
            navigate('/login', { state: { message: `Please log in to access ${action}` } });
        }
    };

    return (
        <Card className="hover:shadow-xl transition-all duration-300 dark:text-gray-100 group cursor-pointer border-dashed border-2 border-gray-300 hover:border-teal-500">
            <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors duration-300">
                    {React.cloneElement(icon as React.ReactElement, {
                        className: "h-8 w-8 text-gray-400  group-hover:text-teal-600 transition-colors duration-300"
                    })}
                </div>
                <h3 className="font-semibold text-lg mb-2 dark:text-gray-100 text-gray-700 group-hover:text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-100">{description}</p>
                <Button
                    variant="outline"
                    onClick={handleClick}
                    className="group-hover:border-teal-500 group-hover:text-teal-600"
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login to Access
                </Button>
            </CardContent>
        </Card>
    );
};
const DoctorLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="text-center">
                <CardContent className="p-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/3 mx-auto mb-2" />
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
);
const handleReadMore = (title: string, source: string) => {
    const query = encodeURIComponent(title);
    let url = "";

    switch (source) {
        case "vinmec":
            url = `https://www.google.com/search?q=${query}+site:vinmec.com`;
            break;
        case "mayoclinic":
            url = `https://www.google.com/search?q=${query}+site:mayoclinic.org`;
            break;
        case "cleveland":
            url = `https://www.google.com/search?q=${query}+site:my.clevelandclinic.org`;
            break;
        default:
            url = `https://www.google.com/search?q=${query}`;
    }

    window.open(url, "_blank");
};
const DashboardPublic = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const isAuthenticated = false;
    const [services, setServices] = useState<IServiceAPI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const result = await getAllServices();
                setServices(result);
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // 4. Gọi hook useDoctors để lấy dữ liệu thật
    const { doctors, isLoading, error } = useDoctors();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % extendedTestimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    // 5. Lọc danh sách bác sĩ từ dữ liệu thật
    const filteredDoctors = useMemo(() => {
        // Chỉ lấy 4 bác sĩ đầu tiên để hiển thị trên dashboard
        const doctorsToShow = doctors?.slice(0, 4) || [];
        if (!searchTerm) {
            return doctorsToShow;
        }
        return doctorsToShow.filter(doctor =>
            `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.doctorDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    return (
        <div className="min-h-screen select-none bg-gray-50 dark:bg-gray-900">
            {/* Sử dụng Header có sẵn */}
            <Header />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white overflow-hidden pt-20 pb-12">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent" />

                <div className="relative container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                            <Award className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Trusted by 10,000+ Patients</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Your Health,
                            <span className="block bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                                Our Priority
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Experience world-class healthcare with compassionate care, cutting-edge technology,
                            and a team of expert medical professionals dedicated to your wellbeing.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <QuickAppointmentForm isAuthenticated={isAuthenticated} navigate={navigate} />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                            {[
                                { number: '25+', label: 'Expert Doctors' },
                                { number: '10K+', label: 'Happy Patients' },
                                { number: '15+', label: 'Years Experience' },
                                { number: '12+', label: 'Medical Services' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                                    <div className="text-sm text-blue-200">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <h3 className="text-xl font-semibold text-gray-700 md:col-span-1 text-center md:text-left">Find Care Quickly</h3>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input placeholder="Search services, specialties..." className="h-12" />
                            <Input placeholder="Search locations..." className="h-12" />
                        </div>
                    </div>
                </div>
            </section>
            {/* SỬA LỖI: Tích hợp trực tiếp logic của PatientInfoHubWithGuide vào đây */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Information for Patients</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Everything you need to know for a smooth and comfortable visit.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {patientInfoLinks.map(item => (
                            <Dialog key={item.title}>
                                <DialogTrigger asChild>
                                    <Card className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                {React.cloneElement(item.icon, { className: "h-8 w-8 text-emerald-600 dark:text-emerald-400" })}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800">
                                    <DialogHeader>
                                        <DialogTitle className="text-gray-900 dark:text-gray-100 text-2xl mb-4">{item.guideTitle}</DialogTitle>

                                        {/* Step-by-step text */}
                                        <div className="text-gray-600 dark:text-gray-400 space-y-4 text-base leading-relaxed">
                                            {item.title === "Appointment Guide" && (
                                                <ol className="list-decimal pl-5 space-y-2">
                                                    <li>Select your service or doctor from the Patient Portal.</li>
                                                    <li>Choose an available date and time.</li>
                                                    <li>Fill in personal details and insurance info.</li>
                                                    <li>Receive confirmation via email and SMS.</li>
                                                </ol>
                                            )}

                                            {item.title === "Service Pricing" && (
                                                <div>
                                                    <p>Our services are transparently priced. Example:</p>
                                                    <ul className="list-disc pl-5 mt-2">
                                                        <li>Standard consultation: $50–$150</li>
                                                        <li>Lab tests: $8–$45 depending on test</li>
                                                    </ul>
                                                    <p className="mt-2">For a detailed quote, contact billing@mediflow.com</p>
                                                </div>
                                            )}

                                            {item.title === "Insurance Information" && (
                                                <div>
                                                    <p>We accept major insurance providers:</p>
                                                    <ul className="list-disc pl-5 mt-2">
                                                        <li>Bao Viet Insurance</li>
                                                        <li>Prudential</li>
                                                        <li>Manulife</li>
                                                        <li>AIA</li>
                                                    </ul>
                                                    <p className="mt-2">Verify your coverage by contacting our team at (123) 456-7892.</p>
                                                </div>
                                            )}

                                            {item.title === "Payment Process" && (
                                                <ol className="list-decimal pl-5 space-y-2">
                                                    <li>Pay online via Patient Portal.</li>
                                                    <li>Pay in-person at billing department.</li>
                                                    <li>Bank transfer (contact billing for details).</li>
                                                    <li>Co-payments are due at time of service.</li>
                                                </ol>
                                            )}

                                            {/* Optional image for visual guidance */}
                                            <img
                                                src={`/images/${item.title.replace(/\s/g, '').toLowerCase()}.png`}
                                                alt={`${item.title} illustration`}
                                                className="w-full rounded-lg mt-4"
                                            />

                                            {/* Optional video guide */}
                                            <div className="mt-4">
                                                <video
                                                    controls
                                                    className="w-full rounded-lg"
                                                    src={`/videos/${item.title.replace(/\s/g, '').toLowerCase()}.mp4`}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">Close</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        ))}

                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Medical Services</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comprehensive healthcare services designed to meet all your medical needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service) => (
                            <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                                <CardHeader className="text-center pb-4">
                                    <img
                                        src={service.imageUrl}
                                        alt={service.name}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>


                                </CardHeader>

                                <CardContent className="text-center">
                                    <p className="text-gray-600 mb-4">{service.description}</p>

                                </CardContent>

                                <CardFooter>
                                    <Button className="w-full" onClick={() => navigate('/book-appointment')}>
                                        Book Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                                <CardFooter>
                                    <Button asChild variant="outline" className="ml-4">
                                        <Link to="/services">View All Services</Link>
                                    </Button>

                                </CardFooter>

                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Doctors</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Our team of experienced medical professionals is here to provide you with the best care
                        </p>
                    </div>
                    {/* Doctor list rendering logic remains the same */}
                    {isLoading && <div className="text-center">Loading doctors...</div>}
                    {error && <div className="text-center text-red-500">Failed to load doctors.</div>}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredDoctors.map((doctor) => (
                                <Card key={doctor._id} className="text-center hover:shadow-xl transition-shadow duration-300 group">
                                    <CardContent className="p-6">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0D9488&color=fff`}
                                            alt={`${doctor.firstName} ${doctor.lastName}`}
                                            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-teal-100 mb-4"
                                        />
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h3>
                                        <p className="text-teal-600 font-medium mb-2">{doctor.doctorDepartment || 'N/A'}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full" onClick={() => navigate(`/doctors/${doctor._id}`)}>
                                            View Profile
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            {/* Private Features Preview Section */}
            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">Patient Portal Features</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-100">
                            Sign in to access your personal health dashboard and manage your healthcare
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dark:text-gray-100">
                        <PrivateFeatureCard
                            title="Medical Records"
                            description="View your complete medical history, lab results, and prescriptions"
                            icon={<FileText />}
                            action="Medical Records"
                        />

                        <PrivateFeatureCard
                            title="Lab Results"
                            description="Access your laboratory test results and reports instantly"
                            icon={<TestTube2 />}
                            action="Lab Results"
                        />

                        <PrivateFeatureCard
                            title="Billing & Payments"
                            description="Manage your medical bills, insurance claims, and payments"
                            icon={<CreditCard />}
                            action="Billing Dashboard"
                        />

                        <PrivateFeatureCard
                            title="Patient Dashboard"
                            description="Your personalized health dashboard with appointments and more"
                            icon={<Activity />}
                            action="Patient Dashboard"
                        />
                    </div>

                    <div className="text-center mt-12">
                        <div className="inline-flex items-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <AlertTriangle className="h-5 w-5 text-teal-600 mr-3" />
                            <span className="text-teal-800">
                                Already have an account?
                                <Link to="/login" className="font-semibold hover:underline ml-1">Sign in here</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Health Tips Section */}
            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 ">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Health Tips & News</h2>
                        <p className="text-xl text-gray-600 max-w-2xl dark:text-gray-100 mx-auto">
                            Stay informed with our latest health articles and wellness tips
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {healthTips.map((tip, index) => (
                            <Card key={index} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="h-48 bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                                    <HeartHandshake className="h-16 w-16 text-white dark:text-gray-100" />
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-3">
                                        <Badge variant="secondary" className="text-xs">{tip.category}</Badge>
                                        <div className="flex items-center ml-auto text-gray-500 dark:text-gray-100 text-sm">
                                            <Timer className="h-4 w-4 mr-1" />
                                            {tip.readTime}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">{tip.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 dark:text-gray-100">{tip.excerpt}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between"
                                        onClick={() => window.open(tip.url, "_blank")}
                                    >
                                        Read More
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardFooter>


                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            <AchievementsSection />

            {/* Testimonials Section (Expanded) */}
            <section className="py-20 bg-gray-50 dark:bg-black/20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12">What Our Patients Say</h2>
                    <div className="relative h-64 overflow-hidden">
                        {extendedTestimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentTestimonial ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-20 h-20 rounded-full mb-4" />
                                    <p className="text-lg text-gray-600 dark:text-gray-100 max-w-2xl mx-auto italic">"{testimonial.review}"</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-100 mt-4">- {testimonial.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-10">
                        Our Trusted Partners
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                        {partners.map((p, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <img
                                    src={getLogoUrl(p)}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    className="h-16 max-w-[160px] object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/partner-fallback.png";
                                    }}
                                />
                                <span className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                                    {p.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white ">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
                        Join thousands of patients who trust MediFlow for their healthcare needs.
                        Book your appointment today and experience the difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="border-white bg-white text-teal-600 transition-all duration-300"
                            onClick={() => navigate('/book-appointment')}
                        >
                            <CalendarPlus className="mr-2 h-5 w-5" />
                            Book Appointment
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white bg-white text-teal-600 transition-all duration-300"
                            onClick={() => navigate('/contact')}
                        >
                            <Phone className="mr-2 h-5 w-5" />
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>
            {/* AI Chat Widget for public users */}
            <ChatWidget position="bottom-right" />

            {/* Sử dụng Footer có sẵn */}
            <Footer />

        </div>
    );
};

export default DashboardPublic;