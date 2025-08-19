import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dbConnection } from '../database/dbConnection.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';
import { LabTest } from '../models/labTest.model.js';
import { User } from '../models/userScheme.js';

// Load environment variables
dotenv.config();

async function createTestLabResults() {
    try {
        await dbConnection();
        console.log('✅ Connected to MongoDB');

        // Find lab orders with completed tests
        const orders = await LabOrder.find({ status: 'Pending' })
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .limit(5);

        if (!orders.length) {
            console.log('❌ No lab orders found. Please create some lab orders first.');
            process.exit(1);
        }

        // Find technicians
        const technicians = await User.find({ role: 'Admin' }); // Use Admin as technician for testing
        if (!technicians.length) {
            console.log('❌ No technicians found');
            process.exit(1);
        }

        console.log(`📋 Found ${orders.length} lab orders`);
        console.log(`👨‍🔬 Found ${technicians.length} technicians`);

        const labResults = [];

        for (const order of orders) {
            console.log(`\n🔬 Processing order ${order.orderId}...`);

            // Update some tests to completed status and create results
            for (let i = 0; i < order.tests.length; i++) {
                const test = order.tests[i];

                // Mark 70% of tests as completed
                if (Math.random() < 0.7) {
                    // Update test status to completed
                    await LabOrder.updateOne(
                        { _id: order._id, 'tests._id': test._id },
                        {
                            $set: {
                                'tests.$.status': 'Completed',
                                'tests.$.completedAt': new Date()
                            }
                        }
                    );

                    // Get test details
                    const testDetails = await LabTest.findById(test.testId);
                    if (!testDetails) continue;

                    const technician = technicians[Math.floor(Math.random() * technicians.length)];

                    // Generate realistic results based on test type
                    let resultValue, isAbnormal = false, flag = 'Normal';
                    let unit = testDetails.normalRange?.unit || '';

                    switch (testDetails.testName) {
                        case 'Complete Blood Count (CBC)':
                            if (Math.random() < 0.8) {
                                resultValue = (12 + Math.random() * 4).toFixed(1); // Normal: 12-16 g/dL
                                unit = 'g/dL';
                            } else {
                                isAbnormal = true;
                                resultValue = Math.random() < 0.5 ? (8 + Math.random() * 3).toFixed(1) : (17 + Math.random() * 3).toFixed(1);
                                flag = resultValue < 12 ? 'Low' : 'High';
                                unit = 'g/dL';
                            }
                            break;

                        case 'Fasting Blood Glucose':
                            if (Math.random() < 0.8) {
                                resultValue = (70 + Math.random() * 30).toFixed(0); // Normal: 70-100 mg/dL
                                unit = 'mg/dL';
                            } else {
                                isAbnormal = true;
                                resultValue = Math.random() < 0.5 ? (50 + Math.random() * 19).toFixed(0) : (126 + Math.random() * 50).toFixed(0);
                                flag = resultValue < 70 ? 'Low' : 'High';
                                unit = 'mg/dL';
                            }
                            break;

                        case 'Erythrocyte Sedimentation Rate (ESR)':
                            if (Math.random() < 0.8) {
                                resultValue = (2 + Math.random() * 18).toFixed(0); // Normal: 2-20 mm/hr
                                unit = 'mm/hr';
                            } else {
                                isAbnormal = true;
                                resultValue = (21 + Math.random() * 29).toFixed(0); // High: >20
                                flag = 'High';
                                unit = 'mm/hr';
                            }
                            break;

                        default:
                            resultValue = 'Normal';
                            flag = 'Normal';
                    }

                    // Generate reference range
                    let referenceRange = testDetails.normalRange?.textRange || '';
                    if (!referenceRange && testDetails.normalRange?.min !== null && testDetails.normalRange?.max !== null) {
                        referenceRange = `${testDetails.normalRange.min}-${testDetails.normalRange.max} ${testDetails.normalRange.unit || ''}`;
                    }

                    const interpretations = {
                        'Normal': 'Result within normal limits',
                        'High': 'Result above normal range - clinical correlation recommended',
                        'Low': 'Result below normal range - clinical correlation recommended',
                        'Critical': 'Critical value - immediate clinical attention required'
                    };

                    const methodologies = {
                        'Hematology': 'Automated cell counter with manual differential',
                        'Chemistry': 'Automated chemistry analyzer',
                        'Microbiology': 'Culture and sensitivity testing',
                        'Immunology': 'Enzyme immunoassay (EIA)',
                        'Pathology': 'Microscopic examination',
                        'Radiology': 'Digital imaging'
                    };

                    const instruments = {
                        'Hematology': 'Sysmex XN-1000',
                        'Chemistry': 'Beckman Coulter AU680',
                        'Microbiology': 'BD Phoenix M50',
                        'Immunology': 'Abbott Architect i2000SR',
                        'Pathology': 'Olympus BX46',
                        'Radiology': 'GE Revolution CT'
                    };

                    const labResult = {
                        orderId: order._id,
                        testId: test.testId,
                        patientId: order.patientId._id,
                        technicianId: technician._id,
                        result: {
                            value: resultValue,
                            unit: unit,
                            isAbnormal: isAbnormal,
                            flag: flag
                        },
                        referenceRange: referenceRange,
                        interpretation: interpretations[flag] || '',
                        comments: isAbnormal ? 'Recommend clinical correlation and possible repeat testing' : '',
                        performedAt: new Date(),
                        verifiedBy: Math.random() > 0.3 ? technician._id : null, // 70% verified
                        verifiedAt: Math.random() > 0.3 ? new Date() : null,
                        status: Math.random() > 0.1 ? 'Completed' : 'Reviewed', // 90% completed, 10% reviewed
                        methodology: methodologies[testDetails.category] || 'Standard laboratory methodology',
                        instrument: instruments[testDetails.category] || 'Standard laboratory instrument'
                    };

                    labResults.push(labResult);
                    console.log(`   ✅ Created result for ${testDetails.testName}: ${resultValue} ${unit} (${flag})`);
                }
            }
        }

        if (labResults.length > 0) {
            const createdResults = await LabResult.insertMany(labResults);
            console.log(`\n🎉 Successfully created ${createdResults.length} lab results`);

            // Show sample results
            console.log('\n📊 Sample results created:');
            for (const result of createdResults.slice(0, 3)) {
                const testInfo = await LabTest.findById(result.testId);
                const order = await LabOrder.findById(result.orderId);
                console.log(`   📋 Order: ${order?.orderId} | Test: ${testInfo?.testName} | Result: ${result.result.value} ${result.result.unit} (${result.result.flag})`);
            }

            // Update order status if all tests are completed
            for (const order of orders) {
                const updatedOrder = await LabOrder.findById(order._id);
                const allCompleted = updatedOrder.tests.every(test =>
                    ['Completed', 'Cancelled'].includes(test.status)
                );

                if (allCompleted) {
                    updatedOrder.status = 'Completed';
                    updatedOrder.completedAt = new Date();
                    await updatedOrder.save();
                    console.log(`   ✅ Updated order ${updatedOrder.orderId} status to Completed`);
                }
            }
        } else {
            console.log('❌ No lab results created');
        }

        console.log('\n✅ Lab results creation completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating lab results:', error);
        process.exit(1);
    }
}

createTestLabResults();
