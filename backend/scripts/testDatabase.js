import mongoose from 'mongoose';
import { config } from 'dotenv';
import { LabTest } from '../models/labTest.model.js';
import { User } from '../models/userScheme.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with correct path
config({ path: path.join(__dirname, '../config/config.env') });

console.log('Environment check:', {
    MONGO_URI: process.env.MONGO_URI ? 'Found' : 'Missing',
    envPath: path.join(__dirname, '../config/config.env')
});

async function testDatabaseConnection() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "hospitalDB",
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB connected successfully");

        // Test Lab Tests collection
        console.log('\n🧪 Checking Lab Tests...');
        const labTestCount = await LabTest.countDocuments();
        console.log(`   Total Lab Tests: ${labTestCount}`);

        if (labTestCount === 0) {
            console.log('   ⚠️  No lab tests found. Adding sample data...');

            const sampleTests = [
                {
                    testCode: "CBC001",
                    testName: "Complete Blood Count (CBC)",
                    category: "Hematology",
                    department: "Laboratory",
                    normalRange: {
                        textRange: "WBC: 4.5-11.0 x10³/µL, RBC: 4.0-5.2 x10⁶/µL",
                        gender: "All"
                    },
                    price: 25.00,
                    turnaroundTime: 2,
                    specimen: "Blood",
                    instructions: "Fasting not required. EDTA tube preferred.",
                    isActive: true
                },
                {
                    testCode: "GLU001",
                    testName: "Fasting Blood Glucose",
                    category: "Chemistry",
                    normalRange: {
                        min: 70,
                        max: 100,
                        unit: "mg/dL",
                        gender: "All"
                    },
                    price: 12.00,
                    turnaroundTime: 1,
                    specimen: "Blood",
                    instructions: "Patient must fast for 8-12 hours before test.",
                    isActive: true
                },
                {
                    testCode: "TSH001",
                    testName: "Thyroid Stimulating Hormone (TSH)",
                    category: "Immunology",
                    normalRange: {
                        min: 0.4,
                        max: 4.0,
                        unit: "mIU/L",
                        gender: "All"
                    },
                    price: 18.00,
                    turnaroundTime: 6,
                    specimen: "Blood",
                    instructions: "No special preparation required.",
                    isActive: true
                }
            ];

            await LabTest.insertMany(sampleTests);
            console.log(`   ✅ Added ${sampleTests.length} sample lab tests`);
        } else {
            const tests = await LabTest.find({}).limit(5);
            console.log('   📋 Sample lab tests:');
            tests.forEach(test => {
                console.log(`      - ${test.testCode}: ${test.testName} (${test.category}) - $${test.price}`);
            });
        }

        // Test User collection
        console.log('\n👥 Checking Users...');
        const userCount = await User.countDocuments();
        console.log(`   Total Users: ${userCount}`);

        if (userCount === 0) {
            console.log('   ⚠️  No users found. Adding sample data...');

            const sampleUsers = [
                {
                    firstName: "Dr. John",
                    lastName: "Smith",
                    email: "john.smith@hospital.com",
                    phone: "1234567890",
                    nic: "123456789012",
                    dob: new Date("1980-05-15"),
                    gender: "Male",
                    password: "doctor123",
                    role: "Doctor",
                    authType: "traditional",
                    isVerified: true,
                    doctorDepartment: "Internal Medicine",
                    specialization: "General Internal Medicine",
                    licenseNumber: "DOC001"
                },
                {
                    firstName: "Jane",
                    lastName: "Doe",
                    email: "jane.doe@patient.com",
                    phone: "1234567891",
                    nic: "123456789013",
                    dob: new Date("1990-08-22"),
                    gender: "Female",
                    password: "patient123",
                    role: "Patient",
                    authType: "traditional",
                    isVerified: true
                },
                {
                    firstName: "Alex",
                    lastName: "Thompson",
                    email: "alex.thompson@hospital.com",
                    phone: "1234567892",
                    nic: "123456789014",
                    dob: new Date("1985-06-20"),
                    gender: "Male",
                    password: "tech123",
                    role: "Technician",
                    authType: "traditional",
                    isVerified: true
                }
            ];

            await User.insertMany(sampleUsers);
            console.log(`   ✅ Added ${sampleUsers.length} sample users`);
        } else {
            const users = await User.find({}).limit(3);
            console.log('   📋 Sample users:');
            users.forEach(user => {
                console.log(`      - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
            });
        }

        // Check by category breakdown
        console.log('\n📊 Lab Tests by Category:');
        const categories = await LabTest.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} tests`);
        });

        console.log('\n✅ Database check completed successfully!');
        console.log('🚀 Lab Management system data is ready!');

    } catch (error) {
        console.error('❌ Database connection or operation failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

testDatabaseConnection();
