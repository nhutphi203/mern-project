// Comprehensive authentication flow test
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import { User } from './models/userScheme.js';
import { GLOBAL_TEST_TOKENS, GLOBAL_TEST_USERS } from './test/globalTestData.js';

// Load environment and passport config
dotenv.config({ path: './config/config.env' });
import './config/passport.config.js';

console.log('🔐 [Auth Flow Test] Starting comprehensive authentication test...');

async function testAuthFlow() {
    try {
        // Connect to test database
        const testDbUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test');
        await mongoose.connect(testDbUri);
        console.log('✅ Connected to test database');

        // Test each role
        for (const [role, token] of Object.entries(GLOBAL_TEST_TOKENS)) {
            console.log(`\n🔍 [Auth Flow] Testing ${role} authentication...`);
            
            // 1. Verify token manually
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                console.log(`✅ Manual JWT verification successful:`, decoded);
                
                // 2. Check if user exists in database
                const user = await User.findById(decoded.id);
                if (user) {
                    console.log(`✅ User found in database:`, { 
                        id: user._id, 
                        role: user.role, 
                        email: user.email,
                        isVerified: user.isVerified 
                    });
                } else {
                    console.log(`❌ User not found in database for ID: ${decoded.id}`);
                    continue;
                }
                
                // 3. Test passport JWT strategy manually
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    cookies: {}
                };
                
                // Simulate passport authentication
                console.log(`🔍 [Auth Flow] Testing passport authentication for ${role}...`);
                
                // This simulates what passport does internally
                const jwtStrategy = passport._strategies.jwt;
                if (jwtStrategy) {
                    console.log(`✅ JWT Strategy found in passport`);
                    
                    // Call the strategy manually to see what happens
                    jwtStrategy.authenticate(mockReq, {});
                } else {
                    console.log(`❌ JWT Strategy not found in passport`);
                }
                
            } catch (error) {
                console.log(`❌ JWT verification failed for ${role}:`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error in auth flow test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from database');
    }
}

testAuthFlow();
