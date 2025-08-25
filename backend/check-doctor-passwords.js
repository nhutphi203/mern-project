import mongoose from 'mongoose';

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/hospitalDB';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String,
    doctorDepartment: String
});

const User = mongoose.model('User', userSchema);

async function checkDoctorData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all doctors
        const doctors = await User.find({ role: 'Doctor' }).select('firstName lastName email');
        
        console.log(`\n🔍 Found ${doctors.length} doctors:`);
        
        doctors.slice(0, 10).forEach((doctor, index) => {
            console.log(`${index + 1}. ${doctor.firstName} ${doctor.lastName} - ${doctor.email}`);
        });

        // Try to create test doctor with known password
        console.log('\n🔧 Creating test doctor with known password...');
        
        const testDoctor = {
            firstName: 'Test',
            lastName: 'Doctor',
            email: 'test.doctor.lab@hospital.com',
            password: '$2a$12$LFCGsXqJAZvbwTlHJz.WlOJ9/Z7xFxB9xYkJE9vHWqLrI4r0/B.9e', // password123
            role: 'Doctor',
            doctorDepartment: 'General Medicine',
            phone: '1234567890',
            isActive: true
        };

        // Check if test doctor already exists
        const existingDoctor = await User.findOne({ email: testDoctor.email });
        
        if (existingDoctor) {
            console.log('✅ Test doctor already exists');
            console.log(`📧 Email: ${existingDoctor.email}`);
            console.log(`🔑 Use password: password123`);
        } else {
            const newDoctor = await User.create(testDoctor);
            console.log('✅ Test doctor created successfully');
            console.log(`📧 Email: ${newDoctor.email}`);
            console.log(`🔑 Password: password123`);
            console.log(`🆔 Doctor ID: ${newDoctor._id}`);
        }

        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDoctorData();
