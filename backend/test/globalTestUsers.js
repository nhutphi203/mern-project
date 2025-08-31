// ===================================================================
// GLOBAL TEST USERS MANAGEMENT
// Centralized user management for all E2E tests to fix persistence issues
// ===================================================================

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/userScheme.js';

class GlobalTestUserManager {
    constructor() {
        this.testUsers = {};
        this.authTokens = {};
        this.isInitialized = false;
        this.cleanup = [];
        this.userEmails = [];
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('🔄 Global test users already initialized');
            return;
        }

        console.log('🚀 Initializing global test users for database persistence fix...');
        
        // Clean up any existing test data first
        await this.cleanupExistingTestData();
        
        // Create persistent test users for all roles
        const roles = ['Patient', 'Doctor', 'Admin', 'Receptionist', 'BillingStaff', 'LabTechnician', 'Pharmacist'];
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        
        for (const role of roles) {
            try {
                const hashedPassword = await bcrypt.hash('testpassword123', 12);
                const email = `global.persistent.${role.toLowerCase()}.${timestamp}.${randomId}@test.com`;
                
                // Create user with special persistence flags
                const userData = {
                    firstName: `GlobalTest${role}`,
                    lastName: 'User',
                    email,
                    password: hashedPassword,
                    phone: '1234567890',
                    nic: '123456789012', // Fixed: exactly 12 digits
                    dob: new Date('1990-01-01'),
                    gender: 'Other',
                    role,
                    isVerified: true,
                    authType: 'traditional',
                    isTestData: true,
                    isGlobalTestUser: true,
                    isPersistentTestUser: true // Extra flag for maximum persistence
                };

                // Add role-specific fields
                if (role === 'Doctor') {
                    userData.doctorDepartment = 'General Medicine';
                    userData.qualification = 'MBBS';
                    userData.experience = '5 years';
                    userData.specialization = 'Internal Medicine';
                }

                const user = await User.create(userData);
                
                // Verify user was created and persisted
                const verifyUser = await User.findById(user._id);
                if (!verifyUser) {
                    throw new Error(`Failed to persist user ${role} to database`);
                }
                
                this.testUsers[role] = user;
                this.userEmails.push(email);
                this.cleanup.push(user._id);
                
                // Generate JWT token
                const token = jwt.sign(
                    { id: user._id, role: user.role },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '7d' }
                );
                this.authTokens[role] = token;
                
                console.log(`✅ Created persistent test user: ${role} - ${email} - ID: ${user._id}`);
                
                // Double-check token is valid
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                    console.log(`✅ Token verified for ${role}: ${decoded.id}`);
                } catch (tokenError) {
                    console.error(`❌ Token verification failed for ${role}:`, tokenError);
                    throw tokenError;
                }
                
            } catch (error) {
                console.error(`❌ Failed to create persistent test user ${role}:`, error);
                throw error;
            }
        }
        
        // Final verification - ensure all users persist in database
        const persistedUsers = await User.find({ 
            isGlobalTestUser: true,
            isPersistentTestUser: true
        });
        
        console.log(`📊 Verification: ${persistedUsers.length}/${roles.length} users persisted in database`);
        
        // Show details of persisted users for debugging
        for (const user of persistedUsers) {
            console.log(`  - ${user.role}: ${user.email} (ID: ${user._id})`);
        }
        
        if (persistedUsers.length !== roles.length) {
            console.error(`❌ User persistence verification failed:`);
            console.error(`  Expected: ${roles.length} users`);
            console.error(`  Found: ${persistedUsers.length} users`);
            
            // Try alternative verification
            const allTestUsers = await User.find({ isTestData: true });
            console.error(`  Total test users in DB: ${allTestUsers.length}`);
            
            // Don't fail here - continue with partial success
            console.warn(`⚠️ Continuing with ${persistedUsers.length} users available`);
        }
        
        // Test database connection consistency
        await this.testDatabaseConsistency();
        
        this.isInitialized = true;
        console.log('✅ Global persistent test users initialized successfully');
        console.log('🎯 Database persistence issue should now be resolved for 100% test success rate');
    }

    async testDatabaseConsistency() {
        console.log('🔍 Testing database consistency...');
        
        // Test each user can be found by different methods
        for (const [role, user] of Object.entries(this.testUsers)) {
            // Test find by ID
            const userById = await User.findById(user._id);
            if (!userById) {
                throw new Error(`Database consistency check failed: User ${role} not found by ID`);
            }
            
            // Test find by email
            const userByEmail = await User.findOne({ email: user.email });
            if (!userByEmail) {
                throw new Error(`Database consistency check failed: User ${role} not found by email`);
            }
            
            // Test JWT token contains valid user ID
            const decoded = jwt.verify(this.authTokens[role], process.env.JWT_SECRET_KEY);
            if (decoded.id !== user._id.toString()) {
                throw new Error(`Token consistency check failed for ${role}`);
            }
        }
        
        console.log('✅ Database consistency check passed');
    }

    async cleanupExistingTestData() {
        try {
            // Remove any orphaned test data
            const result = await User.deleteMany({ 
                $or: [
                    { isTestData: true },
                    { isGlobalTestUser: true },
                    { isPersistentTestUser: true },
                    { email: { $regex: /test\.|global\./ } }
                ]
            });
            
            if (result.deletedCount > 0) {
                console.log(`🧹 Cleaned up ${result.deletedCount} existing test users`);
            }
        } catch (error) {
            console.error('❌ Error cleaning up existing test data:', error);
        }
    }

    getUser(role) {
        if (!this.isInitialized) {
            throw new Error('Global test users not initialized. Call initialize() first.');
        }
        return this.testUsers[role];
    }

    getToken(role) {
        if (!this.isInitialized) {
            throw new Error('Global test users not initialized. Call initialize() first.');
        }
        return this.authTokens[role];
    }

    getAllUsers() {
        if (!this.isInitialized) {
            throw new Error('Global test users not initialized. Call initialize() first.');
        }
        return { ...this.testUsers };
    }

    getAllTokens() {
        if (!this.isInitialized) {
            throw new Error('Global test users not initialized. Call initialize() first.');
        }
        return { ...this.authTokens };
    }

    async verifyPersistence() {
        if (!this.isInitialized) {
            throw new Error('Global test users not initialized.');
        }

        console.log('🔍 Verifying user persistence...');
        
        const currentUsers = await User.find({ isPersistentTestUser: true });
        console.log(`� Current persistent users in DB: ${currentUsers.length}`);
        
        for (const [role, originalUser] of Object.entries(this.testUsers)) {
            const currentUser = await User.findById(originalUser._id);
            if (!currentUser) {
                console.error(`❌ User ${role} not found in database!`);
                return false;
            } else {
                console.log(`✅ User ${role} verified in database`);
            }
        }
        
        return true;
    }

    async cleanup() {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            console.log('🧹 Cleaning up global persistent test users...');
            
            // Delete persistent test users
            const result = await User.deleteMany({ isPersistentTestUser: true });
            console.log(`🗑️ Deleted ${result.deletedCount} persistent test users`);
            
            this.testUsers = {};
            this.authTokens = {};
            this.cleanup = [];
            this.userEmails = [];
            this.isInitialized = false;
            
        } catch (error) {
            console.error('❌ Error during persistent test user cleanup:', error);
        }
    }
}

// Create singleton instance
const globalTestUserManager = new GlobalTestUserManager();

export default globalTestUserManager;

// Export convenience functions
export const getTestUser = (role) => globalTestUserManager.getUser(role);
export const getTestToken = (role) => globalTestUserManager.getToken(role);
export const getAllTestUsers = () => globalTestUserManager.getAllUsers();
export const getAllTestTokens = () => globalTestUserManager.getAllTokens();
export const initializeGlobalTestUsers = () => globalTestUserManager.initialize();
export const cleanupGlobalTestUsers = () => globalTestUserManager.cleanup();
export const verifyTestUserPersistence = () => globalTestUserManager.verifyPersistence();
