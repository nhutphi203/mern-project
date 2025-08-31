import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => console.log('- ' + col.name));

    // Check different possible collection names
    const names = ['enhancedmedicalrecords', 'medical_records', 'medicalrecords', 'enhanced_medical_records'];
    for (const name of names) {
        try {
            const count = await mongoose.connection.db.collection(name).countDocuments();
            console.log(`Collection '${name}': ${count} documents`);
            if (count > 0) {
                const sample = await mongoose.connection.db.collection(name).findOne();
                console.log(`  Sample document ID: ${sample._id}`);
            }
        } catch (err) {
            console.log(`Collection '${name}': not found`);
        }
    }
    mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
});
