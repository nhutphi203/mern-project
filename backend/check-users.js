/**
 * Check existing users in database
 */
import { User } from './models/userScheme.js';
import { dbConnection } from './database/dbConnection.js';

// Wait for DB connection
await dbConnection();

try {
    const users = await User.find({}, 'firstName lastName email role');
    console.log('📋 Existing users in database:');
    if (users.length === 0) {
        console.log('  No users found in database');
    } else {
        users.forEach(user => {
            console.log(`  ${user.role}: ${user.firstName} ${user.lastName} (${user.email})`);
        });
    }
    process.exit(0);
} catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
}
