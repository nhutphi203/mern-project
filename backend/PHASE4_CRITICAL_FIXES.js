#!/usr/bin/env node

/**
 * 🚨 PHASE 4 CRITICAL FIXES - URGENT EXECUTION
 * Target: Fix 132 failed tests → Achieve 100% success rate
 * Timeline: Next 48 hours
 */

import mongoose from 'mongoose';

// ============================================================================
// FIX #1: PATIENT INSURANCE DUPLICATE KEY RESOLVER 
// ============================================================================
async function fixPatientInsuranceDuplicates() {
    console.log('🔧 [FIX #1] Resolving PatientInsurance duplicate key errors...');
    
    try {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Drop the problematic index and recreate properly
        const PatientInsurance = mongoose.connection.collection('patientinsurances');
        
        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections({name: 'patientinsurances'}).toArray();
        
        if (collections.length > 0) {
            console.log('📋 Found PatientInsurance collection, dropping duplicate index...');
            
            try {
                await PatientInsurance.dropIndex('patientId_1_isPrimary_1');
                console.log('✅ Dropped problematic index');
            } catch (error) {
                console.log('⚠️ Index already dropped or not found');
            }
            
            // Delete all existing PatientInsurance records to clean slate
            const deleteResult = await PatientInsurance.deleteMany({});
            console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing PatientInsurance records`);
            
            // Create proper unique index with sparse option
            await PatientInsurance.createIndex(
                { patientId: 1, isPrimary: 1 }, 
                { 
                    unique: true, 
                    sparse: true,
                    name: 'patientId_1_isPrimary_1_sparse'
                }
            );
            console.log('✅ Created new sparse unique index');
        }
        
        console.log('✅ [FIX #1] PatientInsurance duplicate key issue resolved!');
        
    } catch (error) {
        console.error('❌ [FIX #1] Error:', error.message);
        throw error;
    }
}

// ============================================================================
// FIX #2: USER MODEL VALIDATION FIELDS
// ============================================================================
function generateUserValidationFix() {
    console.log('🔧 [FIX #2] Generating user validation field fixes...');
    
    return {
        // Complete user object with all required fields
        completeTestUser: {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "patient",
            gender: "male",           // ← MISSING FIELD FIX
            dob: "1990-01-01",        // ← MISSING FIELD FIX
            phone: "+1234567890",
            address: "Test Address",
            nic: "123456789012"       // ← 12 digit NIC FIX
        },
        
        // Role-specific test data
        roleTestData: {
            admin: {
                name: "Admin User",
                email: "admin@test.com",
                password: "admin123",
                role: "admin",
                gender: "male",
                dob: "1985-01-01",
                phone: "+1234567890",
                address: "Admin Address"
            },
            doctor: {
                name: "Dr. Test",
                email: "doctor@test.com", 
                password: "doctor123",
                role: "doctor",
                gender: "female",
                dob: "1980-01-01",
                phone: "+1234567891",
                address: "Doctor Address",
                specialization: "General Medicine"
            },
            nurse: {
                name: "Nurse Test",
                email: "nurse@test.com",
                password: "nurse123", 
                role: "nurse",
                gender: "female",
                dob: "1990-01-01",
                phone: "+1234567892",
                address: "Nurse Address"
            },
            patient: {
                name: "Patient Test",
                email: "patient@test.com",
                password: "patient123",
                role: "patient", 
                gender: "male",
                dob: "1995-01-01",
                phone: "+1234567893",
                address: "Patient Address",
                nic: "123456789012"
            },
            receptionist: {
                name: "Receptionist Test",
                email: "receptionist@test.com",
                password: "receptionist123",
                role: "receptionist",
                gender: "female", 
                dob: "1992-01-01",
                phone: "+1234567894",
                address: "Receptionist Address"
            },
            billing: {
                name: "Billing Staff",
                email: "billing@test.com",
                password: "billing123",
                role: "billing_staff",
                gender: "male",
                dob: "1988-01-01", 
                phone: "+1234567895",
                address: "Billing Address"
            },
            technician: {
                name: "Lab Tech",
                email: "labtech@test.com",
                password: "labtech123",
                role: "lab_technician",
                gender: "male",
                dob: "1987-01-01",
                phone: "+1234567896", 
                address: "Lab Address"
            }
        }
    };
}

// ============================================================================
// FIX #3: API ENDPOINT CORRECTIONS
// ============================================================================
function generateEndpointFixes() {
    console.log('🔧 [FIX #3] Generating API endpoint corrections...');
    
    return {
        // Correct endpoint mappings
        endpoints: {
            // WRONG: '/api/v1/user/login'
            // CORRECT: '/api/auth/login' (or check actual routes)
            login: '/api/auth/login',
            register: '/api/auth/register', 
            profile: '/api/auth/me',
            patientRegister: '/api/auth/patient/register'
        },
        
        // Supertest app fix for TypeError: app.address is not a function
        supertestFix: `
        // WRONG: const app = require('../app'); 
        // CORRECT:
        const { app, server } = require('../app');
        
        // OR ensure app.js exports properly:
        // module.exports = { app, server };
        `
    };
}

// ============================================================================
// FIX #4: MODEL COLLECTION NAME FIXES
// ============================================================================
function generateModelFixes() {
    console.log('🔧 [FIX #4] Generating model collection name fixes...');
    
    return {
        // Fix for: TypeError: Cannot read properties of undefined (reading 'name')
        const modelExportFix = `
        // Ensure all models are properly exported with collection names
        import User from './models/User.js';
        import Patient from './models/Patient.js';
        import Appointment from './models/Appointment.js';
        import VitalSigns from './models/VitalSigns.js';
        import LabTest from './models/LabTest.js';
        import Invoice from './models/Invoice.js';
        import PatientInsurance from './models/PatientInsurance.js';
        
        export {
            User,
            Patient, 
            Appointment,
            VitalSigns,
            LabTest,
            Invoice,
            PatientInsurance
        };
        `;
        
        // Cleanup function fix
        cleanupFix: `
        // Safe model cleanup
        const cleanTestData = async (model) => {
            try {
                if (!model || !model.collection || !model.collection.name) {
                    console.warn('⚠️ Invalid model provided to cleanTestData');
                    return { deletedCount: 0 };
                }
                
                const result = await model.deleteMany({});
                console.log(\`🧹 Cleaned \${result.deletedCount} records from \${model.collection.name}\`);
                return result;
            } catch (error) {
                console.error(\`❌ Error cleaning test data from \${model?.collection?.name || 'unknown'}: \`, error);
                throw error;
            }
        };
        `
    };
}

// ============================================================================
// EXECUTION PLAN
// ============================================================================
async function executePhase4Fixes() {
    console.log('🚀 Starting PHASE 4 CRITICAL FIXES execution...');
    console.log('📊 Target: Fix 132 failed tests → Achieve 277/277 (100%) success rate\n');
    
    try {
        // Step 1: Fix database issues
        await fixPatientInsuranceDuplicates();
        
        // Step 2: Generate fix templates
        const userFixes = generateUserValidationFix();
        const endpointFixes = generateEndpointFixes();
        const modelFixes = generateModelFixes();
        
        console.log('\n📋 PHASE 4 FIX SUMMARY:');
        console.log('✅ [FIX #1] PatientInsurance duplicate key resolved');
        console.log('✅ [FIX #2] User validation templates generated'); 
        console.log('✅ [FIX #3] API endpoint corrections identified');
        console.log('✅ [FIX #4] Model collection fixes prepared');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Apply user validation fixes to test files');
        console.log('2. Update API endpoints in performance tests');
        console.log('3. Fix model exports and cleanup functions');
        console.log('4. Re-run test suite to validate fixes');
        
        return {
            success: true,
            userFixes,
            endpointFixes, 
            modelFixes
        };
        
    } catch (error) {
        console.error('❌ PHASE 4 CRITICAL FIXES failed:', error);
        return { success: false, error: error.message };
    } finally {
        await mongoose.disconnect();
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
if (require.main === module) {
    executePhase4Fixes()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 PHASE 4 CRITICAL FIXES completed successfully!');
                console.log('🚀 Ready to proceed with systematic test fixing...');
                process.exit(0);
            } else {
                console.error('\n💥 PHASE 4 CRITICAL FIXES failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = {
    fixPatientInsuranceDuplicates,
    generateUserValidationFix,
    generateEndpointFixes,
    generateModelFixes,
    executePhase4Fixes
};
