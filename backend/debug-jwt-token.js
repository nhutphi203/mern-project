// JWT Token Debug Script
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const doctorToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE5NjE0ODhkNTAxMDI2MGRlMjU3NGYiLCJpYXQiOjE3NTU5MzA5NTIsImV4cCI6MTc1NjUzNTc1Mn0.Dr8lUxzEwMbzllzHaM3SLE34bePo2CG25uYqn0_9MJA';

console.log('🔍 JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
console.log('🔍 Token:', doctorToken);

try {
    // Decode without verification first
    const decoded = jwt.decode(doctorToken);
    console.log('\n📋 Decoded payload (without verification):', decoded);
    
    // Verify with secret
    const verified = jwt.verify(doctorToken, process.env.JWT_SECRET_KEY);
    console.log('\n✅ Verified payload:', verified);
    
} catch (error) {
    console.error('\n❌ JWT verification error:', error.message);
    
    // Try different common secret keys
    const commonSecrets = ['secret', 'jwt-secret', 'your-secret-key', 'hospital-management'];
    
    console.log('\n🔄 Trying common secret keys...');
    for (const secret of commonSecrets) {
        try {
            const verified = jwt.verify(doctorToken, secret);
            console.log(`✅ Working secret: "${secret}"`, verified);
            break;
        } catch (err) {
            console.log(`❌ Failed with: "${secret}"`);
        }
    }
}
