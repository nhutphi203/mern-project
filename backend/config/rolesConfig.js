// backend/config/rolesConfig.js
// Role-based access control configuration

const moduleMatrix = {
    // Billing module endpoints
    'invoices': ['Admin', 'BillingStaff'],
    'create-invoices': ['Admin', 'BillingStaff'], // Add this missing endpoint
    'get-invoices': ['Admin', 'BillingStaff'],
    'invoice-payments': ['Admin', 'BillingStaff'],
    'billing-reports': ['Admin', 'BillingStaff'],
    'insurance-claims': ['Admin', 'BillingStaff'],

    // Medical Records module endpoints
    'medical-records': ['Doctor', 'Admin'],
    'create-medical-record': ['Doctor', 'Admin'],
    'get-medical-records': ['Doctor', 'Admin', 'Patient'],
    'update-medical-record': ['Doctor', 'Admin'],

    // Appointment module endpoints
    'appointments': ['Patient', 'Doctor', 'Admin', 'Receptionist'],
    'create-appointment': ['Patient', 'Admin', 'Receptionist'],
    'get-appointments': ['Doctor', 'Admin', 'Receptionist'],
    'update-appointment': ['Doctor', 'Admin', 'Receptionist'],

    // Lab module endpoints
    'lab-orders': ['Doctor', 'LabTechnician', 'Admin'],
    'create-lab-order': ['Doctor', 'Admin'],
    'lab-results': ['Doctor', 'LabTechnician', 'Admin', 'Patient'],
    'update-lab-result': ['LabTechnician', 'Admin'],

    // User management endpoints
    'users': ['Admin'],
    'create-user': ['Admin'],
    'get-users': ['Admin'],
    'update-user': ['Admin'],

    // Vital signs endpoints
    'vital-signs': ['Doctor', 'Nurse', 'Admin'],
    'create-vital-signs': ['Doctor', 'Nurse', 'Admin'],
    'get-vital-signs': ['Doctor', 'Nurse', 'Admin', 'Patient'],

    // Auth endpoints (public access)
    'login': ['*'],
    'register': ['*'],
    'logout': ['*']
};

// Legacy alias for moduleMatrix 
export const ACCESS_MATRIX = moduleMatrix;

// Role constants
export const ROLES = {
    ADMIN: 'Admin',
    DOCTOR: 'Doctor',
    PATIENT: 'Patient',
    NURSE: 'Nurse',
    LAB_TECHNICIAN: 'Lab Technician',
    RECEPTIONIST: 'Receptionist',
    BILLING_STAFF: 'BillingStaff',
    INSURANCE_STAFF: 'Insurance Staff'
};

export const hasAccess = (userRole, endpoint) => {
    console.log(`🔍 [hasAccess] Checking access: ${userRole} -> ${endpoint}`);

    // Get allowed roles for this endpoint
    const allowedRoles = moduleMatrix[endpoint];

    if (!allowedRoles) {
        console.log(`⚠️ [hasAccess] No configuration found for endpoint: ${endpoint}`);
        return false;
    }

    // Check if user role is in allowed roles
    const hasPermission = allowedRoles.includes(userRole);
    console.log(`${hasPermission ? '✅' : '❌'} [hasAccess] ${userRole} ${hasPermission ? 'allowed' : 'denied'} access to ${endpoint}`);

    return hasPermission;
};

export const getRolePermissions = (userRole) => {
    const permissions = {};

    Object.entries(moduleMatrix).forEach(([endpoint, allowedRoles]) => {
        if (allowedRoles.includes('*') || allowedRoles.includes(userRole)) {
            permissions[endpoint] = true;
        }
    });

    return permissions;
};

export const getAllowedRoles = (endpoint) => {
    return moduleMatrix[endpoint] || [];
};

// Function to get endpoint configuration (for legacy compatibility)
export const getEndpointConfig = (module, endpoint) => {
    const key = `${module}-${endpoint}`;
    return moduleMatrix[key] || moduleMatrix[endpoint] || [];
};

export default {
    moduleMatrix,
    ACCESS_MATRIX,
    ROLES,
    hasAccess,
    getRolePermissions,
    getAllowedRoles,
    getEndpointConfig
};
