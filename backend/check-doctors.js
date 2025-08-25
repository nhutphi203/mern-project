import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

async function checkDoctors() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
        
        // Find all doctors
        const doctors = await User.find({ role: 'Doctor' }).select('firstName lastName email role doctorDepartment createdAt');
        console.log(`\n📋 Found ${doctors.length} Doctors:`);
        
        doctors.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.firstName} ${doc.lastName}`);
            console.log(`   Email: ${doc.email}`);
            console.log(`   Department: ${doc.doctorDepartment || 'Not set'}`);
            console.log(`   ID: ${doc._id}`);
            console.log(`   Created: ${doc.createdAt}`);
            console.log('---');
        });
        
        // Also check one doctor's password (hashed)
        if (doctors.length > 0) {
            const firstDoctor = await User.findById(doctors[0]._id).select('password');
            console.log(`\n🔐 Password hash for ${doctors[0].firstName}: ${firstDoctor.password.substring(0, 20)}...`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
}

checkDoctors();
