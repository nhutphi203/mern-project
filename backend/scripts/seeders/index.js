import mongoose from 'mongoose';
import { config } from 'dotenv';
import { seedLabTests } from './labTestSeeder.js';
import { seedInsuranceProviders } from './insuranceSeeder.js';

// Load environment variables
config({ path: '../config/config.env' });

const runSeeders = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "hospitalDB"
        });
        console.log('📦 Connected to MongoDB for seeding...');

        // Run all seeders
        console.log('🌱 Starting database seeding...');

        const labTestsResult = await seedLabTests();
        const insuranceResult = await seedInsuranceProviders();

        if (labTestsResult && insuranceResult) {
            console.log('🎉 All seeders completed successfully!');
        } else {
            console.log('⚠️  Some seeders failed. Check logs above.');
        }

    } catch (error) {
        console.error('💥 Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runSeeders();
}

export { runSeeders };