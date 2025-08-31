import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupOrphanedRecords() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB';
    await mongoose.connect(mongoUri);
    console.log('Connected to database:', mongoose.connection.name);

    const medicalRecordsCollection = mongoose.connection.db.collection('medical_records');
    const usersCollection = mongoose.connection.db.collection('users');

    const allRecords = await medicalRecordsCollection.find({}).toArray();
    console.log('Total medical records:', allRecords.length);

    let orphanedCount = 0;
    const orphanedRecords = [];

    for (const record of allRecords) {
      const patient = await usersCollection.findOne({ _id: record.patientId });
      if (!patient) {
        orphanedCount++;
        orphanedRecords.push(record._id);
        console.log('Orphaned record:', record._id, 'Chief Complaint:', record.clinicalAssessment?.chiefComplaint);
      }
    }

    console.log('Found ' + orphanedCount + ' orphaned records');

    if (orphanedCount > 0) {
      console.log('Removing orphaned records...');
      const deleteResult = await medicalRecordsCollection.deleteMany({
        _id: { $in: orphanedRecords }
      });
      console.log('Deleted', deleteResult.deletedCount, 'orphaned records');
    }

    console.log('Cleanup completed!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

cleanupOrphanedRecords();
