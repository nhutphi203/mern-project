// Fix doctor assignments for lab orders
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function fixDoctorAssignments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find Dr. Thanh Sơn
        const drThanhSon = await mongoose.connection.db.collection('users').findOne({
            firstName: 'Thanh',
            lastName: 'Sơn',
            role: 'Doctor'
        });

        // Find Dr. Ngọc Hà
        const drNgocHa = await mongoose.connection.db.collection('users').findOne({
            firstName: 'Ngọc',
            lastName: 'Hà',
            role: 'Doctor'
        });

        console.log(`Dr. Thanh Sơn ID: ${drThanhSon?._id}`);
        console.log(`Dr. Ngọc Hà ID: ${drNgocHa?._id}`);

        // Update lab orders to assign to different doctors
        const pendingOrders = await mongoose.connection.db.collection('laborders').find({
            status: 'Pending'
        }).toArray();

        console.log(`\nUpdating ${pendingOrders.length} pending lab orders:`);

        for (let i = 0; i < pendingOrders.length; i++) {
            const order = pendingOrders[i];
            let doctorToAssign;

            if (i === 0) {
                // First order to Dr. Thanh Sơn
                doctorToAssign = drThanhSon;
            } else {
                // Rest to Dr. Ngọc Hà
                doctorToAssign = drNgocHa;
            }

            await mongoose.connection.db.collection('laborders').updateOne(
                { _id: order._id },
                {
                    $set: {
                        doctorId: doctorToAssign._id
                    }
                }
            );

            console.log(`   ✅ ${order.orderNumber} → Dr. ${doctorToAssign.firstName} ${doctorToAssign.lastName}`);
        }

        // Verify changes
        console.log('\n📊 Verification:');
        const updatedOrders = await mongoose.connection.db.collection('laborders').find({
            status: 'Pending'
        }).toArray();

        for (const order of updatedOrders) {
            const doctor = await mongoose.connection.db.collection('users').findOne({
                _id: order.doctorId
            });
            console.log(`   ${order.orderNumber} - Dr. ${doctor.firstName} ${doctor.lastName}`);
        }

        console.log('\n✅ Doctor assignments updated!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixDoctorAssignments();
