import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dbConnection } from './database/dbConnection.js';
import { LabResult } from './models/labResult.model.js';
import { LabTest } from './models/labTest.model.js';
import { LabOrder } from './models/labOrder.model.js';
import { User } from './models/userScheme.js';

dotenv.config();

async function fixLabResultsTestIds() {
    try {
        await dbConnection();
        console.log('Connected to MongoDB');

        // 1. Delete all existing lab results with invalid testIds
        console.log('🗑️ Cleaning up invalid lab results...');
        const deletedCount = await LabResult.deleteMany({});
        console.log(`Deleted ${deletedCount.deletedCount} existing lab results`);

        // 2. Get available LabTests  
        const availableTests = await LabTest.find({}).limit(6); // Get first 6 tests
        console.log(`\n📋 Available tests (${availableTests.length}):`);
        availableTests.forEach(test => {
            console.log(`- ${test._id}: ${test.testName}`);
        });

        // 3. Get lab orders to create results for
        const orders = await LabOrder.find({ status: { $in: ['Pending', 'Completed'] } })
            .populate('patientId', 'firstName lastName')
            .limit(3);

        console.log(`\n📋 Found ${orders.length} lab orders`);

        // 4. Get technicians
        const technicians = await User.find({ role: 'Admin' });

        if (!orders.length || !technicians.length || !availableTests.length) {
            console.log('❌ Missing required data');
            return;
        }

        // 5. Create new lab results with correct testIds
        const newResults = [];

        for (const order of orders) {
            console.log(`\n🔬 Creating results for order ${order.orderId}...`);

            // Create 2-3 results per order using available tests
            for (let i = 0; i < Math.min(3, availableTests.length); i++) {
                const test = availableTests[i];
                const technician = technicians[Math.floor(Math.random() * technicians.length)];

                // Generate realistic results
                let resultValue, flag = 'Normal', unit = '';
                let isAbnormal = Math.random() < 0.2; // 20% abnormal

                switch (test.testName) {
                    case 'Complete Blood Count (CBC)':
                        resultValue = isAbnormal ? '9.2' : '14.4';
                        unit = 'g/dL';
                        flag = isAbnormal ? 'Low' : 'Normal';
                        break;
                    case 'Fasting Blood Glucose':
                        resultValue = isAbnormal ? '140' : '92';
                        unit = 'mg/dL';
                        flag = isAbnormal ? 'High' : 'Normal';
                        break;
                    case 'Erythrocyte Sedimentation Rate (ESR)':
                        resultValue = isAbnormal ? '32' : '14';
                        unit = 'mm/hr';
                        flag = isAbnormal ? 'High' : 'Normal';
                        break;
                    case 'Lipid Panel':
                    case 'Liver Function Panel':
                        resultValue = 'Normal';
                        flag = 'Normal';
                        break;
                    default:
                        resultValue = isAbnormal ? '15.8' : '13.9';
                        unit = 'g/dL';
                        flag = isAbnormal ? 'High' : 'Normal';
                }

                const referenceRange = test.normalRange?.textRange ||
                    (unit ? `Normal: varies by test` : 'See reference values');

                const newResult = {
                    orderId: order._id,
                    testId: test._id, // Use correct testId
                    patientId: order.patientId._id,
                    technicianId: technician._id,
                    result: {
                        value: resultValue,
                        unit: unit,
                        isAbnormal: isAbnormal,
                        flag: flag
                    },
                    referenceRange: referenceRange,
                    interpretation: isAbnormal ? 'Result above normal range - clinical correlation recommended' : 'Result within normal limits',
                    comments: isAbnormal ? 'Recommend clinical correlation and possible repeat testing' : '',
                    performedAt: new Date(),
                    verifiedBy: technician._id,
                    verifiedAt: new Date(),
                    status: 'Completed',
                    methodology: 'Automated laboratory analysis',
                    instrument: 'Standard laboratory equipment'
                };

                newResults.push(newResult);
                console.log(`   ✅ Prepared result for ${test.testName}: ${resultValue} ${unit} (${flag})`);
            }
        }

        // 6. Insert new results
        if (newResults.length > 0) {
            const createdResults = await LabResult.insertMany(newResults);
            console.log(`\n🎉 Successfully created ${createdResults.length} lab results with correct testIds`);

            // 7. Verify by checking populate works
            console.log('\n🔍 Verifying populate works...');
            const verifyResults = await LabResult.find({})
                .populate('testId', 'testName category')
                .limit(3);

            verifyResults.forEach((result, index) => {
                console.log(`${index + 1}. Test: ${result.testId?.testName || 'STILL NULL'} | Value: ${result.result.value}`);
            });
        }

        console.log('\n✅ Lab results fix completed!');
        mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error fixing lab results:', error);
        mongoose.connection.close();
    }
}

fixLabResultsTestIds();
