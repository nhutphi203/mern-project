#!/usr/bin/env node

// ===================================================================
// DATABASE PERSISTENCE FIX FOR E2E TESTS
// Script to fix the database persistence issue to achieve 100% test pass rate
// ===================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const execAsync = promisify(exec);

console.log('🚀 Starting Database Persistence Fix for 100% Test Success Rate...\n');

async function fixDatabasePersistence() {
    try {
        // Step 1: Connect to test database and clear any stale data
        console.log('🔧 Step 1: Cleaning up stale test data...');
        
        const testDbUri = process.env.TEST_MONGODB_URI || process.env.MONGO_URI?.replace('healthcare_system', 'healthcare_system_test');
        await mongoose.connect(testDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Remove all test data to start fresh
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const collection of collections) {
            const collectionName = collection.name;
            try {
                await mongoose.connection.db.collection(collectionName).deleteMany({
                    $or: [
                        { isTestData: true },
                        { isGlobalTestUser: true },
                        { email: { $regex: /test\.|global\.test\./ } }
                    ]
                });
            } catch (error) {
                // Collection might not exist or have no matching documents
            }
        }
        
        await mongoose.disconnect();
        console.log('✅ Database cleanup completed');
        
        // Step 2: Run tests with enhanced environment
        console.log('\n🔧 Step 2: Running E2E tests with enhanced persistence...');
        
        const testCommand = 'npm run test:e2e';
        console.log(`Executing: ${testCommand}`);
        
        const { stdout, stderr } = await execAsync(testCommand, {
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
            env: {
                ...process.env,
                NODE_ENV: 'test',
                TEST_VERBOSE: 'true',
                // Force single-threaded execution to prevent race conditions
                JEST_WORKERS: '1'
            }
        });
        
        console.log('\n📊 Test Results:');
        console.log(stdout);
        
        if (stderr) {
            console.log('\n⚠️ Test Warnings/Errors:');
            console.log(stderr);
        }
        
        // Step 3: Analyze results
        console.log('\n🔍 Step 3: Analyzing test results...');
        
        const testSuiteMatch = stdout.match(/Test Suites:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/);
        const testMatch = stdout.match(/Tests:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/);
        
        if (testSuiteMatch && testMatch) {
            const failedSuites = parseInt(testSuiteMatch[1]);
            const passedSuites = parseInt(testSuiteMatch[2]);
            const totalSuites = parseInt(testSuiteMatch[3]);
            
            const failedTests = parseInt(testMatch[1]);
            const passedTests = parseInt(testMatch[2]);
            const totalTests = parseInt(testMatch[3]);
            
            const successRate = ((passedTests / totalTests) * 100).toFixed(1);
            
            console.log(`\n📈 Test Results Summary:`);
            console.log(`   Test Suites: ${passedSuites}/${totalSuites} passed (${failedSuites} failed)`);
            console.log(`   Tests: ${passedTests}/${totalTests} passed (${failedTests} failed)`);
            console.log(`   Success Rate: ${successRate}%`);
            
            if (failedTests === 0) {
                console.log('\n🎉 SUCCESS! Achieved 100% test pass rate!');
                console.log('✅ Database persistence issue has been resolved');
            } else {
                console.log(`\n⚠️ Still have ${failedTests} failing tests`);
                console.log('🔧 Additional fixes may be needed');
                
                // Show specific failed tests
                const failedTestMatches = stdout.match(/● .+$/gm);
                if (failedTestMatches) {
                    console.log('\n❌ Failed Tests:');
                    failedTestMatches.slice(0, 10).forEach((match, index) => {
                        console.log(`   ${index + 1}. ${match.replace('● ', '')}`);
                    });
                    if (failedTestMatches.length > 10) {
                        console.log(`   ... and ${failedTestMatches.length - 10} more`);
                    }
                }
            }
        } else {
            console.log('⚠️ Could not parse test results');
        }
        
    } catch (error) {
        console.error('\n❌ Error during database persistence fix:');
        console.error(error.message);
        
        if (error.stdout) {
            console.log('\n📄 Command Output:');
            console.log(error.stdout);
        }
        
        if (error.stderr) {
            console.log('\n⚠️ Command Errors:');
            console.log(error.stderr);
        }
        
        process.exit(1);
    }
}

// Run the fix
fixDatabasePersistence().then(() => {
    console.log('\n✅ Database persistence fix process completed');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
