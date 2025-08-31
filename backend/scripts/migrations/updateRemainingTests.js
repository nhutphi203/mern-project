// Manual update remaining lab tests
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { LabTest } from '../../models/labTest.model.js';

config({ path: './config/config.env' });

async function updateRemainingTests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Update specific tests by ID or exact name
        const updates = [
            { filter: { testName: { $regex: 'Hemoglobin A1c', $options: 'i' } }, price: 25.00 },
            { filter: { testName: { $regex: 'TSH', $options: 'i' } }, price: 22.00 },
            { filter: { testName: { $regex: 'PSA', $options: 'i' } }, price: 28.00 },
            { filter: { testName: { $regex: 'Complete Blood Count', $options: 'i' } }, price: 12.00 },
            { filter: { testName: { $regex: 'Erythrocyte Sedimentation', $options: 'i' } }, price: 8.00 }
        ];

        for (const { filter, price } of updates) {
            const result = await LabTest.updateMany(filter, { price });
            console.log(`   Updated ${result.modifiedCount} tests to $${price}`);
        }

        // Show all current prices
        const allTests = await LabTest.find({});
        console.log('\n📋 All lab test prices after update:');
        allTests.forEach(test => {
            console.log(`   ${test.testName}: $${test.price}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateRemainingTests();
