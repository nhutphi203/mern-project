/**
 * Authentication Helper for Test Suite
 * Handles token generation, user creation, and role-based authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import supertest from 'supertest';
import app from '../../app.js';
import TestDataFactory from '../factories/test-data-factory.js';

const request = supertest(app);

class AuthHelper {
    constructor() {
        this.dataFactory = new TestDataFactory();
        this.authenticatedUsers = new Map();
        this.testTokens = new Map();
    }

    /**
     * Create and authenticate user for testing
     */
    async createAuthenticatedUser(role = 'Patient', userData = {}) {
        try {
            // Generate test user data
            const userTestData = this.dataFactory.generateUser(role, userData);

            console.log(`🔐 Creating authenticated ${role} user: ${userTestData.email}`);

            // Register user
            const registerResponse = await request
                .post('/api/v1/user/register')
                .send(userTestData);

            if (registerResponse.status !== 201 && registerResponse.status !== 200) {
                console.error(`Registration failed for ${role}:`, registerResponse.body);
                throw new Error(`Registration failed: ${registerResponse.body.message || 'Unknown error'}`);
            }

            // Login user to get token
            const loginResponse = await request
                .post('/api/v1/user/login')
                .send({
                    email: userTestData.email,
                    password: userTestData.password
                });

            if (loginResponse.status !== 200) {
                console.error(`Login failed for ${role}:`, loginResponse.body);
                throw new Error(`Login failed: ${loginResponse.body.message || 'Unknown error'}`);
            }

            const authenticatedUser = {
                id: registerResponse.body.user?.id || registerResponse.body.id,
                email: userTestData.email,
                role: role,
                token: loginResponse.body.token,
                userData: userTestData,
                registrationResponse: registerResponse.body,
                loginResponse: loginResponse.body
            };

            // Store for reuse
            this.authenticatedUsers.set(role.toLowerCase(), authenticatedUser);
            this.testTokens.set(role.toLowerCase(), loginResponse.body.token);

            console.log(`✅ Successfully authenticated ${role} user: ${userTestData.email}`);
            return authenticatedUser;

        } catch (error) {
            console.error(`❌ Failed to create authenticated ${role} user:`, error.message);
            throw error;
        }
    }

    /**
     * Get all role-based authenticated users
     */
    async getAllRoleTokens() {
        const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Nurse', 'LabTechnician', 'BillingStaff'];
        const tokens = {};

        console.log('🔐 Creating authenticated users for all roles...');

        for (const role of roles) {
            try {
                const user = await this.createAuthenticatedUser(role);
                tokens[role.toLowerCase()] = user.token;
                tokens[`${role.toLowerCase()}User`] = user;
            } catch (error) {
                console.warn(`⚠️ Failed to create ${role} user:`, error.message);
                // Continue with other roles
            }
        }

        console.log(`✅ Created tokens for ${Object.keys(tokens).length / 2} roles`);
        return tokens;
    }

    /**
     * Create specific user pairs for testing relationships
     */
    async createUserPairs() {
        const pairs = {};

        // Doctor-Patient pair
        pairs.doctor = await this.createAuthenticatedUser('Doctor', {
            firstName: 'Test',
            lastName: 'Doctor',
            email: 'test.doctor@hospital.com',
            specialization: 'General Medicine'
        });

        pairs.patient = await this.createAuthenticatedUser('Patient', {
            firstName: 'Test',
            lastName: 'Patient',
            email: 'test.patient@hospital.com'
        });

        // Admin user
        pairs.admin = await this.createAuthenticatedUser('Admin', {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'test.admin@hospital.com'
        });

        return pairs;
    }

    /**
     * Generate JWT token manually (for testing token scenarios)
     */
    generateTestToken(payload, expiresIn = '24h') {
        const secret = process.env.JWT_SECRET_KEY || 'test-secret-key';
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Generate expired token for testing
     */
    generateExpiredToken(payload) {
        const secret = process.env.JWT_SECRET_KEY || 'test-secret-key';
        return jwt.sign(payload, secret, { expiresIn: '-1h' }); // Expired 1 hour ago
    }

    /**
     * Generate invalid token for testing
     */
    generateInvalidToken() {
        return 'invalid.token.signature';
    }

    /**
     * Verify token validity
     */
    verifyToken(token) {
        try {
            const secret = process.env.JWT_SECRET_KEY || 'test-secret-key';
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get authenticated user by role
     */
    getAuthenticatedUser(role) {
        return this.authenticatedUsers.get(role.toLowerCase());
    }

    /**
     * Get token by role
     */
    getToken(role) {
        return this.testTokens.get(role.toLowerCase());
    }

    /**
     * Check if user has required permissions
     */
    hasPermission(userRole, requiredPermission) {
        const rolePermissions = {
            'admin': ['all'],
            'doctor': ['medical_records', 'appointments', 'patients', 'prescriptions'],
            'patient': ['view_own_records', 'book_appointments'],
            'receptionist': ['appointments', 'patients', 'billing'],
            'nurse': ['vital_signs', 'patients', 'appointments'],
            'labtechnician': ['lab_tests', 'lab_results'],
            'billingstaff': ['billing', 'invoices', 'payments']
        };

        const permissions = rolePermissions[userRole.toLowerCase()] || [];
        return permissions.includes('all') || permissions.includes(requiredPermission);
    }

    /**
     * Create request headers with authentication
     */
    createAuthHeaders(role) {
        const token = this.getToken(role);
        if (!token) {
            throw new Error(`No token found for role: ${role}`);
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make authenticated request
     */
    async makeAuthenticatedRequest(method, endpoint, role, data = null) {
        const headers = this.createAuthHeaders(role);

        let requestBuilder = request[method.toLowerCase()](endpoint);

        // Add headers
        Object.entries(headers).forEach(([key, value]) => {
            requestBuilder = requestBuilder.set(key, value);
        });

        // Add data if provided
        if (data) {
            requestBuilder = requestBuilder.send(data);
        }

        return requestBuilder;
    }

    /**
     * Reset authentication state
     */
    reset() {
        this.authenticatedUsers.clear();
        this.testTokens.clear();
        this.dataFactory.reset();
    }

    /**
     * Cleanup test users from database
     */
    async cleanup() {
        try {
            // This would cleanup test users from database
            // Implementation depends on your database models
            console.log('🧹 Cleaning up test authentication data...');
            this.reset();
        } catch (error) {
            console.error('❌ Error during auth cleanup:', error.message);
        }
    }
}

export default AuthHelper;
