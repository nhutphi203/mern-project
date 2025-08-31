import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/userScheme.js';

dotenv.config({ path: './config/config.env' });

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function debugUsers() {
    await connectDB();

    console.log('🔍 Debugging User Data...\n');

    const testEmails = [
        'admin@hospital.com',
        'doctor@hospital.com',
        'nurse@hospital.com',
        'patient@hospital.com',
        'phinhut2003@gmail.com'
    ];

    for (const email of testEmails) {
        console.log(`\n📧 ${email}:`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('   ❌ User not found');
            continue;
        }

        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   📛 Name: ${user.firstName} ${user.lastName}`);
        console.log(`   🔒 Password: ${user.password ? 'Set' : 'Missing'}`);
        console.log(`   🔒 Password Length: ${user.password ? user.password.length : 0}`);
        console.log(`   🔒 Is Hashed: ${user.password && user.password.startsWith('$2b$') ? 'Yes' : 'No'}`);
    }

    process.exit(0);
}

debugUsers().catch(error => {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
});
