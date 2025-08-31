#!/usr/bin/env node

/**
 * Debug login issues
 */

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB';

async function debugLogin() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if test users exist
        const testEmail = 'admin.test@hospital.com';
        const testPassword = 'Admin123!';
        
        console.log(`\n🔍 Looking for user: ${testEmail}`);
        const user = await User.findOne({ email: testEmail }).select('+password');
        
        if (!user) {
            console.log('❌ User not found in database');
            return;
        }

        console.log('✅ User found in database:');
        console.log('   Role:', user.role);
        console.log('   Email:', user.email);
        console.log('   Verified:', user.isVerified);
        console.log('   Auth Type:', user.authType);
        console.log('   Has Password:', !!user.password);

        // Test password comparison
        if (user.password) {
            // Get user with password field
            const userWithPassword = await User.findOne({ email: testEmail }).select('+password');
            console.log('\n🔐 Testing password comparison...');
            
            try {
                const isMatch = await userWithPassword.comparePassword(testPassword);
                console.log('   Password test result:', isMatch);
                
                // Also test bcrypt directly
                const directMatch = await bcrypt.compare(testPassword, userWithPassword.password);
                console.log('   Direct bcrypt test:', directMatch);
            } catch (err) {
                console.log('   Password comparison error:', err.message);
            }
        }

        // Check all test users
        console.log('\n📋 All test users status:');
        const testUsers = [
            'admin.test@hospital.com',
            'doctor.test@hospital.com',
            'patient.test@hospital.com',
            'receptionist.test@hospital.com',
            'lab.test@hospital.com',
            'billing.test@hospital.com'
        ];

        for (const email of testUsers) {
            const testUser = await User.findOne({ email });
            if (testUser) {
                console.log(`   ✅ ${email} - Role: ${testUser.role}, Verified: ${testUser.isVerified}`);
            } else {
                console.log(`   ❌ ${email} - Not found`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

debugLogin();
