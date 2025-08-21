import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkFieldNames() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const record = await mongoose.connection.db.collection('medical_records').findOne({});
        console.log('\n📋 Sample record fields:');
        console.log('Has doctorId:', 'doctorId' in record);
        console.log('Has primaryProviderId:', 'primaryProviderId' in record);

        if (record.doctorId) {
            console.log('doctorId value:', record.doctorId);
        }
        if (record.primaryProviderId) {
            console.log('primaryProviderId value:', record.primaryProviderId);
        }

        console.log('\n📝 All field names in record:');
        console.log(Object.keys(record));

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

checkFieldNames();
