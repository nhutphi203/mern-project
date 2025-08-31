/**
 * Comprehensive Test Configuration for Hospital Management System
 * 🎯 Target: 100% Workflow Coverage + 95% Code Coverage
 */

export const TEST_CONFIG = {
    // Test Database Configuration
    database: {
        testDb: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/hospital_test_db',
        cleanupAfterEach: true,
        seedData: true,
        isolation: true
    },

    // Test User Roles & Permissions
    roles: {
        admin: {
            role: 'Admin',
            permissions: ['all'],
            testEmail: 'admin.test@hospital.com'
        },
        doctor: {
            role: 'Doctor',
            permissions: ['medical_records', 'appointments', 'patients', 'prescriptions'],
            testEmail: 'doctor.test@hospital.com'
        },
        patient: {
            role: 'Patient',
            permissions: ['view_own_records', 'book_appointments'],
            testEmail: 'patient.test@hospital.com'
        },
        receptionist: {
            role: 'Receptionist',
            permissions: ['appointments', 'patients', 'billing'],
            testEmail: 'receptionist.test@hospital.com'
        },
        nurse: {
            role: 'Nurse',
            permissions: ['vital_signs', 'patients', 'appointments'],
            testEmail: 'nurse.test@hospital.com'
        },
        labTechnician: {
            role: 'LabTechnician',
            permissions: ['lab_tests', 'lab_results'],
            testEmail: 'lab.test@hospital.com'
        },
        billingStaff: {
            role: 'BillingStaff',
            permissions: ['billing', 'invoices', 'payments'],
            testEmail: 'billing.test@hospital.com'
        }
    },

    // Critical Workflows to Test
    workflows: {
        authentication: [
            'user_registration',
            'user_login',
            'password_reset',
            'token_refresh',
            'role_based_access'
        ],
        appointments: [
            'book_appointment',
            'view_appointments',
            'edit_appointment',
            'cancel_appointment',
            'doctor_availability'
        ],
        patients: [
            'create_patient_profile',
            'view_patient_info',
            'update_patient_info',
            'patient_search',
            'patient_history'
        ],
        medicalRecords: [
            'create_medical_record',
            'view_medical_records',
            'update_medical_record',
            'search_medical_records',
            'medical_record_statistics'
        ],
        vitalSigns: [
            'record_vital_signs',
            'view_vital_signs',
            'vital_signs_trends',
            'vital_signs_alerts'
        ],
        billing: [
            'create_invoice',
            'process_payment',
            'view_billing_history',
            'payment_confirmation',
            'billing_reports'
        ],
        notifications: [
            'send_notification',
            'receive_notification',
            'notification_preferences',
            'real_time_updates'
        ],
        reports: [
            'revenue_reports',
            'patient_statistics',
            'appointment_analytics',
            'doctor_performance'
        ]
    },

    // Test Data Requirements
    testData: {
        users: {
            minPerRole: 3,
            validationFields: ['email', 'nic', 'phone', 'dob', 'gender', 'address']
        },
        appointments: {
            minCount: 20,
            statusTypes: ['scheduled', 'completed', 'cancelled', 'rescheduled']
        },
        medicalRecords: {
            minCount: 50,
            withDiagnoses: true,
            withTreatments: true
        },
        vitalSigns: {
            minCount: 100,
            timeRange: '30 days'
        }
    },

    // Coverage Requirements
    coverage: {
        target: 95,
        critical: {
            authentication: 100,
            billing: 100,
            medicalRecords: 98,
            appointments: 95
        }
    },

    // Test Environment
    environment: {
        timeout: 30000,
        retries: 2,
        parallel: false,
        cleanup: true
    }
};

export default TEST_CONFIG;
