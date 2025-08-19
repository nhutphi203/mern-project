// backend/scripts/seed.js
import mongoose from "mongoose";
import { config } from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
config({ path: "./config/config.env" });

// Setup directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "hospitalDB" });
        console.log("✅ MongoDB connected for seeding");
        return true;
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error}`);
        return false;
    }
}

async function runSeeders() {
    // Check if the connection was successful
    if (!await connectDB()) {
        process.exit(1);
    }

    try {
        console.log("🌱 Starting database seeding process...");

        // Get users from existing seeder or create them
        // First we need to import the user seeder dynamically
        const usersModule = await import('./seeders/userData.js');
        const users = await usersModule.seedUsers();

        console.log(`Created ${users?.length || 0} users`);

        // Extract IDs by role for relationships
        const patientIds = users.filter(u => u.role === 'Patient').map(u => u._id);
        const doctorIds = users.filter(u => u.role === 'Doctor').map(u => u._id);
        const technicianIds = users.filter(u => u.role === 'Technician').map(u => u._id);

        // Import and run lab data seeder
        const labDataModule = await import('./seeders/labData.js');

        // Import the comprehensive lab test seeder
        const labTestSeederModule = await import('./seeders/labTestSeeder.js');
        await labTestSeederModule.seedLabTests();

        // Only seed lab data if we have users to assign it to
        if (patientIds.length && doctorIds.length && technicianIds.length) {
            await labDataModule.seedLabData(patientIds, doctorIds, technicianIds);
        } else {
            console.warn("⚠️ Could not seed lab data: Missing required user roles");
        }

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
}

// Run the seeder
runSeeders();
