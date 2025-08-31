// Debug Test Environment Variables
require('dotenv').config();
const app = require('./app');

console.log('🔍 =========================== TEST ENV DEBUG ===========================');
console.log('📍 Process ENV Check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);
console.log('  - JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY);
console.log('  - JWT_SECRET_KEY length:', process.env.JWT_SECRET_KEY?.length);
console.log('  - JWT_SECRET_KEY type:', typeof process.env.JWT_SECRET_KEY);

// Test app initialization
console.log('📍 App initialization:');
try {
    console.log('  - Express app loaded:', !!app);
    console.log('  - Passport configured:', !!require('./config/passport.config'));
} catch (error) {
    console.error('  - App loading error:', error.message);
}

// Test dotenv in different ways
console.log('📍 Dotenv loading tests:');
console.log('  - Direct require check:', !!require('dotenv'));

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('  - .env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('  - .env contains JWT_SECRET_KEY:', envContent.includes('JWT_SECRET_KEY'));
}

// Test JWT directly
console.log('📍 JWT Testing:');
try {
    const jwt = require('jsonwebtoken');
    const testPayload = { id: 'test123', role: 'Doctor' };
    
    console.log('  - JWT library loaded:', !!jwt);
    
    // Test token generation
    const token = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    console.log('  - Token generation: SUCCESS');
    console.log('  - Token length:', token.length);
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('  - Token verification: SUCCESS');
    console.log('  - Decoded payload:', decoded.id, decoded.role);
    
} catch (error) {
    console.error('  - JWT error:', error.message);
}

console.log('🔍 ========================= END TEST ENV DEBUG =========================');
