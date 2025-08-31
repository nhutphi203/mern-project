import axios from 'axios';
import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testDoctorAuth() {
    console.log('🔐 TESTING DOCTOR AUTHENTICATION');
    console.log('================================');

    try {
        // Connect to database to check users
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB');
        console.log('✅ Connected to database');

        // Find doctor with known password
        const doctor = await User.findOne({ 
            email: 'test.doctor.lab@hospital.com',
            role: 'Doctor' 
        }).select('+password');

        if (!doctor) {
            console.log('❌ Doctor not found in database');
            process.exit(1);
        }

        console.log('👨‍⚕️ Found doctor in database:');
        console.log(`   Name: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Role: ${doctor.role}`);
        console.log(`   Has Password: ${doctor.password ? 'Yes' : 'No'}`);

        // Test login
        console.log('\n🔑 Testing login...');
        
        const credentials = {
            email: doctor.email,
            password: 'password123',
            role: 'Doctor'
        };

        console.log('📤 Sending credentials:', {
            email: credentials.email,
            password: '***hidden***',
            role: credentials.role
        });

        const response = await axios.post(`${BASE_URL}/users/login`, credentials);

        if (response.data.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('👤 User:', response.data.user.firstName, response.data.user.lastName);
            console.log('🎭 Role:', response.data.user.role);
            console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
            
            // Test lab endpoint access
            console.log('\n🧪 Testing lab endpoint access...');
            
            const labResponse = await axios.get(`${BASE_URL}/lab/tests`, {
                headers: { Authorization: `Bearer ${response.data.token}` }
            });

            console.log('📊 Lab tests endpoint result:');
            console.log(`   Status: ${labResponse.status}`);
            console.log(`   Success: ${labResponse.data.success}`);
            console.log(`   Count: ${labResponse.data.count || 0}`);
            
        } else {
            console.log('❌ Login failed:', response.data.message);
        }

    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }

    await mongoose.disconnect();
}

testDoctorAuth();
