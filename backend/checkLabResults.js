import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dbConnection } from './database/dbConnection.js';
import { LabResult } from './models/labResult.model.js';
import { LabTest } from './models/labTest.model.js';

dotenv.config();

async function checkLabResults() {
    try {
        await dbConnection();
        console.log('Connected to MongoDB');

        // Check first few results with their test lookup
        const results = await LabResult.find().limit(5);
        console.log('Checking first 5 lab results:');

        for (const result of results) {
            console.log(`\nResult ID: ${result._id}`);
            console.log(`- testId: ${result.testId}`);
            console.log(`- result value: ${result.result?.value}`);

            // Try to find the corresponding LabTest
            const labTest = await LabTest.findById(result.testId);
            if (labTest) {
                console.log(`✅ Found LabTest: ${labTest.testName} (${labTest.category})`);
            } else {
                console.log(`❌ LabTest NOT FOUND for testId: ${result.testId}`);
            }
        }

        // Check how many LabTests exist
        const totalLabTests = await LabTest.countDocuments();
        const totalLabResults = await LabResult.countDocuments();

        console.log(`\nSummary:`);
        console.log(`- Total LabTests: ${totalLabTests}`);
        console.log(`- Total LabResults: ${totalLabResults}`);

        // Get all LabTest IDs
        const allLabTests = await LabTest.find({}, '_id testName');
        console.log(`\nAvailable LabTests:`);
        allLabTests.forEach(test => {
            console.log(`- ${test._id}: ${test.testName}`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkLabResults();
