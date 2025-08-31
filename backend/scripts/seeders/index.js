// scripts/seeders/index.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedLabTests } from './labTestSeeder.js';
import { seedInsuranceProviders } from './insuranceSeeder.js';

dotenv.config({ path: 'config/config.env' });

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
};

const runSeeders = async () => {
    await connectDB();

    try {
        await seedLabTests();
        await seedInsuranceProviders();
        console.log('🎉 All seeders completed successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
};

runSeeders();
