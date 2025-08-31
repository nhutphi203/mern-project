// scripts/check-env.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const checkEnvironment = () => {
    console.log('🔍 Checking environment configuration...\n');

    // Load environment variables
    const envPath = './config/config.env';

    if (!fs.existsSync(envPath)) {
        console.error('❌ Environment file not found:', envPath);
        console.log('Please create config/config.env file');
        process.exit(1);
    }

    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.error('❌ Error loading environment file:', result.error);
        process.exit(1);
    }

    console.log('✅ Environment file loaded successfully\n');

    // Required variables
    const requiredVars = [
        'JWT_SECRET',
        'MONGO_URI',
        'PORT',
        'NODE_ENV'
    ];

    // Optional variables
    const optionalVars = [
        'TEST_MONGODB_URI',
        'FRONTEND_URL',
        'BACKEND_URL',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];

    let hasErrors = false;

    console.log('📋 Required Environment Variables:');
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            if (varName === 'JWT_SECRET') {
                const length = value.length;
                if (length < 32) {
                    console.log(`⚠️  ${varName}: Present but too short (${length} chars, should be 32+)`);
                } else {
                    console.log(`✅ ${varName}: ✓ (${length} characters)`);
                }
            } else {
                console.log(`✅ ${varName}: ✓`);
            }
        } else {
            console.log(`❌ ${varName}: Missing`);
            hasErrors = true;
        }
    });

    console.log('\n📋 Optional Environment Variables:');
    optionalVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ✓`);
        } else {
            console.log(`⚪ ${varName}: Not set`);
        }
    });

    console.log('\n🔧 Environment Analysis:');

    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET) {
        const secret = process.env.JWT_SECRET;
        if (secret === 'test-jwt-secret-key-for-testing-only-not-for-production') {
            console.log('⚠️  JWT_SECRET: Using test fallback (not for production!)');
        } else if (secret.length < 32) {
            console.log('⚠️  JWT_SECRET: Too short, should be at least 32 characters');
        } else {
            console.log('✅ JWT_SECRET: Strong');
        }
    }

    // Check database URLs
    if (process.env.MONGO_URI) {
        console.log('✅ Main database URL configured');

        // Auto-generate test DB URL if missing
        if (!process.env.TEST_MONGODB_URI) {
            const testUri = process.env.MONGO_URI.replace('hospitalDB', 'hospitalDB_test');
            console.log(`💡 Suggestion: Add TEST_MONGODB_URI=${testUri}`);
        }
    }

    console.log('\n🧪 Test Environment Check:');

    // Set test environment temporarily
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    try {
        // Try importing passport config
        console.log('Testing passport configuration...');
        import('../config/passport.config.js');
        console.log('✅ Passport config loads successfully');
    } catch (error) {
        console.log('❌ Passport config error:', error.message);
        hasErrors = true;
    }

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;

    if (hasErrors) {
        console.log('\n❌ Configuration has errors. Please fix them before running tests.');
        process.exit(1);
    } else {
        console.log('\n✅ Environment configuration is valid!');
        console.log('You can now run tests with: npm run test:e2e');
    }
};

// Run the check
checkEnvironment();