import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUsers() {
    try {
        console.log('🚀 Creating test users directly in MongoDB...');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing test users
        await User.deleteMany({ 
            $or: [
                { email: 'test.doctor@hospital.com' },
                { email: 'test.patient@email.com' },
                { email: 'test.admin@hospital.com' },
                { isTestData: true }
            ]
        });
        console.log('🧹 Cleaned up existing test users');

        // Test Doctor
        const testDoctor = await User.create({
            firstName: 'Test',
            lastName: 'Doctor',
            email: 'test.doctor@hospital.com',
            password: 'testpassword123',
            role: 'Doctor',
            specialization: 'Internal Medicine',
            licenseNumber: 'MD123456',
            phone: '1234567890',
            gender: 'Male',
            dob: new Date('1980-01-01'),
            nic: '800101234567',
            isTestData: true
        });
        console.log('✅ Test Doctor created:', testDoctor.email);

        // Test Patient
        const testPatient = await User.create({
            firstName: 'Test',
            lastName: 'Patient',
            email: 'test.patient@email.com',
            password: 'testpassword123',
            role: 'Patient',
            phone: '0987654321',
            gender: 'Female',
            dob: new Date('1990-01-01'),
            nic: '900101234567',
            isTestData: true
        });
        console.log('✅ Test Patient created:', testPatient.email);

        // Test Admin
        const testAdmin = await User.create({
            firstName: 'Test',
            lastName: 'Admin',
            email: 'test.admin@hospital.com',
            password: 'testpassword123',
            role: 'Admin',
            phone: '1234567891',
            gender: 'Male',
            dob: new Date('1975-01-01'),
            nic: '750101234567',
            isTestData: true
        });
        console.log('✅ Test Admin created:', testAdmin.email);

        console.log('🎯 All test users created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

createTestUsers();
