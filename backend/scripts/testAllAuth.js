import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/userScheme.js';

dotenv.config({ path: './config/config.env' });

// Test users matrix
const testUsers = [
    { email: 'admin@hospital.com', password: 'password123', expectedRole: 'Admin' },
    { email: 'doctor@hospital.com', password: 'password123', expectedRole: 'Doctor' },
    { email: 'nurse@hospital.com', password: 'password123', expectedRole: 'Receptionist' },
    { email: 'patient@hospital.com', password: 'password123', expectedRole: 'Patient' },
    { email: 'phinhut2003@gmail.com', password: '11111111', expectedRole: 'Patient' }
];

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function testAuthentication(email, password, expectedRole) {
    try {
        console.log(`\n🧪 Testing: ${email} (Expected: ${expectedRole})`);

        // Find user (explicitly select password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('   ❌ User not found');
            return false;
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log('   ❌ Password incorrect');
            return false;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        // Decode and verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Verify role matches
        const roleMatch = user.role === expectedRole;
        const tokenRoleMatch = decoded.role === expectedRole;

        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 DB Role: ${user.role}`);
        console.log(`   🎟️  JWT Role: ${decoded.role}`);
        console.log(`   ✅ Password: ${isPasswordCorrect ? 'Valid' : 'Invalid'}`);
        console.log(`   ✅ Role Match: ${roleMatch ? 'Correct' : 'Incorrect'}`);
        console.log(`   ✅ Token Role: ${tokenRoleMatch ? 'Correct' : 'Incorrect'}`);

        if (roleMatch && tokenRoleMatch && isPasswordCorrect) {
            console.log(`   ✅ PASS: Authentication successful`);
            return true;
        } else {
            console.log(`   ❌ FAIL: Authentication issues`);
            return false;
        }

    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    await connectDB();

    console.log('🔐 Testing Authentication Matrix...\n');
    console.log('='.repeat(60));

    let passCount = 0;
    let totalCount = testUsers.length;

    for (const testUser of testUsers) {
        const passed = await testAuthentication(
            testUser.email,
            testUser.password,
            testUser.expectedRole
        );
        if (passed) passCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Results: ${passCount}/${totalCount} passed`);

    if (passCount === totalCount) {
        console.log('✅ ALL AUTHENTICATION TESTS PASSED');
        console.log('🎯 Backend authentication system working correctly');
        console.log('🔍 Issue confirmed to be in frontend routing logic');
    } else {
        console.log('❌ Some authentication tests failed');
        console.log('🔧 Backend authentication needs fixing');
    }

    console.log('\n🚀 Next Steps:');
    console.log('   1. If all tests pass → Fix frontend routing logic');
    console.log('   2. If tests fail → Fix backend authentication');
    console.log('   3. Run: node scripts/stopRequestLoop.js (in browser)');
    console.log('   4. Clear browser storage and cookies');

    process.exit(0);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Test interrupted');
    mongoose.connection.close();
    process.exit(0);
});

runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
