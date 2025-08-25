// Debug JWT in Test Context
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import jwt from 'jsonwebtoken';

console.log('🔍 JWT Test Debug:');
console.log('  - JWT_SECRET_KEY exists:', !!process.env.JWT_SECRET_KEY);
console.log('  - JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY);
console.log('  - NODE_ENV:', process.env.NODE_ENV);

try {
    // Test payload similar to failing tests
    const testPayload = { id: '673f44b8e64e4c2c2fe82d93', role: 'Patient' };
    
    console.log('  - Test payload:', testPayload);
    
    // Generate token
    const token = jwt.sign(testPayload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    console.log('  - Token generated successfully');
    console.log('  - Token length:', token.length);
    console.log('  - Token preview:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('  - Token verified successfully');
    console.log('  - Decoded ID:', decoded.id);
    console.log('  - Decoded role:', decoded.role);
    
    // Test in supertest context
    console.log('  - Authorization header:', `Bearer ${token}`);
    
} catch (error) {
    console.error('  - JWT Error:', error.message);
    console.error('  - Error stack:', error.stack);
}
