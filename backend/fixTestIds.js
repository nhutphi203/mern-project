// Fix lab tests with correct ObjectIds
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function fixTestIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing tests with same codes but different IDs
        const deleteResult = await mongoose.connection.db.collection('labtests').deleteMany({
            testCode: { $in: ['CBC001', 'ESR001'] }
        });
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing tests`);

        // Insert with correct IDs
        const testsToInsert = [
            {
                _id: new mongoose.Types.ObjectId('689de420d951427b1456dae5'),
                testName: 'Complete Blood Count (CBC)',
                testCode: 'CBC001',
                category: 'Hematology',
                description: 'A blood test to evaluate overall health and detect disorders',
                normalRange: 'Various parameters with specific ranges',
                unit: 'Various',
                price: 25,
                turnaroundTime: '2-4 hours',
                specimen: 'Blood',
                instructions: 'Instructions for Complete Blood Count (CBC)',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new mongoose.Types.ObjectId('689de420d951427b1456dae6'),
                testName: 'Erythrocyte Sedimentation Rate (ESR)',
                testCode: 'ESR001',
                category: 'Hematology',
                description: 'A blood test that measures inflammation in the body',
                normalRange: 'Men: 0-15 mm/hr, Women: 0-20 mm/hr',
                unit: 'mm/hr',
                price: 15,
                turnaroundTime: '1-2 hours',
                specimen: 'Blood',
                instructions: 'Instructions for Erythrocyte Sedimentation Rate (ESR)',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const insertResult = await mongoose.connection.db.collection('labtests').insertMany(testsToInsert);
        console.log(`✅ Inserted ${insertResult.insertedCount} tests with correct IDs`);

        console.log('✅ Lab test IDs fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixTestIds();
