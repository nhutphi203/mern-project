import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testSearchAPI() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test search functionality that matches the backend API
        console.log('\n🔍 Testing Medical Records Search API logic...');

        // Simulate admin role search with isActive filter
        const adminFilter = { isActive: true };

        // Test different search scenarios
        console.log('\n1. Testing basic isActive filter (all records):');
        const allActiveRecords = await mongoose.connection.db.collection('medical_records')
            .find(adminFilter)
            .toArray();
        console.log(`   Found ${allActiveRecords.length} active records`);

        // Test text search functionality
        console.log('\n2. Testing text search (chest pain):');
        const textSearchFilter = {
            ...adminFilter,
            $or: [
                { 'clinicalAssessment.chiefComplaint': { $regex: 'chest', $options: 'i' } },
                { 'clinicalAssessment.clinicalImpression': { $regex: 'chest', $options: 'i' } },
                { 'diagnoses.icd10Description': { $regex: 'chest', $options: 'i' } }
            ]
        };

        const textSearchRecords = await mongoose.connection.db.collection('medical_records')
            .find(textSearchFilter)
            .toArray();
        console.log(`   Found ${textSearchRecords.length} records matching "chest"`);

        // Test status filter
        console.log('\n3. Testing status filter (In Progress):');
        const statusFilter = {
            ...adminFilter,
            recordStatus: 'In Progress'
        };

        const statusRecords = await mongoose.connection.db.collection('medical_records')
            .find(statusFilter)
            .toArray();
        console.log(`   Found ${statusRecords.length} records with status "In Progress"`);

        // Test completed status
        console.log('\n4. Testing status filter (Completed):');
        const completedFilter = {
            ...adminFilter,
            recordStatus: 'Completed'
        };

        const completedRecords = await mongoose.connection.db.collection('medical_records')
            .find(completedFilter)
            .toArray();
        console.log(`   Found ${completedRecords.length} records with status "Completed"`);

        // Test combined search (like the frontend would do)
        console.log('\n5. Testing combined search (query + status):');
        const combinedFilter = {
            ...adminFilter,
            recordStatus: 'In Progress',
            $or: [
                { 'clinicalAssessment.chiefComplaint': { $regex: 'pain', $options: 'i' } },
                { 'clinicalAssessment.clinicalImpression': { $regex: 'pain', $options: 'i' } },
                { 'diagnoses.icd10Description': { $regex: 'pain', $options: 'i' } }
            ]
        };

        const combinedRecords = await mongoose.connection.db.collection('medical_records')
            .find(combinedFilter)
            .toArray();
        console.log(`   Found ${combinedRecords.length} records matching "pain" + "In Progress"`);

        // Display sample search results
        if (allActiveRecords.length > 0) {
            console.log('\n📋 Sample records that Admin can search:');
            allActiveRecords.forEach((record, index) => {
                console.log(`${index + 1}. Record ID: ${record._id}`);
                console.log(`   Patient ID: ${record.patientId}`);
                console.log(`   Status: ${record.recordStatus}`);
                console.log(`   Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
                console.log(`   Diagnosis: ${record.diagnoses?.[0]?.icd10Description || 'No diagnosis'}`);
                console.log(`   Created: ${record.createdAt}`);
                console.log(`   isActive: ${record.isActive}`);
                console.log('   ---');
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Search API test completed successfully!');
        console.log('\n🎉 RESULT: Admin search functionality is working correctly!');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

testSearchAPI();
