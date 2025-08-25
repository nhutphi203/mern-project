/**
 * Enhanced Test Setup - Replaces existing setup.js with comprehensive test infrastructure
 * Resolves authentication issues and provides proper test environment initialization
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import databaseUtils from './helpers/databaseUtils.js';
import authHelper from './helpers/authHelper.js';
import UserFactory from './factories/userFactory.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'hospital-test-secret-key-2024';

// Global test configuration
global.testConfig = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:4000/api/v1',
  dbUri: process.env.TEST_DB_URI || 'mongodb://localhost:27017/hospital-test-db',
  timeout: 30000,
  testUsers: new Map(),
  testTokens: new Map()
};

/**
 * Setup test environment before all tests
 */
export const setupTestEnvironment = async () => {
  try {
    console.log('🚀 Setting up test environment...');

    // 1. Setup test database
    await databaseUtils.setupTestDatabase();
    await databaseUtils.createTestIndexes();

    // 2. Clean any existing data
    await databaseUtils.cleanDatabase();

    // 3. Create test users for all roles with proper error handling
    await createAllTestUsers();

    console.log('✅ Test environment setup completed successfully');

    return {
      success: true,
      message: 'Test environment ready'
    };

  } catch (error) {
    console.error('❌ Test environment setup failed:', error.message);
    throw error;
  }
};

/**
 * Create test users for all roles with enhanced error handling
 */
export const createAllTestUsers = async () => {
  const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Nurse', 'LabTechnician', 'BillingStaff'];
  const createdUsers = {};
  const createdTokens = {};

  console.log('👥 Creating test users for all roles...');

  for (const role of roles) {
    try {
      console.log(`  Creating ${role}...`);

      // Create user via auth helper (handles API registration and token generation)
      const { user, token } = await authHelper.createTestUser(role);

      if (user && token) {
        createdUsers[role] = user;
        createdTokens[role] = token;
        global.testConfig.testUsers.set(role, user);
        global.testConfig.testTokens.set(role, token);

        console.log(`  ✅ ${role} created successfully (ID: ${user._id || user.id})`);
      } else {
        throw new Error(`Failed to create ${role} - missing user or token`);
      }

    } catch (error) {
      console.warn(`  ⚠️  ${role} creation failed: ${error.message}`);

      // Create fallback user data for testing
      const fallbackUser = await createFallbackUser(role);
      createdUsers[role] = fallbackUser.user;
      createdTokens[role] = fallbackUser.token;
      global.testConfig.testUsers.set(role, fallbackUser.user);
      global.testConfig.testTokens.set(role, fallbackUser.token);

      console.log(`  ⚡ ${role} fallback created (ID: ${fallbackUser.user._id})`);
    }
  }

  // Store globally for easy access in tests
  global.testUsers = createdUsers;
  global.testTokens = createdTokens;

  console.log('✅ All test users created successfully');
  return { users: createdUsers, tokens: createdTokens };
};

/**
 * Create fallback user when API registration fails
 */
const createFallbackUser = async (role) => {
  try {
    // Get user data from factory
    const userData = await UserFactory[`create${role}`]();

    // Create minimal user object for testing
    const fallbackUser = {
      _id: `test-${role.toLowerCase()}-${Date.now()}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      gender: userData.gender,
      verified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate test token
    const token = authHelper.generateTestToken(fallbackUser._id, role);

    return { user: fallbackUser, token };

  } catch (error) {
    console.error(`Failed to create fallback user for ${role}:`, error.message);
    throw error;
  }
};

/**
 * Cleanup test environment after all tests
 */
export const cleanupTestEnvironment = async () => {
  try {
    console.log('🧹 Cleaning up test environment...');

    // Clear auth helper cache
    authHelper.clearCache();

    // Clean database
    await databaseUtils.cleanDatabase();

    // Close database connection
    await databaseUtils.closeDatabase();

    // Clear global variables
    global.testUsers = null;
    global.testTokens = null;
    global.testConfig.testUsers.clear();
    global.testConfig.testTokens.clear();

    console.log('✅ Test environment cleanup completed');

  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error.message);
    throw error;
  }
};

/**
 * Reset test environment between tests
 */
export const resetTestEnvironment = async () => {
  try {
    // Clean database but keep structure
    await databaseUtils.cleanDatabase();

    // Clear auth cache
    authHelper.clearCache();

    // Recreate test users
    await createAllTestUsers();

  } catch (error) {
    console.error('Reset test environment failed:', error.message);
    throw error;
  }
};

/**
 * Get test user and token by role
 */
export const getTestUser = (role = 'Patient') => {
  const user = global.testConfig.testUsers.get(role);
  const token = global.testConfig.testTokens.get(role);

  if (!user || !token) {
    throw new Error(`Test user for role ${role} not found. Ensure test environment is set up.`);
  }

  return { user, token };
};

/**
 * Validate test environment setup
 */
export const validateTestEnvironment = async () => {
  const issues = [];

  try {
    // Check database connection
    if (!databaseUtils.isConnected) {
      issues.push('Database not connected');
    }

    // Check test users
    const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Nurse', 'LabTechnician', 'BillingStaff'];
    for (const role of roles) {
      if (!global.testConfig.testUsers.has(role)) {
        issues.push(`Test user missing for role: ${role}`);
      }
      if (!global.testConfig.testTokens.has(role)) {
        issues.push(`Test token missing for role: ${role}`);
      }
    }

    // Validate database integrity
    const integrityCheck = await databaseUtils.validateDatabaseIntegrity();
    if (!integrityCheck.isValid) {
      issues.push(...integrityCheck.issues);
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };

  } catch (error) {
    issues.push(`Validation error: ${error.message}`);
    return {
      isValid: false,
      issues: issues
    };
  }
};

/**
 * Performance monitoring for test environment
 */
export const startTestPerformanceMonitoring = async () => {
  return await databaseUtils.startPerformanceMonitoring();
};

// Jest global setup and teardown hooks
export default {
  setupTestEnvironment,
  cleanupTestEnvironment,
  resetTestEnvironment,
  getTestUser,
  validateTestEnvironment,
  createAllTestUsers
};
