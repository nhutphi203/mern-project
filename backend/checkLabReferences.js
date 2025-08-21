// Check lab orders and their patient/doctor references
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function checkLabReferences() {
    try {
        console.log('🔍 CHECKING LAB ORDER REFERENCES\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all lab orders with references
        const labOrders = await mongoose.connection.db.collection('laborders').find({}).toArray();

        console.log('📋 LAB ORDERS ANALYSIS:');
        console.log(`   Total Lab Orders: ${labOrders.length}\n`);

        for (const order of labOrders) {
            console.log(`Order: ${order.orderNumber || order._id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Patient ID: ${order.patientId}`);
            console.log(`   Doctor ID: ${order.doctorId}`);

            // Check if patient exists
            if (order.patientId) {
                const patient = await mongoose.connection.db.collection('users').findOne({ _id: order.patientId });
                console.log(`   Patient: ${patient ? `${patient.firstName} ${patient.lastName}` : '❌ NOT FOUND'}`);
            } else {
                console.log(`   Patient: ❌ NO PATIENT ID`);
            }

            // Check if doctor exists
            if (order.doctorId) {
                const doctor = await mongoose.connection.db.collection('users').findOne({ _id: order.doctorId });
                console.log(`   Doctor: ${doctor ? `${doctor.firstName} ${doctor.lastName}` : '❌ NOT FOUND'}`);
            } else {
                console.log(`   Doctor: ❌ NO DOCTOR ID`);
            }

            console.log(`   Created: ${order.createdAt?.toLocaleDateString()}\n`);
        }

        // Check for orphaned references
        const allPatientIds = [...new Set(labOrders.map(o => o.patientId).filter(Boolean))];
        const allDoctorIds = [...new Set(labOrders.map(o => o.doctorId).filter(Boolean))];

        console.log('🔗 REFERENCE CHECK:');
        console.log(`   Unique Patient IDs in lab orders: ${allPatientIds.length}`);
        console.log(`   Unique Doctor IDs in lab orders: ${allDoctorIds.length}`);

        // Check missing patients
        const existingPatients = await mongoose.connection.db.collection('users').find({
            _id: { $in: allPatientIds }
        }).toArray();

        const missingPatientIds = allPatientIds.filter(id =>
            !existingPatients.find(p => p._id.toString() === id.toString())
        );

        if (missingPatientIds.length > 0) {
            console.log(`   ❌ Missing Patients: ${missingPatientIds.length}`);
            missingPatientIds.forEach(id => console.log(`      - ${id}`));
        } else {
            console.log(`   ✅ All patients found`);
        }

        // Check missing doctors
        const existingDoctors = await mongoose.connection.db.collection('users').find({
            _id: { $in: allDoctorIds }
        }).toArray();

        const missingDoctorIds = allDoctorIds.filter(id =>
            !existingDoctors.find(d => d._id.toString() === id.toString())
        );

        if (missingDoctorIds.length > 0) {
            console.log(`   ❌ Missing Doctors: ${missingDoctorIds.length}`);
            missingDoctorIds.forEach(id => console.log(`      - ${id}`));
        } else {
            console.log(`   ✅ All doctors found`);
        }

        // Test the exact query from getLabQueue
        console.log('\n🧪 TESTING getLabQueue AGGREGATION:');

        const pipeline = [
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
                    pipeline: [{ $project: { firstName: 1, lastName: 1, doctorDepartment: 1 } }]
                }
            },
            {
                $project: {
                    orderNumber: 1,
                    status: 1,
                    patient: 1,
                    doctor: 1,
                    patientId: { $arrayElemAt: ['$patient', 0] },
                    doctorId: { $arrayElemAt: ['$doctor', 0] }
                }
            }
        ];

        const testResult = await mongoose.connection.db.collection('laborders').aggregate(pipeline).toArray();

        console.log(`   Found ${testResult.length} pending orders:`);
        testResult.forEach(order => {
            console.log(`      ${order.orderNumber || order._id}`);
            console.log(`         Patient Array: ${order.patient.length} items`);
            console.log(`         Doctor Array: ${order.doctor.length} items`);
            console.log(`         PatientId: ${order.patientId ? 'Found' : 'undefined'}`);
            console.log(`         DoctorId: ${order.doctorId ? 'Found' : 'undefined'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLabReferences();
