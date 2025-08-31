import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: './config/config.env' });

console.log('🔍 MEDICAL RECORDS SYSTEM ANALYSIS');
console.log('==================================');

async function analyzeMedicalRecordsSystem() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Import models
        const { MedicalRecord } = await import('./models/medicalRecordSchema.js');
        const { EnhancedMedicalRecord } = await import('./models/enhancedMedicalRecord.model.js');

        console.log('\n📊 DATABASE ANALYSIS:');
        console.log('===================');

        // Count legacy records
        const legacyCount = await MedicalRecord.countDocuments();
        console.log(`📋 Legacy Medical Records: ${legacyCount}`);

        // Count enhanced records  
        const enhancedCount = await EnhancedMedicalRecord.countDocuments();
        console.log(`🆕 Enhanced Medical Records: ${enhancedCount}`);

        // Sample legacy record structure
        if (legacyCount > 0) {
            const sampleLegacy = await MedicalRecord.findOne().lean();
            console.log('\n📝 Sample Legacy Record Structure:');
            console.log('Fields:', Object.keys(sampleLegacy || {}));
        }

        // Sample enhanced record structure
        if (enhancedCount > 0) {
            const sampleEnhanced = await EnhancedMedicalRecord.findOne().lean();
            console.log('\n🆕 Sample Enhanced Record Structure:');
            console.log('Fields:', Object.keys(sampleEnhanced || {}));
        }

        console.log('\n🔗 ENDPOINT ANALYSIS:');
        console.log('===================');

        // Test endpoints availability
        const endpoints = [
            '/api/v1/medical-records/legacy',
            '/api/v1/medical-records/enhanced',
            '/api/v1/medical-records/all',
            '/api/v1/medical-records/search',
            '/api/v1/medical-records/statistics'
        ];

        console.log('Available endpoints to test:', endpoints);

        console.log('\n📱 FRONTEND INTEGRATION POINTS:');
        console.log('==============================');

        // Check what the frontend is expecting
        console.log('Frontend expects:');
        console.log('- MedicalRecord interface');
        console.log('- MedicalRecordsAPI class');
        console.log('- Enhanced medical record features');

        console.log('\n⚠️ MIGRATION RECOMMENDATIONS:');
        console.log('=============================');

        if (legacyCount > 0 && enhancedCount === 0) {
            console.log('🔄 PHASE 1: Migrate legacy records to enhanced format');
            console.log('🔧 PHASE 2: Update frontend to use enhanced endpoints');
            console.log('🧹 PHASE 3: Clean up legacy code');
        } else if (enhancedCount > 0) {
            console.log('✅ Enhanced records exist - update frontend integration');
            console.log('🔧 Focus on API compatibility layer');
        } else {
            console.log('⚠️ No medical records found - fresh system');
        }

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        mongoose.disconnect();
    }
}

// Run analysis
analyzeMedicalRecordsSystem();
