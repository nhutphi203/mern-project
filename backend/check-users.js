/**
 * Check existing users in database
 */
import dotenv from 'dotenv';
import { User } from './models/userScheme.js';
import { dbConnection } from './database/dbConnection.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Wait for DB connection
await dbConnection();

try {
    const users = await User.find({}, 'firstName lastName email role');
    console.log('📋 Existing users in database:');
    if (users.length === 0) {
        console.log('  No users found in database');
    } else {
        users.forEach(user => {
            console.log(`  ${user._id}: ${user.role} - ${user.firstName} ${user.lastName} (${user.email})`);
        });
        
        // Find first doctor and patient for test tokens
        const doctor = users.find(u => u.role === 'Doctor');
        const patient = users.find(u => u.role === 'Patient');
        
        if (doctor && patient) {
            console.log('\n🎯 Recommended test users:');
            console.log(`Doctor ID: ${doctor._id}`);
            console.log(`Patient ID: ${patient._id}`);
        }
    }
    process.exit(0);
} catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
}
