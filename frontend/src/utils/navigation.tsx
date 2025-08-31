// frontend/src/utils/navigation.ts
import React from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    TestTube,
    Receipt,
    CreditCard,
    FileBarChart,
    Microscope,
    Shield,
    UserCog,
    FileText,
    Activity,
    ClipboardList,
    AlertTriangle,
    Heart,
    Stethoscope,
    Pill,
    FileChartLine,
    PlusCircle,
    Search,
    Edit,
    Eye
} from 'lucide-react';

export interface NavigationItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string | ((role: string) => string);
    roles: string[];
    badge?: string;
    children?: NavigationItem[];
}

export const getNavigationItems = (userRole: string): NavigationItem[] => {
    const allItems: NavigationItem[] = [
        // Common Dashboard
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            path: (role) => {
                switch (role) {
                    case 'Admin': return '/admin-dashboard';
                    case 'Doctor': return '/doctor-dashboard';
                    case 'Nurse': return '/nurse-dashboard';
                    case 'Receptionist': return '/reception-dashboard';
                    default: return '/dashboard';
                }
            },
            roles: ['Admin', 'Doctor', 'Nurse', 'Patient', 'Receptionist', 'Lab Technician', 'BillingStaff', 'LabSupervisor', 'Pharmacist', 'Insurance Staff']
        },

        // Patient Management
        {
            key: 'patients',
            label: 'Patients',
            icon: <Users className="w-5 h-5" />,
            path: '/patients',
            roles: ['Admin', 'Doctor', 'Lab Technician', 'Receptionist']
        },

        // Appointments
        {
            key: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="w-5 h-5" />,
            path: '/appointments',
            roles: ['Admin', 'Doctor', 'Patient', 'Lab Technician', 'Receptionist']
        },

        // Laboratory Management
        {
            key: 'laboratory',
            label: 'Laboratory',
            icon: <TestTube className="w-5 h-5" />,
            path: '/lab',
            roles: ['Doctor', 'Lab Technician', 'Admin', 'LabSupervisor', 'Receptionist'],
            children: [
                {
                    key: 'lab-orders',
                    label: 'Lab Orders',
                    icon: <TestTube className="w-4 h-4" />,
                    path: '/lab/orders',
                    roles: ['Doctor', 'Admin', 'Lab Technician', 'Receptionist']
                },
                {
                    key: 'lab-queue',
                    label: 'Lab Queue',
                    icon: <Microscope className="w-4 h-4" />,
                    path: '/lab/queue',
                    roles: ['Lab Technician', 'LabSupervisor', 'Admin']
                },
                {
                    key: 'lab-results',
                    label: 'Lab Results',
                    icon: <FileText className="w-4 h-4" />,
                    path: '/lab/results',
                    roles: ['Lab Technician', 'Doctor', 'Patient', 'Admin', 'LabSupervisor']
                },
                {
                    key: 'lab-reports',
                    label: 'Lab Reports',
                    icon: <FileBarChart className="w-4 h-4" />,
                    path: '/lab/reports',
                    roles: ['Doctor', 'Patient', 'Admin', 'Lab Technician', 'LabSupervisor', 'Receptionist']
                }
            ]
        },

        // Billing & Insurance
        {
            key: 'billing',
            label: 'Billing',
            icon: <Receipt className="w-5 h-5" />,
            path: '/billing',
            roles: ['Admin', 'Insurance Staff', 'Receptionist', 'Patient'],
            children: [
                {
                    key: 'invoices',
                    label: 'Invoices',
                    icon: <Receipt className="w-4 h-4" />,
                    path: '/billing/invoices',
                    roles: ['Admin', 'Insurance Staff', 'Receptionist']
                },
                {
                    key: 'payments',
                    label: 'Payments',
                    icon: <CreditCard className="w-4 h-4" />,
                    path: '/billing/payments',
                    roles: ['Admin', 'Insurance Staff', 'Patient', 'Receptionist']
                },
                {
                    key: 'insurance-claims',
                    label: 'Insurance Claims',
                    icon: <Shield className="w-4 h-4" />,
                    path: '/billing/insurance',
                    roles: ['Insurance Staff', 'Admin']
                },
                {
                    key: 'billing-reports',
                    label: 'Billing Reports',
                    icon: <FileBarChart className="w-4 h-4" />,
                    path: '/billing/reports',
                    roles: ['Admin', 'Insurance Staff']
                }
            ]
        },

        // Medical Record System - Comprehensive
        {
            key: 'medical-records',
            label: 'Medical Records',
            icon: <ClipboardList className="w-5 h-5" />,
            path: '/medical-records',
            roles: ['Doctor', 'Patient', 'Admin', 'Lab Technician', 'Receptionist', 'BillingStaff', 'LabSupervisor', 'Pharmacist'],
            children: [
                // Doctor-specific medical record functions
                {
                    key: 'medical-records-create',
                    label: 'Create Record',
                    icon: <PlusCircle className="w-4 h-4" />,
                    path: '/medical-records/create',
                    roles: ['Doctor']
                },
                {
                    key: 'medical-records-search',
                    label: 'Patient Search',
                    icon: <Search className="w-4 h-4" />,
                    path: '/medical-records/search',
                    roles: ['Doctor', 'Admin', 'Lab Technician', 'LabSupervisor']
                },
                {
                    key: 'medical-records-manage',
                    label: 'Manage Records',
                    icon: <Edit className="w-4 h-4" />,
                    path: '/medical-records/manage',
                    roles: ['Doctor', 'Admin']
                },
                // CPOE System
                {
                    key: 'cpoe-orders',
                    label: 'CPOE Orders',
                    icon: <Stethoscope className="w-4 h-4" />,
                    path: '/medical-records/cpoe',
                    roles: ['Doctor']
                },
                {
                    key: 'prescriptions',
                    label: 'Prescriptions',
                    icon: <Pill className="w-4 h-4" />,
                    path: '/medical-records/prescriptions',
                    roles: ['Doctor', 'Patient', 'Pharmacist']
                },
                // ICD-10 & Diagnosis
                {
                    key: 'diagnosis-icd10',
                    label: 'ICD-10 Diagnosis',
                    icon: <Heart className="w-4 h-4" />,
                    path: '/medical-records/diagnosis',
                    roles: ['Doctor']
                },
                // Patient view
                {
                    key: 'my-medical-records',
                    label: 'My Records',
                    icon: <Eye className="w-4 h-4" />,
                    path: '/medical-records/my-records',
                    roles: ['Patient']
                },
                // Admin & Reports
                {
                    key: 'medical-reports',
                    label: 'Medical Reports',
                    icon: <FileChartLine className="w-4 h-4" />,
                    path: '/medical-records/reports',
                    roles: ['Admin', 'Doctor']
                },
                // Staff access
                {
                    key: 'records-overview',
                    label: 'Records Overview',
                    icon: <FileText className="w-4 h-4" />,
                    path: '/medical-records/overview',
                    roles: ['Receptionist', 'Admin', 'Lab Technician', 'BillingStaff', 'LabSupervisor']
                }
            ]
        },

        // Admin Settings
        {
            key: 'settings',
            label: 'Settings',
            icon: <UserCog className="w-5 h-5" />,
            path: '/settings',
            roles: ['Admin']
        }
    ];

    // Filter items based on user role
    return allItems.filter(item => item.roles.includes(userRole)).map(item => ({
        ...item,
        children: item.children?.filter(child => child.roles.includes(userRole))
    }));
};

