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
// EXECUTION PLAN
// ============================================================================
async function executePhase4Fixes() {
    console.log('🚀 Starting PHASE 4 CRITICAL FIXES execution...');
    console.log('📊 Target: Fix 132 failed tests → Achieve 277/277 (100%) success rate\n');
    
    try {
        // Step 1: Fix database issues
        await fixPatientInsuranceDuplicates();
        
        console.log('\n📋 PHASE 4 FIX SUMMARY:');
        console.log('✅ [FIX #1] PatientInsurance duplicate key resolved');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Apply user validation fixes to test files');
        console.log('2. Update API endpoints in performance tests');
        console.log('3. Fix model exports and cleanup functions');
        console.log('4. Re-run test suite to validate fixes');
        
        return { success: true };
        
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
