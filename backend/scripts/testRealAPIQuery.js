import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testRealAPIQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Import models exactly like the router does
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        console.log('\n🎯 Testing exact API query for Admin (page 1, limit 20)...');

        // Simulate admin user (no role-based filtering)
        const filter = { isActive: true };
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        console.log('Filter:', filter);
        console.log('Pagination:', { page, limit, skip });

        // Execute the exact query from router
        const records = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        console.log(`\n📊 API Query Results:`);
        console.log(`✅ Found ${records.length} records`);

        if (records.length > 0) {
            records.forEach((record, index) => {
                console.log(`\n${index + 1}. Record ID: ${record._id}`);
                console.log(`   Patient: ${record.patientId?.firstName} ${record.patientId?.lastName}`);
                console.log(`   Doctor: ${record.doctorId?.firstName} ${record.doctorId?.lastName}`);
                console.log(`   Status: ${record.recordStatus}`);
                console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
                console.log(`   Created: ${record.createdAt}`);
            });
        }

        // Test pagination info
        const totalRecords = await EnhancedMedicalRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);

        console.log(`\n📄 Pagination Info:`);
        console.log(`   Total Records: ${totalRecords}`);
        console.log(`   Total Pages: ${totalPages}`);
        console.log(`   Current Page: ${page}`);
        console.log(`   Has Next Page: ${page < totalPages}`);
        console.log(`   Has Previous Page: ${page > 1}`);

        await mongoose.disconnect();
        console.log('\n🎉 API test completed successfully!');
        console.log('✅ Frontend should now receive proper data!');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.error('Stack:', error.stack);
        await mongoose.disconnect();
    }
}

testRealAPIQuery();
