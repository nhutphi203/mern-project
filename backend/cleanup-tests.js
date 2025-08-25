/**
 * Test Cleanup Script
 * Removes outdated and duplicate test files, keeps only essential tests
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestCleanup {
    constructor() {
        // Files to keep (essential and up-to-date tests)
        this.filesToKeep = [
            // Core test infrastructure
            'test/setup.js',
            'test/workflow/complete-system-workflow.test.js',
            'test/workflow/role-specific-workflows.test.js',
            'test/workflow/api-endpoint-validation.test.js',

            // Keep some specific comprehensive tests
            'test-comprehensive-medical-records.js',
            'test-role-access-control.js',
            'test-medical-records-endpoints.js',

            // Test configuration
            'jest.config.json',
            'run-comprehensive-tests.js'
        ];

        // Files to definitely remove (outdated, duplicate, or low-value)
        this.filesToRemove = [
            'testAPI.js',
            'testFrontendAuth.js',
            'testLabQueueAPI.js',
            'testNewPipeline.js',
            'testEncountersAPI.js',
            'testMedicalRecordsWithAuth.js',
            'testMedicalRecordsComplete.js',
            'testFrontendIntegration.js',
            'test-insurance-integration.js',
            'test-insurance-endpoints.js',
            'test-password-flow.js',
            'test-auth-fix.js',
            'test-lab-tech-login.js',
            'test-receptionist-billing.js',
            'test-token-generator.js',
            'test-login-manual.js',
            'test-frontend-auth-debug.js',
            'test-appointment-auth.js',
            'test-all-dashboards.js',
            'test-encounter-endpoints.js',
            'test-doctor-dashboard.js',
            'test-encounter-quick.js',
            'test-medical-records-complete.js'
        ];
    }

    async cleanupTests() {
        console.log('🧹 Starting Test Cleanup Process...');
        console.log('='.repeat(50));

        let removedCount = 0;
        let keptCount = 0;

        // Remove outdated files
        for (const fileName of this.filesToRemove) {
            const filePath = path.join(__dirname, fileName);

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`❌ Removed: ${fileName}`);
                    removedCount++;
                } else {
                    console.log(`⚠️  Not found: ${fileName}`);
                }
            } catch (error) {
                console.error(`❌ Error removing ${fileName}:`, error.message);
            }
        }

        // List kept files
        console.log('\\n✅ Files kept:');
        for (const fileName of this.filesToKeep) {
            const filePath = path.join(__dirname, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`✅ Kept: ${fileName}`);
                keptCount++;
            } else {
                console.log(`⚠️  Missing essential file: ${fileName}`);
            }
        }

        // Check for any remaining test files not in our lists
        console.log('\\n🔍 Checking for remaining test files...');
        const allFiles = fs.readdirSync(__dirname);
        const remainingTestFiles = allFiles.filter(file =>
            file.startsWith('test') &&
            file.endsWith('.js') &&
            !this.filesToKeep.includes(file) &&
            !this.filesToRemove.includes(file)
        );

        if (remainingTestFiles.length > 0) {
            console.log('\\n📋 Remaining test files for manual review:');
            remainingTestFiles.forEach(file => {
                const filePath = path.join(__dirname, file);
                const stats = fs.statSync(filePath);
                console.log(`🤔 ${file} (${(stats.size / 1024).toFixed(2)} KB, modified: ${stats.mtime.toDateString()})`);
            });
        }

        console.log('\\n' + '='.repeat(50));
        console.log('📊 CLEANUP SUMMARY:');
        console.log(`❌ Removed: ${removedCount} files`);
        console.log(`✅ Kept: ${keptCount} files`);
        console.log(`🤔 For review: ${remainingTestFiles.length} files`);

        if (remainingTestFiles.length > 0) {
            console.log('\\n💡 Recommendation: Review remaining files and either:');
            console.log('   - Add them to filesToKeep if they are valuable');
            console.log('   - Add them to filesToRemove if they are outdated');
        }

        // Generate new test structure documentation
        this.generateTestDocumentation();

        console.log('\\n🎉 Test cleanup completed!');
    }

    generateTestDocumentation() {
        const documentation = `# Hospital Management System - Test Documentation

## Test Structure

### Core Test Suites

1. **Complete System Workflow** (\`test/workflow/complete-system-workflow.test.js\`)
   - End-to-end patient journey testing
   - Multi-role workflow integration
   - Data integrity validation

2. **Role-Specific Workflows** (\`test/workflow/role-specific-workflows.test.js\`)
   - Individual role functionality testing
   - Doctor, Patient, Admin, Receptionist, Technician, Billing workflows
   - Role-based access control validation

3. **API Endpoint Validation** (\`test/workflow/api-endpoint-validation.test.js\`)
   - Comprehensive API testing
   - Security and authentication testing
   - Error handling and edge cases

### Legacy Tests (Kept for specific purposes)

- \`test-comprehensive-medical-records.js\` - Detailed medical records testing
- \`test-role-access-control.js\` - Access control validation
- \`test-medical-records-endpoints.js\` - Medical records API testing

## Running Tests

### Run All Tests
\`\`\`bash
node run-comprehensive-tests.js
\`\`\`

### Run Specific Test Suite
\`\`\`bash
npx jest test/workflow/complete-system-workflow.test.js --verbose
npx jest test/workflow/role-specific-workflows.test.js --verbose
npx jest test/workflow/api-endpoint-validation.test.js --verbose
\`\`\`

### Run with Coverage
\`\`\`bash
npx jest --coverage
\`\`\`

## Test Environment

- Uses test database (\`hospitalDB_test\`)
- Automatic cleanup of test data
- Role-based test users with predefined credentials
- Comprehensive error handling and reporting

## Test Data

Test users are automatically created for each role:
- Admin: admin.test@hospital.com
- Doctor: doctor.test@hospital.com  
- Patient: patient.test@hospital.com
- Receptionist: receptionist.test@hospital.com
- Technician: tech.test@hospital.com
- BillingStaff: billing.test@hospital.com
- Pharmacist: pharmacist.test@hospital.com
- LabSupervisor: labsupervisor.test@hospital.com

## Coverage Goals

- Statements: 80%+
- Branches: 80%+
- Functions: 80%+
- Lines: 80%+

## Continuous Integration

Tests should be run before any deployment:
1. Pre-commit hooks
2. Pull request validation
3. Pre-deployment testing
4. Production health checks

Generated on: ${new Date().toISOString()}
`;

        const docPath = path.join(__dirname, 'TEST_DOCUMENTATION.md');
        fs.writeFileSync(docPath, documentation);
        console.log(`📄 Test documentation generated: ${docPath}`);
    }
}

// Run cleanup if called directly
if (import.meta.url === `file://${__filename}`) {
    const cleanup = new TestCleanup();
    cleanup.cleanupTests().catch(console.error);
}

export default TestCleanup;
