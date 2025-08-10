// src/App.tsx - FIXED VERSION

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCurrentUser } from './hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

// Layout and Pages
import Layout from './components/layout/Layout';
import AboutPage from './pages/About';
import ServicesPage from './pages/Services';
import DoctorsPage from './pages/Doctors';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import BookAppointment from './pages/BookAppointment';
import PatientProfilePage from './pages/PatientProfile';
import MedicalRecords from './pages/MedicalRecords'; // Import trang mới
import DoctorDashboard from './pages/DoctorDashboard'; // 1. Import trang mới
import ProtectedRoute from './components/ProtectedRoute'; // 2. Import ProtectedRoute
import PatientRecordDetailPage from './pages/PatientRecordDetailPage'; // Import trang chi tiết hồ sơ bệnh nhân
const AppContent = () => {
  const { data: currentUser, isLoading, isError, error } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // 🔧 FIX: Handle social login success
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const errorStatus = searchParams.get('error');

    if (authStatus === 'success') {
      console.log('Social login success detected');
      toast({
        title: 'Login Successful',
        description: 'Welcome to MediFlow!',
      });

      // Clear the URL params
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Force refetch user data
      // This is handled automatically by react-query when component mounts
    }

    if (errorStatus) {
      const errorMessages = {
        'social_failed': 'Social login failed. Please try again.',
        'auth_failed': 'Authentication failed. Please try again.',
        'server_error': 'Server error occurred. Please try again later.'
      };

      toast({
        title: 'Login Failed',
        description: errorMessages[errorStatus as keyof typeof errorMessages] || 'Unknown error occurred.',
        variant: 'destructive',
      });

      // Clear error from URL
      navigate('/login', { replace: true });
    }
  }, [searchParams, location.pathname, toast, navigate]);

  // 🔧 FIX: Simplified redirect logic
  useEffect(() => {
    console.log("APP EFFECT:", {
      currentUser: currentUser?.user,
      isLoading,
      isError,
      pathname: location.pathname
    });

    // Don't redirect while loading
    if (isLoading) return;

    // If we have a user and they're on login/register page, redirect them
    if (currentUser?.user) {
      if (location.pathname === '/login' || location.pathname === '/register') {
        const targetPath = currentUser.user.role === 'Admin' ? '/admin-dashboard' : '/dashboard';
        console.log(`User authenticated, redirecting to ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    }

    // If no user and trying to access protected routes, redirect to login
    if (!currentUser?.user && isError) {
      const protectedRoutes = ['/dashboard', '/admin-dashboard', '/book-appointment'];
      const isProtectedRoute = protectedRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        console.log('No user detected, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [currentUser, isLoading, isError, navigate, location.pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public pages with layout */}
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
      <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/medical-records" element={<Layout><MedicalRecords /></Layout>} />
      <Route
        path="/patient-records/:patientId"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <Layout>
              <PatientRecordDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/patient-profile/:patientId" element={<PatientProfilePage />} />

      {/* Root route - redirect based on auth status */}
      <Route
        path="/"
        element={
          currentUser?.user
            ? (currentUser.user.role === 'Admin'
              ? <Navigate to="/admin-dashboard" replace />
              : <Navigate to="/dashboard" replace />)
            : <Navigate to="/login" replace />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Layout><div>404 - Page Not Found</div></Layout>} />
    </Routes>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;