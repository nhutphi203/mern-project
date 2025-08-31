// Check if there are lab orders in database and test the complete flow
import mongoose from 'mongoose';
import { LabOrder } from '../models/labOrder.model.js';
import { User } from '../models/userScheme.js';
import { LabTest } from '../models/labTest.model.js';

async function checkLabOrdersFlow() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/hospitalDB');
        console.log('✅ Connected to MongoDB');

        console.log('\n🔍 CHECKING DATABASE CONTENT:');

        // 1. Check existing lab orders
        const existingOrders = await LabOrder.find().populate('patientId', 'firstName lastName').populate('doctorId', 'firstName lastName');
        console.log(`📋 Existing Lab Orders: ${existingOrders.length}`);

        if (existingOrders.length > 0) {
            existingOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. Order #${order.orderId} - Status: ${order.status} - Patient: ${order.patientId?.firstName} ${order.patientId?.lastName} - Tests: ${order.tests?.length}`);
                if (order.tests && order.tests.length > 0) {
                    order.tests.forEach(test => {
                        console.log(`      - Test Status: ${test.status}, Priority: ${test.priority}`);
                    });
                }
            });
        }

        // 2. Check users
        const adminUser = await User.findOne({ email: 'nhutadmin@gmail.com' });
        const patientUser = await User.findOne({ email: 'phinhut2003@gmail.com' });
        console.log(`\n👤 Admin User: ${adminUser ? '✅ Found' : '❌ Not found'}`);
        console.log(`👤 Patient User: ${patientUser ? '✅ Found' : '❌ Not found'}`);

        // 3. Check lab tests
        const labTests = await LabTest.find({ isActive: true });
        console.log(`🧪 Available Lab Tests: ${labTests.length}`);
        if (labTests.length > 0) {
            console.log('   Categories:', [...new Set(labTests.map(t => t.category))]);
        }

        console.log('\n🔄 TESTING FLOW COMPATIBILITY:');

        // 4. Simulate what LabOrderForm sends
        const simulatedLabOrderData = {
            encounterId: new mongoose.Types.ObjectId(),
            patientId: patientUser?._id,
            tests: labTests.slice(0, 2).map(test => ({
                testId: test._id,
                priority: 'Routine',
                instructions: 'Test instructions'
            })),
            clinicalInfo: 'Patient presenting with routine screening request'
        };

        console.log('📤 LabOrderForm would send:', {
            encounterId: 'ObjectId',
            patientId: simulatedLabOrderData.patientId ? 'Valid' : 'Missing',
            testsCount: simulatedLabOrderData.tests.length,
            clinicalInfo: simulatedLabOrderData.clinicalInfo ? 'Present' : 'Missing'
        });

        // 5. Check what query LabQueue makes
        console.log('\n📥 LabQueue queries:');

        // Query with Pending status (order-level)
        const pendingOrders = await LabOrder.find({ status: 'Pending' });
        console.log(`   Orders with status 'Pending': ${pendingOrders.length}`);

        // Query with Ordered status (test-level)
        const orderedTestOrders = await LabOrder.find({ 'tests.status': 'Ordered' });
        console.log(`   Orders with test status 'Ordered': ${orderedTestOrders.length}`);

        // 6. Test aggregation pipeline similar to getLabQueue
        console.log('\n🔍 Testing LabQueue aggregation:');
        const aggregationResult = await LabOrder.aggregate([
            { $match: { status: 'Pending' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            { $limit: 5 }
        ]);
        console.log(`   Aggregation result count: ${aggregationResult.length}`);

        console.log('\n✅ Database check completed');

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkLabOrdersFlow();
