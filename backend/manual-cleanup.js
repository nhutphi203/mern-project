import mongoose from 'mongoose';

async function cleanup() {
  try {
    const dbUri = process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test') || 'mongodb://localhost:27017/healthcare_system_test';
    await mongoose.connect(dbUri);
    
    console.log('🧹 Cleaning duplicate PatientInsurance records...');
    const db = mongoose.connection.db;
    const result = await db.collection('patientinsurances').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} PatientInsurance records`);
    
    await mongoose.disconnect();
    console.log('✅ Manual cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanup();
