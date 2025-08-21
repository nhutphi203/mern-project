import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

async function checkRawData() {
    await connectDB();

    console.log('🔍 Checking Raw MongoDB Data...\n');

    const testEmails = ['admin@hospital.com', 'phinhut2003@gmail.com'];

    for (const email of testEmails) {
        console.log(`📧 ${email}:`);

        // Get raw document from MongoDB
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const rawUser = await usersCollection.findOne({ email });

        if (!rawUser) {
            console.log('   ❌ User not found in MongoDB');
            continue;
        }

        console.log(`   🆔 ID: ${rawUser._id}`);
        console.log(`   📛 Name: ${rawUser.firstName} ${rawUser.lastName}`);
        console.log(`   🎭 Role: ${rawUser.role}`);
        console.log(`   🔐 AuthType: ${rawUser.authType}`);
        console.log(`   🔒 Password Field Exists: ${rawUser.password ? 'Yes' : 'No'}`);
        console.log(`   🔒 Password Length: ${rawUser.password ? rawUser.password.length : 0}`);
        console.log(`   🔒 Password Value: ${rawUser.password ? rawUser.password.substring(0, 20) + '...' : 'MISSING'}`);
        console.log(`   ✅ Verified: ${rawUser.isVerified}`);
        console.log('   ---');
    }

    process.exit(0);
}

checkRawData().catch(error => {
    console.error('❌ Raw data check failed:', error.message);
    process.exit(1);
});
