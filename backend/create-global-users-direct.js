// ===================================================================
// PHASE 4.2 DIRECT GLOBAL USERS CREATION & VERIFICATION
// Standalone global test users creation without Jest dependency
// ===================================================================

// 🔧 CRITICAL FIX: Load environment variables FIRST!
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './models/userScheme.js';

async function createAndVerifyGlobalUsers() {
    try {
        console.log('\n🎯 PHASE 4.2 DIRECT GLOBAL TEST USERS CREATION');
        console.log('='.repeat(60));

        // Connect to test database
        const dbUri = process.env.DB_URI_TEST || process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB';
        if (!mongoose.connection.readyState) {
            await mongoose.connect(dbUri);
            console.log(`✅ Connected to database: ${dbUri}`);
        }

        // Clear existing test users
        await User.deleteMany({ email: { $regex: /@test\.com$/ } });
        console.log('🧹 Cleared existing test users');

        const testUserData = {
            Admin: {
                firstName: 'Test',
                lastName: 'Admin',
                email: 'admin@test.com',
                password: 'testpassword123',
                role: 'Admin',
                phone: '1234567890',
                gender: 'Male',
                dob: new Date('1980-01-01'),
                authType: 'traditional',
                isVerified: true,
                isGlobalTestUser: true
            },
            Doctor: {
                firstName: 'Dr. Test',
                lastName: 'Physician',
                email: 'doctor@test.com',
                password: 'testpassword123',
                role: 'Doctor',
                phone: '1234567891',
                gender: 'Female',
                dob: new Date('1975-01-01'),
                authType: 'traditional',
                specialization: 'General Medicine',
                doctorDepartment: 'Medicine',
                licenseNumber: 'LIC123456789',
                isVerified: true,
                isGlobalTestUser: true
            },
            Patient: {
                firstName: 'Test',
                lastName: 'Patient',
                email: 'patient@test.com',
                password: 'testpassword123',
                role: 'Patient',
                phone: '1234567892',
                gender: 'Male',
                dob: new Date('1990-01-01'),
                authType: 'traditional',
                nic: '123456789012',
                isVerified: true,
                isGlobalTestUser: true
            },
            Receptionist: {
                firstName: 'Test',
                lastName: 'Receptionist',
                email: 'receptionist@test.com',
                password: 'testpassword123',
                role: 'Receptionist',
                phone: '1234567893',
                gender: 'Female',
                dob: new Date('1985-01-01'),
                authType: 'traditional',
                isVerified: true,
                isGlobalTestUser: true
            },
            Nurse: {
                firstName: 'Test',
                lastName: 'Nurse',
                email: 'nurse@test.com',
                password: 'testpassword123',
                role: 'Nurse',
                phone: '1234567894',
                gender: 'Female',
                dob: new Date('1988-01-01'),
                authType: 'traditional',
                isVerified: true,
                isGlobalTestUser: true
            },
            BillingStaff: {
                firstName: 'Test',
                lastName: 'Billing',
                email: 'billing@test.com',
                password: 'testpassword123',
                role: 'BillingStaff',
                phone: '1234567895',
                gender: 'Male',
                dob: new Date('1986-01-01'),
                authType: 'traditional',
                isVerified: true,
                isGlobalTestUser: true
            },
            LabTechnician: {
                firstName: 'Test',
                lastName: 'LabTech',
                email: 'labtech@test.com',
                password: 'testpassword123',
                role: 'LabTechnician',
                phone: '1234567896',
                gender: 'Male',
                dob: new Date('1987-01-01'),
                authType: 'traditional',
                isVerified: true,
                isGlobalTestUser: true
            }
        };

        const createdUsers = {};
        const generatedTokens = {};

        // Create all test users
        for (const [role, userData] of Object.entries(testUserData)) {
            try {
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                
                const user = await User.create({
                    ...userData,
                    password: hashedPassword
                });

                // Generate JWT token with proper payload structure
                const token = jwt.sign(
                    { 
                        id: user._id,
                        role: user.role,
                        authType: user.authType,
                        isVerified: user.isVerified
                    },
                    process.env.JWT_SECRET_KEY || 'test-secret-key',
                    { expiresIn: process.env.JWT_EXPIRES || '7d' }
                );

                createdUsers[role] = user;
                generatedTokens[role] = token;

                console.log(`✅ Created global test user: ${role} (${userData.email})`);
            } catch (userError) {
                console.error(`❌ Failed to create ${role} user:`, userError.message);
            }
        }

        console.log(`\n🎯 Global test users created: ${Object.keys(createdUsers).length}/7`);

        // Verify users in database
        const testUsersInDb = await User.find({ isGlobalTestUser: true });
        console.log(`📈 Database verification: ${testUsersInDb.length} test users found`);

        if (testUsersInDb.length > 0) {
            console.log('\n👥 Verified Test Users:');
            testUsersInDb.forEach(user => {
                console.log(`  ✅ ${user.role}: ${user.email} (ID: ${user._id})`);
            });
        }

        // Test JWT tokens
        console.log('\n🔐 JWT Token Validation:');
        Object.entries(generatedTokens).forEach(([role, token]) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'test-secret-key');
                console.log(`  ✅ ${role}: Valid token (ID: ${decoded.id}, Role: ${decoded.role})`);
            } catch (error) {
                console.log(`  ❌ ${role}: Invalid token - ${error.message}`);
            }
        });

        // Final status
        console.log('\n🎯 PHASE 4.2 COMPLETION STATUS:');
        console.log('='.repeat(60));
        console.log(`✅ Users Created: ${Object.keys(createdUsers).length}/7`);
        console.log(`✅ Tokens Generated: ${Object.keys(generatedTokens).length}/7`);
        console.log(`✅ Database Verified: ${testUsersInDb.length}/7`);
        
        const successRate = testUsersInDb.length === 7 && Object.keys(generatedTokens).length === 7 ? 100 : 
                           (testUsersInDb.length / 7) * 100;
        console.log(`🎯 Infrastructure Success Rate: ${successRate.toFixed(0)}%`);

        if (successRate === 100) {
            console.log('\n🚀 PHASE 4.2 COMPLETE - Global test infrastructure ready!');
            console.log('📊 Ready for comprehensive E2E testing with 277 total tests');
            
            // Provide next steps
            console.log('\n📋 NEXT STEPS FOR ULTIMATE TEST SUCCESS:');
            console.log('  1. ✅ Global test users infrastructure: COMPLETE');
            console.log('  2. 🔄 Run comprehensive test suite to measure progress');
            console.log('  3. 🎯 Target: Achieve 95%+ success rate (269+ tests passing)');
            console.log('  4. 🚀 Fix remaining edge cases for 100% success (277/277)');
        } else {
            console.log('\n⚠️  PHASE 4.2 INCOMPLETE - Infrastructure needs fixes');
        }

        return {
            usersCreated: Object.keys(createdUsers).length,
            tokensGenerated: Object.keys(generatedTokens).length,
            databaseVerified: testUsersInDb.length,
            successRate
        };

    } catch (error) {
        console.error('❌ Error in global users creation:', error);
        return null;
    } finally {
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
            console.log('\n🔒 Database connection closed');
        }
    }
}

// Run the creation and verification
createAndVerifyGlobalUsers();
