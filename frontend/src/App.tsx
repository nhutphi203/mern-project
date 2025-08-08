import React, { useEffect } from 'react';
// ❌ Dòng này KHÔNG được import 'BrowserRouter as Router'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from './hooks/useAuth';

// ✅ BƯỚC 1: Import Layout và các trang
import Layout from './components/layout/Layout';
// import Home from './pages/Home'; // Xóa trang Home không còn sử dụng
import AboutPage from './pages/About';
import ServicesPage from './pages/Services';
import DoctorsPage from './pages/Doctors';

// Import các trang đã có
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import BookAppointment from './pages/BookAppointment';
import PatientProfilePage from './pages/PatientProfile';
// Component này chứa logic điều hướng và các Routes
const AppContent = () => {
  // Logic này đã đúng, không cần thay đổi
  const { data: patientUser, isSuccess: isPatientSuccess } = useCurrentUser();
  const { data: adminUser, isSuccess: isAdminSuccess } = useCurrentUser();

  const currentUser = patientUser || adminUser;
  const isSuccess = (patientUser && isPatientSuccess) || (adminUser && isAdminSuccess);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log để kiểm tra
    console.log("APP EFFECT:", { currentUser, isSuccess, pathname: location.pathname });

    if (isSuccess && currentUser) {
      // ✅ SỬA ĐỔI: Sau khi đăng nhập, bệnh nhân sẽ được chuyển đến trang chủ ('/')
      const targetPath = currentUser.user.role === 'Admin' ? '/admin-dashboard' : '/';
      if (location.pathname === '/login' || location.pathname === '/register') {
        console.log(`Navigating to ${targetPath}...`);
        navigate(targetPath, { replace: true });
      }
    }
  }, [currentUser, isSuccess, navigate, location.pathname]);

  return (
    // ✅ BƯỚC 2: Cấu trúc lại Routes
    <Routes>
      {/* Trang chủ của ứng dụng là Dashboard (yêu cầu đăng nhập) */}
      <Route path="/" element={<Dashboard />} />

      {/* Các trang công khai sử dụng Layout chung (có Navbar và Footer) */}
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
      <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />

      {/* Các trang đăng nhập/đăng ký không có Layout chung */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Các trang yêu cầu đăng nhập khác */}
      {/* Route /dashboard giờ có thể xóa hoặc trỏ về trang chủ */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/patient-profile/:patientId" element={<PatientProfilePage />} />

      {/* Route cho trang không tồn tại */}
      <Route path="*" element={<Layout><div>404 - Page Not Found</div></Layout>} />
    </Routes>
  );
};


// Component App giờ chỉ cần trả về AppContent
const App = () => {
  return <AppContent />;
};

export default App;
