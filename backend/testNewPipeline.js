// Test new lab queue pipeline
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function testNewPipeline() {
    try {
        console.log('🔍 TESTING NEW LAB QUEUE PIPELINE\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // New pipeline from the fixed controller
        const status = 'Pending';
        let matchStage = { status };

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, dob: 1, gender: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, doctorDepartment: 1 } }]
                }
            },
            {
                $addFields: {
                    tests: {
                        $map: {
                            input: '$tests',
                            as: 'test',
                            in: {
                                _id: '$$test._id',
                                testId: '$$test.testId',
                                priority: '$$test.priority',
                                status: '$$test.status',
                                instructions: '$$test.instructions'
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'labtests',
                    let: { testIds: '$tests.testId' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$testIds'] } } },
                        { $project: { testName: 1, category: 1, specimen: 1, turnaroundTime: 1 } }
                    ],
                    as: 'testDetails'
                }
            },
            {
                $addFields: {
                    tests: {
                        $map: {
                            input: '$tests',
                            as: 'test',
                            in: {
                                $mergeObjects: [
                                    '$$test',
                                    {
                                        $let: {
                                            vars: {
                                                testDetail: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$testDetails',
                                                                cond: { $eq: ['$$this._id', '$$test.testId'] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: {
                                                testName: { $ifNull: ['$$testDetail.testName', 'Unknown Test'] },
                                                category: { $ifNull: ['$$testDetail.category', 'Unknown'] },
                                                specimen: { $ifNull: ['$$testDetail.specimen', 'Unknown'] },
                                                turnaroundTime: { $ifNull: ['$$testDetail.turnaroundTime', 'Unknown'] }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    orderNumber: 1,
                    patientId: { $arrayElemAt: ['$patient', 0] },
                    doctorId: { $arrayElemAt: ['$doctor', 0] },
                    orderedAt: 1,
                    status: 1,
                    clinicalInfo: 1,
                    totalAmount: 1,
                    tests: 1
                }
            },
            {
                $sort: {
                    'tests.priority': 1,
                    orderedAt: 1
                }
            }
        ];

        const result = await mongoose.connection.db.collection('laborders').aggregate(pipeline).toArray();

        console.log(`📊 PIPELINE RESULT: ${result.length} orders found`);

        result.forEach((order, index) => {
            console.log(`\n   Order ${index + 1}: ${order.orderNumber || order._id}`);
            console.log(`      Patient: ${order.patientId?.firstName || 'undefined'} ${order.patientId?.lastName || ''}`);
            console.log(`      Doctor: ${order.doctorId?.firstName || 'undefined'} ${order.doctorId?.lastName || ''}`);
            console.log(`      Status: ${order.status}`);
            console.log(`      Tests: ${order.tests?.length || 0}`);

            if (order.tests && order.tests.length > 0) {
                order.tests.forEach((test, testIndex) => {
                    console.log(`         Test ${testIndex + 1}: ${test.testName || 'Unknown'} (${test.category || 'Unknown'})`);
                });
            }
        });

        console.log('\n🎯 ANALYSIS:');
        if (result.length === 3) {
            console.log('   ✅ All 3 pending orders returned - FIXED!');
        } else {
            console.log(`   ❌ Still missing orders: expected 3, got ${result.length}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testNewPipeline();
