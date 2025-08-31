// Debug Authentication Script
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/userScheme.js';
import jwt from 'jsonwebtoken';

config({ path: './config/config.env' });

const connectDatabase = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.MONGO_URI;
        console.log('🔗 Connecting to database:', dbUri);

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

const debugAuthentication = async () => {
    try {
        console.log('🔍 Debugging Authentication Issue...\n');

        // 1. Find user by email
        const email = 'phinhut2003@gmail.com';
        console.log(`📧 Looking for user with email: ${email}`);

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found in database');

            // Check all users with similar emails
            const similarUsers = await User.find({
                email: { $regex: 'phinhut', $options: 'i' }
            }).select('email role firstName lastName');

            console.log('\n📋 Users with similar emails:');
            similarUsers.forEach(u => {
                console.log(`  - ${u.email} | Role: ${u.role} | Name: ${u.firstName} ${u.lastName}`);
            });

            return;
        }

        console.log('✅ User found:');
        console.log({
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            authType: user.authType,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });

        // 2. Test password comparison
        console.log('\n🔐 Testing password...');
        const testPassword = '11111111';

        if (!user.password) {
            console.log('❌ User has no password set!');
            console.log('This user might have been created via social login or incomplete registration.');

            // Let's set a password for this user
            console.log('\n🔧 Setting password for user...');
            user.password = testPassword;
            await user.save();
            console.log('✅ Password set successfully');

            // Reload user to test
            const updatedUser = await User.findOne({ email }).select('+password');
            const isPasswordCorrect = await updatedUser.comparePassword(testPassword);
            console.log(`Password "${testPassword}" is now ${isPasswordCorrect ? 'CORRECT' : 'INCORRECT'}`);
        } else {
            const isPasswordCorrect = await user.comparePassword(testPassword);
            console.log(`Password "${testPassword}" is ${isPasswordCorrect ? 'CORRECT' : 'INCORRECT'}`);
        }

        // 3. Generate JWT token
        console.log('\n🎫 Generating JWT token...');
        const token = user.generateJsonWebToken();
        console.log('Token generated:', token.substring(0, 50) + '...');

        // 4. Decode JWT token to verify payload
        console.log('\n🔍 Decoding JWT token...');
        const decoded = jwt.decode(token);
        console.log('JWT Payload:', {
            id: decoded.id,
            role: decoded.role,
            authType: decoded.authType,
            isVerified: decoded.isVerified,
            exp: new Date(decoded.exp * 1000).toISOString()
        });

        // 5. Check all admin users
        console.log('\n👑 All Admin users:');
        const adminUsers = await User.find({ role: 'Admin' })
            .select('email firstName lastName');

        adminUsers.forEach(admin => {
            console.log(`  - ${admin.email} | ${admin.firstName} ${admin.lastName}`);
        });

        // 6. Check all Patient users
        console.log('\n👤 All Patient users:');
        const patientUsers = await User.find({ role: 'Patient' })
            .select('email firstName lastName')
            .limit(10);

        patientUsers.forEach(patient => {
            console.log(`  - ${patient.email} | ${patient.firstName} ${patient.lastName}`);
        });

        // 7. Check if there's role mismatch
        if (user.role !== 'Patient') {
            console.log(`\n⚠️  ROLE MISMATCH DETECTED!`);
            console.log(`Expected: Patient`);
            console.log(`Actual: ${user.role}`);
            console.log('This explains why you see admin interface!');
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    }
};

const main = async () => {
    await connectDatabase();
    await debugAuthentication();
    await mongoose.connection.close();
    console.log('\n🔚 Debug completed.');
};

main();
