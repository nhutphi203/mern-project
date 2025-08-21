import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkUsersAndRecords() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\n👥 Users in database:');
        users.forEach(user => {
            console.log(`- ID: ${user._id}`);
            console.log(`  Name: ${user.firstName} ${user.lastName}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Email: ${user.email}`);
            console.log('  ---');
        });

        // Get all medical records 
        const records = await mongoose.connection.db.collection('medical_records').find({}).toArray();
        console.log('\n📋 Medical Records with relationships:');
        records.forEach(record => {
            console.log(`- Record ID: ${record._id}`);
            console.log(`  Patient ID: ${record.patientId}`);
            console.log(`  Doctor ID: ${record.primaryProviderId}`);
            console.log(`  Status: ${record.recordStatus}`);
            console.log(`  Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);

            // Find matching users
            const patient = users.find(u => u._id.toString() === record.patientId?.toString());
            const doctor = users.find(u => u._id.toString() === record.primaryProviderId?.toString());

            console.log(`  Patient Name: ${patient ? patient.firstName + ' ' + patient.lastName : 'NOT FOUND'}`);
            console.log(`  Doctor Name: ${doctor ? doctor.firstName + ' ' + doctor.lastName : 'NOT FOUND'}`);
            console.log('  ---');
        });

        // Check if there's a mismatch
        const orphanedRecords = records.filter(record => {
            const hasPatient = users.some(u => u._id.toString() === record.patientId?.toString());
            const hasDoctor = users.some(u => u._id.toString() === record.primaryProviderId?.toString());
            return !hasPatient || !hasDoctor;
        });

        if (orphanedRecords.length > 0) {
            console.log(`\n⚠️  Found ${orphanedRecords.length} medical records with missing user references!`);
            console.log('This explains why populate() fails in the API.');
        } else {
            console.log('\n✅ All medical records have valid user references!');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

checkUsersAndRecords();
