import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testAdminAccess() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test direct database access for admin
        console.log('\n📊 Testing admin access to medical records...');

        // Get all medical records from database directly
        const allRecords = await mongoose.connection.db.collection('medical_records').find({}).toArray();
        console.log(`📋 Total medical records in database (all): ${allRecords.length}`);

        const activeRecords = await mongoose.connection.db.collection('medical_records').find({ isActive: true }).toArray();
        console.log(`📋 Total active medical records: ${activeRecords.length}`);

        const records = allRecords.length > 0 ? allRecords : activeRecords;

        if (records.length > 0) {
            console.log('\n📝 Medical records that admin should see:');
            for (let i = 0; i < records.length; i++) {
                const record = records[i];

                // Get patient and doctor info
                const patient = await mongoose.connection.db.collection('users').findOne({ _id: record.patientId });
                const doctor = await mongoose.connection.db.collection('users').findOne({ _id: record.primaryProviderId });

                console.log(`  ${i + 1}. Record ID: ${record._id}`);
                console.log(`     Patient: ${patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}`);
                console.log(`     Doctor: ${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'}`);
                console.log(`     Status: ${record.recordStatus}`);
                console.log(`     Chief Complaint: ${record.clinicalAssessment?.chiefComplaint || 'N/A'}`);
                console.log(`     Created: ${record.createdAt}`);
                console.log('     ---');
            }
        } else {
            console.log('❌ No medical records found in database');
        }

        // Check users in database
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`\n👥 Total users in database: ${users.length}`);

        const adminUsers = users.filter(user => user.role === 'Admin');
        console.log(`👮‍♂️ Admin users: ${adminUsers.length}`);
        if (adminUsers.length > 0) {
            adminUsers.forEach((admin, index) => {
                console.log(`  ${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
            });
        }

        // Simulate API filter logic for admin
        console.log('\n🔧 Testing API filter logic for admin role...');
        let filter = { isActive: true };
        // For admin role, no additional filters are applied - they see everything
        console.log('✅ Admin filter:', JSON.stringify(filter));
        console.log('📋 Admin should see ALL active medical records');

        console.log('\n🎯 Summary for Admin Access:');
        console.log(`• Total medical records available: ${records.length}`);
        console.log('• Admin role has NO additional filters applied');
        console.log('• Admin should see ALL medical records in the system');
        console.log('• If admin sees empty data in frontend, check:');
        console.log('  1. Authentication token is valid');
        console.log('  2. API endpoint is accessible');
        console.log('  3. Frontend is calling correct API endpoints');

    } catch (error) {
        console.error('❌ Error during admin test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    }
}

testAdminAccess();
