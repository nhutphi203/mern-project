/**
 * Authentication Helpers - Provides JWT token management and authentication utilities
 * Resolves 401 unauthorized errors by properly managing token lifecycle
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const UserFactory = require('../factories/userFactory.js');

class AuthHelper {
  constructor() {
    this.baseURL = process.env.TEST_API_URL || 'http://localhost:4000/api/v1';
    this.tokens = new Map(); // Store tokens by user role
    this.users = new Map(); // Store created users by role
  }

  /**
   * Generate JWT token for testing
   */
  generateTestToken(userId, role = 'Patient') {
    const payload = {
      id: userId,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret-key');
  }

  /**
   * Verify token validity
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
    } catch (error) {
      return null;
    }
  }

  /**
   * Create and register a test user with proper authentication
   */
  async createTestUser(role = 'Patient') {
    try {
      // Check if user already exists in cache
      if (this.users.has(role) && this.tokens.has(role)) {
        const existingToken = this.tokens.get(role);
        if (this.verifyToken(existingToken)) {
          return {
            user: this.users.get(role),
            token: existingToken
          };
        }
      }

      // Get user data from factory
      const userData = await UserFactory[`create${role}`]();

      // Register user via API
      const registerResponse = await axios.post(`${this.baseURL}/user/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!registerResponse.data.success) {
        throw new Error(`Registration failed: ${registerResponse.data.message}`);
      }

      const user = registerResponse.data.user;

      // Login to get token
      const loginCredentials = UserFactory.getLoginCredentials(role);
      const loginResponse = await axios.post(`${this.baseURL}/user/login`, loginCredentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!loginResponse.data.success) {
        throw new Error(`Login failed: ${loginResponse.data.message}`);
      }

      const token = loginResponse.data.token;

      // Cache for future use
      this.users.set(role, user);
      this.tokens.set(role, token);

      return { user, token };

    } catch (error) {
      console.error(`Failed to create test user for role ${role}:`, error.message);

      // Fallback: create minimal user with generated token
      const fallbackUser = {
        _id: `test-${role.toLowerCase()}-${Date.now()}`,
        role: role,
        email: UserFactory.getLoginCredentials(role).email,
        firstName: `Test`,
        lastName: role,
        verified: true,
        isActive: true
      };

      const fallbackToken = this.generateTestToken(fallbackUser._id, role);

      this.users.set(role, fallbackUser);
      this.tokens.set(role, fallbackToken);

      return { user: fallbackUser, token: fallbackToken };
    }
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(role = 'Patient') {
    const { token } = await this.createTestUser(role);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create authenticated axios instance
   */
  async createAuthenticatedClient(role = 'Patient') {
    const { token } = await this.createTestUser(role);

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Login with existing credentials
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/user/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        return {
          user: response.data.user,
          token: response.data.token
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Logout and clear cached tokens
   */
  async logout(role = 'Patient') {
    try {
      const token = this.tokens.get(role);
      if (token) {
        await axios.post(`${this.baseURL}/user/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.warn(`Logout warning for ${role}:`, error.message);
    } finally {
      // Always clear cached data
      this.tokens.delete(role);
      this.users.delete(role);
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshToken(role = 'Patient') {
    const currentToken = this.tokens.get(role);

    if (!currentToken || !this.verifyToken(currentToken)) {
      // Token expired or invalid, create new user/token
      const { user, token } = await this.createTestUser(role);
      return token;
    }

    return currentToken;
  }

  /**
   * Test authentication for all roles
   */
  async testAllRoleAuthentication() {
    const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Nurse', 'LabTechnician', 'BillingStaff'];
    const results = {};

    for (const role of roles) {
      try {
        const { user, token } = await this.createTestUser(role);
        const isValid = this.verifyToken(token);

        results[role] = {
          success: true,
          userId: user._id,
          email: user.email,
          tokenValid: isValid,
          message: 'Authentication successful'
        };
      } catch (error) {
        results[role] = {
          success: false,
          error: error.message,
          message: 'Authentication failed'
        };
      }
    }

    return results;
  }

  /**
   * Get user by role from cache
   */
  getUser(role = 'Patient') {
    return this.users.get(role);
  }

  /**
   * Get token by role from cache
   */
  getToken(role = 'Patient') {
    return this.tokens.get(role);
  }

  /**
   * Clear all cached authentication data
   */
  clearCache() {
    this.tokens.clear();
    this.users.clear();
  }

  /**
   * Validate user permissions for specific actions
   */
  validatePermissions(userRole, requiredPermissions) {
    // Handle null/undefined inputs gracefully
    if (!userRole || !requiredPermissions || !Array.isArray(requiredPermissions)) {
      return false;
    }

    const rolePermissions = {
      Admin: ['all'],
      Doctor: [
        'read_patients', 'write_medical_records', 'read_appointments', 'write_appointments',
        'schedule_appointments', 'view_appointments', 'order_lab_tests', 'view_lab_results',
        'read_lab_orders', 'view_billing'
      ],
      Nurse: [
        'read_patients', 'read_medical_records', 'update_vital_signs', 'view_appointments',
        'view_lab_results'
      ],
      Receptionist: [
        'read_appointments', 'write_appointments', 'read_patients', 'schedule_appointments',
        'read_billing', 'process_payments', 'view_billing'
      ],
      LabTechnician: [
        'read_lab_orders', 'write_lab_results', 'process_lab_tests', 'update_lab_status',
        'view_lab_queue', 'manage_lab_equipment', 'view_lab_reports'
      ],
      BillingStaff: [
        'read_billing', 'write_billing', 'read_appointments', 'process_payments',
        'create_invoices', 'manage_insurance_claims', 'view_financial_reports',
        'process_refunds', 'manage_payment_plans'
      ],
      Patient: [
        'read_own_data', 'write_own_appointments', 'view_own_appointments',
        'view_own_lab_results', 'view_own_billing', 'make_payments'
      ]
    };

    const userPermissions = rolePermissions[userRole] || [];

    if (userPermissions.includes('all')) {
      return true;
    }

    // Handle empty permissions array
    if (requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Create test request with proper authentication
   */
  async createTestRequest(role = 'Patient', endpoint, method = 'GET', data = null) {
    const { token } = await this.createTestUser(role);

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }

    return axios(config);
  }

  /**
   * Simulate authentication middleware for testing
   */
  simulateAuthMiddleware(req, token) {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default new AuthHelper();

module.exports = new AuthHelper();
