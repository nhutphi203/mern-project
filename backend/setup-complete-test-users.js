#!/usr/bin/env node

/**
 * Setup Complete Test Users for All Roles
 * Tạo test users cho tất cả các vai trò trong hệ thống
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import User model
import { User } from './models/userScheme.js';

// Define all test users for different roles
const testUsers = [
    {
        firstName: 'Admin',
        lastName: 'Test',
        email: 'admin.test@hospital.com',
        phone: '1234567890',
        role: 'Admin',
        gender: 'Male',
        dob: new Date('1985-01-01'),
        password: 'Admin123!',
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Doctor',
        lastName: 'Test',
        email: 'doctor.test@hospital.com',
        phone: '1234567891',
        role: 'Doctor',
        gender: 'Female',
        dob: new Date('1980-05-15'),
        password: 'Doctor123!',
        isActive: true,
        authType: 'traditional',
        doctorDepartment: 'Cardiology'
    },
    {
        firstName: 'Patient',
        lastName: 'Test',
        email: 'patient.test@hospital.com',
        phone: '1234567892',
        nic: '123456789012', // Required for Patient role
        role: 'Patient',
        gender: 'Male',
        dob: new Date('1990-12-25'),
        password: 'Patient123!',
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Receptionist',
        lastName: 'Test',
        email: 'receptionist.test@hospital.com',
        phone: '1234567893',
        role: 'Receptionist',
        gender: 'Female',
        dob: new Date('1988-03-10'),
        password: 'Reception123!',
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Lab',
        lastName: 'Technician',
        email: 'lab.test@hospital.com',
        phone: '1234567894',
        role: 'Technician',
        gender: 'Male',
        dob: new Date('1992-07-20'),
        password: 'LabTech123!', // Updated to meet 8+ character requirement
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Billing',
        lastName: 'Staff',
        email: 'billing.test@hospital.com',
        phone: '1234567895',
        role: 'BillingStaff',
        gender: 'Female',
        dob: new Date('1987-11-05'),
        password: 'Billing123!',
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Lab',
        lastName: 'Supervisor',
        email: 'labsupervisor.test@hospital.com',
        phone: '1234567896',
        role: 'LabSupervisor',
        gender: 'Male',
        dob: new Date('1983-09-12'),
        password: 'LabSup123!',
        isActive: true,
        authType: 'traditional'
    },
    {
        firstName: 'Pharmacist',
        lastName: 'Test',
        email: 'pharmacist.test@hospital.com',
        phone: '1234567897',
        role: 'Pharmacist',
        gender: 'Female',
        dob: new Date('1986-04-30'),
        password: 'Pharma123!',
        isActive: true,
        authType: 'traditional'
    }
];

async function setupAllTestUsers() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n👥 Setting up test users for all roles...');
        
        for (const userData of testUsers) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ email: userData.email });
                
                if (existingUser) {
                    console.log(`⚠️  ${userData.role} user already exists: ${userData.email}`);
                    continue;
                }

                // Hash password
                // NOTE: Let mongoose handle password hashing via pre-save middleware
                // const hashedPassword = await bcrypt.hash(userData.password, 12);
                
                // Create user
                const newUser = new User({
                    ...userData,
                    // password: hashedPassword,  // Use plain password, let mongoose hash it
                    isVerified: true  // Make sure test users are verified
                });

                await newUser.save();
                console.log(`✅ Created ${userData.role}: ${userData.email} | Password: ${userData.password}`);
                
            } catch (error) {
                console.log(`❌ Failed to create ${userData.role}: ${error.message}`);
            }
        }

        console.log('\n📋 Test Users Summary:');
        console.log('==========================================');
        
        for (const user of testUsers) {
            const exists = await User.findOne({ email: user.email });
            const status = exists ? '✅ Ready' : '❌ Failed';
            console.log(`${status} ${user.role.padEnd(15)} | ${user.email.padEnd(30)} | ${user.password}`);
        }

        console.log('\n🔐 Role-Based Access Testing Guide:');
        console.log('==========================================');
        console.log('1. 👨‍💼 Admin        - Full system access, user management');
        console.log('2. 👩‍⚕️ Doctor       - Medical records, prescriptions, diagnosis');
        console.log('3. 👤 Patient       - Own medical records, appointments');
        console.log('4. 👩‍💻 Receptionist - Appointments, patient check-in');
        console.log('5. 🔬 Lab Tech      - Lab orders, results entry');
        console.log('6. 💳 Billing Staff - Invoices, insurance claims');
        console.log('7. 🔬 Lab Supervisor- Lab oversight, reports');
        console.log('8. 💊 Pharmacist    - Prescriptions, medication management');

        console.log('\n🧪 Testing Scenarios by Role:');
        console.log('==========================================');
        console.log('📝 Medical Records:');
        console.log('   - Doctor: Create, view, edit medical records');
        console.log('   - Patient: View own records only');
        console.log('   - Admin: Full access to all records');
        console.log('   - Others: Limited/No access');
        
        console.log('\n🔬 Lab System:');
        console.log('   - Doctor: Order lab tests');
        console.log('   - Lab Tech: Enter results, manage queue');
        console.log('   - Lab Supervisor: Oversight, reports');
        console.log('   - Patient: View own results');
        
        console.log('\n💳 Billing & Insurance:');
        console.log('   - Billing Staff: Create invoices, process claims');
        console.log('   - Admin: Full billing access');
        console.log('   - Patient: View own invoices');
        console.log('   - Doctor: Limited billing view');

    } catch (error) {
        console.error('❌ Error setting up test users:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run setup
setupAllTestUsers()
    .then(() => {
        console.log('\n🎉 All test users setup completed!');
        console.log('💡 Use these credentials to test role-based access control');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    });
