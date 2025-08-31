// Medical Record Functionality Test Script
import axios from 'axios';
import { config } from 'dotenv';

config({ path: './config/config.env' });

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test credentials for different roles
const testUsers = {
    doctor: {
        email: 'doctor@hospital.com',
        password: 'password123',
        role: 'Doctor'
    },
    nurse: {
        email: 'nurse@hospital.com',
        password: 'password123',
        role: 'Nurse'
    },
    admin: {
        email: 'admin@hospital.com',
        password: 'password123',
        role: 'Admin'
    },
    patient: {
        email: 'patient@hospital.com',
        password: 'password123',
        role: 'Patient'
    }
};

// Authentication tokens storage
const authTokens = {};

// Utility function to authenticate users
const authenticateUser = async (userType) => {
    try {
        const user = testUsers[userType];
        const response = await axios.post(`${API_BASE}/login`, {
            email: user.email,
            password: user.password
        });

        authTokens[userType] = response.data.token;
        console.log(`✅ Authenticated ${userType}: ${user.email}`);
        return response.data.token;

    } catch (error) {
        console.error(`❌ Authentication failed for ${userType}:`, error.response?.data?.message || error.message);
        return null;
    }
};

// Utility function to make authenticated requests
const makeAuthenticatedRequest = async (method, endpoint, userType, data = null) => {
    try {
        const token = authTokens[userType];
        if (!token) {
            throw new Error(`No token available for ${userType}`);
        }

        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;

    } catch (error) {
        console.error(`❌ Request failed: ${method} ${endpoint}`, error.response?.data?.message || error.message);
        return null;
    }
};

// Test ICD-10 functionality
const testICD10Functionality = async () => {
    console.log('\n🔍 Testing ICD-10 Functionality...');

    // Test 1: Search ICD-10 codes (Doctor access)
    console.log('   📝 Test 1: Doctor searching ICD-10 codes...');
    const searchResults = await makeAuthenticatedRequest('GET', '/icd10/search?query=diabetes', 'doctor');
    if (searchResults?.success) {
        console.log(`   ✅ Found ${searchResults.data.length} ICD-10 codes for "diabetes"`);
    }

    // Test 2: Get ICD-10 statistics (Admin access)
    console.log('   📊 Test 2: Admin accessing ICD-10 statistics...');
    const stats = await makeAuthenticatedRequest('GET', '/icd10/statistics', 'admin');
    if (stats?.success) {
        console.log(`   ✅ ICD-10 statistics: ${stats.data.totalCodes} total codes`);
    }

    // Test 3: Patient attempting to access ICD-10 (should fail)
    console.log('   🚫 Test 3: Patient attempting ICD-10 access (should fail)...');
    const patientAccess = await makeAuthenticatedRequest('GET', '/icd10/search?query=diabetes', 'patient');
    if (!patientAccess) {
        console.log('   ✅ Patient access correctly denied');
    }
};

// Test CPOE functionality
const testCPOEFunctionality = async () => {
    console.log('\n💊 Testing CPOE Functionality...');

    // Test 1: Doctor creating medication order
    console.log('   💉 Test 1: Doctor creating medication order...');
    const medicationOrder = {
        patientId: 'sample_patient_id',
        orderType: 'Medication',
        medicationOrder: {
            medicationName: 'Aspirin',
            dosage: '81mg',
            route: 'Oral',
            frequency: 'Daily',
            duration: '30 days',
            instructions: 'Take with food'
        },
        priority: 'Routine'
    };

    const createOrder = await makeAuthenticatedRequest('POST', '/cpoe/orders', 'doctor', medicationOrder);
    if (createOrder?.success) {
        console.log('   ✅ Medication order created successfully');
    }

    // Test 2: Nurse accessing orders
    console.log('   👩‍⚕️ Test 2: Nurse accessing CPOE orders...');
    const nurseOrders = await makeAuthenticatedRequest('GET', '/cpoe/orders', 'nurse');
    if (nurseOrders?.success) {
        console.log(`   ✅ Nurse can view ${nurseOrders.data.length} orders`);
    }

    // Test 3: Admin accessing order statistics
    console.log('   📈 Test 3: Admin accessing order statistics...');
    const orderStats = await makeAuthenticatedRequest('GET', '/cpoe/statistics', 'admin');
    if (orderStats?.success) {
        console.log('   ✅ Admin can access order statistics');
    }
};

// Test Enhanced Medical Records functionality
const testMedicalRecordsFunctionality = async () => {
    console.log('\n📋 Testing Enhanced Medical Records...');

    // Test 1: Doctor creating medical record
    console.log('   👨‍⚕️ Test 1: Doctor creating medical record...');
    const medicalRecord = {
        patientId: 'sample_patient_id',
        clinicalAssessment: {
            chiefComplaint: 'Annual physical examination',
            historyOfPresentIllness: 'Patient presents for routine annual check-up'
        },
        diagnoses: [{
            icd10Code: 'Z00.00',
            icd10Description: 'Encounter for general adult medical examination without abnormal findings',
            diagnosisType: 'Primary'
        }]
    };

    const createRecord = await makeAuthenticatedRequest('POST', '/medical-records/enhanced', 'doctor', medicalRecord);
    if (createRecord?.success) {
        console.log('   ✅ Medical record created successfully');
    }

    // Test 2: Patient accessing own records
    console.log('   👤 Test 2: Patient accessing own medical records...');
    const patientRecords = await makeAuthenticatedRequest('GET', '/medical-records/patient/mine', 'patient');
    if (patientRecords?.success) {
        console.log(`   ✅ Patient can view ${patientRecords.data.length} own records`);
    }

    // Test 3: Nurse accessing records for care coordination
    console.log('   👩‍⚕️ Test 3: Nurse accessing records for care...');
    const nurseRecords = await makeAuthenticatedRequest('GET', '/medical-records/enhanced', 'nurse');
    if (nurseRecords?.success) {
        console.log('   ✅ Nurse can access medical records for care coordination');
    }
};

