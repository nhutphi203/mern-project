#!/usr/bin/env node

/**
 * Test direct password creation and comparison
 */

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function testPasswordFlow() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test password hashing and comparison
        const testPassword = 'TestPass123!';
        console.log(`\n🔐 Testing password: ${testPassword}`);
        
        // Hash password manually
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        console.log('✅ Password hashed manually');
        
        // Test direct bcrypt comparison
        const directMatch = await bcrypt.compare(testPassword, hashedPassword);
        console.log('   Direct bcrypt test:', directMatch);
        
        // Create test user
        console.log('\n👤 Creating test user...');
        
        // Delete existing test user if any
        await User.deleteOne({ email: 'test.direct@hospital.com' });
        
        const testUser = new User({
            firstName: 'Test',
            lastName: 'Direct',
            email: 'test.direct@hospital.com',
            phone: '1234567890',
            nic: '123456789012',
            role: 'Patient',
            gender: 'Male',
            dob: new Date('1990-01-01'),
            password: testPassword, // Let mongoose hash it
            isVerified: true,
            isActive: true,
            authType: 'traditional'
        });
        
        await testUser.save();
        console.log('✅ User created with mongoose (auto-hashing)');
        
        // Fetch user and test comparison
        const savedUser = await User.findOne({ email: 'test.direct@hospital.com' }).select('+password');
        console.log('✅ User fetched from database');
        
        // Test comparePassword method
        const methodMatch = await savedUser.comparePassword(testPassword);
        console.log('   comparePassword method:', methodMatch);
        
        // Test with wrong password
        const wrongMatch = await savedUser.comparePassword('wrongpass');
        console.log('   Wrong password test:', wrongMatch);
        
        // Cleanup
        await User.deleteOne({ email: 'test.direct@hospital.com' });
        console.log('✅ Test user cleaned up');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testPasswordFlow();
