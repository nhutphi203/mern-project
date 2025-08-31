#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Hospital Management System
 * Runs a            await mongoose.default.connect(testDbUri);
            
            // Clean test collections
            const collections = ['users', 'appointments', 'medical_records', 'prescriptions', 'labtests', 'invoices'];
            
            for (const collectionName of collections) {
                const collection = mongoose.default.connection.db.collection(collectionName);
                await collection.deleteMany({ 
                    $or: [
                        { email: { $regex: /test@hospital\.com$/i } },
                        { isTestData: true }
                    ]
                });
            }
            
            await mongoose.default.disconnect();s and generates detailed reports
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            coverage: null,
            duration: 0,
            errors: []
        };

        this.testSuites = [
            {
                name: 'Complete System Workflow',
                file: 'test/workflow/complete-system-workflow.test.js',
                description: 'Tests end-to-end patient journey and role workflows'
            },
            {
                name: 'Role-Specific Workflows',
                file: 'test/workflow/role-specific-workflows.test.js',
                description: 'Tests individual role functionalities'
            },
            {
                name: 'API Endpoint Validation',
                file: 'test/workflow/api-endpoint-validation.test.js',
                description: 'Tests all API endpoints for security and functionality'
            }
        ];
    }

    async runAllTests() {
        console.log('🚀 Starting Hospital Management System Test Suite');
        console.log('='.repeat(60));

        const startTime = Date.now();

        try {
            // Pre-test setup
            await this.setupTestEnvironment();

            // Run individual test suites
            for (const suite of this.testSuites) {
                await this.runTestSuite(suite);
            }

            // Generate coverage report
            await this.generateCoverageReport();

            // Post-test cleanup
            await this.cleanupTestEnvironment();

            this.testResults.duration = Date.now() - startTime;
            this.generateSummaryReport();

        } catch (error) {
            console.error('❌ Test runner failed:', error);
            process.exit(1);
        }
    }

    async setupTestEnvironment() {
        console.log('🔧 Setting up test environment...');

        // Set test environment variables
        process.env.NODE_ENV = 'test';
        process.env.TEST_VERBOSE = 'true';

        // Ensure test database is clean
        await this.cleanTestDatabase();

        console.log('✅ Test environment ready');
    }

    async cleanTestDatabase() {
        try {
            const mongoose = await import('mongoose');
            const dotenv = await import('dotenv');

            dotenv.default.config();

            const testDbUri = process.env.MONGO_URI?.replace('hospitalDB', 'hospitalDB_test') || 'mongodb://localhost:27017/hospitalDB_test';

            await mongoose.connect(testDbUri);

            // Clean test collections
            const collections = ['users', 'appointments', 'medical_records', 'prescriptions', 'labtests', 'invoices'];

            for (const collectionName of collections) {
                const collection = mongoose.connection.db.collection(collectionName);
                await collection.deleteMany({
                    $or: [
                        { email: { $regex: /test@hospital\\.com$/i } },
                        { isTestData: true }
                    ]
                });
            }

            await mongoose.disconnect();
            console.log('🧹 Test database cleaned');

        } catch (error) {
            console.warn('⚠️ Could not clean test database:', error.message);
        }
    }

    async runTestSuite(suite) {
        console.log(`\\n📋 Running: ${suite.name}`);
        console.log(`   ${suite.description}`);
        console.log('-'.repeat(50));

        return new Promise((resolve) => {
            const jest = spawn('npx', ['jest', suite.file, '--verbose', '--coverage'], {
                stdio: 'pipe',
                cwd: process.cwd()
            });

            let output = '';
            let errorOutput = '';

            jest.stdout.on('data', (data) => {
                output += data.toString();
                process.stdout.write(data);
            });

            jest.stderr.on('data', (data) => {
                errorOutput += data.toString();
                process.stderr.write(data);
            });

            jest.on('close', (code) => {
                this.parseTestResults(output, errorOutput, code);
                resolve(code);
            });
        });
    }

    parseTestResults(output, errorOutput, exitCode) {
        // Parse Jest output to extract test statistics
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        const skippedMatch = output.match(/(\d+) skipped/);
        const totalMatch = output.match(/Tests:\s+(\d+) total/);

        if (passedMatch) this.testResults.passed += parseInt(passedMatch[1]);
        if (failedMatch) this.testResults.failed += parseInt(failedMatch[1]);
        if (skippedMatch) this.testResults.skipped += parseInt(skippedMatch[1]);
        if (totalMatch) this.testResults.total += parseInt(totalMatch[1]);

        if (exitCode !== 0) {
            this.testResults.errors.push(errorOutput);
        }
    }

    async generateCoverageReport() {
        console.log('\\n📊 Generating coverage report...');

        try {
            // Run Jest with coverage
            const coverage = spawn('npx', ['jest', '--coverage', '--coverageReporters=text-summary'], {
                stdio: 'pipe'
            });

            let coverageOutput = '';

            coverage.stdout.on('data', (data) => {
                coverageOutput += data.toString();
            });

            await new Promise((resolve) => {
                coverage.on('close', () => {
                    this.parseCoverageReport(coverageOutput);
                    resolve();
                });
            });

        } catch (error) {
            console.warn('⚠️ Could not generate coverage report:', error.message);
        }
    }

    parseCoverageReport(output) {
        const coverageMatch = output.match(/All files[\\s\\S]*?(\d+\\.?\d*)\s*\|\s*(\d+\\.?\d*)\s*\|\s*(\d+\\.?\d*)\s*\|\s*(\d+\\.?\d*)/);

        if (coverageMatch) {
            this.testResults.coverage = {
                statements: parseFloat(coverageMatch[1]),
                branches: parseFloat(coverageMatch[2]),
                functions: parseFloat(coverageMatch[3]),
                lines: parseFloat(coverageMatch[4])
            };
        }
    }

    async cleanupTestEnvironment() {
        console.log('\\n🧹 Cleaning up test environment...');

        // Clean test data again
        await this.cleanTestDatabase();

        console.log('✅ Cleanup completed');
    }

    generateSummaryReport() {
        console.log('\\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY REPORT');
        console.log('='.repeat(60));

        console.log(`🎯 Tests: ${this.testResults.passed} passed, ${this.testResults.failed} failed, ${this.testResults.skipped} skipped`);
        console.log(`📊 Total: ${this.testResults.total} tests`);
        console.log(`⏱️  Duration: ${(this.testResults.duration / 1000).toFixed(2)}s`);

        if (this.testResults.coverage) {
            console.log('\\n📈 CODE COVERAGE:');
            console.log(`   Statements: ${this.testResults.coverage.statements}%`);
            console.log(`   Branches: ${this.testResults.coverage.branches}%`);
            console.log(`   Functions: ${this.testResults.coverage.functions}%`);
            console.log(`   Lines: ${this.testResults.coverage.lines}%`);
        }

        if (this.testResults.errors.length > 0) {
            console.log('\\n❌ ERRORS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.slice(0, 200)}...`);
            });
        }

        const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(2);
        console.log(`\\n🎉 Success Rate: ${successRate}%`);

        if (this.testResults.failed === 0) {
            console.log('\\n✅ ALL TESTS PASSED! System is ready for production.');
        } else {
            console.log(`\\n⚠️  ${this.testResults.failed} tests failed. Please review and fix issues.`);
        }

        console.log('='.repeat(60));

        // Write detailed report to file
        this.writeDetailedReport();
    }

    writeDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                testEnvironment: process.env.NODE_ENV
            },
            results: this.testResults,
            testSuites: this.testSuites.map(suite => ({
                name: suite.name,
                description: suite.description,
                file: suite.file
            })),
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(__dirname, 'test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.testResults.failed > 0) {
            recommendations.push('Review failed tests and fix underlying issues before deployment');
        }

        if (this.testResults.coverage && this.testResults.coverage.statements < 80) {
            recommendations.push('Increase test coverage to at least 80% for better reliability');
        }

        if (this.testResults.total < 50) {
            recommendations.push('Consider adding more comprehensive tests for edge cases');
        }

        if (recommendations.length === 0) {
            recommendations.push('System is well-tested and ready for production deployment');
        }

        return recommendations;
    }
}

// CLI interface
const runner = new TestRunner();
runner.runAllTests().catch(console.error);

export default TestRunner;
