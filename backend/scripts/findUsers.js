// Find admin/billing users
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/userScheme.js';

config({ path: './config/config.env' });

async function findAdminUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔍 Finding users...');

        const users = await User.find({ role: { $in: ['Admin', 'BillingStaff'] } })
            .select('firstName lastName email role')
            .limit(5);

        console.log('👥 Available admin/billing users:');
        users.forEach(user => {
            console.log(`  📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
        });

        // Also find any users for testing
        const allUsers = await User.find()
            .select('firstName lastName email role')
            .limit(3);

        console.log('\n👤 Sample users:');
        allUsers.forEach(user => {
            console.log(`  📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findAdminUsers();
