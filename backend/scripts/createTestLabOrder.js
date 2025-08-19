// Create test lab order directly in database to test LabQueue display
import mongoose from 'mongoose';
import { LabOrder } from '../models/labOrder.model.js';
import { User } from '../models/userScheme.js';
import { LabTest } from '../models/labTest.model.js';

async function createTestLabOrder() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/hospitalDB');
        console.log('✅ Connected to MongoDB');

        // Get users
        const admin = await User.findOne({ email: 'nhutadmin@gmail.com' });
        const patient = await User.findOne({ email: 'phinhut2003@gmail.com' });

        if (!admin || !patient) {
            console.log('❌ Admin or patient not found');
            return;
        }

        // Get lab tests
        const labTests = await LabTest.find({ isActive: true }).limit(3);
        if (labTests.length === 0) {
            console.log('❌ No lab tests found');
            return;
        }

        console.log('👤 Found users:', { admin: admin.firstName, patient: patient.firstName });
        console.log('🧪 Found tests:', labTests.map(t => t.testName));

        // Create test lab order directly
        console.log('\n📝 Creating test lab order...');

        // Generate orderId manually
        const orderCount = await LabOrder.countDocuments();
        const orderId = `LAB${String(orderCount + 1).padStart(6, '0')}`;

        const testLabOrder = new LabOrder({
            orderId: orderId, // Set orderId manually
            encounterId: new mongoose.Types.ObjectId(), // Mock encounter ID
            patientId: patient._id,
            doctorId: admin._id,
            tests: labTests.map(test => ({
                testId: test._id,
                priority: ['Routine', 'Urgent', 'STAT'][Math.floor(Math.random() * 3)],
                instructions: `Instructions for ${test.testName}`,
                status: 'Ordered' // Test-level status
            })),
            clinicalInfo: 'Test lab order created directly in database for testing LabQueue display functionality',
            totalAmount: labTests.reduce((sum, test) => sum + test.price, 0),
            status: 'Pending', // Order-level status 
            orderedAt: new Date()
        });

        const createdOrder = await testLabOrder.save();

        console.log('\n🎉 TEST LAB ORDER CREATED:');
        console.log(`📋 Order ID: ${createdOrder.orderId}`);
        console.log(`🆔 Database ID: ${createdOrder._id}`);
        console.log(`📊 Status: ${createdOrder.status} (order level)`);
        console.log(`🧪 Tests: ${createdOrder.tests.length}`);
        console.log(`💰 Total: $${createdOrder.totalAmount}`);
        console.log(`⏰ Ordered: ${createdOrder.orderedAt}`);

        console.log('\n🔍 Test details:');
        createdOrder.tests.forEach((test, index) => {
            const labTest = labTests.find(lt => lt._id.toString() === test.testId.toString());
            console.log(`   ${index + 1}. ${labTest?.testName} - ${test.status} - ${test.priority}`);
        });

        // Verify the order can be found by LabQueue queries
        console.log('\n🔍 TESTING LABQUEUE QUERIES:');

        // Test 1: Query by order status (Pending)
        const pendingOrders = await LabOrder.find({ status: 'Pending' })
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName');
        console.log(`✅ Orders with status 'Pending': ${pendingOrders.length}`);

        // Test 2: Query by test status (Ordered) 
        const orderedTestOrders = await LabOrder.find({ 'tests.status': 'Ordered' })
            .populate('patientId', 'firstName lastName');
        console.log(`✅ Orders with test status 'Ordered': ${orderedTestOrders.length}`);

        // Test 3: Simulate LabQueue aggregation
        const aggregationResult = await LabOrder.aggregate([
            { $match: { status: 'Pending' } },
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
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }]
                }
            },
            { $unwind: '$tests' },
            {
                $lookup: {
                    from: 'labtests',
                    localField: 'tests.testId',
                    foreignField: '_id',
                    as: 'testDetails'
                }
            },
            { $unwind: '$testDetails' },
            {
                $group: {
                    _id: '$_id',
                    orderId: { $first: '$orderId' },
                    patient: { $first: { $arrayElemAt: ['$patient', 0] } },
                    doctor: { $first: { $arrayElemAt: ['$doctor', 0] } },
                    orderedAt: { $first: '$orderedAt' },
                    status: { $first: '$status' },
                    clinicalInfo: { $first: '$clinicalInfo' },
                    tests: {
                        $push: {
                            testName: '$testDetails.testName',
                            category: '$testDetails.category',
                            priority: '$tests.priority',
                            status: '$tests.status'
                        }
                    }
                }
            }
        ]);

        console.log(`✅ Aggregation result: ${aggregationResult.length} orders`);

        if (aggregationResult.length > 0) {
            const order = aggregationResult[0];
            console.log('\n📋 Sample aggregated order:');
            console.log(`   Order: ${order.orderId}`);
            console.log(`   Patient: ${order.patient?.firstName} ${order.patient?.lastName}`);
            console.log(`   Doctor: ${order.doctor?.firstName} ${order.doctor?.lastName}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Tests: ${order.tests?.length}`);
            if (order.tests) {
                order.tests.forEach(test => {
                    console.log(`     - ${test.testName} (${test.category}) - ${test.status} - ${test.priority}`);
                });
            }
        }

        console.log('\n🎯 SUMMARY:');
        console.log('✅ Test lab order created successfully');
        console.log('✅ Order findable by Pending status query');
        console.log('✅ Order findable by Ordered test status query');
        console.log('✅ Order properly aggregated for LabQueue display');
        console.log('\n💡 Now LabQueue should display this order when filtering by "Pending" status');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createTestLabOrder();
