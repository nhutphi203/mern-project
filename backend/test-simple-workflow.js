import { config } from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

config();

class WorkflowTester {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/v1';
        this.tokens = {};
        this.testUsers = {};
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: '💡',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type];
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTest(testName, testFn) {
        this.results.total++;
        try {
            await testFn();
            this.results.passed++;
            this.log(`${testName} - PASSED`, 'success');
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({ test: testName, error: error.message });
            this.log(`${testName} - FAILED: ${error.message}`, 'error');
        }
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        return { status: response.status, data };
    }

    async checkApiHealth() {
        const { status, data } = await this.makeRequest('/health');
        if (status !== 200) {
            throw new Error(`API health check failed with status ${status}`);
        }
        this.log('API is healthy and running');
    }

    async testUserAuthentication() {
        // Test login with existing users
        const loginData = {
            email: 'admin@hospital.com',
            password: 'admin123'
        };

        const { status, data } = await this.makeRequest('/user/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });

        if (status === 200 && data.token) {
            this.tokens.admin = data.token;
            this.log('Admin login successful');
            return true;
        } else {
            throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
        }
    }

    async testMedicalRecordsAccess() {
        if (!this.tokens.admin) {
            throw new Error('No admin token available');
        }

        const { status, data } = await this.makeRequest('/medical-records/summary', {
            headers: {
                'Authorization': `Bearer ${this.tokens.admin}`
            }
        });

        if (status === 200) {
            this.log(`Medical records accessed successfully. Found ${data.data?.length || 0} records`);
        } else {
            throw new Error(`Medical records access failed with status ${status}`);
        }
    }

    async testAppointmentEndpoints() {
        if (!this.tokens.admin) {
            throw new Error('No admin token available');
        }

        const { status, data } = await this.makeRequest('/appointment/all', {
            headers: {
                'Authorization': `Bearer ${this.tokens.admin}`
            }
        });

        if (status === 200) {
            this.log(`Appointments accessed successfully. Found ${data.appointments?.length || 0} appointments`);
        } else {
            throw new Error(`Appointments access failed with status ${status}`);
        }
    }

    async testUserManagement() {
        if (!this.tokens.admin) {
            throw new Error('No admin token available');
        }

        const { status, data } = await this.makeRequest('/admin/users', {
            headers: {
                'Authorization': `Bearer ${this.tokens.admin}`
            }
        });

        if (status === 200) {
            this.log(`User management accessed successfully. Found ${data.users?.length || 0} users`);
        } else {
            throw new Error(`User management access failed with status ${status}`);
        }
    }

    async testDashboardData() {
        if (!this.tokens.admin) {
            throw new Error('No admin token available');
        }

        const { status, data } = await this.makeRequest('/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${this.tokens.admin}`
            }
        });

        if (status === 200) {
            this.log('Dashboard data accessed successfully');
        } else {
            throw new Error(`Dashboard access failed with status ${status}`);
        }
    }

    async runAllTests() {
        this.log('🚀 Starting Hospital Management System Workflow Tests', 'info');
        this.log('='.repeat(60), 'info');

        await this.runTest('API Health Check', () => this.checkApiHealth());
        await this.runTest('User Authentication', () => this.testUserAuthentication());
        await this.runTest('Medical Records Access', () => this.testMedicalRecordsAccess());
        await this.runTest('Appointment Endpoints', () => this.testAppointmentEndpoints());
        await this.runTest('User Management', () => this.testUserManagement());
        await this.runTest('Dashboard Data', () => this.testDashboardData());

        this.printResults();
    }

    printResults() {
        this.log('='.repeat(60), 'info');
        this.log('📊 TEST RESULTS SUMMARY', 'info');
        this.log('='.repeat(60), 'info');

        this.log(`Total Tests: ${this.results.total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');

        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        this.log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');

        if (this.results.errors.length > 0) {
            this.log('\n❌ FAILED TESTS:', 'error');
            this.results.errors.forEach((error, index) => {
                this.log(`  ${index + 1}. ${error.test}: ${error.error}`, 'error');
            });
        }

        if (this.results.failed === 0) {
            this.log('\n🎉 ALL TESTS PASSED! System workflows are working correctly.', 'success');
        } else {
            this.log(`\n⚠️ ${this.results.failed} tests failed. Please review the issues above.`, 'warning');
        }
    }
}

// Wait for server to be ready
async function waitForServer(url, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return true;
            }
        } catch (error) {
            // Server not ready yet
        }

        console.log(`⏳ Waiting for server... (attempt ${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Server not responding after maximum attempts');
}

// Main execution
async function main() {
    try {
        // Wait for server to be ready
        await waitForServer('http://localhost:8080/api/v1/health');

        const tester = new WorkflowTester();
        await tester.runAllTests();

        process.exit(tester.results.failed === 0 ? 0 : 1);
    } catch (error) {
        console.error('❌ Test suite failed to run:', error.message);
        process.exit(1);
    }
}

main();
