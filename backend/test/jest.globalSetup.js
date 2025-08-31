// test/jest.globalSetup.js
import dotenv from 'dotenv';
import path from 'path';

export default async () => {
    console.log('🔧 Jest Global Setup: Loading environment variables...');

    // Load environment variables from different possible locations
    const possibleEnvPaths = [
        './config/config.env',
        '../config/config.env',
        './backend/config/config.env',
        '.env'
    ];

    let envLoaded = false;

    for (const envPath of possibleEnvPaths) {
        try {
            const result = dotenv.config({ path: envPath });
            if (!result.error) {
                console.log(`✅ Loaded environment from: ${envPath}`);
                envLoaded = true;
                break;
            }
        } catch (error) {
            console.log(`⚠️ Could not load env from: ${envPath}`);
        }
    }

    if (!envLoaded) {
        console.log('⚠️ No environment file found, trying default dotenv...');
        dotenv.config();
    }

    // Set essential environment variables for testing
    process.env.NODE_ENV = 'test';

    // Ensure JWT_SECRET exists for tests
    if (!process.env.JWT_SECRET) {
        console.log('⚠️ JWT_SECRET not found, setting fallback for tests');
        process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-not-for-production';
    }

    // Set test database URI if not provided
    if (!process.env.TEST_MONGODB_URI && process.env.MONGO_URI) {
        process.env.TEST_MONGODB_URI = process.env.MONGO_URI.replace('hospitalDB', 'hospitalDB_test');
    }

    console.log('✅ Jest Global Setup Complete');
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('- MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('- TEST_MONGODB_URI exists:', !!process.env.TEST_MONGODB_URI);
};