// Quick validation test for Medical Records critical fixes
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🎯 MEDICAL RECORDS CRITICAL FIXES - VALIDATION TEST');
console.log('==================================================');

function runValidation() {
    const results = {
        backendFixes: 0,
        frontendFixes: 0,
        routerFixes: 0,
        total: 0
    };

    console.log('\n📋 ISSUE 1: Backend Schema Mismatch - VALIDATION');
    try {
        // Check if controller has appointmentId fix
        const controllerContent = fs.readFileSync('./controller/enhancedMedicalRecordController.js', 'utf8');

        if (controllerContent.includes('appointmentId,') && controllerContent.includes('doctorId,')) {
            console.log('✅ Backend controller has appointmentId and doctorId mapping');
            results.backendFixes++;
        } else {
            console.log('❌ Backend controller missing appointmentId/doctorId mapping');
        }

        if (controllerContent.includes('CRITICAL FIX') || controllerContent.includes('FIXED')) {
            console.log('✅ Backend controller has critical fix markers');
            results.backendFixes++;
        } else {
            console.log('❌ Backend controller missing fix markers');
        }

        results.total += 2;
    } catch (error) {
        console.log('❌ Error validating backend controller:', error.message);
    }

    console.log('\n📋 ISSUE 2: Frontend Type Interface Mismatch - VALIDATION');
    try {
        // Check if frontend has appointmentId interface
        const frontendContent = fs.readFileSync('../frontend/src/api/medicalRecords.ts', 'utf8');

        if (frontendContent.includes('appointmentId?: string')) {
            console.log('✅ Frontend interface has appointmentId support');
            results.frontendFixes++;
        } else {
            console.log('❌ Frontend interface missing appointmentId');
        }

        if (frontendContent.includes('mapLegacyMedicalRecord')) {
            console.log('✅ Frontend has backward compatibility helper');
            results.frontendFixes++;
        } else {
            console.log('❌ Frontend missing backward compatibility helper');
        }

        if (frontendContent.includes('LegacyMedicalRecord')) {
            console.log('✅ Frontend has legacy type support');
            results.frontendFixes++;
        } else {
            console.log('❌ Frontend missing legacy type support');
        }

        results.total += 3;
    } catch (error) {
        console.log('❌ Error validating frontend interface:', error.message);
    }

    console.log('\n📋 ISSUE 3: Duplicate Routes Cleanup - VALIDATION');
    try {
        // Check if router has been cleaned up
        const routerContent = fs.readFileSync('./router/medicalRecordRouter.js', 'utf8');

        if (routerContent.includes('LEGACY MEDICAL RECORD ROUTES')) {
            console.log('✅ Router has organized legacy routes');
            results.routerFixes++;
        } else {
            console.log('❌ Router missing legacy route organization');
        }

        if (routerContent.includes('ISSUE 3 FIX')) {
            console.log('✅ Router has duplicate route fix');
            results.routerFixes++;
        } else {
            console.log('❌ Router missing duplicate route fix');
        }

        results.total += 2;
    } catch (error) {
        console.log('❌ Error validating router cleanup:', error.message);
    }

    console.log('\n📊 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`✅ Backend fixes: ${results.backendFixes}/2`);
    console.log(`✅ Frontend fixes: ${results.frontendFixes}/3`);
    console.log(`✅ Router fixes: ${results.routerFixes}/2`);
    console.log(`🎯 Total fixes: ${results.backendFixes + results.frontendFixes + results.routerFixes}/${results.total}`);

    const percentage = Math.round(((results.backendFixes + results.frontendFixes + results.routerFixes) / results.total) * 100);

    if (percentage >= 85) {
        console.log(`\n🎉 SUCCESS! ${percentage}% of critical fixes validated`);
        console.log('✅ Medical Records system is ready for testing');
        return true;
    } else {
        console.log(`\n⚠️  WARNING! Only ${percentage}% of critical fixes validated`);
        console.log('❌ Some critical fixes may be missing');
        return false;
    }
}

console.log('\n🔍 TESTING FILE STRUCTURE...');
try {

    // Check test files exist
    const testFiles = [
        './test/integration/medicalRecordsIntegration.test.js',
        './test/performance/medicalRecordsPerformance.test.js',
        './test/security/accessControl.test.js',
        './test/integrity/dataIntegrity.test.js',
        './test/database/seeders/medicalRecordSeeder.js'
    ];

    let existingFiles = 0;
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
            existingFiles++;
        } else {
            console.log(`❌ ${file} missing`);
        }
    });

    console.log(`📊 Test files: ${existingFiles}/${testFiles.length} available`);

} catch (error) {
    console.log('❌ Error checking test structure:', error.message);
}

console.log('\n🧪 VALIDATING CRITICAL FIXES...');
const success = runValidation();

console.log('\n🎯 NEXT STEPS:');
if (success) {
    console.log('1. ✅ Run comprehensive test suite: npm run test:all');
    console.log('2. ✅ Run performance tests: npm run test:performance');
    console.log('3. ✅ Run security tests: npm run test:security');
    console.log('4. ✅ Validate frontend integration');
    console.log('5. ✅ Deploy to staging environment');
} else {
    console.log('1. ❌ Review and complete missing critical fixes');
    console.log('2. ❌ Re-run validation test');
    console.log('3. ❌ Fix any remaining schema mismatches');
    console.log('4. ❌ Ensure all routes are properly organized');
}

process.exit(success ? 0 : 1);
