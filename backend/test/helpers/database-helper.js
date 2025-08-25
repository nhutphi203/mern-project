// ===================================================================
// 🚀 ULTIMATE TEST FIX STRATEGY - Database Helper
// Phase 1: Foundation Fix - Smart Database Management
// ===================================================================

import mongoose from 'mongoose';
import { User } from '../../models/userScheme.js';
import { Appointment } from '../../models/appointmentSchema.js';
import { Message } from '../../models/messageSchema.js';
import { MedicalRecord } from '../../models/medicalRecordSchema.js';
import { EnhancedMedicalRecord } from '../../models/enhancedMedicalRecord.model.js';
import { LabResult } from '../../models/labResult.model.js';
import { LabOrder } from '../../models/labOrder.model.js';
import { LabReport } from '../../models/labReport.model.js';
import { Prescription } from '../../models/prescriptionSchema.js';
import { Billing } from '../../models/billing/invoice.model.js';
import { Diagnosis } from '../../models/diagnosis.model.js';
import { ICD10 } from '../../models/icd10.model.js';
import { PatientInsurance } from '../../models/billing/patientInsurance.model.js';
import { InsuranceClaim } from '../../models/billing/insuranceClaim.model.js';
import { InsuranceProvider } from '../../models/billing/insuranceProvider.model.js';
import { GLOBAL_TEST_USERS } from '../globalTestData.js';

class TestDatabaseHelper {
    constructor() {
        this.globalTestUserIds = Object.values(GLOBAL_TEST_USERS).map(user => user._id);
        this.counters = new Map();
    }

    /**
     * ✅ Smart cleanup that preserves global test users
     * @param {Object} options - Cleanup options
     */
    async smartCleanup(options = { preserveGlobalUsers: true, preserveICD10: true }) {
        console.log('🧹 Starting smart database cleanup...');
        
        try {
            // Build exclusion filters
            const userExclusions = options.preserveGlobalUsers ? 
                { _id: { $nin: this.globalTestUserIds } } : {};

            // Sequential cleanup to avoid race conditions
            const collections = [
                { model: InsuranceClaim, name: 'InsuranceClaim', filter: {} },
                { model: PatientInsurance, name: 'PatientInsurance', filter: {} },
                { model: LabOrder, name: 'LabOrder', filter: {} },
                { model: LabResult, name: 'LabResult', filter: {} },
                { model: LabReport, name: 'LabReport', filter: {} },
                { model: Prescription, name: 'Prescription', filter: {} },
                { model: Billing, name: 'Billing', filter: {} },
                { model: MedicalRecord, name: 'MedicalRecord', filter: {} },
                { model: EnhancedMedicalRecord, name: 'EnhancedMedicalRecord', filter: {} },
                { model: Appointment, name: 'Appointment', filter: {} },
                { model: Message, name: 'Message', filter: {} },
                { model: User, name: 'User', filter: userExclusions }
            ];

            // Don't cleanup ICD10 if preserving
            if (!options.preserveICD10) {
                collections.push({ model: ICD10, name: 'ICD10', filter: {} });
                collections.push({ model: Diagnosis, name: 'Diagnosis', filter: {} });
            }

            const results = {
                cleaned: [],
                preserved: [],
                errors: []
            };

            for (const { model, name, filter } of collections) {
                try {
                    const deleteResult = await model.deleteMany(filter);
                    results.cleaned.push(`${name}: ${deleteResult.deletedCount} records`);
                    console.log(`  ✅ ${name}: Cleaned ${deleteResult.deletedCount} records`);
                } catch (error) {
                    results.errors.push(`${name}: ${error.message}`);
                    console.error(`  ❌ ${name}: ${error.message}`);
                }
            }

            // Verify global users are preserved
            if (options.preserveGlobalUsers) {
                const preservedUsers = await User.find({ _id: { $in: this.globalTestUserIds } });
                results.preserved.push(`Global users: ${preservedUsers.length}/${this.globalTestUserIds.length}`);
                console.log(`  ✅ Preserved global users: ${preservedUsers.length}/${this.globalTestUserIds.length}`);
            }

            console.log('🎯 Smart cleanup completed successfully');
            return results;

        } catch (error) {
            console.error('❌ Smart cleanup failed:', error.message);
            throw error;
        }
    }

