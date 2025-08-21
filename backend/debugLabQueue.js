// Debug full getLabQueue pipeline
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function debugLabQueuePipeline() {
    try {
        console.log('🔍 DEBUGGING getLabQueue PIPELINE\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Full pipeline from getLabQueue
        const status = 'Pending';

        console.log('Step 1: Initial match stage');
        let matchStage = { status };
        let step1 = await mongoose.connection.db.collection('laborders').find(matchStage).toArray();
        console.log(`   Found ${step1.length} orders with status '${status}'`);

        console.log('\nStep 2: After user lookups');
        let pipeline2 = [
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
            }
        ];

        let step2 = await mongoose.connection.db.collection('laborders').aggregate(pipeline2).toArray();
        console.log(`   After lookups: ${step2.length} orders`);

        console.log('\nStep 3: After $unwind tests');
        let pipeline3 = [...pipeline2, { $unwind: '$tests' }];
        let step3 = await mongoose.connection.db.collection('laborders').aggregate(pipeline3).toArray();
        console.log(`   After unwind tests: ${step3.length} test entries`);

        // Show test details
        step3.forEach((entry, index) => {
            console.log(`      Test ${index + 1}: ${entry.tests?.testId} (Order: ${entry.orderNumber || entry._id})`);
        });

        console.log('\nStep 4: After test details lookup');
        let pipeline4 = [
            ...pipeline3,
            {
                $lookup: {
                    from: 'labtests',
                    localField: 'tests.testId',
                    foreignField: '_id',
                    as: 'testDetails'
                }
            },
        ];
        let step4 = await mongoose.connection.db.collection('laborders').aggregate(pipeline4).toArray();
        console.log(`   After test lookup: ${step4.length} entries`);

        // Check for failed lookups
        step4.forEach((entry, index) => {
            const hasTestDetails = entry.testDetails && entry.testDetails.length > 0;
            console.log(`      Entry ${index + 1}: Test details ${hasTestDetails ? 'found' : 'NOT FOUND'} for test ID ${entry.tests?.testId}`);
        });

        console.log('\nStep 5: After $unwind testDetails');
        let pipeline5 = [...pipeline4, { $unwind: '$testDetails' }];
        let step5 = await mongoose.connection.db.collection('laborders').aggregate(pipeline5).toArray();
        console.log(`   After unwind testDetails: ${step5.length} entries`);

        console.log('\nStep 6: After $group (final)');
        let pipeline6 = [
            ...pipeline5,
            {
                $group: {
                    _id: '$_id',
                    orderId: { $first: '$orderId' },
                    patientId: { $first: { $arrayElemAt: ['$patient', 0] } },
                    doctorId: { $first: { $arrayElemAt: ['$doctor', 0] } },
                    orderedAt: { $first: '$orderedAt' },
                    status: { $first: '$status' },
                    clinicalInfo: { $first: '$clinicalInfo' },
                    totalAmount: { $first: '$totalAmount' },
                    tests: {
                        $push: {
                            _id: '$tests._id',
                            testId: '$tests.testId',
                            testName: '$testDetails.testName',
                            category: '$testDetails.category',
                            priority: '$tests.priority',
                            status: '$tests.status',
                            specimen: '$testDetails.specimen',
                            turnaroundTime: '$testDetails.turnaroundTime'
                        }
                    }
                }
            }
        ];

        let step6 = await mongoose.connection.db.collection('laborders').aggregate(pipeline6).toArray();
        console.log(`   Final result: ${step6.length} orders`);

        step6.forEach((order, index) => {
            console.log(`      Order ${index + 1}: ${order.orderId || order._id}`);
            console.log(`         Patient: ${order.patientId?.firstName || 'undefined'} ${order.patientId?.lastName || ''}`);
            console.log(`         Doctor: ${order.doctorId?.firstName || 'undefined'} ${order.doctorId?.lastName || ''}`);
            console.log(`         Tests: ${order.tests?.length || 0}`);
        });

        // Check if there are any missing test IDs
        console.log('\n🔍 MISSING TEST ANALYSIS:');
        const allTestIds = new Set();

        step1.forEach(order => {
            order.tests?.forEach(test => {
                allTestIds.add(test.testId.toString());
            });
        });

        console.log(`   Unique test IDs referenced: ${allTestIds.size}`);

        const existingTests = await mongoose.connection.db.collection('labtests').find({
            _id: { $in: Array.from(allTestIds).map(id => new mongoose.Types.ObjectId(id)) }
        }).toArray();

        console.log(`   Existing tests in database: ${existingTests.length}`);

        if (allTestIds.size !== existingTests.length) {
            const existingTestIds = new Set(existingTests.map(t => t._id.toString()));
            const missingTestIds = Array.from(allTestIds).filter(id => !existingTestIds.has(id));
            console.log(`   ❌ Missing test IDs: ${missingTestIds.length}`);
            missingTestIds.forEach(id => console.log(`      - ${id}`));
        } else {
            console.log(`   ✅ All test IDs found`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugLabQueuePipeline();
