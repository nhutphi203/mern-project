#!/usr/bin/env node

/**
 * Setup Insurance Staff User
 * Tạo user Insurance Staff để test Insurance System
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import User model
import { User } from './models/userScheme.js';

async function setupInsuranceStaff() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Insurance Staff user already exists
        const existingUser = await User.findOne({
            email: 'insurance@mediflow.com'
        });

        if (existingUser) {
            console.log('👤 Insurance Staff user already exists');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Role: ${existingUser.role}`);
            console.log(`   Status: ${existingUser.isActive ? 'Active' : 'Inactive'}`);
            return existingUser;
        }

        // Create new Insurance Staff user
        console.log('👤 Creating Insurance Staff user...');

        const hashedPassword = await bcrypt.hash('Insurance123!', 12);

        const insuranceStaff = new User({
            firstName: 'Insurance',
            lastName: 'Staff',
            email: 'insurance@mediflow.com',
            phone: '1234567890',
            password: hashedPassword,
            role: 'BillingStaff', // Use existing role instead of 'Insurance Staff'
            gender: 'Male',
            dob: new Date('1990-01-01'),
            isActive: true,
            authType: 'traditional',
            avatar: 'https://via.placeholder.com/150'
        });

        await insuranceStaff.save();
        console.log('✅ Insurance Staff user created successfully');
        console.log(`   Email: ${insuranceStaff.email}`);
        console.log(`   Role: ${insuranceStaff.role}`);
        console.log(`   Password: Insurance123!`);

        return insuranceStaff;

    } catch (error) {
        console.error('❌ Error setting up Insurance Staff:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run setup
setupInsuranceStaff()
    .then(() => {
        console.log('\n🎉 Insurance Staff setup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    });
