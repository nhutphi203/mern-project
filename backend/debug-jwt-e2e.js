// debug-jwt-e2e.js - Debug JWT token issues in E2E tests
import jwt from 'jsonwebtoken';
import { User } from './models/userScheme.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

async function debugJWTIssues() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔐 [JWT Debug] Connected to MongoDB');

        // 1. Test JWT_SECRET_KEY
        console.log('🔐 [JWT Debug] JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);
        console.log('🔐 [JWT Debug] JWT_SECRET_KEY length:', process.env.JWT_SECRET_KEY?.length);
        console.log('🔐 [JWT Debug] JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY);

        // 2. Create test user
        const testUser = {
            firstName: 'Test',
            lastName: 'Doctor',
            email: `debug.doctor.${Date.now()}@test.com`,
            phone: '1234567890',
            nic: '123456789012', // 🔧 FIX: Exactly 12 digits
            dob: new Date('1990-01-01'),
            gender: 'Male',
            password: 'testpassword123',
            role: 'Doctor',
            doctorDepartment: 'Internal Medicine',
            qualification: 'MBBS, MD',
            isTestData: true
        };

        console.log('🔐 [JWT Debug] Creating test user...');
        const user = await User.create(testUser);
        console.log('🔐 [JWT Debug] Test user created:', {
            id: user._id,
            role: user.role,
            email: user.email
        });

        // 3. Generate token exactly like in tests
        const payload = { id: user._id, role: user.role };
        console.log('🔐 [JWT Debug] Token payload:', payload);
        
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );
        console.log('🔐 [JWT Debug] Token generated:', token);

        // 4. Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('✅ [JWT Debug] Token verified successfully:', decoded);
        } catch (verifyError) {
            console.error('❌ [JWT Debug] Token verification failed:', verifyError.message);
            console.error('❌ [JWT Debug] Error details:', verifyError);
        }

        // 5. Test with different payload structures
        const testPayloads = [
            { id: user._id, role: user.role },
            { id: user._id.toString(), role: user.role },
            { _id: user._id, role: user.role },
            { userId: user._id, role: user.role }
        ];

        for (let i = 0; i < testPayloads.length; i++) {
            const testPayload = testPayloads[i];
            console.log(`\n🔐 [JWT Debug] Testing payload ${i + 1}:`, testPayload);
            
            try {
                const testToken = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                const testDecoded = jwt.verify(testToken, process.env.JWT_SECRET_KEY);
                console.log(`✅ [JWT Debug] Payload ${i + 1} works:`, testDecoded);
            } catch (testError) {
                console.error(`❌ [JWT Debug] Payload ${i + 1} failed:`, testError.message);
            }
        }

        // 6. Test user lookup
        console.log('\n🔐 [JWT Debug] Testing user lookup...');
        const foundUser = await User.findById(user._id);
        if (foundUser) {
            console.log('✅ [JWT Debug] User found in database:', {
                id: foundUser._id,
                role: foundUser.role,
                email: foundUser.email
            });
        } else {
            console.error('❌ [JWT Debug] User not found in database');
        }

        // 7. Test ObjectId conversion
        console.log('\n🔐 [JWT Debug] Testing ObjectId handling...');
        console.log('🔐 [JWT Debug] user._id type:', typeof user._id);
        console.log('🔐 [JWT Debug] user._id value:', user._id);
        console.log('🔐 [JWT Debug] user._id.toString():', user._id.toString());
        
        // 8. Clean up test user
        await User.findByIdAndDelete(user._id);
        console.log('✅ [JWT Debug] Test user cleaned up');

    } catch (error) {
        console.error('❌ [JWT Debug] Critical error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔐 [JWT Debug] Disconnected from MongoDB');
    }
}

debugJWTIssues();