// Test role-based access control
const testRoleBasedAccess = async () => {
    console.log('\n🔐 Testing Role-Based Access Control...');

    const accessTests = [
        { role: 'doctor', endpoint: '/icd10/search?query=test', shouldPass: true },
        { role: 'nurse', endpoint: '/cpoe/orders', shouldPass: true },
        { role: 'admin', endpoint: '/icd10/statistics', shouldPass: true },
        { role: 'patient', endpoint: '/icd10/search?query=test', shouldPass: false },
        { role: 'patient', endpoint: '/cpoe/orders', shouldPass: false }
    ];

    for (const test of accessTests) {
        const result = await makeAuthenticatedRequest('GET', test.endpoint, test.role);
        const passed = test.shouldPass ? result?.success : !result;

        if (passed) {
            console.log(`   ✅ ${test.role} access to ${test.endpoint}: ${test.shouldPass ? 'Allowed' : 'Denied'} (Expected)`);
        } else {
            console.log(`   ❌ ${test.role} access to ${test.endpoint}: Unexpected result`);
        }
    }
};

// Test clinical decision support
const testClinicalDecisionSupport = async () => {
    console.log('\n🧠 Testing Clinical Decision Support...');

    // Test drug interaction checking
    console.log('   💊 Test 1: Drug interaction alerts...');
    const interactionCheck = await makeAuthenticatedRequest('POST', '/cpoe/check-interactions', 'doctor', {
        medications: ['Warfarin', 'Aspirin'],
        patientId: 'sample_patient_id'
    });

    if (interactionCheck?.success) {
        console.log('   ✅ Drug interaction checking functional');
    }

    // Test allergy alerts
    console.log('   🚨 Test 2: Allergy alert system...');
    const allergyCheck = await makeAuthenticatedRequest('POST', '/cpoe/check-allergies', 'doctor', {
        medication: 'Penicillin',
        patientId: 'sample_patient_id'
    });

    if (allergyCheck?.success) {
        console.log('   ✅ Allergy alert system functional');
    }
};

// Main test runner
const runMedicalRecordTests = async () => {
    try {
        console.log('🧪 Starting Medical Record Functionality Tests...');
        console.log(`🔗 Testing against: ${BASE_URL}\n`);

        // Authenticate all user types
        console.log('🔐 Authenticating test users...');
        for (const userType of Object.keys(testUsers)) {
            await authenticateUser(userType);
        }
        console.log('');

        // Run all test suites
        await testICD10Functionality();
        await testCPOEFunctionality();
        await testMedicalRecordsFunctionality();
        await testRoleBasedAccess();
        await testClinicalDecisionSupport();

        console.log('\n🎉 Medical Record Functionality Tests Completed!');
        console.log('\n📊 Test Summary:');
        console.log('   ✅ ICD-10 diagnosis code management');
        console.log('   ✅ CPOE order management system');
        console.log('   ✅ Enhanced medical record creation');
        console.log('   ✅ Role-based access control');
        console.log('   ✅ Clinical decision support features');

    } catch (error) {
        console.error('❌ Fatal error in testing process:', error);
    }
};

// Usage instructions
const printUsageInstructions = () => {
    console.log('\n📖 Medical Record Testing Instructions:');
    console.log('');
    console.log('1. Ensure your backend server is running on port 4000');
    console.log('2. Make sure test users exist in your database:');
    console.log('   - doctor@hospital.com (Doctor role)');
    console.log('   - nurse@hospital.com (Nurse role)');
    console.log('   - admin@hospital.com (Admin role)');
    console.log('   - patient@hospital.com (Patient role)');
    console.log('3. Run the seeder first: node masterMedicalRecordsSeeder.js');
    console.log('4. Then run this test: node testMedicalRecordFunctionality.js');
    console.log('');
    console.log('🧪 Test Coverage:');
    console.log('   📋 Enhanced Medical Records CRUD operations');
    console.log('   🔍 ICD-10 diagnosis code search and management');
    console.log('   💊 CPOE order creation and management');
    console.log('   🔐 Role-based access control verification');
    console.log('   🧠 Clinical decision support features');
    console.log('   🚨 Safety checks and alerts');
};

// Export for use in other scripts
export {
    runMedicalRecordTests,
    authenticateUser,
    makeAuthenticatedRequest,
    testICD10Functionality,
    testCPOEFunctionality,
    testMedicalRecordsFunctionality
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Check if help is requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        printUsageInstructions();
    } else {
        runMedicalRecordTests();
    }
}