    /**
     * ✅ Seed comprehensive test data
     * @param {Object} options - Seeding options
     */
    async seedTestData(options = { includeICD10: true, includeSampleData: true }) {
        console.log('🌱 Starting test data seeding...');
        
        try {
            const seededData = {
                icd10: 0,
                diagnoses: 0,
                appointments: 0,
                medicalRecords: 0,
                labResults: 0
            };

            // Seed ICD10 codes if needed
            if (options.includeICD10) {
                const icd10Count = await ICD10.countDocuments();
                if (icd10Count === 0) {
                    const sampleICD10 = [
                        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
                        { code: 'I10', description: 'Essential hypertension', category: 'Circulatory' },
                        { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
                        { code: 'K59.00', description: 'Constipation, unspecified', category: 'Digestive' },
                        { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
                        { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental' },
                        { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', category: 'Health Status' },
                        { code: 'R06.02', description: 'Shortness of breath', category: 'Symptoms' },
                        { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
                        { code: 'L70.9', description: 'Acne, unspecified', category: 'Skin' }
                    ];

                    await ICD10.insertMany(sampleICD10);
                    seededData.icd10 = sampleICD10.length;
                    console.log(`  ✅ Seeded ${sampleICD10.length} ICD10 codes`);
                }
            }

            // Seed sample diagnoses
            if (options.includeSampleData) {
                const diagnosisCount = await Diagnosis.countDocuments();
                if (diagnosisCount === 0) {
                    const sampleDiagnoses = [
                        { name: 'Type 2 Diabetes', icd10Code: 'E11.9', description: 'Diabetes mellitus without complications' },
                        { name: 'Hypertension', icd10Code: 'I10', description: 'High blood pressure' },
                        { name: 'Upper Respiratory Infection', icd10Code: 'J06.9', description: 'Common cold or similar infection' },
                        { name: 'Constipation', icd10Code: 'K59.00', description: 'Difficulty with bowel movements' },
                        { name: 'Depression', icd10Code: 'F32.9', description: 'Major depressive disorder' }
                    ];

                    await Diagnosis.insertMany(sampleDiagnoses);
                    seededData.diagnoses = sampleDiagnoses.length;
                    console.log(`  ✅ Seeded ${sampleDiagnoses.length} diagnoses`);
                }
            }

            console.log('🎯 Test data seeding completed successfully');
            return seededData;

        } catch (error) {
            console.error('❌ Test data seeding failed:', error.message);
            throw error;
        }
    }

    /**
     * ✅ Reset all counters to prevent ID conflicts
     */
    async resetCounters() {
        console.log('🔄 Resetting database counters...');
        
        try {
            // Reset mongoose connection counters
            if (mongoose.connection.readyState === 1) {
                const collections = await mongoose.connection.db.listCollections().toArray();
                const collectionNames = collections.map(c => c.name);
                
                // Reset sequence counters if they exist
                for (const collectionName of collectionNames) {
                    if (collectionName.includes('counter') || collectionName.includes('sequence')) {
                        await mongoose.connection.db.collection(collectionName).deleteMany({});
                        console.log(`  ✅ Reset counter for ${collectionName}`);
                    }
                }
            }

            // Clear internal counters
            this.counters.clear();

            console.log('🎯 Database counters reset successfully');
            return true;

        } catch (error) {
            console.error('❌ Counter reset failed:', error.message);
            throw error;
        }
    }

    /**
     * ✅ Verify database state and connections
     */
    async verifyDatabaseState() {
        console.log('🔍 Verifying database state...');
        
        try {
            const state = {
                connection: mongoose.connection.readyState,
                collections: {},
                globalUsers: {},
                issues: []
            };

            // Check connection
            if (state.connection !== 1) {
                state.issues.push('Database connection not ready');
                return state;
            }

            // Count documents in each collection
            const models = [
                { model: User, name: 'users' },
                { model: Appointment, name: 'appointments' },
                { model: MedicalRecord, name: 'medicalRecords' },
                { model: EnhancedMedicalRecord, name: 'enhancedMedicalRecords' },
                { model: LabResult, name: 'labResults' },
                { model: LabOrder, name: 'labOrders' },
                { model: LabReport, name: 'labReports' },
                { model: Prescription, name: 'prescriptions' },
                { model: Billing, name: 'billing' },
                { model: PatientInsurance, name: 'patientInsurances' },
                { model: InsuranceClaim, name: 'insuranceClaims' },
                { model: ICD10, name: 'icd10Codes' },
                { model: Diagnosis, name: 'diagnoses' }
            ];

            for (const { model, name } of models) {
                try {
                    state.collections[name] = await model.countDocuments();
                } catch (error) {
                    state.collections[name] = 'Error: ' + error.message;
                    state.issues.push(`Failed to count ${name}: ${error.message}`);
                }
            }

            // Verify global test users
            const globalUsers = await User.find({ _id: { $in: this.globalTestUserIds } });
            state.globalUsers = {
                expected: this.globalTestUserIds.length,
                found: globalUsers.length,
                missing: this.globalTestUserIds.length - globalUsers.length
            };

            if (state.globalUsers.missing > 0) {
                state.issues.push(`Missing ${state.globalUsers.missing} global test users`);
            }

            // Log summary
            console.log('📊 Database State Summary:');
            console.log(`  Connection: ${state.connection === 1 ? '✅ Connected' : '❌ Disconnected'}`);
            console.log(`  Global Users: ${state.globalUsers.found}/${state.globalUsers.expected}`);
            Object.entries(state.collections).forEach(([name, count]) => {
                console.log(`  ${name}: ${count}`);
            });

            if (state.issues.length > 0) {
                console.log('⚠️ Issues found:');
                state.issues.forEach(issue => console.log(`  - ${issue}`));
            } else {
                console.log('🎯 Database state verification passed');
            }

            return state;

        } catch (error) {
            console.error('❌ Database state verification failed:', error.message);
            throw error;
        }
    }

    /**
     * ✅ Create test appointment with proper relationships
     */
    async createTestAppointment(doctorId, patientId, additionalData = {}) {
        const appointmentData = {
            doctorId,
            patientId,
            appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            appointmentTime: "10:00",
            department: "General Medicine",
            hasVisited: false,
            address: "123 Test Street, Test City",
            phone: "1234567890",
            status: "Pending",
            ...additionalData
        };

        return await Appointment.create(appointmentData);
    }

    /**
     * ✅ Create test medical record with proper validation
     */
    async createTestMedicalRecord(patientId, doctorId, additionalData = {}) {
        const recordData = {
            patientId,
            doctorId,
            visitDate: new Date(),
            symptoms: ["Test symptom"],
            vitalSigns: {
                bloodPressure: { systolic: 120, diastolic: 80 },
                heartRate: 75,
                temperature: 98.6,
                weight: 70,
                height: 170
            },
            diagnosis: "Test diagnosis",
            treatment: "Test treatment",
            notes: "Test notes",
            ...additionalData
        };

        return await EnhancedMedicalRecord.create(recordData);
    }

    /**
     * ✅ Get test statistics
     */
    async getTestStatistics() {
        const stats = {};
        
        const models = [
            { model: User, name: 'users' },
            { model: Appointment, name: 'appointments' },
            { model: MedicalRecord, name: 'medicalRecords' },
            { model: EnhancedMedicalRecord, name: 'enhancedMedicalRecords' },
            { model: LabResult, name: 'labResults' },
            { model: Prescription, name: 'prescriptions' },
            { model: Billing, name: 'billing' }
        ];

        for (const { model, name } of models) {
            stats[name] = await model.countDocuments();
        }

        return stats;
    }
}

// Export singleton instance
export default new TestDatabaseHelper();

// Also export class for custom instances
export { TestDatabaseHelper };
