#!/usr/bin/env node

/**
 * Clean test users and recreate them
 */

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function cleanTestUsers() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all test users
        const testEmails = [
            'admin.test@hospital.com',
            'doctor.test@hospital.com',
            'patient.test@hospital.com',
            'receptionist.test@hospital.com',
            'lab.test@hospital.com',
            'billing.test@hospital.com',
            'labsupervisor.test@hospital.com',
            'pharmacist.test@hospital.com'
        ];

        console.log('\n🗑️ Deleting existing test users...');
        const deleteResult = await User.deleteMany({ email: { $in: testEmails } });
        console.log(`✅ Deleted ${deleteResult.deletedCount} test users`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

cleanTestUsers();
