#!/usr/bin/env node

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

async function recreateLabTech() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing lab tech user
        console.log('\n🗑️ Deleting existing lab tech user...');
        await User.deleteOne({ email: 'lab.test@hospital.com' });
        console.log('✅ Deleted existing user');

        // Create new lab tech user
        console.log('\n👷 Creating new lab tech user...');
        const newLabTech = new User({
            firstName: 'Lab',
            lastName: 'Technician',
            email: 'lab.test@hospital.com',
            phone: '1234567894',
            nic: '123456789123',
            role: 'Technician',
            gender: 'Male',
            dob: new Date('1992-07-20'),
            password: 'LabTech123!', // Match test script expectations
            isVerified: true,
            isActive: true,
            authType: 'traditional'
        });

        await newLabTech.save();
        console.log('✅ Created new Lab Technician user');

        // Test login immediately
        console.log('\n🧪 Testing login...');
        const testUser = await User.findOne({ email: 'lab.test@hospital.com' }).select('+password');
        console.log('User details:', {
            email: testUser.email,
            role: testUser.role,
            verified: testUser.isVerified,
            hasPassword: !!testUser.password
        });

        // Test password comparison
        const passwordMatch = await testUser.comparePassword('LabTech123!');
        console.log('Password test:', passwordMatch);

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

recreateLabTech();
