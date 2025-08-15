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
    ClipboardList
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
            path: (role) => role === 'Admin' ? '/admin-dashboard' : '/dashboard',
            roles: ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Lab Technician', 'Insurance Staff']
        },

        // Patient Management
        {
            key: 'patients',
            label: 'Patients',
            icon: <Users className="w-5 h-5" />,
            path: '/patients',
            roles: ['Admin', 'Doctor', 'Receptionist']
        },

        // Appointments
        {
            key: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="w-5 h-5" />,
            path: '/appointments',
            roles: ['Admin', 'Doctor', 'Patient', 'Receptionist']
        },

        // Laboratory Management
        {
            key: 'laboratory',
            label: 'Laboratory',
            icon: <TestTube className="w-5 h-5" />,
            path: '/lab',
            roles: ['Doctor', 'Lab Technician', 'Admin', 'Receptionist'],
            children: [
                {
                    key: 'lab-orders',
                    label: 'Lab Orders',
                    icon: <TestTube className="w-4 h-4" />,
                    path: '/lab/orders',
                    roles: ['Doctor', 'Admin', 'Receptionist']
                },
                {
                    key: 'lab-queue',
                    label: 'Lab Queue',
                    icon: <Microscope className="w-4 h-4" />,
                    path: '/lab/queue',
                    roles: ['Lab Technician', 'Admin']
                },
                {
                    key: 'lab-results',
                    label: 'Lab Results',
                    icon: <FileText className="w-4 h-4" />,
                    path: '/lab/results',
                    roles: ['Lab Technician', 'Doctor', 'Patient', 'Admin']
                },
                {
                    key: 'lab-reports',
                    label: 'Lab Reports',
                    icon: <FileBarChart className="w-4 h-4" />,
                    path: '/lab/reports',
                    roles: ['Doctor', 'Patient', 'Admin', 'Receptionist', 'Lab Technician']
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

        // Medical Records
        {
            key: 'medical-records',
            label: 'Medical Records',
            icon: <ClipboardList className="w-5 h-5" />,
            path: '/medical-records',
            roles: ['Doctor', 'Patient', 'Admin']
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
                { label: 'Lab Queue Overview', path: '/lab/queue', icon: <Microscope className="w-5 h-5" /> },
                { label: 'Billing Reports', path: '/billing/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Doctor': {
            title: 'Doctor Dashboard',
            subtitle: 'Patient care and medical management',
            primaryActions: [
                { label: 'Create Lab Order', path: '/lab/orders/create', icon: <TestTube className="w-5 h-5" /> },
                { label: 'View Lab Results', path: '/lab/results', icon: <FileText className="w-5 h-5" /> },
                { label: 'Patient Queue', path: '/doctor/queue', icon: <Users className="w-5 h-5" /> }
            ]
        },
        'Lab Technician': {
            title: 'Lab Technician Dashboard',
            subtitle: 'Laboratory operations and results',
            primaryActions: [
                { label: 'Lab Queue', path: '/lab/queue', icon: <Microscope className="w-5 h-5" /> },
                { label: 'Enter Results', path: '/lab/results/entry', icon: <Activity className="w-5 h-5" /> },
                { label: 'Generate Reports', path: '/lab/reports', icon: <FileBarChart className="w-5 h-5" /> }
            ]
        },
        'Patient': {
            title: 'Patient Dashboard',
            subtitle: 'Your health information',
            primaryActions: [
                { label: 'View Lab Results', path: '/lab/results/my', icon: <FileText className="w-5 h-5" /> },
                { label: 'My Invoices', path: '/billing/my-invoices', icon: <Receipt className="w-5 h-5" /> },
                { label: 'Medical Records', path: '/medical-records', icon: <ClipboardList className="w-5 h-5" /> }
            ]
        },
        'Receptionist': {
            title: 'Reception Dashboard',
            subtitle: 'Patient management and administration',
            primaryActions: [
                { label: 'Check Lab Status', path: '/lab/orders', icon: <TestTube className="w-5 h-5" /> },
                { label: 'Process Payments', path: '/billing/payments', icon: <CreditCard className="w-5 h-5" /> },
                { label: 'Patient Check-in', path: '/reception/checkin', icon: <Users className="w-5 h-5" /> }
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
