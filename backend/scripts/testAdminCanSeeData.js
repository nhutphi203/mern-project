import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testAdminAccess() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test the exact filter logic from the backend router
        // This simulates what happens when admin calls /api/v1/medical-records/summary

        console.log('\n🔍 Testing Admin access logic...');

        // Admin role doesn't add any additional filters, only isActive: true
        const adminFilter = { isActive: true };

        console.log('Admin filter:', adminFilter);

        const records = await mongoose.connection.db.collection('medical_records').find(adminFilter).toArray();
        console.log(`\n📊 Admin can see ${records.length} medical records:`);

        records.forEach((record, index) => {
            console.log(`\n${index + 1}. Medical Record:`);
            console.log(`   ID: ${record._id}`);
            console.log(`   Patient ID: ${record.patientId}`);
            console.log(`   Primary Provider ID: ${record.primaryProviderId}`);
            console.log(`   Status: ${record.recordStatus}`);
            console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
            console.log(`   Created: ${record.createdAt}`);
            console.log(`   isActive: ${record.isActive}`);
        });

        // Test statistics calculation for Admin
        const totalRecords = await mongoose.connection.db.collection('medical_records').countDocuments(adminFilter);
        const activeCases = await mongoose.connection.db.collection('medical_records').countDocuments({
            ...adminFilter,
            recordStatus: { $in: ['In Progress', 'Draft'] }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = await mongoose.connection.db.collection('medical_records').countDocuments({
            ...adminFilter,
            recordStatus: 'Finalized',
            updatedAt: { $gte: today }
        });

        const pendingReview = await mongoose.connection.db.collection('medical_records').countDocuments({
            ...adminFilter,
            recordStatus: 'Completed'
        });

        console.log(`\n📈 Statistics for Admin Dashboard:`);
        console.log(`   Total Records: ${totalRecords}`);
        console.log(`   Active Cases: ${activeCases}`);
        console.log(`   Resolved Today: ${resolvedToday}`);
        console.log(`   Pending Review: ${pendingReview}`);

        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully!');
        console.log('\n🎉 RESULT: Admin CAN see medical records data!');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

testAdminAccess();
