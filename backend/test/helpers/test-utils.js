/**
 * Test Utilities for Hospital Management System
 * Common utilities, assertions, and helpers for testing
 */

import mongoose from 'mongoose';
import { expect } from '@jest/globals';

class TestUtils {
    /**
     * Database utilities
     */
    static async connectTestDB() {
        const testUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/hospital_test_db';
        
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to test database');
        }
    }

    static async cleanTestDB() {
        if (mongoose.connection.readyState !== 0) {
            const collections = await mongoose.connection.db.collections();
            
            for (const collection of collections) {
                await collection.deleteMany({ isTestData: true });
            }
            
            console.log('🧹 Cleaned test database');
        }
    }

    static async disconnectTestDB() {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('✅ Disconnected from test database');
        }
    }

    /**
     * Wait utilities
     */
    static async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async waitForCondition(conditionFn, timeout = 5000, interval = 100) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await conditionFn()) {
                return true;
            }
            await this.wait(interval);
        }
        
        throw new Error(`Condition not met within ${timeout}ms`);
    }

    /**
     * API Response Assertions
     */
    static expectSuccessResponse(response) {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
        expect(response.body).toBeDefined();
        
        if (response.body.success !== undefined) {
            expect(response.body.success).toBe(true);
        }
    }

    static expectErrorResponse(response, expectedStatus) {
        expect(response.status).toBe(expectedStatus);
        
        if (response.body.success !== undefined) {
            expect(response.body.success).toBe(false);
        }
        
        expect(response.body.message).toBeDefined();
    }

    static expectValidationError(response) {
        this.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('validation');
    }

    static expectUnauthorizedError(response) {
        this.expectErrorResponse(response, 401);
    }

    static expectForbiddenError(response) {
        this.expectErrorResponse(response, 403);
    }

    static expectNotFoundError(response) {
        this.expectErrorResponse(response, 404);
    }

    /**
     * Data validation utilities
     */
    static validateUserResponse(user) {
        expect(user).toBeDefined();
        expect(user.id || user._id).toBeDefined();
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.role).toBeDefined();
        
        // Password should not be returned
        expect(user.password).toBeUndefined();
    }

    static validateAppointmentResponse(appointment) {
        expect(appointment).toBeDefined();
        expect(appointment.id || appointment._id).toBeDefined();
        expect(appointment.patientId).toBeDefined();
        expect(appointment.doctorId).toBeDefined();
        expect(appointment.appointmentDate).toBeDefined();
        expect(appointment.appointmentTime).toBeDefined();
        expect(['scheduled', 'completed', 'cancelled', 'rescheduled']).toContain(appointment.status);
    }

    static validateMedicalRecordResponse(record) {
        expect(record).toBeDefined();
        expect(record.id || record._id).toBeDefined();
        expect(record.patientId).toBeDefined();
        expect(record.doctorId).toBeDefined();
        expect(record.visitDate || record.createdAt).toBeDefined();
        
        if (record.clinicalAssessment) {
            expect(record.clinicalAssessment.chiefComplaint).toBeDefined();
        }
    }

    static validateVitalSignsResponse(vitalSigns) {
        expect(vitalSigns).toBeDefined();
        expect(vitalSigns.id || vitalSigns._id).toBeDefined();
        expect(vitalSigns.patientId).toBeDefined();
        expect(vitalSigns.recordedDate).toBeDefined();
        
        if (vitalSigns.measurements) {
            const { measurements } = vitalSigns;
            if (measurements.bloodPressure) {
                expect(measurements.bloodPressure.systolic).toBeGreaterThan(0);
                expect(measurements.bloodPressure.diastolic).toBeGreaterThan(0);
            }
            if (measurements.heartRate) {
                expect(measurements.heartRate).toBeGreaterThan(0);
            }
        }
    }

    static validateInvoiceResponse(invoice) {
        expect(invoice).toBeDefined();
        expect(invoice.id || invoice._id).toBeDefined();
        expect(invoice.patientId).toBeDefined();
        expect(invoice.invoiceNumber).toBeDefined();
        expect(invoice.totalAmount).toBeGreaterThan(0);
        expect(['pending', 'paid', 'overdue', 'cancelled']).toContain(invoice.status);
    }

    /**
     * Test data generators
     */
    static generateValidEmail() {
        return `test.${Date.now()}.${Math.random().toString(36).substr(2, 5)}@hospital.com`;
    }

    static generateValidPhone() {
        return Math.random().toString().substr(2, 10);
    }

    static generateValidNIC() {
        return Math.random().toString().substr(2, 12);
    }

    static generateFutureDate(daysFromNow = 7) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date;
    }

    static generatePastDate(daysAgo = 7) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
    }

    /**
     * Performance testing utilities
     */
    static async measureExecutionTime(fn) {
        const startTime = Date.now();
        const result = await fn();
        const endTime = Date.now();
        
        return {
            result,
            executionTime: endTime - startTime
        };
    }

    static expectResponseTime(response, maxTimeMs) {
        const responseTime = response.headers['x-response-time'] || 
                           response.res?.responseTime || 
                           0;
        
        if (responseTime > 0) {
            expect(responseTime).toBeLessThanOrEqual(maxTimeMs);
        }
    }

    /**
     * Error handling utilities
     */
    static async expectAsyncError(asyncFn, expectedError) {
        try {
            await asyncFn();
            throw new Error('Expected function to throw an error');
        } catch (error) {
            expect(error.message).toContain(expectedError);
        }
    }

    /**
     * Mock data utilities
     */
    static createMockRequest(data = {}, headers = {}) {
        return {
            body: data,
            headers: {
                'content-type': 'application/json',
                ...headers
            },
            user: null,
            params: {},
            query: {}
        };
    }

    static createMockResponse() {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            setHeader: jest.fn().mockReturnThis(),
            headers: {}
        };
        return res;
    }

    /**
     * Array and object utilities
     */
    static expectArrayContainsObject(array, objectMatcher) {
        expect(array).toEqual(
            expect.arrayContaining([
                expect.objectContaining(objectMatcher)
            ])
        );
    }

    static expectObjectHasKeys(obj, keys) {
        keys.forEach(key => {
            expect(obj).toHaveProperty(key);
        });
    }

    /**
     * ID validation utilities
     */
    static isValidObjectId(id) {
        return mongoose.Types.ObjectId.isValid(id);
    }

    static expectValidObjectId(id) {
        expect(this.isValidObjectId(id)).toBe(true);
    }

    /**
     * Date utilities
     */
    static expectValidDate(dateString) {
        const date = new Date(dateString);
        expect(date instanceof Date && !isNaN(date)).toBe(true);
    }

    static expectDateInRange(dateString, startDate, endDate) {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
    }

    /**
     * Logging utilities
     */
    static logTestStep(step, details = '') {
        console.log(`🧪 ${step}${details ? ': ' + details : ''}`);
    }

    static logTestResult(passed, message) {
        console.log(passed ? `✅ ${message}` : `❌ ${message}`);
    }

    static logTestData(label, data) {
        console.log(`📊 ${label}:`, JSON.stringify(data, null, 2));
    }
}

export default TestUtils;
