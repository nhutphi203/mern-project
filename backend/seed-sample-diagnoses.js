#!/usr/bin/env node

/**
 * Sample Diagnoses Seeder
 * Tạo sample diagnoses để test Medical Records System
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import models
import { User } from './models/userScheme.js';
import { EnhancedMedicalRecord } from './models/enhancedMedicalRecord.model.js';
import { ICD10 } from './models/icd10.model.js';
import { Diagnosis } from './models/diagnosis.model.js';

const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg)
};

async function seedDiagnoses() {
    try {
        log.header('SEEDING SAMPLE DIAGNOSES');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        log.success('Connected to MongoDB');

        // Check if diagnoses already exist
        const existingCount = await Diagnosis.countDocuments();
        if (existingCount > 0) {
            log.warning(`Found ${existingCount} existing diagnoses, skipping seed`);
            return;
        }

        // Get available data
        const doctors = await User.find({ role: 'Doctor' }).limit(5);
        const patients = await User.find({ role: 'Patient' }).limit(10);
        const medicalRecords = await EnhancedMedicalRecord.find().limit(10);
        const icd10Codes = await ICD10.find().limit(10);

        if (doctors.length === 0 || patients.length === 0 || medicalRecords.length === 0 || icd10Codes.length === 0) {
            log.error('Insufficient data to seed diagnoses');
            log.info(`Doctors: ${doctors.length}, Patients: ${patients.length}, Records: ${medicalRecords.length}, ICD10: ${icd10Codes.length}`);
            return;
        }

        log.info(`Available data: ${doctors.length} doctors, ${patients.length} patients, ${medicalRecords.length} records, ${icd10Codes.length} ICD-10 codes`);

        // Create sample diagnoses
        const sampleDiagnoses = [];

        // Diagnosis templates based on ICD-10 codes
        const diagnosisTemplates = [
            {
                icd10Code: 'I10',
                customDescription: 'Patient presents with consistently elevated blood pressure readings over 140/90 mmHg',
                type: 'Primary',
                severity: 'Moderate',
                status: 'Active',
                confidence: 'Confirmed',
                clinicalNotes: 'Patient has family history of hypertension. Recommending lifestyle modifications and antihypertensive medication.'
            },
            {
                icd10Code: 'E11.9',
                customDescription: 'Type 2 diabetes mellitus with good glycemic control',
                type: 'Primary',
                severity: 'Moderate',
                status: 'Chronic',
                confidence: 'Confirmed',
                clinicalNotes: 'Patient managing diabetes well with metformin and diet control. HbA1c within target range.'
            },
            {
                icd10Code: 'J06.9',
                customDescription: 'Acute viral upper respiratory tract infection',
                type: 'Primary',
                severity: 'Mild',
                status: 'Active',
                confidence: 'Probable',
                clinicalNotes: 'Recent onset of cold symptoms. Symptomatic treatment recommended.'
            },
            {
                icd10Code: 'K59.0',
                customDescription: 'Chronic constipation related to dietary factors',
                type: 'Secondary',
                severity: 'Mild',
                status: 'Active',
                confidence: 'Probable',
                clinicalNotes: 'Patient reports irregular bowel movements. Dietary counseling and fiber supplementation advised.'
            },
            {
                icd10Code: 'R50.9',
                customDescription: 'Fever of unknown origin under investigation',
                type: 'Primary',
                severity: 'Moderate',
                status: 'Active',
                confidence: 'Suspected',
                clinicalNotes: 'Patient presenting with intermittent fever. Further diagnostic workup needed to determine etiology.'
            },
            {
                icd10Code: 'F32.9',
                customDescription: 'Major depressive episode, moderate severity',
                type: 'Primary',
                severity: 'Moderate',
                status: 'Active',
                confidence: 'Confirmed',
                clinicalNotes: 'Patient reports persistent low mood, anhedonia, and sleep disturbances. Initiating antidepressant therapy.'
            },
            {
                icd10Code: 'N39.0',
                customDescription: 'Uncomplicated urinary tract infection',
                type: 'Primary',
                severity: 'Mild',
                status: 'Active',
                confidence: 'Confirmed',
                clinicalNotes: 'Positive urine culture for E. coli. Patient responding well to antibiotic treatment.'
            },
            {
                icd10Code: 'Z00.0',
                customDescription: 'Routine annual physical examination',
                type: 'Primary',
                severity: 'Mild',
                status: 'Resolved',
                confidence: 'Confirmed',
                clinicalNotes: 'Comprehensive health screening completed. All parameters within normal limits.'
            }
        ];

        // Create diagnoses for medical records
        for (let i = 0; i < Math.min(medicalRecords.length, diagnosisTemplates.length); i++) {
            const record = medicalRecords[i];
            const template = diagnosisTemplates[i];

            // Find matching ICD-10 code
            const icd10 = icd10Codes.find(code => code.code === template.icd10Code);
            if (!icd10) continue;

            // Get doctor and patient from record
            const doctor = doctors.find(d => d._id.toString() === record.doctorId?.toString()) || doctors[0];
            const patient = patients.find(p => p._id.toString() === record.patientId?.toString()) || patients[0];

            const diagnosis = {
                medicalRecordId: record._id,
                doctorId: doctor._id,
                patientId: patient._id,
                icd10Code: icd10.code,
                icd10Description: icd10.shortDescription,
                customDescription: template.customDescription,
                type: template.type,
                severity: template.severity,
                status: template.status,
                confidence: template.confidence,
                onsetDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
                clinicalNotes: template.clinicalNotes,
                createdBy: doctor._id
            };

            sampleDiagnoses.push(diagnosis);
        }

        // Add some additional diagnoses for variety
        for (let i = 0; i < 5; i++) {
            const randomRecord = medicalRecords[Math.floor(Math.random() * medicalRecords.length)];
            const randomICD10 = icd10Codes[Math.floor(Math.random() * icd10Codes.length)];
            const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
            const randomPatient = patients[Math.floor(Math.random() * patients.length)];

            const additionalDiagnosis = {
                medicalRecordId: randomRecord._id,
                doctorId: randomDoctor._id,
                patientId: randomPatient._id,
                icd10Code: randomICD10.code,
                icd10Description: randomICD10.shortDescription,
                customDescription: `Clinical assessment consistent with ${randomICD10.shortDescription.toLowerCase()}`,
                type: ['Primary', 'Secondary', 'Differential'][Math.floor(Math.random() * 3)],
                severity: ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
                status: ['Active', 'Resolved', 'Chronic'][Math.floor(Math.random() * 3)],
                confidence: ['Confirmed', 'Probable', 'Possible', 'Suspected'][Math.floor(Math.random() * 4)],
                onsetDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
                clinicalNotes: `Additional clinical observations and treatment plan for ${randomICD10.shortDescription.toLowerCase()}.`,
                createdBy: randomDoctor._id
            };

            sampleDiagnoses.push(additionalDiagnosis);
        }

        // Insert diagnoses
        const insertedDiagnoses = await Diagnosis.insertMany(sampleDiagnoses);
        log.success(`Seeded ${insertedDiagnoses.length} sample diagnoses`);

        // Update ICD-10 usage counts
        for (const diagnosis of insertedDiagnoses) {
            await ICD10.findOneAndUpdate(
                { code: diagnosis.icd10Code },
                { $inc: { commonUsage: 1 } }
            );
        }
        log.success('Updated ICD-10 usage statistics');

        // Verify seeding
        const finalCount = await Diagnosis.countDocuments();
        log.info(`Total diagnoses in database: ${finalCount}`);

        // Show statistics
        const statusStats = await Diagnosis.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const typeStats = await Diagnosis.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        log.info('Diagnosis statistics:');
        log.info('By Status:');
        statusStats.forEach(stat => log.info(`  ${stat._id}: ${stat.count}`));

        log.info('By Type:');
        typeStats.forEach(stat => log.info(`  ${stat._id}: ${stat.count}`));

        log.header('🎉 SAMPLE DIAGNOSES SEEDING COMPLETED!');

    } catch (error) {
        log.error(`Seeding failed: ${error.message}`);
        throw error;
    } finally {
        await mongoose.disconnect();
        log.info('Disconnected from MongoDB');
    }
}

// Run seeder
seedDiagnoses().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
