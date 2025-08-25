#!/usr/bin/env node

// ===================================================================
// COMPREHENSIVE DATABASE PERSISTENCE FIX 
// Direct approach to fix database persistence for 100% E2E test success
// ===================================================================

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from './models/userScheme.js';

console.log('🚀 COMPREHENSIVE DATABASE PERSISTENCE FIX');
console.log('===========================================');
console.log('Target: 100% E2E Test Success Rate (148/148 tests passing)\n');

async function comprehensiveDatabaseFix() {
    let connection = null;
    
    try {
        // Step 1: Database Connection
        console.log('📡 Step 1: Establishing database connection...');
        const testDbUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test');
        
        connection = await mongoose.connect(testDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Database connected successfully');
        console.log(`   Database: ${connection.connections[0].name}`);
        console.log(`   Host: ${connection.connections[0].host}:${connection.connections[0].port}\n`);

        // Step 2: Clean Previous Test Data
        console.log('🧹 Step 2: Cleaning previous test data...');
        const deletedUsers = await User.deleteMany({
            $or: [
                { isTestData: true },
                { isGlobalTestUser: true },
                { isPersistentTestUser: true },
                { email: { $regex: /test\.|global\.|persistent\./ } }
            ]
        });
        console.log(`   Removed ${deletedUsers.deletedCount} existing test users`);

        // Step 3: Create Persistent Test Users
        console.log('\n👥 Step 3: Creating persistent test users for all roles...');
        const roles = ['Patient', 'Doctor', 'Admin', 'Receptionist', 'BillingStaff', 'LabTechnician', 'Pharmacist'];
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 8);
        
        const createdUsers = {};
        const authTokens = {};

        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];
            
            try {
                const hashedPassword = await bcrypt.hash('testpassword123', 12);
                const email = `persistent.${role.toLowerCase()}.${timestamp}.${randomSuffix}@test.com`;
                
                const userData = {
                    firstName: `Test${role}`,
                    lastName: 'PersistentUser',
                    email,
                    password: hashedPassword,
                    phone: '1234567890',
                    nic: '123456789012',
                    dob: new Date('1990-01-01'),
                    gender: 'Other',
                    role,
                    isVerified: true,
                    authType: 'traditional',
                    isTestData: true,
                    isGlobalTestUser: true,
                    isPersistentTestUser: true
                };

                // Add role-specific fields for doctor
                if (role === 'Doctor') {
                    userData.doctorDepartment = 'General Medicine';
                    userData.qualification = 'MBBS';
                    userData.experience = '5 years';
                    userData.specialization = 'Internal Medicine';
                }

                // Create user with explicit database session
                const user = new User(userData);
                await user.save();
                
                // Verify user was saved
                const savedUser = await User.findById(user._id);
                if (!savedUser) {
                    throw new Error(`User ${role} was not persisted to database`);
                }

                createdUsers[role] = savedUser;
                
                // Generate JWT token
                const token = jwt.sign(
                    { id: savedUser._id, role: savedUser.role },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '7d' }
                );
                authTokens[role] = token;
                
                console.log(`   ✅ ${role}: ${email} (ID: ${savedUser._id})`);
                
            } catch (error) {
                console.error(`   ❌ Failed to create ${role}: ${error.message}`);
                throw error;
            }
        }

        // Step 4: Database Verification
        console.log('\n🔍 Step 4: Verifying database persistence...');
        
        const verificationQueries = [
            { filter: { isPersistentTestUser: true }, name: 'Persistent test users' },
            { filter: { isGlobalTestUser: true }, name: 'Global test users' },
            { filter: { isTestData: true }, name: 'All test users' },
        ];

        for (const query of verificationQueries) {
            const count = await User.countDocuments(query.filter);
            console.log(`   ${query.name}: ${count}`);
        }

        // Step 5: Token Verification
        console.log('\n🔐 Step 5: Verifying authentication tokens...');
        
        for (const [role, token] of Object.entries(authTokens)) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findById(decoded.id);
                
                if (!user) {
                    throw new Error(`Token points to non-existent user`);
                }
                
                if (user.role !== role) {
                    throw new Error(`Token role mismatch: expected ${role}, got ${user.role}`);
                }
                
                console.log(`   ✅ ${role}: Token valid, user exists`);
                
            } catch (error) {
                console.error(`   ❌ ${role}: Token verification failed - ${error.message}`);
                throw error;
            }
        }

        // Step 6: Export Global Variables
        console.log('\n📤 Step 6: Preparing global test data...');
        
        // Create the global test data file
        const globalDataContent = `
// AUTO-GENERATED GLOBAL TEST DATA
// Generated: ${new Date().toISOString()}
// Purpose: Persistent test users for 100% E2E test success

export const GLOBAL_TEST_USERS = ${JSON.stringify(createdUsers, null, 2)};

export const GLOBAL_TEST_TOKENS = ${JSON.stringify(authTokens, null, 2)};

export const getTestUser = (role) => GLOBAL_TEST_USERS[role];
export const getTestToken = (role) => GLOBAL_TEST_TOKENS[role];

console.log('✅ Global test data loaded - ${Object.keys(createdUsers).length} users available');
`;

        // Save to a file that can be imported by tests
        const fs = await import('fs');
        fs.writeFileSync('./test/globalTestData.js', globalDataContent);
        console.log('   ✅ Global test data exported to test/globalTestData.js');

        // Step 7: Final Summary
        console.log('\n📊 PERSISTENCE FIX SUMMARY');
        console.log('==========================');
        console.log(`✅ Created: ${Object.keys(createdUsers).length} persistent test users`);
        console.log(`✅ Generated: ${Object.keys(authTokens).length} authentication tokens`);
        console.log('✅ Database persistence: VERIFIED');
        console.log('✅ Token authentication: VERIFIED');
        console.log('✅ Global test data: EXPORTED');
        
        console.log('\n🎯 EXPECTED IMPROVEMENT:');
        console.log('   Before: 127/148 tests passing (85.8%)');
        console.log('   Target: 148/148 tests passing (100%)');
        console.log('   Fix: Database persistence for authentication');
        
        console.log('\n🔄 Next Steps:');
        console.log('   1. Run: npm run test:e2e');
        console.log('   2. Verify: 100% test success rate');
        console.log('   3. Confirm: All authentication failures resolved');

    } catch (error) {
        console.error('\n❌ PERSISTENCE FIX FAILED');
        console.error('========================');
        console.error(`Error: ${error.message}`);
        if (error.stack) {
            console.error(`Stack: ${error.stack}`);
        }
        process.exit(1);
        
    } finally {
        if (connection) {
            await mongoose.disconnect();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Execute the comprehensive fix
comprehensiveDatabaseFix().then(() => {
    console.log('\n🎉 PERSISTENCE FIX COMPLETED SUCCESSFULLY!');
    console.log('Database persistence issue should now be resolved.');
    console.log('Ready for 100% E2E test success rate.');
    process.exit(0);
}).catch((error) => {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    process.exit(1);
});
