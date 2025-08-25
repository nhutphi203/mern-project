// src/App.tsx - FIXED VERSION with proper authentication handling

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCurrentUser } from './hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

// Layout and Pages
import Layout from './components/layout/Layout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPublic from './pages/PublicDashboard'; // Public Dashboard
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
import MedicalRecords from './pages/MedicalRecords';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ReceptionDashboard from './pages/ReceptionDashboard';

// Lab pages
import LabOrdersPage from '@/pages/Lab/LabOrdersPage';
import LabResultsPage from '@/pages/Lab/LabResultsPage';
import LabReportsPage from '@/pages/Lab/LabReportsPage';
import LabResultsView from '@/pages/Lab/LabResultsView'; // Keep for backward compatibility

// Medical Records System Pages
import MedicalRecordsOverview from '@/pages/MedicalRecords/MedicalRecordsOverview';
import MedicalRecordsSearch from '@/pages/MedicalRecords/MedicalRecordsSearch';
import ManageMedicalRecords from '@/pages/MedicalRecords/ManageMedicalRecords';
import MedicalReports from '@/pages/MedicalRecords/MedicalReports';
import MedicalRecordDetail from '@/pages/MedicalRecords/MedicalRecordDetail';
import DiagnosisReportsPage from '@/pages/MedicalRecords/DiagnosisReportsPage';

// Placeholder components - will be created
const CreateMedicalRecord = () => <div className="p-6"><h1 className="text-2xl font-bold">Create Medical Record</h1><p>This page will allow doctors to create comprehensive medical records with ICD-10 diagnosis and CPOE orders.</p></div>;
const SearchPatientRecords = MedicalRecordsSearch;
const CPOEOrders = () => <div className="p-6"><h1 className="text-2xl font-bold">CPOE Orders</h1><p>Computerized Provider Order Entry system for medications and treatments.</p></div>;
const PrescriptionsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Prescriptions</h1><p>View and manage patient prescriptions.</p></div>;
const ICD10DiagnosisPage = () => <div className="p-6"><h1 className="text-2xl font-bold">ICD-10 Diagnosis</h1><p>International Classification of Diseases diagnostic coding system.</p></div>;
const MyMedicalRecords = () => <div className="p-6"><h1 className="text-2xl font-bold">My Medical Records</h1><p>Patient view of their own medical records and history.</p></div>;
import LabResultEntry from '@/pages/Lab/LabResultEntry';
import LabQueue from '@/components/Lab/LabQueue';

