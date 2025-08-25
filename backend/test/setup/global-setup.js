// ===================================================================
// 🚀 ULTIMATE TEST FIX STRATEGY - Global Test Setup
// Phase 1: Foundation Fix - Complete Test Environment Setup  
// ===================================================================

const mongoose = require('mongoose');
const { User } = require('../../models/userScheme.js');
const { Appointment } = require('../../models/appointmentSchema.js');
const { MedicalRecord } = require('../../models/medicalRecordSchema.js');
const { EnhancedMedicalRecord } = require('../../models/enhancedMedicalRecord.model.js');
const { Prescription } = require('../../models/prescriptionSchema.js');
const { Billing } = require('../../models/billing/invoice.model.js');
const { Diagnosis } = require('../../models/diagnosis.model.js');
const { ICD10 } = require('../../models/icd10.model.js');
const { LabResult } = require('../../models/labResult.model.js');
const { LabOrder } = require('../../models/labOrder.model.js');
const { GLOBAL_TEST_USERS } = require('../globalTestData.js');

class GlobalTestSetup {
    static async setupTestEnvironment() {
        console.log('🚀 ULTIMATE TEST FIX STRATEGY - Phase 1: Foundation Setup');
        console.log('=========================================================');
        
        // 1. Clear all test data before each test suite
        await this.clearAllTestData();
        
        // 2. Seed consistent test data
        await this.seedTestData();
        
        // 3. Reset auto-increment counters
        await this.resetCounters();
        
        // 4. Verify database state
        await this.verifyDatabaseState();
        
        // 5. Setup authentication system
        await this.setupAuthenticationSystem();
        
        console.log('✅ FOUNDATION SETUP COMPLETE - Ready for 100% test success!');
    }

