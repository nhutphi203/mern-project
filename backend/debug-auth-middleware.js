// debug-auth-middleware.js - Debug authentication middleware
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from './models/userScheme.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { isAuthenticated } from './middlewares/auth.js';
import passport from './config/passport.config.js';

dotenv.config({ path: './config/config.env' });

async function testAuthMiddleware() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔐 [Auth Debug] Connected to MongoDB');

        // Create Express app for testing
        const app = express();
        app.use(express.json());
        app.use(passport.initialize());

        // Create test user
        const testUser = {
            firstName: 'Test',
            lastName: 'Doctor',
            email: `auth.debug.${Date.now()}@test.com`,
            phone: '1234567890',
            nic: '123456789012',
            dob: new Date('1990-01-01'),
            gender: 'Male',
            password: 'testpassword123',
            role: 'Doctor',
            doctorDepartment: 'Internal Medicine',
            qualification: 'MBBS, MD',
            isTestData: true
        };

        const user = await User.create(testUser);
        console.log('🔐 [Auth Debug] Test user created:', {
            id: user._id,
            role: user.role
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );
        console.log('🔐 [Auth Debug] Token generated for middleware test');

        // Test route
        app.get('/test-auth', isAuthenticated, (req, res) => {
            console.log('✅ [Auth Debug] Middleware passed, user:', {
                id: req.user._id,
                role: req.user.role,
                email: req.user.email
            });
            res.json({ success: true, user: req.user });
        });

        // Test the middleware with a mock request
        const testRequest = {
            headers: {
                authorization: `Bearer ${token}`
            },
            originalUrl: '/api/v1/test-auth',
            method: 'GET'
        };

        const testResponse = {
            status: (code) => ({
                json: (data) => {
                    console.log(`🔐 [Auth Debug] Response status ${code}:`, data);
                    return testResponse;
                }
            }),
            json: (data) => {
                console.log('🔐 [Auth Debug] Response data:', data);
                return testResponse;
            }
        };

        const testNext = (error) => {
            if (error) {
                console.error('❌ [Auth Debug] Middleware error:', error);
            } else {
                console.log('✅ [Auth Debug] Middleware next() called successfully');
            }
        };

        console.log('\n🔐 [Auth Debug] Testing authentication middleware...');
        await isAuthenticated(testRequest, testResponse, testNext);

        // Clean up
        await User.findByIdAndDelete(user._id);
        console.log('✅ [Auth Debug] Test user cleaned up');

    } catch (error) {
        console.error('❌ [Auth Debug] Critical error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔐 [Auth Debug] Disconnected from MongoDB');
    }
}

testAuthMiddleware();
