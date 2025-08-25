#!/usr/bin/env node

/**
 * Create missing Lab Technician user
 */

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function createLabTech() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing if any
        await User.deleteOne({ email: 'lab.test@hospital.com' });
        
        // Create Lab Technician user
        const labTechUser = new User({
            firstName: 'Lab',
            lastName: 'Technician',
            email: 'lab.test@hospital.com',
            phone: '1234567894',
            role: 'Technician',
            gender: 'Male',
            dob: new Date('1992-07-20'),
            password: 'LabTech123!',
            isActive: true,
            isVerified: true,
            authType: 'traditional'
        });

        await labTechUser.save();
        console.log('✅ Created Lab Technician: lab.test@hospital.com | Password: LabTech123!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

createLabTech();
