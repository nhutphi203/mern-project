// Test script to create sample medical records
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dbConnection } from '../database/dbConnection.js';
import { EnhancedMedicalRecord } from '../models/enhancedMedicalRecord.model.js';
import { User } from '../models/userScheme.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function createTestData() {
    try {
        await dbConnection();
        console.log('Connected to database');

        // Find or create test users
        let patient = await User.findOne({ role: 'Patient' });
        let doctor = await User.findOne({ role: 'Doctor' });

        if (!patient) {
            patient = await User.create({
                firstName: 'Nguyễn',
                lastName: 'Văn A',
                email: 'patient@test.com',
                phone: '0123456789',
                password: 'password123',
                role: 'Patient',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Male'
            });
            console.log('Created test patient');
        }

        if (!doctor) {
            doctor = await User.create({
                firstName: 'Dr. Trần',
                lastName: 'Minh',
                email: 'doctor@test.com',
                phone: '0987654321',
                password: 'password123',
                role: 'Doctor',
                specialization: 'Internal Medicine',
                licenseNumber: 'DOC001'
            });
            console.log('Created test doctor');
        }

        // Create sample medical records
        const sampleRecords = [
            {
                appointmentId: new mongoose.Types.ObjectId(), // Proper ObjectId
                patientId: patient._id,
                doctorId: doctor._id, // Use doctorId instead of primaryProviderId
                encounterId: new mongoose.Types.ObjectId(), // Proper ObjectId
                clinicalAssessment: {
                    chiefComplaint: 'Chest pain and shortness of breath',
                    historyOfPresentIllness: 'Patient reports onset of chest pain 2 hours ago, associated with shortness of breath and sweating.',
                    physicalExam: {
                        vitalSigns: {
                            bloodPressure: '140/90',
                            heartRate: 95,
                            temperature: 37.2,
                            respiratoryRate: 20,
                            oxygenSaturation: 96
                        },
                        generalAppearance: 'Patient appears anxious and in mild distress',
                        chest: 'Clear to auscultation bilaterally',
                        heart: 'Regular rate and rhythm, no murmurs'
                    },
                    clinicalImpression: 'Possible acute coronary syndrome vs anxiety',
                    assessedBy: doctor._id // Add required assessedBy field
                },
                diagnoses: [
                    {
                        icd10Code: 'R06.02',
                        icd10Description: 'Shortness of breath',
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: doctor._id
                    }
                ],
                treatmentPlans: [
                    {
                        planName: 'Cardiac monitoring',
                        planType: 'Monitoring',
                        description: 'Continuous cardiac monitoring for 24 hours',
                        status: 'Active',
                        prescribedBy: doctor._id
                    }
                ],
                recordStatus: 'In Progress',
                isActive: true
            },
            {
                appointmentId: new mongoose.Types.ObjectId(), // Proper ObjectId
                patientId: patient._id,
                doctorId: doctor._id, // Use doctorId instead of primaryProviderId
                encounterId: new mongoose.Types.ObjectId(), // Proper ObjectId
                clinicalAssessment: {
                    chiefComplaint: 'Routine check-up',
                    historyOfPresentIllness: 'Patient here for annual physical examination. No acute complaints.',
                    physicalExam: {
                        vitalSigns: {
                            bloodPressure: '120/80',
                            heartRate: 72,
                            temperature: 36.8,
                            respiratoryRate: 16,
                            oxygenSaturation: 98
                        },
                        generalAppearance: 'Patient appears well and in no acute distress'
                    },
                    clinicalImpression: 'Healthy adult male, routine screening',
                    assessedBy: doctor._id // Add required assessedBy field
                },
                diagnoses: [
                    {
                        icd10Code: 'Z00.00',
                        icd10Description: 'Encounter for general adult medical examination without abnormal findings',
                        diagnosisType: 'Primary',
                        status: 'Active',
                        addedBy: doctor._id
                    }
                ],
                recordStatus: 'Completed',
                isActive: true
            }
        ];

        // Delete existing test records
        await EnhancedMedicalRecord.deleteMany({});
        console.log('Cleared existing medical records');

        // Insert sample records
        const createdRecords = await EnhancedMedicalRecord.insertMany(sampleRecords);
        console.log(`Created ${createdRecords.length} sample medical records`);

        // Verify data
        const count = await EnhancedMedicalRecord.countDocuments();
        console.log(`Total medical records in database: ${count}`);

        // Show sample data
        const records = await EnhancedMedicalRecord.find()
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .limit(3);

        console.log('\nSample records:');
        records.forEach((record, index) => {
            console.log(`${index + 1}. Patient: ${record.patientId?.firstName} ${record.patientId?.lastName}`);
            console.log(`   Doctor: ${record.doctorId?.firstName} ${record.doctorId?.lastName}`);
            console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
            console.log(`   Status: ${record.recordStatus}`);
            console.log(`   Created: ${record.createdAt}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
}

createTestData();
