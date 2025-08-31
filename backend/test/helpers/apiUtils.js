/**
 * API Test Utilities - Provides comprehensive API testing helpers
 * Handles request/response validation, error handling, and test assertions
 */
const axios = require('axios');
const authHelper = require('./authHelper.js');

class APITestUtils {
  constructor() {
    this.baseURL = process.env.TEST_API_URL || 'http://localhost:4000/api/v1';
    this.defaultTimeout = 10000;
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(method, endpoint, data = null, role = 'Patient', options = {}) {
    try {
      const headers = await authHelper.getAuthHeaders(role);

      const config = {
        method: method.toUpperCase(),
        url: `${this.baseURL}${endpoint}`,
        headers: { ...headers, ...options.headers },
        timeout: options.timeout || this.defaultTimeout,
        validateStatus: () => true // Don't throw on HTTP errors
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
      }

      if (options.params) {
        config.params = options.params;
      }

      const response = await axios(config);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: response.status >= 200 && response.status < 300
      };
    } catch (error) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: error.message },
        headers: error.response?.headers || {},
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Make unauthenticated API request
   */
  async makeRequest(method, endpoint, data = null, options = {}) {
    try {
      const config = {
        method: method.toUpperCase(),
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: options.timeout || this.defaultTimeout,
        validateStatus: () => true
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
      }

      if (options.params) {
        config.params = options.params;
      }

      const response = await axios(config);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: response.status >= 200 && response.status < 300
      };
    } catch (error) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: error.message },
        headers: error.response?.headers || {},
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test API endpoint with various scenarios
   */
  async testEndpoint(endpoint, scenarios) {
    const results = {};

    for (const [scenarioName, scenario] of Object.entries(scenarios)) {
      try {
        const {
          method = 'GET',
          data = null,
          role = 'Patient',
          expectedStatus = 200,
          options = {}
        } = scenario;

        const response = await this.makeAuthenticatedRequest(method, endpoint, data, role, options);

        results[scenarioName] = {
          ...response,
          expectedStatus,
          statusMatch: response.status === expectedStatus,
          scenario
        };
      } catch (error) {
        results[scenarioName] = {
          success: false,
          error: error.message,
          scenario
        };
      }
    }

    return results;
  }

  /**
   * Validate API response structure
   */
  validateResponse(response, expectedSchema) {
    const errors = [];

    // Check status code
    if (expectedSchema.status && response.status !== expectedSchema.status) {
      errors.push(`Expected status ${expectedSchema.status}, got ${response.status}`);
    }

    // Check required fields
    if (expectedSchema.requiredFields) {
      for (const field of expectedSchema.requiredFields) {
        if (!this.hasNestedProperty(response.data, field)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check data types
    if (expectedSchema.types) {
      for (const [field, expectedType] of Object.entries(expectedSchema.types)) {
        const value = this.getNestedProperty(response.data, field);
        if (value !== undefined && typeof value !== expectedType) {
          errors.push(`Field ${field} should be ${expectedType}, got ${typeof value}`);
        }
      }
    }

    // Check array structures
    if (expectedSchema.arrays) {
      for (const [field, arraySchema] of Object.entries(expectedSchema.arrays)) {
        const array = this.getNestedProperty(response.data, field);
        if (array && Array.isArray(array)) {
          if (arraySchema.minLength && array.length < arraySchema.minLength) {
            errors.push(`Array ${field} should have at least ${arraySchema.minLength} items`);
          }
          if (arraySchema.maxLength && array.length > arraySchema.maxLength) {
            errors.push(`Array ${field} should have at most ${arraySchema.maxLength} items`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test CRUD operations for a resource
   */
  async testCRUDOperations(resourceName, testData, role = 'Admin') {
    const results = {};
    let createdId = null;

    try {
      // CREATE
      const createResponse = await this.makeAuthenticatedRequest(
        'POST',
        `/${resourceName}`,
        testData.create,
        role
      );

      results.create = {
        ...createResponse,
        success: createResponse.status === 201 || createResponse.status === 200
      };

      if (createResponse.success && createResponse.data?.data) {
        createdId = createResponse.data.data._id || createResponse.data.data.id;
      }

      // READ (List)
      const listResponse = await this.makeAuthenticatedRequest(
        'GET',
        `/${resourceName}`,
        null,
        role
      );

      results.list = {
        ...listResponse,
        success: listResponse.status === 200
      };

      // READ (Single)
      if (createdId) {
        const readResponse = await this.makeAuthenticatedRequest(
          'GET',
          `/${resourceName}/${createdId}`,
          null,
          role
        );

        results.read = {
          ...readResponse,
          success: readResponse.status === 200
        };

        // UPDATE
        if (testData.update) {
          const updateResponse = await this.makeAuthenticatedRequest(
            'PUT',
            `/${resourceName}/${createdId}`,
            testData.update,
            role
          );

          results.update = {
            ...updateResponse,
            success: updateResponse.status === 200
          };
        }

        // DELETE
        const deleteResponse = await this.makeAuthenticatedRequest(
          'DELETE',
          `/${resourceName}/${createdId}`,
          null,
          role
        );

        results.delete = {
          ...deleteResponse,
          success: deleteResponse.status === 200 || deleteResponse.status === 204
        };
      }

    } catch (error) {
      results.error = error.message;
    }

    return results;
  }

  /**
   * Test API endpoint performance
   */
  async testPerformance(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      role = 'Patient',
      iterations = 10,
      concurrent = false
    } = options;

    const results = [];
    const startTime = Date.now();

    if (concurrent) {
      // Concurrent requests
      const promises = Array(iterations).fill().map(async () => {
        const requestStart = Date.now();
        const response = await this.makeAuthenticatedRequest(method, endpoint, data, role);
        const requestEnd = Date.now();

        return {
          duration: requestEnd - requestStart,
          status: response.status,
          success: response.success
        };
      });

      results.push(...await Promise.all(promises));
    } else {
      // Sequential requests
      for (let i = 0; i < iterations; i++) {
        const requestStart = Date.now();
        const response = await this.makeAuthenticatedRequest(method, endpoint, data, role);
        const requestEnd = Date.now();

        results.push({
          duration: requestEnd - requestStart,
          status: response.status,
          success: response.success
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const successfulRequests = results.filter(r => r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const minDuration = Math.min(...results.map(r => r.duration));
    const maxDuration = Math.max(...results.map(r => r.duration));

    return {
      totalTime,
      iterations,
      successfulRequests,
      failedRequests: iterations - successfulRequests,
      successRate: (successfulRequests / iterations) * 100,
      avgDuration,
      minDuration,
      maxDuration,
      requestsPerSecond: iterations / (totalTime / 1000),
      results
    };
  }

  /**
   * Test API rate limiting
   */
  async testRateLimit(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      role = 'Patient',
      maxRequests = 100,
      timeWindow = 60000 // 1 minute
    } = options;

    const results = [];
    const startTime = Date.now();
    let requestCount = 0;

    while (Date.now() - startTime < timeWindow && requestCount < maxRequests) {
      const response = await this.makeAuthenticatedRequest(method, endpoint, data, role);

      results.push({
        requestNumber: requestCount + 1,
        timestamp: Date.now(),
        status: response.status,
        success: response.success,
        rateLimited: response.status === 429
      });

      requestCount++;

      // Stop if rate limited
      if (response.status === 429) {
        break;
      }
    }

    const rateLimitedCount = results.filter(r => r.rateLimited).length;

    return {
      totalRequests: requestCount,
      timeWindow,
      rateLimitedRequests: rateLimitedCount,
      successfulRequests: results.filter(r => r.success).length,
      rateLimitHit: rateLimitedCount > 0,
      results
    };
  }

  /**
   * Validate error responses
   */
  validateErrorResponse(response, expectedError = {}) {
    const errors = [];

    // Check status code is an error code
    if (response.status < 400) {
      errors.push(`Expected error status code (400+), got ${response.status}`);
    }

    // Check error message exists
    if (!response.data?.message && !response.data?.error) {
      errors.push('Error response should contain message or error field');
    }

    // Check specific error code if expected
    if (expectedError.code && response.data?.code !== expectedError.code) {
      errors.push(`Expected error code ${expectedError.code}, got ${response.data?.code}`);
    }

    // Check error message contains expected text
    if (expectedError.messageContains) {
      const message = response.data?.message || response.data?.error || '';
      if (!message.toLowerCase().includes(expectedError.messageContains.toLowerCase())) {
        errors.push(`Error message should contain "${expectedError.messageContains}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper: Check if nested property exists
   */
  hasNestedProperty(obj, path) {
    return this.getNestedProperty(obj, path) !== undefined;
  }

  /**
   * Helper: Get nested property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Generate test report
   */
  generateTestReport(testResults, testName) {
    const report = {
      testName,
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        successRate: 0
      },
      details: []
    };

    const flattenResults = (results, prefix = '') => {
      for (const [key, value] of Object.entries(results)) {
        const testKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && value.success !== undefined) {
          report.summary.total++;
          if (value.success) {
            report.summary.passed++;
          } else {
            report.summary.failed++;
          }

          report.details.push({
            test: testKey,
            success: value.success,
            status: value.status,
            error: value.error,
            duration: value.duration
          });
        } else if (value && typeof value === 'object') {
          flattenResults(value, testKey);
        }
      }
    };

    flattenResults(testResults);

    report.summary.successRate = report.summary.total > 0
      ? (report.summary.passed / report.summary.total) * 100
      : 0;

    return report;
  }
}

// Export singleton instance
export default new APITestUtils();

module.exports = new APITestUtils();
