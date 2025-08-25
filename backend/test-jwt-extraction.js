// Test JWT extraction and verification during HTTP simulation
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ExtractJwt } from 'passport-jwt';
import { GLOBAL_TEST_TOKENS } from './test/globalTestData.js';

dotenv.config({ path: './config/config.env' });

console.log('🔐 [JWT Test] Starting JWT extraction test...');
console.log('🔐 [JWT Test] JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);

// Test each token with simulated HTTP request
Object.entries(GLOBAL_TEST_TOKENS).forEach(([role, token]) => {
    console.log(`\n🔍 [JWT Test] Testing ${role} token extraction...`);
    
    // Simulate HTTP request with Authorization header
    const mockReq = {
        headers: {
            authorization: `Bearer ${token}`
        },
        cookies: {}
    };
    
    try {
        // Test standard extraction
        const extractedToken = ExtractJwt.fromAuthHeaderAsBearerToken()(mockReq);
        console.log(`✅ Standard extraction successful: ${extractedToken ? 'Found' : 'Not found'}`);
        
        if (extractedToken) {
            // Verify the token
            const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET_KEY);
            console.log(`✅ Token verification successful:`, decoded);
            
            // Check if the extracted token matches the original
            console.log(`✅ Token match: ${extractedToken === token}`);
        }
        
    } catch (error) {
        console.log(`❌ Token verification failed:`, error.message);
    }
});

console.log('\n🔍 [JWT Test] Testing custom extractor...');

// Test the custom extractor from passport config
const customExtractor = (req) => {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    console.log('🔍 [Custom Extract] Authorization header token:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
    return token;
};

const testReq = {
    headers: {
        authorization: `Bearer ${GLOBAL_TEST_TOKENS.Doctor}`
    },
    cookies: {}
};

const customExtracted = customExtractor(testReq);
console.log(`✅ Custom extractor result: ${customExtracted ? 'Success' : 'Failed'}`);

if (customExtracted) {
    try {
        const decoded = jwt.verify(customExtracted, process.env.JWT_SECRET_KEY);
        console.log('✅ Custom extracted token verified:', decoded);
    } catch (error) {
        console.log('❌ Custom extracted token verification failed:', error.message);
    }
}