// Billing pages
import InvoicesPage from '@/pages/Billing/InvoicesPage';
import PaymentsPage from '@/pages/Billing/PaymentsPage';
import InsuranceClaimsPage from '@/pages/Billing/InsuranceClaimsPage';
import BillingReportsPage from '@/pages/Billing/BillingReportsPage';
import MyInvoicesPage from '@/pages/Billing/MyInvoicesPage';
import PatientsPage from '@/pages/PatientsPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import PatientRecordDetailPage from './pages/PatientRecordDetailPage';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // 🔧 TEMP FIX: Disable auth for development to stop infinite loops
  const isPublicRoute = ['/', '/about', '/services', '/doctors', '/contact', '/login', '/register'].includes(location.pathname);
  const isDevelopment = true; // Set to false when auth is working properly
  const shouldCheckAuth = !isDevelopment && (!isPublicRoute || searchParams.get('auth') === 'success');

  // Conditional authentication check
  const authQuery = useCurrentUser({ enabled: shouldCheckAuth });
  const { data: currentUser, isLoading, isError } = authQuery;

  // 🔧 FIX: Handle social login success
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const errorStatus = searchParams.get('error');

    if (authStatus === 'success') {
      console.log('✅ Social login success detected');
      toast({
        title: 'Login Successful',
        description: 'Welcome to MediFlow!',
      });

      // Clear the URL params and redirect to appropriate dashboard
      const newUrl = location.pathname.split('?')[0];
      window.history.replaceState({}, '', newUrl);

      // Force redirect to dashboard (this will trigger auth check)
      navigate('/dashboard', { replace: true });
      return;
    }

    if (errorStatus) {
      const errorMessages: Record<string, string> = {
        'social_failed': 'Social login failed. Please try again.',
        'auth_failed': 'Authentication failed. Please try again.',
        'server_error': 'Server error occurred. Please try again later.',
        'google_auth_failed': 'Google login failed. Please try again.',
        'facebook_auth_failed': 'Facebook login failed. Please try again.',
        'github_auth_failed': 'GitHub login failed. Please try again.',
      };

      toast({
        title: 'Login Failed',
        description: errorMessages[errorStatus] || 'Unknown error occurred.',
        variant: 'destructive',
      });

      // Clear error from URL and redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, location.pathname, toast, navigate]);

  // 🔧 FIX: Simplified redirect logic - only for authenticated users
  useEffect(() => {
    // Don't do anything on public routes unless there's a user
    if (isPublicRoute && !currentUser?.user) {
      return;
    }

    // Don't redirect while loading
    if (isLoading) {
      console.log('🔄 Authentication loading...');
      return;
    }

    console.log("🔍 APP EFFECT:", {
      currentUser: currentUser?.user ? {
        id: currentUser.user._id,
        email: currentUser.user.email,
        role: currentUser.user.role
      } : null,
      isLoading,
      isError,
      pathname: location.pathname,
      isPublicRoute
    });

    // If we have a user and they're on login/register page, redirect them
    if (currentUser?.user) {
      if (location.pathname === '/login' || location.pathname === '/register') {
        const targetPath = getRedirectPath(currentUser.user.role);
        console.log(`✅ User authenticated, redirecting from ${location.pathname} to ${targetPath}`);
        navigate(targetPath, { replace: true });
        return;
      }
    }

    // If no user and trying to access protected routes, redirect to login
    if (!currentUser?.user && isError && !isPublicRoute) {
      const protectedRoutes = ['/dashboard', '/admin-dashboard', '/doctor-dashboard', '/nurse-dashboard', '/reception-dashboard'];
      const isProtectedRoute = protectedRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        console.log('❌ No user detected for protected route, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [currentUser, isLoading, isError, navigate, location.pathname, isPublicRoute]);

  // Helper function to determine redirect path based on role
  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'Admin':
        return '/admin-dashboard';
      case 'Doctor':
        return '/doctor-dashboard';
      case 'Nurse':
        return '/nurse-dashboard';
      case 'Receptionist':
        return '/reception-dashboard';
      default:
        return '/dashboard';
    }
  };

  // 🔧 FIX: Show loading only for protected routes
  if (isLoading && !isPublicRoute) {
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
      {/* 🆕 ROOT ROUTE - Public Dashboard (No authentication required) */}
      <Route path="/" element={<DashboardPublic />} />

      {/* Public routes - Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public pages with layout */}
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
      <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />

      {/* Semi-public routes - Can be accessed but some features require auth */}
      <Route path="/book-appointment" element={<Layout><BookAppointment /></Layout>} />

      {/* Test routes - for development only */}

      {/* Protected routes with role-based access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Patient', 'Doctor', 'Admin', 'Receptionist', 'Lab Technician', 'Insurance Staff']}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/nurse-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Nurse']}>
            <DashboardLayout>
              <NurseDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reception-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Receptionist', 'Admin']}>
            <DashboardLayout>
              <ReceptionDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient & Medical Records */}
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <Layout>
              <MedicalRecords />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Medical Records System - Comprehensive Routes */}
      <Route
        path="/medical-records/overview"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Receptionist', 'Lab Technician', 'BillingStaff', 'LabSupervisor', 'Pharmacist']}>
            <DashboardLayout>
              <MedicalRecordsOverview />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/create"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout>
              <CreateMedicalRecord />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/search"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Admin', 'Lab Technician', 'LabSupervisor']}>
            <DashboardLayout>
              <SearchPatientRecords />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/manage"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
            <DashboardLayout>
              <ManageMedicalRecords />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/cpoe"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout>
              <CPOEOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Patient', 'Pharmacist']}>
            <DashboardLayout>
              <PrescriptionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/diagnosis"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout>
              <ICD10DiagnosisPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/my-records"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <DashboardLayout>
              <MyMedicalRecords />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/:recordId"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Admin', 'Patient']}>
            <MedicalRecordDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/diagnosis/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout>
              <DiagnosisReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout>
              <MedicalReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient-profile/:patientId"
        element={
          <ProtectedRoute allowedRoles={['Patient', 'Doctor', 'Admin']}>
            <Layout>
              <PatientProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient-records/:patientId"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
            <Layout>
              <PatientRecordDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Patient Management routes */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Receptionist']}>
            <DashboardLayout>
              <PatientsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Appointment Management routes */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient', 'Receptionist']}>
            <DashboardLayout>
              <AppointmentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Laboratory routes */}
      <Route
        path="/lab/orders"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Admin', 'Receptionist']}>
            <DashboardLayout>
              <LabOrdersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab/queue"
        element={
          <ProtectedRoute allowedRoles={['Lab Technician', 'Admin']}>
            <DashboardLayout>
              <LabQueue />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Lab Results - NEW DEDICATED PAGE */}
      <Route
        path="/lab/results"
        element={
          <ProtectedRoute allowedRoles={['Lab Technician', 'Doctor', 'Patient', 'Admin']}>
            <DashboardLayout>
              <LabResultsPage showPatientInfo />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab/results/my"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <DashboardLayout>
              <LabResultsPage showPatientInfo={false} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab/results/enter"
        element={
          <ProtectedRoute allowedRoles={['Lab Technician']}>
            <DashboardLayout>
              <LabResultEntry />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Lab Reports - NEW DEDICATED PAGE */}
      <Route
        path="/lab/reports"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Patient', 'Admin', 'Receptionist']}>
            <DashboardLayout>
              <LabReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Keep old route for backward compatibility */}
      <Route
        path="/lab/legacy"
        element={
          <ProtectedRoute allowedRoles={['Doctor', 'Patient', 'Admin', 'Receptionist']}>
            <DashboardLayout>
              <LabResultsView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Billing routes */}
      <Route
        path="/billing/invoices"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Insurance Staff', 'Receptionist']}>
            <DashboardLayout>
              <InvoicesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/payments"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Insurance Staff', 'Patient']}>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/my-invoices"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <DashboardLayout>
              <MyInvoicesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/insurance"
        element={
          <ProtectedRoute allowedRoles={['Insurance Staff', 'Admin']}>
            <DashboardLayout>
              <InsuranceClaimsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Insurance Staff']}>
            <DashboardLayout>
              <BillingReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;