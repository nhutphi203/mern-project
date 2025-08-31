// Test user verification script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/userScheme.js';
import { GLOBAL_TEST_USERS } from './test/globalTestData.js';

dotenv.config({ path: './config/config.env' });

async function verifyTestUsers() {
    try {
        console.log('🔐 [User Verification] Connecting to test database...');
        
        // Connect to test database
        const testDbUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test');
        await mongoose.connect(testDbUri);
        console.log('✅ Connected to test database');

        // Check each global test user
        for (const [role, userData] of Object.entries(GLOBAL_TEST_USERS)) {
            console.log(`\n🔍 [User Verification] Checking ${role} user...`);
            console.log(`📋 Expected ID: ${userData._id}`);
            
            // Check if user exists by ID
            const userById = await User.findById(userData._id);
            console.log(`✅ User found by ID: ${!!userById}`);
            
            // Check if user exists by email
            const userByEmail = await User.findOne({ email: userData.email });
            console.log(`✅ User found by email: ${!!userByEmail}`);
            
            if (userById) {
                console.log(`📋 Database user ID: ${userById._id}`);
                console.log(`📋 Database user role: ${userById.role}`);
                console.log(`📋 Database user email: ${userById.email}`);
                console.log(`📋 Database user isVerified: ${userById.isVerified}`);
                console.log(`📋 Database user authType: ${userById.authType}`);
            } else {
                console.log('❌ User not found in database!');
            }
        }

        // Count total users
        const totalUsers = await User.countDocuments();
        console.log(`\n📊 Total users in database: ${totalUsers}`);
        
        // List all user roles
        const allUsers = await User.find({}, 'role email isVerified');
        console.log(`📋 All users in database:`);
        allUsers.forEach(user => {
            console.log(`  - ${user.role} (${user.email}) - Verified: ${user.isVerified}`);
        });

    } catch (error) {
        console.error('❌ Error verifying test users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from database');
    }
}

verifyTestUsers();
