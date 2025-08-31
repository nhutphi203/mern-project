// Token verification test
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GLOBAL_TEST_TOKENS } from './test/globalTestData.js';

// Load environment variables
dotenv.config();

console.log('🔐 [Token Verification] Starting token verification...');
console.log('🔐 [Token Verification] JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);
console.log('🔐 [Token Verification] JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY);

// Test each token
Object.entries(GLOBAL_TEST_TOKENS).forEach(([role, token]) => {
    try {
        console.log(`\n🔐 [Token Verification] Testing ${role} token...`);
        console.log(`🔐 [Token Verification] Token: ${token.substring(0, 50)}...`);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(`✅ [Token Verification] ${role} token is VALID:`, decoded);
    } catch (error) {
        console.log(`❌ [Token Verification] ${role} token is INVALID:`, error.message);
    }
});
