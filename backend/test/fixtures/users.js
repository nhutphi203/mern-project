/**
 * Valid Test User Data with Proper Schema Validation
 * Fixes: NIC validation, DOB format, Gender enum, Required fields
 */

export const validTestUsers = {
    doctor: {
        firstName: 'Test',
        lastName: 'Doctor',
        email: 'test.doctor@hospital.com',
        password: 'testpassword123',
        phone: '1234567890',
        gender: 'Male', // Correct enum value
        dob: '1980-01-01', // Valid date format
        nic: '198012345678', // Exactly 12 digits
        address: 'Test Doctor Address 123',
        role: 'Doctor',
        specialization: 'General Medicine',
        department: 'Medicine',
        isTestData: true
    },

    patient: {
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient@email.com',
        password: 'testpassword123',
        phone: '2345678901',
        gender: 'Female', // Correct enum value
        dob: '1990-01-01', // Valid date format
        nic: '199012345678', // Exactly 12 digits
        address: 'Test Patient Address 456',
        role: 'Patient',
        isTestData: true
    },

    admin: {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test.admin@hospital.com',
        password: 'testpassword123',
        phone: '3456789012',
        gender: 'Male',
        dob: '1985-01-01',
        nic: '198512345678',
        address: 'Test Admin Address 789',
        role: 'Admin',
        isTestData: true
    },

    receptionist: {
        firstName: 'Test',
        lastName: 'Receptionist',
        email: 'test.receptionist@hospital.com',
        password: 'testpassword123',
        phone: '4567890123',
        gender: 'Female',
        dob: '1988-01-01',
        nic: '198812345678',
        address: 'Test Receptionist Address 012',
        role: 'Receptionist',
        isTestData: true
    },

    nurse: {
        firstName: 'Test',
        lastName: 'Nurse',
        email: 'test.nurse@hospital.com',
        password: 'testpassword123',
        phone: '5678901234',
        gender: 'Female',
        dob: '1989-01-01',
        nic: '198912345678',
        address: 'Test Nurse Address 345',
        role: 'Nurse',
        isTestData: true
    },

    labTechnician: {
        firstName: 'Test',
        lastName: 'LabTech',
        email: 'test.labtech@hospital.com',
        password: 'testpassword123',
        phone: '6789012345',
        gender: 'Male',
        dob: '1991-01-01',
        nic: '199112345678',
        address: 'Test LabTech Address 678',
        role: 'LabTechnician',
        isTestData: true
    },

    billingStaff: {
        firstName: 'Test',
        lastName: 'BillingStaff',
        email: 'test.billing@hospital.com',
        password: 'testpassword123',
        phone: '7890123456',
        gender: 'Female',
        dob: '1986-01-01',
        nic: '198612345678',
        address: 'Test Billing Address 901',
        role: 'BillingStaff',
        isTestData: true
    }
};

export const invalidTestUsers = {
    // For negative testing
    invalidNIC: {
        ...validTestUsers.patient,
        email: 'invalid.nic@test.com',
        nic: '123', // Too short
    },

    invalidGender: {
        ...validTestUsers.patient,
        email: 'invalid.gender@test.com',
        gender: 'unknown', // Invalid enum
    },

    missingRequiredFields: {
        firstName: 'Test',
        lastName: 'Incomplete',
        email: 'incomplete@test.com',
        // Missing: dob, nic, gender for Patient role
        role: 'Patient'
    }
};

export const testMedicalRecords = {
    basicRecord: {
        chiefComplaint: 'Test complaint for access control',
        historyOfPresentIllness: 'Test history for security testing',
        clinicalAssessment: {
            physicalExam: {
                vitalSigns: {
                    bloodPressure: '120/80',
                    heartRate: 72,
                    temperature: 98.6,
                    respiratoryRate: 16
                }
            }
        },
        diagnoses: [{
            icd10Code: 'Z00.00',
            icd10Description: 'Encounter for general adult medical examination',
            diagnosisType: 'Primary',
            severity: 'Mild'
        }],
        recordStatus: 'Completed',
        isTestData: true
    }
};

export const testAppointments = {
    basicAppointment: {
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        appointmentTime: '10:00',
        department: 'General Medicine',
        reasonForVisit: 'Test appointment for access control',
        status: 'Scheduled',
        isTestData: true
    }
};
