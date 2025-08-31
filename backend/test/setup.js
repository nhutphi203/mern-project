// Test setup configuration
// CRITICAL: Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

// BACKUP: Try to load from different possible paths if first fails
if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not found, trying alternative paths...');
    dotenv.config({ path: '../config/config.env' });
    dotenv.config({ path: './backend/config/config.env' });
    dotenv.config(); // Try default .env file
}

// Set a fallback JWT_SECRET for tests if still not found
if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET still not found, using test fallback');
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-not-for-production';
}

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
}

console.log('✅ Environment variables loaded in setup.js');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);

// NOW we can safely import other modules
import mongoose from 'mongoose';
import supertest from 'supertest';

// Import app AFTER environment setup
import app from '../app.js';

const request = supertest(app);

// Set test timeout
jest.setTimeout(30000);

// Global test users data with proper validation
const globalTestUsersData = {
    admin: {
        firstName: 'Global',
        lastName: 'Admin',
        email: 'global.admin@test.com',
        password: 'testpassword123',
        phone: '1111111111',
        gender: 'Male',
        dob: '1985-01-01',
        address: 'Test Address 123',
        role: 'Admin'
    },
    doctor: {
        firstName: 'Global',
        lastName: 'Doctor',
        email: 'global.doctor@test.com',
        password: 'testpassword123',
        phone: '2222222222',
        gender: 'Male',
        dob: '1980-01-01',
        address: 'Test Address 456',
        role: 'Doctor',
        specialization: 'General Medicine'
    },
    patient: {
        firstName: 'Global',
        lastName: 'Patient',
        email: 'global.patient@test.com',
        password: 'testpassword123',
        phone: '3333333333',
        gender: 'Male',
        dob: '1990-01-01',
        nic: '123456789V',
        address: 'Test Address 789',
        role: 'Patient'
    },
    receptionist: {
        firstName: 'Global',
        lastName: 'Receptionist',
        email: 'global.receptionist@test.com',
        password: 'testpassword123',
        phone: '4444444444',
        gender: 'Female',
        dob: '1988-01-01',
        address: 'Test Address 012',
        role: 'Receptionist'
    },
    nurse: {
        firstName: 'Global',
        lastName: 'Nurse',
        email: 'global.nurse@test.com',
        password: 'testpassword123',
        phone: '5555555555',
        gender: 'Female',
        dob: '1989-01-01',
        address: 'Test Address 345',
        role: 'Nurse'
    },
    labTechnician: {
        firstName: 'Global',
        lastName: 'LabTech',
        email: 'global.labtech@test.com',
        password: 'testpassword123',
        phone: '6666666666',
        gender: 'Male',
        dob: '1991-01-01',
        address: 'Test Address 678',
        role: 'LabTechnician'
    },
    billingStaff: {
        firstName: 'Global',
        lastName: 'BillingStaff',
        email: 'global.billing@test.com',
        password: 'testpassword123',
        phone: '7777777777',
        gender: 'Female',
        dob: '1986-01-01',
        address: 'Test Address 901',
        role: 'BillingStaff'
    }
};

// Setup test database connection and create global test users
beforeAll(async () => {
    try {
        // Ensure JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is required for tests');
        }

        // Use test database
        const testDbUri = process.env.TEST_MONGODB_URI ||
            process.env.MONGO_URI?.replace('hospitalDB', 'hospitalDB_test') ||
            'mongodb://localhost:27017/hospitalDB_test';

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to test database:', testDbUri);
        }

        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
            });
        }

        // Clean existing test users
        try {
            if (mongoose.connection.db) {
                await mongoose.connection.db.collection('users').deleteMany({
                    email: { $regex: /global\..*@test\.com$/i }
                });
                console.log('✅ Cleaned existing test users');
            }
        } catch (cleanError) {
            console.warn('⚠️ Could not clean existing test users:', cleanError.message);
        }

        // Create global test users
        global.testUsers = {};

        for (const [role, userData] of Object.entries(globalTestUsersData)) {
            try {
                // Register user
                const registerResponse = await request
                    .post('/api/v1/users/register')
                    .send(userData);

                if (registerResponse.status === 201 || registerResponse.status === 200) {
                    // Login to get token
                    const loginResponse = await request
                        .post('/api/v1/users/login')
                        .send({
                            email: userData.email,
                            password: userData.password
                        });

                    if (loginResponse.status === 200 && loginResponse.body.token) {
                        global.testUsers[role] = {
                            id: registerResponse.body.user?.id || registerResponse.body.id,
                            token: loginResponse.body.token,
                            email: userData.email,
                            role: userData.role
                        };
                        console.log(`✅ Created global test user: ${role}`);
                    } else {
                        console.warn(`⚠️ Failed to login global test user: ${role}`);
                    }
                } else {
                    console.warn(`⚠️ Failed to register global test user: ${role}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error creating global test user ${role}:`, error.message);
            }
        }

        console.log(`✅ Global test setup complete. Created ${Object.keys(global.testUsers || {}).length} test users`);
    } catch (error) {
        console.error('❌ Failed to setup test environment:', error.message);
        // Don't exit process - let tests run without global users
        global.testUsers = {};
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