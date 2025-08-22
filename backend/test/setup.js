// Test setup configuration
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Set test timeout
jest.setTimeout(30000);

// Setup test database connection
beforeAll(async () => {
    try {
        // Use test database
        const testDbUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test');

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to test database');
        }
    } catch (error) {
        console.error('❌ Failed to connect to test database:', error);
        process.exit(1);
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('✅ Disconnected from test database');
        }
    } catch (error) {
        console.error('❌ Error disconnecting from test database:', error);
    }
});

// Global test helpers
global.testHelpers = {
    // Generate random test email
    generateTestEmail: (prefix = 'test') => {
        return `${prefix}.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`;
    },

    // Generate test MongoDB ObjectId
    generateObjectId: () => {
        return new mongoose.Types.ObjectId();
    },

    // Wait for async operations
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Clean test data by pattern
    cleanTestData: async (model, pattern = { isTestData: true }) => {
        try {
            const result = await model.deleteMany(pattern);
            console.log(`🧹 Cleaned ${result.deletedCount} test records from ${model.collection.name}`);
            return result;
        } catch (error) {
            console.error(`❌ Error cleaning test data from ${model.collection.name}:`, error);
            throw error;
        }
    },

    // Create test user helper
    createTestUser: async (overrides = {}) => {
        const { User } = await import('../models/userScheme.js');

        const defaultUser = {
            firstName: 'Test',
            lastName: 'User',
            email: global.testHelpers.generateTestEmail(),
            phone: '1234567890',
            password: 'testpassword123',
            role: 'Patient',
            isTestData: true
        };

        return await User.create({ ...defaultUser, ...overrides });
    },

    // Create test appointment helper
    createTestAppointment: async (patientId, doctorId, overrides = {}) => {
        const { Appointment } = await import('../models/appointmentSchema.js');

        const defaultAppointment = {
            patientId,
            doctorId,
            appointment_date: new Date(),
            appointment_time: '10:00',
            department: 'General Medicine',
            status: 'Scheduled',
            isTestData: true
        };

        return await Appointment.create({ ...defaultAppointment, ...overrides });
    },

    // Create test medical record helper
    createTestMedicalRecord: async (patientId, doctorId, appointmentId, overrides = {}) => {
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const defaultRecord = {
            appointmentId,
            patientId,
            doctorId,
            encounterId: appointmentId,
            clinicalAssessment: {
                chiefComplaint: 'Test complaint',
                historyOfPresentIllness: 'Test history',
                assessedBy: doctorId
            },
            recordStatus: 'Draft',
            isTestData: true
        };

        return await EnhancedMedicalRecord.create({ ...defaultRecord, ...overrides });
    }
};

// Enhanced console logging for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
    if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
        originalConsoleLog(...args);
    }
};

console.error = (...args) => {
    if (process.env.NODE_ENV === 'test') {
        originalConsoleError(...args);
    }
};

// Handle unhandled rejections in tests
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = {
    testHelpers: global.testHelpers
};
