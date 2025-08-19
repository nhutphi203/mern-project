// Quick database check for lab orders
import mongoose from 'mongoose';

// Connect to MongoDB
async function checkDatabase() {
    console.log('🔍 Checking database for lab orders...\n');

    try {
        await mongoose.connect('mongodb://localhost:27017/hospitalDB');
        console.log('✅ Connected to database');

        // Get collection directly
        const labOrders = await mongoose.connection.collection('laborders').find({}).toArray();
        console.log('\n📊 Lab Orders in database:', labOrders.length);

        if (labOrders.length > 0) {
            console.log('\n📋 Orders found:');
            labOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. Order #${order.orderId || order._id}`);
                console.log(`      Status: ${order.status}`);
                console.log(`      Patient: ${order.patientId}`);
                console.log(`      Tests: ${order.tests?.length || 0}`);
                console.log(`      Created: ${order.createdAt}`);
                console.log('');
            });
        } else {
            console.log('❌ No lab orders found in database');
            console.log('   This explains why LabQueue shows no data');
        }

        // Check users
        const users = await mongoose.connection.collection('users').find({}).toArray();
        console.log('\n👥 Users in database:', users.length);

        const doctors = users.filter(u => u.role === 'Doctor');
        const patients = users.filter(u => u.role === 'Patient');
        const admins = users.filter(u => u.role === 'Admin');

        console.log(`   - Doctors: ${doctors.length}`);
        console.log(`   - Patients: ${patients.length}`);
        console.log(`   - Admins: ${admins.length}`);

        // Check encounters
        const encounters = await mongoose.connection.collection('encounters').find({}).toArray();
        console.log('\n🏥 Encounters in database:', encounters.length);

        // Check lab tests
        const labTests = await mongoose.connection.collection('labtests').find({}).toArray();
        console.log('\n🧪 Lab Tests in database:', labTests.length);

        if (labTests.length > 0) {
            console.log('   Categories:', [...new Set(labTests.map(t => t.category))]);
        }

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
