import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
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

async function fixPasswords() {
    await connectDB();

    console.log('🔧 Fixing passwords directly...\n');

    const userUpdates = [
        { email: 'admin@hospital.com', password: 'password123', role: 'Admin' },
        { email: 'doctor@hospital.com', password: 'password123', role: 'Doctor' },
        { email: 'nurse@hospital.com', password: 'password123', role: 'Receptionist' },
        { email: 'patient@hospital.com', password: 'password123', role: 'Patient' },
        { email: 'phinhut2003@gmail.com', password: '11111111', role: 'Patient' }
    ];

    for (const update of userUpdates) {
        console.log(`🔒 Fixing: ${update.email}`);

        // Hash password manually
        const hashedPassword = await bcrypt.hash(update.password, 10);

        // Update with hashed password directly
        const result = await User.updateOne(
            { email: update.email },
            {
                $set: {
                    password: hashedPassword,
                    role: update.role,
                    authType: 'traditional',
                    isVerified: true
                }
            },
            { upsert: false }
        );

        if (result.matchedCount > 0) {
            console.log(`   ✅ Updated password for ${update.email}`);
        } else {
            console.log(`   ❌ User not found: ${update.email}`);
        }
    }

    process.exit(0);
}

fixPasswords().catch(error => {
    console.error('❌ Password fix failed:', error.message);
    process.exit(1);
});
