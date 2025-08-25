// Quick database inspection
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

async function inspectDatabase() {
    try {
        const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB';
        await mongoose.connect(dbUri);
        console.log('Connected to database');

        const allUsers = await User.find({});
        console.log(`Total users in database: ${allUsers.length}`);

        const testUsers = await User.find({ email: { $regex: /@test\.com$/ } });
        console.log(`Users with @test.com emails: ${testUsers.length}`);

        if (testUsers.length > 0) {
            console.log('\nTest users found:');
            testUsers.forEach(user => {
                console.log(`  ${user.role}: ${user.email} (isGlobalTestUser: ${user.isGlobalTestUser})`);
            });
        }

        const globalUsers = await User.find({ isGlobalTestUser: true });
        console.log(`\nUsers with isGlobalTestUser=true: ${globalUsers.length}`);

        if (globalUsers.length > 0) {
            globalUsers.forEach(user => {
                console.log(`  ${user.role}: ${user.email}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

inspectDatabase();
