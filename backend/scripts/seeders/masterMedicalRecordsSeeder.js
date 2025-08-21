// Master Medical Records Seeder
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { seedICD10Codes } from './icd10Seeder.js';
import { seedEnhancedMedicalRecords } from './enhancedMedicalRecordSeeder.js';
import { seedCPOEOrders } from './cpoeSeeder.js';

config({ path: './config/config.env' });

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔗 Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

const seedMedicalRecordsData = async () => {
    try {
        console.log('🏥 Starting Medical Records Data Seeding...\n');

        // 1. Seed ICD-10 diagnosis codes first
        console.log('1️⃣ Seeding ICD-10 Diagnosis Codes...');
        await seedICD10Codes();
        console.log('✅ ICD-10 codes seeded successfully\n');

        // 2. Seed enhanced medical records
        console.log('2️⃣ Seeding Enhanced Medical Records...');
        await seedEnhancedMedicalRecords();
        console.log('✅ Enhanced medical records seeded successfully\n');

        // 3. Seed CPOE orders
        console.log('3️⃣ Seeding CPOE Orders...');
        await seedCPOEOrders();
        console.log('✅ CPOE orders seeded successfully\n');

        console.log('🎉 Medical Records Data Seeding Completed Successfully!');

        // Summary
        console.log('\n📋 Seeding Summary:');
        console.log('   ✅ ICD-10 Diagnosis Codes: 20+ codes covering major categories');
        console.log('   ✅ Enhanced Medical Records: 3 comprehensive patient records');
        console.log('   ✅ CPOE Orders: 9 orders (medications, labs, imaging, procedures)');
        console.log('\n💡 You can now test:');
        console.log('   🔸 Role-based access for different user types');
        console.log('   🔸 Medical record creation and management');
        console.log('   🔸 ICD-10 diagnosis search and assignment');
        console.log('   🔸 CPOE order management workflow');
        console.log('   🔸 Clinical decision support features');

    } catch (error) {
        console.error('❌ Error during medical records seeding:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDatabase();
        await seedMedicalRecordsData();

        console.log('\n🔚 Seeding process completed. Closing database connection...');
        await mongoose.connection.close();
        console.log('✅ Database connection closed.');

    } catch (error) {
        console.error('❌ Fatal error in seeding process:', error);
        process.exit(1);
    }
};

// Export functions for individual use
export {
    seedICD10Codes,
    seedEnhancedMedicalRecords,
    seedCPOEOrders,
    seedMedicalRecordsData
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
