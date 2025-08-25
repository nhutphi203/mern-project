// Debug JWT cho appointments test
import { config } from "dotenv";
config({ path: "./config/config.env" });

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from './models/userScheme.js';

async function debugJWT() {
    console.log('🔧 Debugging JWT for appointments...');

    // Check environment variables
    console.log('📋 Environment check:');
    console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY ? 'Present' : 'Missing');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

    // Test JWT creation
    const testPayload = { id: '507f1f77bcf86cd799439011', role: 'Patient' };

    try {
        // Test with JWT_SECRET_KEY (what we're using in test)
        const token1 = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        console.log('✅ JWT with JWT_SECRET_KEY created:', token1.substring(0, 50) + '...');

        // Try to verify it
        const decoded1 = jwt.verify(token1, process.env.JWT_SECRET_KEY);
        console.log('✅ JWT with JWT_SECRET_KEY verified:', decoded1);

        // Test if there's a JWT_SECRET too
        if (process.env.JWT_SECRET) {
            const token2 = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log('✅ JWT with JWT_SECRET created:', token2.substring(0, 50) + '...');

            const decoded2 = jwt.verify(token2, process.env.JWT_SECRET);
            console.log('✅ JWT with JWT_SECRET verified:', decoded2);
        }

    } catch (error) {
        console.error('❌ JWT error:', error.message);
    }
}

debugJWT().catch(console.error);
