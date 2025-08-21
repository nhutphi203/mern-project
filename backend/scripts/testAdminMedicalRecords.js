import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testAdminAccess() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Import models dynamically
        const { default: User } = await import('../models/userScheme.js');
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        // Find or create an admin user
        let adminUser = await User.findOne({ role: 'Admin' });

        if (!adminUser) {
            console.log('👤 Creating admin user for testing...');
            adminUser = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@test.com',
                phone: '0123456789',
                role: 'Admin',
                password: 'admin123',
                doctorDepartment: 'Administration'
            });
            await adminUser.save();
            console.log('✅ Admin user created');
        } else {
            console.log('👤 Found existing admin user:', adminUser.email);
        }

        // Simulate admin access to medical records
        console.log('\n📊 Testing admin access to medical records...');

        // Test 1: Get all medical records (admin should see all)
        const allRecords = await EnhancedMedicalRecord.find({ isActive: true })
            .populate('patientId', 'firstName lastName')
            .populate('primaryProviderId', 'firstName lastName')
            .sort({ createdAt: -1 });

        console.log(`📋 Total medical records available: ${allRecords.length}`);

        if (allRecords.length > 0) {
            console.log('📝 Medical records details:');
            allRecords.forEach((record, index) => {
                console.log(`  ${index + 1}. Patient: ${record.patientId?.firstName} ${record.patientId?.lastName}`);
                console.log(`     Doctor: ${record.primaryProviderId?.firstName} ${record.primaryProviderId?.lastName}`);
                console.log(`     Status: ${record.recordStatus}`);
                console.log(`     Chief Complaint: ${record.clinicalAssessment?.chiefComplaint}`);
                console.log(`     Created: ${record.createdAt}`);
                console.log('     ---');
            });
        }

        // Test 2: Statistics for admin
        const stats = {
            totalRecords: await EnhancedMedicalRecord.countDocuments({ isActive: true }),
            activeCases: await EnhancedMedicalRecord.countDocuments({
                isActive: true,
                recordStatus: { $in: ['In Progress', 'Draft'] }
            }),
            completedCases: await EnhancedMedicalRecord.countDocuments({
                isActive: true,
                recordStatus: 'Completed'
            }),
            finalizedCases: await EnhancedMedicalRecord.countDocuments({
                isActive: true,
                recordStatus: 'Finalized'
            })
        };

        console.log('\n📈 Statistics for Admin:');
        console.log(`  Total Records: ${stats.totalRecords}`);
        console.log(`  Active Cases: ${stats.activeCases}`);
        console.log(`  Completed Cases: ${stats.completedCases}`);
        console.log(`  Finalized Cases: ${stats.finalizedCases}`);

        // Test 3: API simulation (what admin would see through API)
        console.log('\n🌐 Simulating API response for admin...');
        const filter = { isActive: true }; // Admin sees all records (no additional filtering)

        const recentRecords = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName')
            .populate('primaryProviderId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10);

        const transformedData = recentRecords.map(record => ({
            _id: record._id,
            patientName: `${record.patientId?.firstName || ''} ${record.patientId?.lastName || ''}`.trim(),
            diagnosis: record.diagnoses?.[0]?.icd10Description || 'No diagnosis recorded',
            lastUpdated: record.updatedAt,
            status: record.recordStatus === 'Finalized' ? 'Resolved' :
                record.recordStatus === 'In Progress' ? 'Under Treatment' : 'Active',
            doctor: `${record.primaryProviderId?.firstName || ''} ${record.primaryProviderId?.lastName || ''}`.trim(),
            priority: record.clinicalAssessment?.severity || 'Medium',
            chiefComplaint: record.clinicalAssessment?.chiefComplaint || ''
        }));

        console.log('📱 API Response Data for Admin:');
        if (transformedData.length > 0) {
            transformedData.forEach((record, index) => {
                console.log(`  ${index + 1}. ${record.patientName} - ${record.chiefComplaint}`);
                console.log(`     Status: ${record.status} | Doctor: ${record.doctor}`);
            });
        } else {
            console.log('  ❌ No data returned for admin - this indicates an issue');
        }

        console.log('\n✅ Admin access test completed');
        console.log('👮‍♂️ Admin should be able to see ALL medical records in the system');

    } catch (error) {
        console.error('❌ Error during admin test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    }
}

// Run the test
testAdminAccess();
