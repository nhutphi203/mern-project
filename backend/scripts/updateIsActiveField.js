import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function updateIsActiveField() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Update all medical records to have isActive: true
        const result = await mongoose.connection.db.collection('medical_records').updateMany(
            {},
            { $set: { isActive: true } }
        );

        console.log(`📝 Updated ${result.modifiedCount} medical records with isActive: true`);

        // Verify the update
        const records = await mongoose.connection.db.collection('medical_records').find({}).toArray();
        console.log('\n📋 All records now have isActive field:');
        records.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record._id}`);
            console.log(`   Patient ID: ${record.patientId}`);
            console.log(`   Doctor ID: ${record.primaryProviderId}`);
            console.log(`   isActive: ${record.isActive}`);
            console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
            console.log('   ---');
        });

        // Test the filter that Admin will use
        const activeRecords = await mongoose.connection.db.collection('medical_records').find({
            isActive: true
        }).toArray();

        console.log(`\n🎯 Admin will see ${activeRecords.length} records with isActive: true filter`);

        await mongoose.disconnect();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

updateIsActiveField();
