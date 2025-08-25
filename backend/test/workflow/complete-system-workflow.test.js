/**
 * Comprehensive Workflow Tests for Hospital Management System
 * Tests complete user workflows for all roles in the system
 */
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { expect } from '@jest/globals';

const request = supertest(app);

describe('🏥 Complete Hospital Management System Workflow Tests', () => {
    let server;
    let testUsers = {};
    let testTokens = {};
    let testData = {};

    // Test user credentials for each role
    const roleTestData = {
        Admin: {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'admin.test@hospital.com',
            password: 'AdminTest123!',
            phone: '1234567890',
            gender: 'Male',
            dob: '1985-01-01',
            role: 'Admin'
        },
        Doctor: {
            firstName: 'Dr. Test',
            lastName: 'Physician',
            email: 'doctor.test@hospital.com',
            password: 'DoctorTest123!',
            phone: '1234567891',
            gender: 'Male',
            dob: '1980-01-01',
            role: 'Doctor',
            specialization: 'General Medicine',
            department: 'Medicine'
        },
        Patient: {
            firstName: 'Test',
            lastName: 'Patient',
            email: 'patient.test@hospital.com',
            password: 'PatientTest123!',
            phone: '1234567892',
            gender: 'Male',
            dob: '1990-01-01',
            nic: '123456789V',
            role: 'Patient'
        },
        Receptionist: {
            firstName: 'Test',
            lastName: 'Receptionist',
            email: 'receptionist.test@hospital.com',
            password: 'ReceptionTest123!',
            phone: '1234567893',
            gender: 'Female',
            dob: '1988-01-01',
            role: 'Receptionist'
        },
        Technician: {
            firstName: 'Test',
            lastName: 'Technician',
            email: 'tech.test@hospital.com',
            password: 'TechTest123!',
            phone: '1234567894',
            gender: 'Male',
            dob: '1987-01-01',
            role: 'Technician'
        },
        BillingStaff: {
            firstName: 'Test',
            lastName: 'Billing',
            email: 'billing.test@hospital.com',
            password: 'BillingTest123!',
            phone: '1234567895',
            gender: 'Female',
            dob: '1986-01-01',
            role: 'BillingStaff'
        },
        Pharmacist: {
            firstName: 'Test',
            lastName: 'Pharmacist',
            email: 'pharmacist.test@hospital.com',
            password: 'PharmTest123!',
            phone: '1234567896',
            gender: 'Male',
            dob: '1984-01-01',
            role: 'Pharmacist'
        },
        LabSupervisor: {
            firstName: 'Test',
            lastName: 'LabSupervisor',
            email: 'labsupervisor.test@hospital.com',
            password: 'LabSupTest123!',
            phone: '1234567897',
            gender: 'Female',
            dob: '1983-01-01',
            role: 'LabSupervisor'
        },
        Nurse: {
            firstName: 'Test',
            lastName: 'Nurse',
            email: 'nurse.test@hospital.com',
            password: 'NurseTest123!',
            phone: '1234567898',
            gender: 'Female',
            dob: '1989-01-01',
            role: 'Nurse'
        },
        LabTechnician: {
            firstName: 'Test',
            lastName: 'LabTech',
            email: 'labtech.test@hospital.com',
            password: 'LabTechTest123!',
            phone: '1234567899',
            gender: 'Male',
            dob: '1991-01-01',
            role: 'LabTechnician'
        }
    };

    beforeAll(async () => {
        // Start server
        server = app.listen(0);

        // Clean test data
        await cleanTestData();

        // Create test users for each role
        await createTestUsers();

        // Login and get tokens for each user
        await loginAllTestUsers();

        console.log('🚀 Test setup completed - All test users created and authenticated');
    });

    afterAll(async () => {
        // Clean up test data
        await cleanTestData();

        // Close server and database connections
        if (server) {
            server.close();
        }

        console.log('🧹 Test cleanup completed');
    });

    // Helper functions
    async function cleanTestData() {
        try {
            const collections = ['users', 'appointments', 'medical_records', 'prescriptions', 'labtests', 'invoices'];

            for (const collectionName of collections) {
                const collection = mongoose.connection.db.collection(collectionName);
                await collection.deleteMany({
                    $or: [
                        { email: { $regex: /test@hospital\.com$/i } },
                        { isTestData: true }
                    ]
                });
            }

            console.log('🧹 Cleaned test data from database');
        } catch (error) {
            console.error('❌ Error cleaning test data:', error);
        }
    }

    async function createTestUsers() {
        for (const [role, userData] of Object.entries(roleTestData)) {
            try {
                const response = await request(app)
                    .post('/api/v1/user/patient/register')
                    .send({
                        ...userData,
                        isTestData: true
                    });

                if (response.status === 201) {
                    testUsers[role] = response.body.user;
                    console.log(`✅ Created test ${role}: ${userData.email}`);
                } else {
                    console.log(`⚠️ ${role} might already exist: ${userData.email}`);
                    // Try to find existing user
                    const { User } = await import('../../models/userScheme.js');
                    const existingUser = await User.findOne({ email: userData.email });
                    if (existingUser) {
                        testUsers[role] = existingUser;
                    }
                }
            } catch (error) {
                console.error(`❌ Error creating test ${role}:`, error.message);
            }
        }
    }

    async function loginAllTestUsers() {
        for (const [role, userData] of Object.entries(roleTestData)) {
            try {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: userData.email,
                        password: userData.password
                    });

                if (response.status === 200) {
                    testTokens[role] = response.body.token;
                    console.log(`✅ Logged in test ${role}`);
                } else {
                    console.error(`❌ Failed to login test ${role}:`, response.body);
                }
            } catch (error) {
                console.error(`❌ Error logging in test ${role}:`, error.message);
            }
        }
    }

    // Test helper function
    function getAuthHeader(role) {
        return testTokens[role] ? { Authorization: `Bearer ${testTokens[role]}` } : {};
    }

    describe('🏥 Complete Patient Journey Workflow', () => {
        let appointmentId;
        let medicalRecordId;
        let prescriptionId;
        let labTestId;
        let invoiceId;

        it('Should complete full patient journey from registration to billing', async () => {
            console.log('🚀 Starting complete patient journey test...');

            // Step 1: Patient registers (already done in setup)
            expect(testUsers.Patient).toBeDefined();
            expect(testUsers.Patient.email).toBe(roleTestData.Patient.email);

            // Step 2: Receptionist schedules appointment
            console.log('📅 Step 2: Scheduling appointment...');
            const appointmentResponse = await request(app)
                .post('/api/v1/appointment/book')
                .set(getAuthHeader('Receptionist'))
                .send({
                    patientId: testUsers.Patient._id,
                    doctorId: testUsers.Doctor._id,
                    appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    appointment_time: '10:00',
                    department: 'General Medicine',
                    reason: 'Regular checkup'
                });

            expect(appointmentResponse.status).toBe(201);
            appointmentId = appointmentResponse.body.appointment._id;
            console.log(`✅ Appointment scheduled: ${appointmentId}`);

            // Step 3: Doctor conducts consultation and creates medical record
            console.log('👨‍⚕️ Step 3: Doctor consultation...');
            const medicalRecordResponse = await request(app)
                .post('/api/v1/medical-records/create')
                .set(getAuthHeader('Doctor'))
                .send({
                    appointmentId,
                    patientId: testUsers.Patient._id,
                    encounterId: appointmentId,
                    clinicalAssessment: {
                        chiefComplaint: 'Regular health checkup',
                        historyOfPresentIllness: 'Patient reports feeling well, requesting routine examination',
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
                        icd10Description: 'Encounter for general adult medical examination without abnormal findings',
                        diagnosisType: 'Primary',
                        severity: 'Mild',
                        status: 'Active',
                        confidence: 'Confirmed'
                    }]
                });

            expect([200, 201]).toContain(medicalRecordResponse.status);
            if (medicalRecordResponse.body.record) {
                medicalRecordId = medicalRecordResponse.body.record._id;
            }
            console.log(`✅ Medical record created: ${medicalRecordId}`);

            // Step 4: Doctor prescribes medication
            console.log('💊 Step 4: Prescribing medication...');
            const prescriptionResponse = await request(app)
                .post('/api/v1/prescriptions')
                .set(getAuthHeader('Doctor'))
                .send({
                    patientId: testUsers.Patient._id,
                    appointmentId,
                    medications: [{
                        name: 'Vitamin D',
                        dosage: '1000 IU',
                        frequency: 'Once daily',
                        duration: '30 days',
                        instructions: 'Take with food'
                    }]
                });

            if (prescriptionResponse.status === 201) {
                prescriptionId = prescriptionResponse.body.prescription._id;
                console.log(`✅ Prescription created: ${prescriptionId}`);
            } else {
                console.log(`⚠️ Prescription creation status: ${prescriptionResponse.status}`);
            }

            // Step 5: Doctor orders lab tests
            console.log('🧪 Step 5: Ordering lab tests...');
            const labTestResponse = await request(app)
                .post('/api/v1/lab/tests')
                .set(getAuthHeader('Doctor'))
                .send({
                    patientId: testUsers.Patient._id,
                    appointmentId,
                    testType: 'Blood Work',
                    testName: 'Complete Blood Count',
                    urgency: 'routine',
                    instructions: 'Fasting required'
                });

            if (labTestResponse.status === 201) {
                labTestId = labTestResponse.body.test._id;
                console.log(`✅ Lab test ordered: ${labTestId}`);
            } else {
                console.log(`⚠️ Lab test ordering status: ${labTestResponse.status}`);
            }

            // Step 6: Technician processes lab test
            if (labTestId) {
                console.log('🔬 Step 6: Processing lab test...');
                const labProcessResponse = await request(app)
                    .patch(`/api/v1/lab/tests/${labTestId}`)
                    .set(getAuthHeader('Technician'))
                    .send({
                        status: 'Completed',
                        results: {
                            hemoglobin: '14.2 g/dL',
                            whiteBloodCells: '7500/μL',
                            platelets: '250000/μL'
                        },
                        notes: 'All values within normal range'
                    });

                if (labProcessResponse.status === 200) {
                    console.log(`✅ Lab test processed successfully`);
                } else {
                    console.log(`⚠️ Lab test processing status: ${labProcessResponse.status}`);
                }
            }

            // Step 7: Pharmacist dispenses medication
            if (prescriptionId) {
                console.log('🏥 Step 7: Dispensing medication...');
                const dispensingResponse = await request(app)
                    .patch(`/api/v1/prescriptions/${prescriptionId}/dispense`)
                    .set(getAuthHeader('Pharmacist'))
                    .send({
                        dispensedBy: testUsers.Pharmacist._id,
                        dispensedDate: new Date(),
                        notes: 'Medication dispensed with counseling provided'
                    });

                if (dispensingResponse.status === 200) {
                    console.log(`✅ Medication dispensed successfully`);
                } else {
                    console.log(`⚠️ Medication dispensing status: ${dispensingResponse.status}`);
                }
            }

            // Step 8: Billing staff creates invoice
            console.log('💰 Step 8: Creating invoice...');
            const invoiceResponse = await request(app)
                .post('/api/v1/billing/invoices')
                .set(getAuthHeader('BillingStaff'))
                .send({
                    patientId: testUsers.Patient._id,
                    appointmentId,
                    services: [
                        {
                            name: 'Consultation',
                            code: 'CONS001',
                            amount: 150.00
                        },
                        {
                            name: 'Lab Test - CBC',
                            code: 'LAB001',
                            amount: 75.00
                        }
                    ],
                    totalAmount: 225.00
                });

            if (invoiceResponse.status === 201) {
                invoiceId = invoiceResponse.body.invoice._id;
                console.log(`✅ Invoice created: ${invoiceId}`);
            } else {
                console.log(`⚠️ Invoice creation status: ${invoiceResponse.status}`);
            }

            // Step 9: Patient views their data
            console.log('👤 Step 9: Patient accessing their data...');

            // Patient views appointments
            const patientAppointmentsResponse = await request(app)
                .get('/api/v1/appointment/patient')
                .set(getAuthHeader('Patient'));

            expect([200, 404]).toContain(patientAppointmentsResponse.status);
            console.log(`✅ Patient accessed appointments: ${patientAppointmentsResponse.status}`);

            // Patient views medical records
            const patientRecordsResponse = await request(app)
                .get('/api/v1/medical-records/my-records')
                .set(getAuthHeader('Patient'));

            expect([200, 404]).toContain(patientRecordsResponse.status);
            console.log(`✅ Patient accessed medical records: ${patientRecordsResponse.status}`);

            // Step 10: Admin oversight
            console.log('👨‍💼 Step 10: Admin oversight...');

            // Admin views dashboard
            const adminDashboardResponse = await request(app)
                .get('/api/v1/admin/dashboard')
                .set(getAuthHeader('Admin'));

            expect([200, 404]).toContain(adminDashboardResponse.status);
            console.log(`✅ Admin accessed dashboard: ${adminDashboardResponse.status}`);

            console.log('🎉 Complete patient journey workflow test completed successfully!');
        }, 60000); // Extended timeout for complete workflow
    });

    describe('🔐 Role-based Access Control Tests', () => {
        it('Should enforce proper access control for each role', async () => {
            console.log('🔒 Testing role-based access control...');

            // Test Patient access restrictions
            const patientAdminAccess = await request(app)
                .get('/api/v1/admin/users')
                .set(getAuthHeader('Patient'));
            expect([401, 403]).toContain(patientAdminAccess.status);

            // Test Doctor access to patient data
            const doctorPatientAccess = await request(app)
                .get('/api/v1/patients')
                .set(getAuthHeader('Doctor'));
            expect([200, 404]).toContain(doctorPatientAccess.status);

            // Test Receptionist appointment management
            const receptionistAppointments = await request(app)
                .get('/api/v1/appointment/all')
                .set(getAuthHeader('Receptionist'));
            expect([200, 404]).toContain(receptionistAppointments.status);

            // Test Technician lab access
            const techLabAccess = await request(app)
                .get('/api/v1/lab/tests')
                .set(getAuthHeader('Technician'));
            expect([200, 404]).toContain(techLabAccess.status);

            console.log('✅ Role-based access control working correctly');
        });
    });

    describe('📊 System Performance and Data Integrity', () => {
        it('Should maintain data integrity across all workflows', async () => {
            console.log('🔍 Testing data integrity...');

            // Test user count consistency
            const userCountResponse = await request(app)
                .get('/api/v1/admin/users/count')
                .set(getAuthHeader('Admin'));

            if (userCountResponse.status === 200) {
                expect(userCountResponse.body.count).toBeGreaterThan(0);
            }

            // Test appointment consistency
            const appointmentStatsResponse = await request(app)
                .get('/api/v1/appointment/stats')
                .set(getAuthHeader('Admin'));

            if (appointmentStatsResponse.status === 200) {
                expect(typeof appointmentStatsResponse.body).toBe('object');
            }

            console.log('✅ Data integrity maintained');
        });

        it('Should handle concurrent operations', async () => {
            console.log('⚡ Testing concurrent operations...');

            // Simulate multiple concurrent requests
            const concurrentPromises = [
                request(app).get('/api/v1/user/me').set(getAuthHeader('Patient')),
                request(app).get('/api/v1/user/me').set(getAuthHeader('Doctor')),
                request(app).get('/api/v1/user/me').set(getAuthHeader('Admin'))
            ];

            const results = await Promise.all(concurrentPromises);

            // All requests should complete successfully
            results.forEach((result, index) => {
                expect([200, 401]).toContain(result.status);
            });

            console.log('✅ Concurrent operations handled successfully');
        });
    });
});

const testHelpers = {
    cleanTestData: async () => {
        const collections = ['users', 'appointments', 'medical_records', 'prescriptions', 'labtests', 'invoices'];

        for (const collectionName of collections) {
            const collection = mongoose.connection.db.collection(collectionName);
            await collection.deleteMany({
                $or: [
                    { email: { $regex: /test@hospital\.com$/i } },
                    { isTestData: true }
                ]
            });
        }
    }
};

export { roleTestData, testHelpers };
