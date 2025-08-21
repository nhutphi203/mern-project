import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testAPIEndpoint() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test model import
        console.log('\n🔍 Testing EnhancedMedicalRecord model import...');
        try {
            const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
            const { User } = await import('../models/userScheme.js');
            console.log('✅ Both models imported successfully');

            // Test the exact query that causes the 500 error
            console.log('\n📋 Testing API query that fails...');
            const filter = { isActive: true };
            console.log('Filter:', filter);

            // Test with raw MongoDB query first
            console.log('\n1. Testing with raw MongoDB query:');
            const rawRecords = await mongoose.connection.db.collection('medical_records').find(filter).toArray();
            console.log(`   Found ${rawRecords.length} records`);

            // Test with Mongoose model
            console.log('\n2. Testing with Mongoose model:');
            const modelRecords = await EnhancedMedicalRecord.find(filter);
            console.log(`   Found ${modelRecords.length} records via model`);

            // Test with populate (this might be causing the issue)
            console.log('\n3. Testing with populate (likely cause of 500 error):');
            try {
                const populatedRecords = await EnhancedMedicalRecord.find(filter)
                    .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
                    .populate('doctorId', 'firstName lastName specialization licenseNumber')
                    // .populate('encounterId', 'type status scheduledDateTime')  // Skip this for now
                    .sort({ createdAt: -1 })
                    .limit(20);

                console.log(`   ✅ Populate successful! Found ${populatedRecords.length} records`);

                if (populatedRecords.length > 0) {
                    const record = populatedRecords[0];
                    console.log('\n📊 Sample populated record:');
                    console.log('   Patient:', record.patientId ? `${record.patientId.firstName} ${record.patientId.lastName}` : 'null');
                    console.log('   Doctor:', record.doctorId ? `${record.doctorId.firstName} ${record.doctorId.lastName}` : 'null');
                    console.log('   Encounter:', record.encounterId ? record.encounterId.type : 'null');
                }

            } catch (populateError) {
                console.error('❌ Populate failed:', populateError.message);
                console.error('This is likely the cause of the 500 error!');
                console.error('Full error:', populateError);
            }

        } catch (modelError) {
            console.error('❌ Model import failed:', modelError.message);
            console.error('This could be the cause of the 500 error!');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        await mongoose.disconnect();
    }
}

testAPIEndpoint();
