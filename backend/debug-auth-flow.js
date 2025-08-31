// debug-auth-flow.js - Debug complete auth flow like in tests
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

async function debugCompleteAuthFlow() {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create test user exactly like in tests
        const hashedPassword = await bcrypt.hash('testpassword123', 12);
        const userData = {
            firstName: 'TestDoctor',
            lastName: 'Debug',
            email: `debug.doctor.${Date.now()}@test.com`,
            password: hashedPassword,
            phone: '1234567890',
            nic: '123456789012',
            dob: new Date('1990-01-01'),
            gender: 'Male',
            role: 'Doctor',
            doctorDepartment: 'Internal Medicine',
            qualification: 'MBBS, MD',
            isVerified: true,
            authType: 'traditional',
            isTestData: true
        };

        console.log('\n🔐 [Auth Debug] Creating user...');
        const user = await User.create(userData);
        console.log('✅ [Auth Debug] User created:', {
            id: user._id,
            role: user.role,
            email: user.email
        });

        // 2. Generate token exactly like in tests
        console.log('\n🔐 [Auth Debug] Generating token...');
        console.log('🔐 [Auth Debug] JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
        
        const tokenPayload = { id: user._id, role: user.role };
        console.log('🔐 [Auth Debug] Token payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );
        console.log('✅ [Auth Debug] Token generated:', token);

        // 3. Verify token
        console.log('\n🔐 [Auth Debug] Verifying token...');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('✅ [Auth Debug] Token verified:', decoded);
        } catch (verifyError) {
            console.error('❌ [Auth Debug] Token verification failed:', verifyError.message);
            console.error('Full error:', verifyError);
        }

        // 4. Test user lookup
        console.log('\n🔐 [Auth Debug] Testing user lookup...');
        const foundUser = await User.findById(tokenPayload.id);
        if (foundUser) {
            console.log('✅ [Auth Debug] User found by ID:', {
                id: foundUser._id,
                role: foundUser.role,
                email: foundUser.email
            });
        } else {
            console.error('❌ [Auth Debug] User not found by ID:', tokenPayload.id);
        }

        // 5. Test different payload formats
        console.log('\n🔐 [Auth Debug] Testing different payload formats...');
        const testPayloads = [
            { id: user._id, role: user.role },
            { id: user._id.toString(), role: user.role },
            { _id: user._id, role: user.role }
        ];

        for (let i = 0; i < testPayloads.length; i++) {
            const testPayload = testPayloads[i];
            console.log(`\nTesting payload ${i + 1}:`, testPayload);
            
            try {
                const testToken = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                const testDecoded = jwt.verify(testToken, process.env.JWT_SECRET_KEY);
                console.log(`✅ Payload ${i + 1} works - decoded:`, testDecoded);
                
                // Test user lookup with this payload
                const lookupUserId = testDecoded.id || testDecoded._id;
                const lookupUser = await User.findById(lookupUserId);
                if (lookupUser) {
                    console.log(`✅ User lookup ${i + 1} successful`);
                } else {
                    console.error(`❌ User lookup ${i + 1} failed for ID:`, lookupUserId);
                }
            } catch (testError) {
                console.error(`❌ Payload ${i + 1} failed:`, testError.message);
            }
        }

        // Clean up
        await User.findByIdAndDelete(user._id);
        console.log('\n✅ [Auth Debug] Test user cleaned up');

    } catch (error) {
        console.error('❌ [Auth Debug] Critical error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ [Auth Debug] Disconnected from MongoDB');
    }
}

debugCompleteAuthFlow();
