import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

async function checkAllUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital_management');
        console.log('✅ Connected to MongoDB');
        
        // Find all users
        const users = await User.find({}).select('firstName lastName email role doctorDepartment createdAt');
        console.log(`\n📋 Found ${users.length} Users:`);
        
        const roleStats = {};
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Department: ${user.doctorDepartment || 'Not set'}`);
            console.log(`   ID: ${user._id}`);
            console.log('---');
            
            // Count roles
            roleStats[user.role] = (roleStats[user.role] || 0) + 1;
        });
        
        console.log('\n📊 Role Statistics:');
        Object.entries(roleStats).forEach(([role, count]) => {
            console.log(`${role}: ${count}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
}

checkAllUsers();