// Role-specific dashboard configurations
export const getRoleDashboardConfig = (role: string) => {
    const configs = {
        'Admin': {
            title: 'Admin Dashboard',
            subtitle: 'Manage hospital operations',
            primaryActions: [
                { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
                { label: 'Medical Records Overview', path: '/medical-records/overview', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Lab Queue Overview', path: '/lab/queue', icon: <Microscope className="w-5 h-5" /> },
                { label: 'Medical Reports', path: '/medical-records/reports', icon: <FileChartLine className="w-5 h-5" /> },
                { label: 'Billing Reports', path: '/billing/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Doctor': {
            title: 'Doctor Dashboard',
            subtitle: 'Patient care and medical management',
            primaryActions: [
                { label: 'Create Medical Record', path: '/medical-records/create', icon: <PlusCircle className="w-5 h-5" /> },
                { label: 'CPOE Orders', path: '/medical-records/cpoe', icon: <Stethoscope className="w-5 h-5" /> },
                { label: 'ICD-10 Diagnosis', path: '/medical-records/diagnosis', icon: <Heart className="w-5 h-5" /> },
                { label: 'Patient Search', path: '/medical-records/search', icon: <Search className="w-5 h-5" /> },
                { label: 'Create Lab Order', path: '/lab/orders/create', icon: <TestTube className="w-5 h-5" /> },
                { label: 'View Lab Results', path: '/lab/results', icon: <FileText className="w-5 h-5" /> }
            ]
        },
        'Patient': {
            title: 'Patient Dashboard',
            subtitle: 'Your health information',
            primaryActions: [
                { label: 'My Medical Records', path: '/medical-records/my-records', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'My Prescriptions', path: '/medical-records/prescriptions', icon: <Pill className="w-5 h-5" /> },
                { label: 'View Lab Results', path: '/lab/results/my', icon: <FileText className="w-5 h-5" /> },
                { label: 'My Invoices', path: '/billing/my-invoices', icon: <Receipt className="w-5 h-5" /> },
                { label: 'Book Appointment', path: '/appointments/book', icon: <Calendar className="w-5 h-5" /> }
            ]
        },
        'Receptionist': {
            title: 'Reception Dashboard',
            subtitle: 'Patient management and administration',
            primaryActions: [
                { label: 'Records Overview', path: '/medical-records/overview', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Patient Check-in', path: '/reception/checkin', icon: <Users className="w-5 h-5" /> },
                { label: 'Check Lab Status', path: '/lab/orders', icon: <TestTube className="w-5 h-5" /> },
                { label: 'Process Payments', path: '/billing/payments', icon: <CreditCard className="w-5 h-5" /> }
            ]
        },
        'Lab Technician': {
            title: 'Lab Technician Dashboard',
            subtitle: 'Laboratory operations and results',
            primaryActions: [
                { label: 'Lab Queue', path: '/lab/queue', icon: <Microscope className="w-5 h-5" /> },
                { label: 'Patient Records', path: '/medical-records/search', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Enter Results', path: '/lab/results/entry', icon: <Activity className="w-5 h-5" /> },
                { label: 'Generate Reports', path: '/lab/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'LabSupervisor': {
            title: 'Lab Supervisor Dashboard',
            subtitle: 'Laboratory management and supervision',
            primaryActions: [
                { label: 'Supervise Lab Queue', path: '/lab/queue', icon: <Microscope className="w-5 h-5" /> },
                { label: 'Medical Records', path: '/medical-records/search', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Lab Operations', path: '/lab/results', icon: <TestTube className="w-5 h-5" /> },
                { label: 'Supervision Reports', path: '/lab/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Pharmacist': {
            title: 'Pharmacist Dashboard',
            subtitle: 'Medication and prescription management',
            primaryActions: [
                { label: 'Prescriptions', path: '/medical-records/prescriptions', icon: <Pill className="w-5 h-5" /> },
                { label: 'Patient Records', path: '/medical-records/search', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Medication Orders', path: '/medical-records/cpoe', icon: <Stethoscope className="w-5 h-5" /> },
                { label: 'Pharmacy Reports', path: '/pharmacy/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Nurse': {
            title: 'Nurse Dashboard',
            subtitle: 'Patient care and vital signs management',
            primaryActions: [
                { label: 'Vital Signs Entry', path: '/nurse-dashboard', icon: <Activity className="w-5 h-5" /> },
                { label: 'Patient Records', path: '/medical-records/search', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Care Alerts', path: '/nurse/alerts', icon: <AlertTriangle className="w-5 h-5" /> },
                { label: 'Patient Assignments', path: '/nurse/assignments', icon: <Users className="w-5 h-5" /> },
                { label: 'Medication Administration', path: '/medical-records/prescriptions', icon: <Pill className="w-5 h-5" /> }
            ]
        },
        'BillingStaff': {
            title: 'Billing Staff Dashboard',
            subtitle: 'Billing and financial management',
            primaryActions: [
                { label: 'Process Bills', path: '/billing/invoices', icon: <Receipt className="w-5 h-5" /> },
                { label: 'Patient Records', path: '/medical-records/overview', icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Payment Processing', path: '/billing/payments', icon: <CreditCard className="w-5 h-5" /> },
                { label: 'Billing Reports', path: '/billing/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Insurance Staff': {
            title: 'Insurance Dashboard',
            subtitle: 'Claims and insurance management',
            primaryActions: [
                { label: 'Process Claims', path: '/billing/insurance', icon: <Shield className="w-5 h-5" /> },
                { label: 'Review Invoices', path: '/billing/invoices', icon: <Receipt className="w-5 h-5" /> },
                { label: 'Insurance Reports', path: '/billing/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        }
    };

    return configs[role as keyof typeof configs] || configs['Patient'];
};
