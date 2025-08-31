// Database Seeder cho Test Data - Medical Records System
const mongoose = require('mongoose');

class MedicalRecordSeeder {
    static async seedTestData() {
        try {
            console.log('🌱 Starting medical record seeder...');

            // Dynamic imports
            const { EnhancedMedicalRecord } = await import('../../../models/enhancedMedicalRecord.model.js');
            const { User } = await import('../../../models/userScheme.js');
            const { Appointment } = await import('../../../models/appointmentSchema.js');

            // Clear existing test data
            await EnhancedMedicalRecord.deleteMany({ isTestData: true });
            console.log('✅ Cleared existing test data');

            // Create test doctor
            const testDoctor = await User.findOneAndUpdate(
                { email: 'test.doctor@hospital.com' },
                {
                    firstName: 'Test',
                    lastName: 'Doctor',
                    email: 'test.doctor@hospital.com',
                    role: 'Doctor',
                    specialization: 'Internal Medicine',
                    licenseNumber: 'MD123456',
                    phone: '1234567890',
                    password: '$2b$10$3Xe8ZJ0OkWpG1V1ZJ9G3N.OjWO1P8M2V9NMQyoQ3OWy2.yZ8c8K3K', // testpassword123
                    isTestData: true
                },
                { upsert: true, new: true }
            );
            console.log('✅ Created test doctor:', testDoctor.email);

            // Create test patient
            const testPatient = await User.findOneAndUpdate(
                { email: 'test.patient@email.com' },
                {
                    firstName: 'Test',
                    lastName: 'Patient',
                    email: 'test.patient@email.com',
                    role: 'Patient',
                    dateOfBirth: new Date('1990-01-01'),
                    gender: 'Male',
                    phone: '1234567891',
                    password: '$2b$10$3Xe8ZJ0OkWpG1V1ZJ9G3N.OjWO1P8M2V9NMQyoQ3OWy2.yZ8c8K3K', // testpassword123
                    address: {
                        street: '123 Test Street',
                        city: 'Test City',
                        state: 'Test State',
                        zipCode: '12345',
                        country: 'Test Country'
                    },
                    isTestData: true
                },
                { upsert: true, new: true }
            );
            console.log('✅ Created test patient:', testPatient.email);

            // Create test appointment
            const testAppointment = await Appointment.findOneAndUpdate(
                { patientId: testPatient._id, doctorId: testDoctor._id },
                {
                    patientId: testPatient._id,
                    doctorId: testDoctor._id,
                    appointment_date: new Date(),
                    appointment_time: '10:00',
                    department: 'Internal Medicine',
                    status: 'Completed',
                    isTestData: true
                },
                { upsert: true, new: true }
            );
            console.log('✅ Created test appointment');

            // Seed medical records with various scenarios
            const medicalRecordsData = [
                {
                    appointmentId: testAppointment._id,
                    patientId: testPatient._id,
                    doctorId: testDoctor._id,
                    encounterId: testAppointment._id, // Use appointment as encounter for simplicity
                    clinicalAssessment: {
                        chiefComplaint: 'Headache and fever',
                        historyOfPresentIllness: 'Patient presents with 2-day history of headache and low-grade fever',
                        clinicalImpression: 'Viral syndrome suspected',
                        assessedBy: testDoctor._id,
                        assessedDate: new Date()
                    },
                    diagnoses: [{
                        icd10Code: 'R50.9',
                        icd10Description: 'Fever, unspecified',
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: testDoctor._id,
                        addedAt: new Date()
                    }],
                    treatmentPlans: [{
                        planName: 'Symptomatic Treatment',
                        planType: 'Medication',
                        description: 'Paracetamol for fever and pain relief',
                        startDate: new Date(),
                        status: 'Active',
                        prescribedBy: testDoctor._id
                    }],
                    recordStatus: 'Completed',
                    currentVersion: 1,
                    isActive: true,
                    isTestData: true
                },
                {
                    appointmentId: testAppointment._id,
                    patientId: testPatient._id,
                    doctorId: testDoctor._id,
                    encounterId: testAppointment._id,
                    clinicalAssessment: {
                        chiefComplaint: 'Chronic back pain',
                        historyOfPresentIllness: 'Patient reports chronic lower back pain for 6 months',
                        clinicalImpression: 'Chronic lower back pain, likely mechanical',
                        assessedBy: testDoctor._id,
                        assessedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    diagnoses: [{
                        icd10Code: 'M54.5',
                        icd10Description: 'Low back pain',
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: testDoctor._id,
                        addedAt: new Date()
                    }],
                    treatmentPlans: [{
                        planName: 'Physical Therapy',
                        planType: 'Therapy',
                        description: 'Physical therapy for back pain management',
                        startDate: new Date(),
                        status: 'Active',
                        prescribedBy: testDoctor._id
                    }],
                    recordStatus: 'In Progress',
                    currentVersion: 1,
                    isActive: true,
                    isTestData: true
                },
                {
                    appointmentId: testAppointment._id,
                    patientId: testPatient._id,
                    doctorId: testDoctor._id,
                    encounterId: testAppointment._id,
                    clinicalAssessment: {
                        chiefComplaint: 'Annual wellness visit',
                        historyOfPresentIllness: 'Patient here for routine annual physical examination',
                        clinicalImpression: 'Healthy adult for annual wellness visit',
                        assessedBy: testDoctor._id,
                        assessedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    },
                    diagnoses: [{
                        icd10Code: 'Z00.00',
                        icd10Description: 'Encounter for general adult medical examination without abnormal findings',
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: testDoctor._id,
                        addedAt: new Date()
                    }],
                    treatmentPlans: [{
                        planName: 'Routine Screening',
                        planType: 'Monitoring',
                        description: 'Continue routine screening and lifestyle counseling',
                        startDate: new Date(),
                        status: 'Completed',
                        prescribedBy: testDoctor._id
                    }],
                    recordStatus: 'Finalized',
                    currentVersion: 1,
                    isActive: true,
                    isTestData: true
                }
            ];

            const createdRecords = await EnhancedMedicalRecord.insertMany(medicalRecordsData);

            console.log(`✅ Seeded ${createdRecords.length} test medical records`);

            return {
                testDoctor,
                testPatient,
                testAppointment,
                createdRecords
            };

        } catch (error) {
            console.error('❌ Error seeding medical record test data:', error);
            throw error;
        }
    }

    static async seedLargeDataset() {
        try {
            console.log('🌱 Creating large dataset for performance testing...');

            // Dynamic imports
            const { EnhancedMedicalRecord } = await import('../../../models/enhancedMedicalRecord.model.js');
            const { User } = await import('../../../models/userScheme.js');
            const { Appointment } = await import('../../../models/appointmentSchema.js');

            // Create multiple test doctors and patients
            const doctors = [];
            const patients = [];

            for (let i = 0; i < 10; i++) {
                const doctor = await User.create({
                    firstName: `TestDoctor${i}`,
                    lastName: `Performance`,
                    email: `perf.doctor${i}@test.com`,
                    role: 'Doctor',
                    specialization: 'Internal Medicine',
                    licenseNumber: `MD${i}123456`,
                    phone: `123456789${i}`,
                    password: '$2b$10$3Xe8ZJ0OkWpG1V1ZJ9G3N.OjWO1P8M2V9NMQyoQ3OWy2.yZ8c8K3K',
                    gender: 'Male',
                    dob: new Date('1980-01-01'),
                    nic: `80012345${i}`,
                    isTestData: true
                });
                doctors.push(doctor);
            }

            for (let i = 0; i < 50; i++) {
                const patient = await User.create({
                    firstName: `TestPatient${i}`,
                    lastName: `Performance`,
                    email: `perf.patient${i}@test.com`,
                    role: 'Patient',
                    dob: new Date(1990 + (i % 30), i % 12, (i % 28) + 1),
                    gender: i % 2 === 0 ? 'Male' : 'Female',
                    phone: `987654321${i}`,
                    password: '$2b$10$3Xe8ZJ0OkWpG1V1ZJ9G3N.OjWO1P8M2V9NMQyoQ3OWy2.yZ8c8K3K',
                    nic: `90012345${i}`,
                    isTestData: true
                });
                patients.push(patient);
            }

            // Create appointments and medical records
            const medicalRecords = [];
            const icd10Codes = [
                { code: 'R50.9', description: 'Fever, unspecified' },
                { code: 'M54.5', description: 'Low back pain' },
                { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
                { code: 'K59.00', description: 'Constipation, unspecified' },
                { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
                { code: 'I10', description: 'Essential hypertension' },
                { code: 'Z00.00', description: 'Encounter for general adult medical examination' }
            ];

            for (let i = 0; i < 500; i++) {
                const doctor = doctors[i % doctors.length];
                const patient = patients[i % patients.length];
                const icd10 = icd10Codes[i % icd10Codes.length];

                const appointment = await Appointment.create({
                    patientId: patient._id,
                    doctorId: doctor._id,
                    appointment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    appointment_time: '10:00',
                    department: 'Internal Medicine',
                    status: 'Completed',
                    isTestData: true
                });

                const record = await EnhancedMedicalRecord.create({
                    appointmentId: appointment._id,
                    patientId: patient._id,
                    doctorId: doctor._id,
                    encounterId: appointment._id,
                    clinicalAssessment: {
                        chiefComplaint: `Performance test complaint ${i}`,
                        historyOfPresentIllness: `Test history for record ${i}`,
                        clinicalImpression: `Test assessment for record ${i}`,
                        assessedBy: doctor._id,
                        assessedDate: new Date()
                    },
                    diagnoses: [{
                        icd10Code: icd10.code,
                        icd10Description: icd10.description,
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: doctor._id,
                        addedAt: new Date()
                    }],
                    recordStatus: i % 3 === 0 ? 'Completed' : 'In Progress',
                    currentVersion: 1,
                    isActive: true,
                    isTestData: true
                });

                medicalRecords.push(record);
            }

            console.log(`✅ Created large dataset: ${doctors.length} doctors, ${patients.length} patients, ${medicalRecords.length} medical records`);

            return {
                doctors,
                patients,
                medicalRecords
            };

        } catch (error) {
            console.error('❌ Error creating large dataset:', error);
            throw error;
        }
    }

    static async cleanupTestData() {
        try {
            console.log('🧹 Cleaning up test data...');

            // Dynamic imports
            const { EnhancedMedicalRecord } = await import('../../../models/enhancedMedicalRecord.model.js');
            const { User } = await import('../../../models/userScheme.js');
            const { Appointment } = await import('../../../models/appointmentSchema.js');

            await EnhancedMedicalRecord.deleteMany({ isTestData: true });
            await Appointment.deleteMany({ isTestData: true });
            await User.deleteMany({ isTestData: true });

            console.log('✅ Test data cleaned up successfully');
        } catch (error) {
            console.error('❌ Error cleaning up test data:', error);
            throw error;
        }
    }

    static async getTestAuthTokens() {
        try {
            const request = require('supertest');
            const app = require('../../app.js');

            // Login as doctor
            const doctorLoginResponse = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'test.doctor@hospital.com',
                    password: 'testpassword123'
                });

            // Login as patient
            const patientLoginResponse = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'test.patient@email.com',
                    password: 'testpassword123'
                });

            return {
                doctor: doctorLoginResponse.body.token,
                patient: patientLoginResponse.body.token
            };
        } catch (error) {
            console.error('❌ Error getting auth tokens:', error);
            throw error;
        }
    }
}

module.exports = MedicalRecordSeeder;
