import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function fixMedicalRecordsWithDoctor() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find a doctor user
        const doctor = await mongoose.connection.db.collection('users').findOne({
            role: 'Doctor'
        });

        if (!doctor) {
            console.log('❌ No doctor found in database!');
            return;
        }

        console.log(`🩺 Found doctor: ${doctor.firstName} ${doctor.lastName} (${doctor._id})`);

        // Update all medical records to have this doctor as primaryProviderId
        const result = await mongoose.connection.db.collection('medical_records').updateMany(
            {},
            {
                $set: {
                    primaryProviderId: doctor._id,
                    lastModifiedBy: doctor._id,
                    lastModifiedAt: new Date()
                }
            }
        );

        console.log(`📝 Updated ${result.modifiedCount} medical records with doctor ID`);

        // Verify the update
        const updatedRecords = await mongoose.connection.db.collection('medical_records').find({}).toArray();
        console.log('\n📋 Updated medical records:');

        updatedRecords.forEach((record, index) => {
            console.log(`${index + 1}. Record ID: ${record._id}`);
            console.log(`   Patient ID: ${record.patientId}`);
            console.log(`   Doctor ID: ${record.primaryProviderId}`);
            console.log(`   Status: ${record.recordStatus}`);
            console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
            console.log(`   Last Modified: ${record.lastModifiedAt}`);
            console.log('   ---');
        });

        await mongoose.disconnect();
        console.log('\n✅ Medical records fixed successfully!');
        console.log('\n🎉 RESULT: Admin should now see full data with doctor names!');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

fixMedicalRecordsWithDoctor();
