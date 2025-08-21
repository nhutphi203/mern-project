// Fix missing lab tests and doctor assignments
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function fixLabData() {
    try {
        console.log('🔧 FIXING LAB DATA ISSUES\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. First, let's check the missing test IDs and create them
        const missingTestIds = [
            '689de420d951427b1456dae5',
            '689de420d951427b1456dae6',
            '689de420d951427b1456dae7'
        ];

        console.log('1. Creating missing lab tests...');

        const labTestsToCreate = [
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
            },
            {
                _id: new mongoose.Types.ObjectId('689de420d951427b1456dae7'),
                testName: 'Fasting Blood Glucose',
                testCode: 'FBG001',
                category: 'Chemistry',
                description: 'Measures blood sugar level after fasting',
                normalRange: '70-100 mg/dL',
                unit: 'mg/dL',
                price: 12,
                turnaroundTime: '1 hour',
                specimen: 'Blood',
                instructions: 'Instructions for Fasting Blood Glucose',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Insert the missing lab tests
        for (const test of labTestsToCreate) {
            try {
                await mongoose.connection.db.collection('labtests').insertOne(test);
                console.log(`   ✅ Created test: ${test.testName} (${test.testCode})`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`   ⚠️  Test already exists: ${test.testName}`);
                } else {
                    console.error(`   ❌ Error creating test ${test.testName}:`, error);
                }
            }
        }

        // 2. Now let's check and fix the doctor assignments
        console.log('\n2. Checking doctor assignments...');

        // Find Dr. Thanh Sơn's ID
        const drThanhSon = await mongoose.connection.db.collection('users').findOne({
            firstName: 'Thanh',
            lastName: 'Sơn',
            role: 'Doctor'
        });

        if (drThanhSon) {
            console.log(`   ✅ Found Dr. Thanh Sơn: ${drThanhSon._id}`);

            // Find encounter with Dr. Thanh Sơn that should have lab orders
            const encounterWithThanhSon = await mongoose.connection.db.collection('encounters').findOne({
                'appointmentId.doctorId': drThanhSon._id,
                status: 'InProgress'
            });

            if (encounterWithThanhSon) {
                console.log(`   ✅ Found InProgress encounter with Dr. Thanh Sơn: ${encounterWithThanhSon._id}`);

                // Check if there are lab orders that should be assigned to this encounter
                const pendingLabOrders = await mongoose.connection.db.collection('laborders').find({
                    status: 'Pending'
                }).toArray();

                console.log(`   Found ${pendingLabOrders.length} pending lab orders`);

                // Let's assign one of the pending orders to Dr. Thanh Sơn's encounter
                if (pendingLabOrders.length > 0) {
                    const orderToUpdate = pendingLabOrders[0]; // Take the first one

                    await mongoose.connection.db.collection('laborders').updateOne(
                        { _id: orderToUpdate._id },
                        {
                            $set: {
                                doctorId: drThanhSon._id,
                                encounterId: encounterWithThanhSon._id
                            }
                        }
                    );

                    console.log(`   ✅ Updated lab order ${orderToUpdate.orderNumber} to be assigned to Dr. Thanh Sơn`);
                }
            }
        } else {
            console.log('   ❌ Dr. Thanh Sơn not found');
        }

        // 3. Verify the fix
        console.log('\n3. Verifying fixes...');

        // Check lab tests count
        const labTestsCount = await mongoose.connection.db.collection('labtests').countDocuments();
        console.log(`   Lab tests in database: ${labTestsCount}`);

        // Check pending orders again
        const pendingOrders = await mongoose.connection.db.collection('laborders').find({
            status: 'Pending'
        }).toArray();

        console.log(`   Pending lab orders: ${pendingOrders.length}`);
        pendingOrders.forEach(order => {
            console.log(`      ${order.orderNumber} - Doctor ID: ${order.doctorId}`);
        });

        console.log('\n✅ Lab data fixes completed!');
        console.log('   Recommendation: Restart backend and check lab queue again');

    } catch (error) {
        console.error('❌ Error fixing lab data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixLabData();
