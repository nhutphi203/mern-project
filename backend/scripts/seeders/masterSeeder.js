import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config({ path: './config/config.env' });

// Import all seeders
import { seedUsers } from './userSeeder.js';
import { seedLabTests } from './labTestSeeder.js';
import { seedAppointments } from './appointmentSeeder.js';
import { seedEncounters } from './encounterSeeder.js';
import { seedLabOrders } from './labOrderSeeder.js';
import { seedLabResults } from './labResultSeeder.js';

// Connect to database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "hospitalDB",
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB connected for seeding");
        return true;
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error}`);
        return false;
    }
}

async function runAllSeeders() {
    // Check if the connection was successful
    if (!await connectDB()) {
        process.exit(1);
    }

    try {
        console.log("🌱 Starting comprehensive database seeding process...\n");

        // Step 1: Seed Users (must be first as other models depend on users)
        console.log("📋 Step 1: Seeding users...");
        const users = await seedUsers();
        console.log(`   Created: ${Object.values(users).flat().length} users total\n`);

        // Step 2: Seed Lab Tests (needed for lab orders)
        console.log("🧪 Step 2: Seeding lab tests...");
        await seedLabTests();
        const labTests = await mongoose.model('LabTest').find({});
        console.log(`   Created: ${labTests.length} lab tests\n`);

        // Step 3: Seed Appointments (needed for encounters)
        console.log("📅 Step 3: Seeding appointments...");
        const appointments = await seedAppointments(users);
        console.log(`   Created: ${appointments.length} appointments\n`);

        // Step 4: Seed Encounters (needed for lab orders)
        console.log("🏥 Step 4: Seeding encounters...");
        const encounters = await seedEncounters(appointments, users);
        console.log(`   Created: ${encounters.length} encounters\n`);

        // Step 5: Seed Lab Orders (needed for lab results)
        console.log("📋 Step 5: Seeding lab orders...");
        const labOrders = await seedLabOrders(encounters, users, labTests);
        console.log(`   Created: ${labOrders.length} lab orders\n`);

        // Step 6: Seed Lab Results (depends on lab orders)
        console.log("🔬 Step 6: Seeding lab results...");
        const labResults = await seedLabResults(labOrders, users, labTests);
        console.log(`   Created: ${labResults.length} lab results\n`);

        // Summary
        console.log("📊 SEEDING SUMMARY:");
        console.log("===================");
        console.log(`👥 Users: ${Object.values(users).flat().length}`);
        console.log(`   - Patients: ${users.patients.length}`);
        console.log(`   - Doctors: ${users.doctors.length}`);
        console.log(`   - Technicians: ${users.technicians.length}`);
        console.log(`   - Lab Supervisors: ${users.labSupervisors.length}`);
        console.log(`   - Receptionists: ${users.receptionists.length}`);
        console.log(`   - Admins: ${users.admins.length}`);
        console.log(`   - Billing Staff: ${users.billingStaff.length}`);
        console.log(`🧪 Lab Tests: ${labTests.length}`);
        console.log(`📅 Appointments: ${appointments.length}`);
        console.log(`🏥 Encounters: ${encounters.length}`);
        console.log(`📋 Lab Orders: ${labOrders.length}`);
        console.log(`🔬 Lab Results: ${labResults.length}`);

        console.log("\n✅ All seeding completed successfully!");
        console.log("🚀 Your Lab Management system is now ready with sample data!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        console.error("Stack trace:", error.stack);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
}

// Run the master seeder
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runAllSeeders();
}

export default runAllSeeders;
