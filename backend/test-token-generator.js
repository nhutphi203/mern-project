// Generate valid JWT tokens for testing
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from './models/userScheme.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Database connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "HOSPITAL_MANAGEMENT_SYSTEM"
        });
        console.log('✅ Connected to database for token generation');
    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES || '7d'
    });
};

// Main function to generate tokens
const generateTestTokens = async () => {
    try {
        await connectToDatabase();

        // Find first doctor and patient in database
        let doctor = await User.findOne({ role: 'Doctor' });
        let patient = await User.findOne({ role: 'Patient' });

        if (!doctor) {
            console.log('❌ No doctor found in database');
            process.exit(1);
        }

        if (!patient) {
            console.log('❌ No patient found in database');
            process.exit(1);
        }

        console.log('✅ Found test users:');
        console.log(`Doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
        console.log(`Patient: ${patient.firstName} ${patient.lastName} (${patient.email})`);

        // Generate tokens
        const doctorToken = generateToken(doctor._id);
        const patientToken = generateToken(patient._id);

        console.log('\n🔑 GENERATED TEST TOKENS:');
        console.log('='.repeat(50));
        console.log(`Doctor Token (${doctor.firstName} ${doctor.lastName}):`, doctorToken);
        console.log(`Patient Token (${patient.firstName} ${patient.lastName}):`, patientToken);
        console.log('='.repeat(50));

        // Save tokens to a file for easy copy-paste
        const fs = await import('fs');
        const tokenData = {
            doctorToken,
            patientToken,
            doctor: {
                id: doctor._id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                email: doctor.email,
                role: doctor.role
            },
            patient: {
                id: patient._id,
                name: `${patient.firstName} ${patient.lastName}`,
                email: patient.email,
                role: patient.role
            },
            generated: new Date().toISOString()
        };

        fs.writeFileSync('./test-tokens.json', JSON.stringify(tokenData, null, 2));
        console.log('📁 Tokens saved to test-tokens.json');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating tokens:', error);
        process.exit(1);
    }
};

// Run the generator
generateTestTokens();
