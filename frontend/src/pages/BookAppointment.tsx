import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrentUser } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner'; // Đảm bảo bạn đã import toast
import axios from 'axios';
import { useDoctors } from '@/hooks/useDoctors';

// Dữ liệu tạm thời
const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const BookAppointment = () => {
    const navigate = useNavigate();
    const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
    const { doctors, isLoading: areDoctorsLoading } = useDoctors();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [address, setAddress] = useState<string>('');

    const filteredDoctors = doctors?.filter(doc => doc.doctorDepartment === selectedDepartment) || [];

    const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!currentUser?.user) {
            // [THÔNG BÁO THẤT BẠI] - Chưa đăng nhập
            toast.error("Bạn cần đăng nhập để đặt lịch hẹn.");
            setIsSubmitting(false);
            return navigate('/login');
        }

        const selectedDoctor = doctors?.find(doc => doc._id === selectedDoctorId);

        if (!selectedDepartment || !selectedDoctor || !selectedDate || !selectedTime || !address) {
            // [THÔNG BÁO THẤT BẠI] - Thiếu thông tin
            toast.error("Vui lòng điền đầy đủ tất cả các trường thông tin.");
            setIsSubmitting(false);
            return;
        }

        try {
            const appointmentDateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;

            const payload = {
                firstName: currentUser.user.firstName,
                lastName: currentUser.user.lastName,
                email: currentUser.user.email,
                phone: currentUser.user.phone,
                nic: currentUser.user.nic,
                dob: currentUser.user.dob,
                gender: currentUser.user.gender,
                appointment_date: appointmentDateTimeString,
                department: selectedDepartment,
                address: address,
                doctor_firstName: selectedDoctor.firstName,
                doctor_lastName: selectedDoctor.lastName,
                hasVisited: false,
            };

            const { data } = await axios.post(
                "http://localhost:4000/api/v1/appointment/post",
                payload,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            // [THÔNG BÁO THÀNH CÔNG] - Đặt lịch thành công
            toast.success(data.message || "Đặt lịch hẹn thành công! Vui lòng chờ xác nhận.");
            navigate('/dashboard');

        } catch (error) {
            // [THÔNG BÁO THẤT BẠI] - Lỗi từ server hoặc mạng
            console.error("Booking Error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isUserLoading || areDoctorsLoading) {
        return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Đặt lịch hẹn khám bệnh</h1>
                <form onSubmit={handleBookingSubmit} className="max-w-2xl mx-auto space-y-6">
                    {/* Phần chọn Khoa và Bác sĩ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                            <SelectTrigger><SelectValue placeholder="Bước 1: Chọn Khoa" /></SelectTrigger>
                            <SelectContent>
                                {doctors?.map(doc => doc.doctorDepartment).filter((value, index, self) => self.indexOf(value) === index).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId} disabled={!selectedDepartment}>
                            <SelectTrigger><SelectValue placeholder="Bước 2: Chọn Bác sĩ" /></SelectTrigger>
                            <SelectContent>
                                {filteredDoctors.map(d => <SelectItem key={d._id} value={d._id}>{`Dr. ${d.firstName} ${d.lastName}`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phần chọn Ngày và Giờ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Bước 3: Chọn ngày</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} />
                            </PopoverContent>
                        </Popover>

                        <Select onValueChange={setSelectedTime} value={selectedTime} disabled={!selectedDate}>
                            <SelectTrigger><SelectValue placeholder="Bước 4: Chọn giờ" /></SelectTrigger>
                            <SelectContent>
                                {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phần điền địa chỉ */}
                    <Textarea
                        placeholder="Bước 5: Nhập địa chỉ cụ thể của bạn..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                    />

                    {/* Nút Submit */}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</> : <>Xác nhận và Đặt lịch <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default BookAppointment;