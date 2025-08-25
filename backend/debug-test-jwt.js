// debug-test-jwt.js - Debug JWT in test environment
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load env vars like in tests
dotenv.config({ path: './config/config.env' });

console.log('🔐 [Test Debug] ENV loaded:');
console.log('🔐 [Test Debug] JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);
console.log('🔐 [Test Debug] JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY);
console.log('🔐 [Test Debug] NODE_ENV:', process.env.NODE_ENV);

// Test JWT like in tests
const testPayload = {
    id: '507f1f77bcf86cd799439011',
    role: 'Doctor'
};

try {
    const token = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    console.log('✅ [Test Debug] Token generated:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('✅ [Test Debug] Token verified:', decoded);
} catch (error) {
    console.error('❌ [Test Debug] JWT error:', error.message);
}

// Test passport config loading
try {
    console.log('\n🔐 [Test Debug] Testing passport config...');
    
    // Import passport config (this should load dotenv internally)
    const passportConfig = await import('./config/passport.config.js');
    console.log('✅ [Test Debug] Passport config loaded successfully');
} catch (error) {
    console.error('❌ [Test Debug] Passport config error:', error.message);
}
