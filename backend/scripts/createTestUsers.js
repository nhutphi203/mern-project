// Create Test Users Script  
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/userScheme.js';

config({ path: './config/config.env' });

const connectDatabase = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.MONGO_URI;
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔗 Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

const createTestUsers = async () => {
    try {
        console.log('👥 Creating Test Users for Authentication...\n');

        const testUsers = [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@hospital.com',
                password: 'password123',
                role: 'Admin',
                phone: '0123456789',
                nic: '123456789012',
                dob: new Date('1985-01-15'),
                gender: 'Male',
                isVerified: true,
                authType: 'traditional'
            },
            {
                firstName: 'Doctor',
                lastName: 'Smith',
                email: 'doctor@hospital.com',
                password: 'password123',
                role: 'Doctor',
                phone: '0123456790',
                nic: '123456789013',
                dob: new Date('1980-03-20'),
                gender: 'Male',
                isVerified: true,
                authType: 'traditional'
            },
            {
                firstName: 'Receptionist',
                lastName: 'Johnson',
                email: 'nurse@hospital.com',
                password: 'password123',
                role: 'Receptionist', // Changed from Nurse to Receptionist
                phone: '0123456791',
                nic: '123456789014',
                dob: new Date('1990-07-10'),
                gender: 'Female',
                isVerified: true,
                authType: 'traditional'
            },
            {
                firstName: 'Patient',
                lastName: 'Test',
                email: 'patient@hospital.com',
                password: 'password123',
                role: 'Patient',
                phone: '0123456792',
                nic: '123456789015',
                dob: new Date('1995-12-05'),
                gender: 'Other',
                isVerified: true,
                authType: 'traditional'
            }
        ];

        for (const userData of testUsers) {
            console.log(`Creating user: ${userData.email} (${userData.role})`);

            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`   ⚠️  User exists, updating password and role...`);

                // Update existing user with password hashing
                existingUser.password = userData.password;
                existingUser.role = userData.role;
                existingUser.isVerified = true;
                existingUser.authType = 'traditional';

                // Force password to be marked as modified to trigger hashing
                existingUser.markModified('password');
                await existingUser.save();

                console.log(`   ✅ Updated: ${existingUser.email} → ${existingUser.role}`);
            } else {
                // Create new user
                const newUser = await User.create(userData);
                console.log(`   ✅ Created: ${newUser.email} → ${newUser.role}`);
            }
        }

        console.log('\n🎯 Test Users Ready:');
        console.log('📧 admin@hospital.com / password123 → Admin');
        console.log('📧 doctor@hospital.com / password123 → Doctor');
        console.log('📧 nurse@hospital.com / password123 → Receptionist');
        console.log('📧 patient@hospital.com / password123 → Patient');
        console.log('📧 phinhut2003@gmail.com / 11111111 → Patient');

        console.log('\n🧪 Test Commands:');
        console.log('node scripts/testRealAuth.js - Test all authentication');
        console.log('node scripts/testLogin.js - Test single login');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    }
};

const main = async () => {
    await connectDatabase();
    await createTestUsers();
    await mongoose.connection.close();
    console.log('\n✅ Test users setup completed!');
};

main();
