import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/userScheme.js';

async function resetDoctorPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB');
        console.log('✅ Connected to database');

        // Find the doctor
        const doctor = await User.findOne({ 
            email: 'test.doctor.lab@hospital.com',
            role: 'Doctor' 
        });

        if (!doctor) {
            console.log('❌ Doctor not found');
            process.exit(1);
        }

        // Reset password to 'password123'
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Use updateOne to avoid validation issues
        await User.updateOne(
            { _id: doctor._id },
            { password: hashedPassword }
        );

        console.log('✅ Password reset successfully');
        console.log(`📧 Email: ${doctor.email}`);
        console.log(`🔑 New password: ${newPassword}`);
        console.log(`👤 Doctor: ${doctor.firstName} ${doctor.lastName}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetDoctorPassword();