    static async setupAuthenticationSystem() {
        console.log('🔐 Setting up authentication system...');
        
        const { GLOBAL_TEST_USERS, GLOBAL_TEST_TOKENS } = require('../globalTestData');
        
        // Verify all tokens are valid
        for (const [role, token] of Object.entries(GLOBAL_TEST_TOKENS)) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'vgvgvjvkjvjfuukfkhghkj');
                console.log(`✅ ${role} token valid: ${decoded.email}`);
            } catch (error) {
                console.error(`❌ ${role} token invalid:`, error.message);
                throw new Error(`Authentication setup failed for ${role}`);
            }
        }
        
        // Make auth data globally available
        global.TEST_AUTH = {
            users: GLOBAL_TEST_USERS,
            tokens: GLOBAL_TEST_TOKENS,
            getUser: (role) => GLOBAL_TEST_USERS[role],
            getToken: (role) => GLOBAL_TEST_TOKENS[role],
            getAuthHeader: (role) => ({ 'Authorization': `Bearer ${GLOBAL_TEST_TOKENS[role]}` })
        };
        
        console.log('✅ Authentication system ready');
    }

    static async clearAllTestData() {
        console.log('🧹 CRITICAL: Clearing ALL test data for fresh state...');
        
        const collections = [
            'users', 'patients', 'appointments', 'medicalrecords',
            'vitalsigns', 'billings', 'laborders', 'labresults',
            'patientinsurances', 'encounters', 'prescriptions',
            'invoices', 'payments', 'notifications'
        ];
        
        for (const collection of collections) {
            try {
                // Clear test data but preserve global test users
                const result = await mongoose.connection.db.collection(collection).deleteMany({
                    $and: [
                        {
                            $or: [
                                { isTestData: true },
                                { email: { $regex: /@test\.com$/ } },
                                { email: { $regex: /\.ttgs8acq@test\.com$/ } }
                            ]
                        },
                        // Keep global test users (they have specific IDs)
                        { 
                            _id: { 
                                $nin: [
                                    '68aaf2cd230ee29e1bd82660', // Patient
                                    '68aaf2cd230ee29e1bd82663', // Doctor  
                                    '68aaf2cd230ee29e1bd82666', // Admin
                                    '68aaf2cd230ee29e1bd82669', // Receptionist
                                    '68aaf2cd230ee29e1bd8266c', // BillingStaff
                                    '68aaf2cd230ee29e1bd8266f', // LabTechnician
                                    '68aaf2ce230ee29e1bd82672'  // Pharmacist
                                ].map(id => new mongoose.Types.ObjectId(id))
                            }
                        }
                    ]
                });
                
                if (result.deletedCount > 0) {
                    console.log(`   🗑️ Cleared ${result.deletedCount} records from ${collection}`);
                }
            } catch (error) {
                console.log(`⚠️ Collection ${collection} cleanup warning:`, error.message);
            }
        }
        
        console.log('✅ Test data cleanup complete - Global test users preserved');
    }

    static async seedTestData() {
        console.log('🌱 Seeding CONSISTENT test data for 100% success...');
        
        // Import models dynamically
        const { User } = require('../../models/userScheme');
        const { GLOBAL_TEST_USERS, GLOBAL_TEST_TOKENS } = require('../globalTestData');
        
        // Verify test users exist in database
        let usersVerified = 0;
        for (const [role, userData] of Object.entries(GLOBAL_TEST_USERS)) {
            const userExists = await User.findById(userData._id);
            if (!userExists) {
                console.log(`⚠️ Test user ${role} missing, recreating...`);
                
                // Create user with exact data from globalTestData
                await User.create({
                    _id: userData._id,
                    ...userData,
                    password: 'testpassword123', // Set consistent password
                    isTestData: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`   ✅ Recreated ${role} user`);
            } else {
                console.log(`   ✅ ${role} user verified`);
            }
            usersVerified++;
        }
        
        console.log(`✅ ${usersVerified}/7 global test users ready`);
        
        // Seed additional test data if needed
        await this.seedSampleData();
    }

    static async seedSampleData() {
        console.log('📋 Seeding sample test data...');
        
        // This will create minimal sample data needed for tests
        // without interfering with the main test logic
        
        try {
            const { Appointment } = require('../../models/appointmentSchema');
            const { GLOBAL_TEST_USERS } = require('../globalTestData');
            
            // Create one sample appointment for workflow tests
            const sampleAppointment = await Appointment.findOne({ isTestData: true });
            if (!sampleAppointment) {
                await Appointment.create({
                    firstName: GLOBAL_TEST_USERS.Patient.firstName,
                    lastName: GLOBAL_TEST_USERS.Patient.lastName,
                    email: GLOBAL_TEST_USERS.Patient.email,
                    nic: GLOBAL_TEST_USERS.Patient.nic,
                    dob: '1990-01-01',
                    gender: 'Male',
                    appointment_date: '2025-08-25',
                    department: 'General Medicine',
                    doctor_firstName: GLOBAL_TEST_USERS.Doctor.firstName,
                    doctor_lastName: GLOBAL_TEST_USERS.Doctor.lastName,
                    hasVisited: false,
                    address: '123 Test Street',
                    status: 'Scheduled',
                    isTestData: true
                });
                console.log('   ✅ Sample appointment created');
            }
        } catch (error) {
            console.log('⚠️ Sample data seeding warning:', error.message);
        }
    }

    static async resetCounters() {
        console.log('🔄 Resetting auto-increment counters...');
        
        // Reset MongoDB sequences and counters to prevent ID conflicts
        try {
            // Clear any existing sequence collections
            const sequenceCollections = ['counters', 'sequences'];
            for (const seqCollection of sequenceCollections) {
                try {
                    await mongoose.connection.db.collection(seqCollection).deleteMany({});
                } catch (error) {
                    // Collection might not exist, which is fine
                }
            }
            
            // Reset any application-specific counters
            global.testCounters = {
                appointmentCounter: 1000,
                invoiceCounter: 1000,
                claimCounter: 1000
            };
            
            console.log('✅ Counters reset successfully');
        } catch (error) {
            console.log('⚠️ Counter reset warning:', error.message);
        }
    }

    static async verifyDatabaseState() {
        console.log('🔍 CRITICAL: Verifying database state...');
        
        const { User } = require('../../models/userScheme');
        const { GLOBAL_TEST_USERS } = require('../globalTestData');
        
        // Verify all test users exist
        const userCount = await User.countDocuments({ 
            _id: { $in: Object.values(GLOBAL_TEST_USERS).map(u => u._id) }
        });
        
        console.log(`✅ Found ${userCount}/7 global test users in database`);
        
        if (userCount < 7) {
            throw new Error('❌ CRITICAL: Test users not properly created - aborting test run');
        }
        
        // Verify database connection is stable
        const dbState = mongoose.connection.readyState;
        if (dbState !== 1) {
            throw new Error('❌ CRITICAL: Database connection unstable - aborting test run');
        }
        
        console.log('✅ Database state verification PASSED');
    }

    static async teardownTestEnvironment() {
        console.log('🧹 Tearing down test environment...');
        await this.clearAllTestData();
    }
}

module.exports = { GlobalTestSetup };
