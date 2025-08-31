#!/usr/bin/env node

/**
 * Detailed Role-Based Access Control Test
 * Kiểm tra chi tiết permissions cho từng endpoint
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

// Test users with correct passwords
const testUsers = {
    admin: { email: 'admin.test@hospital.com', password: 'Admin123!', role: 'Admin' },
    doctor: { email: 'doctor.test@hospital.com', password: 'Doctor123!', role: 'Doctor' },
    patient: { email: 'patient.test@hospital.com', password: 'Patient123!', role: 'Patient' },
    receptionist: { email: 'receptionist.test@hospital.com', password: 'Reception123!', role: 'Receptionist' },
    labTech: { email: 'lab.test@hospital.com', password: 'Lab123456!', role: 'Technician' },
    billingStaff: { email: 'billing.test@hospital.com', password: 'Billing123!', role: 'BillingStaff' }
};

// Logger
const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg),
    section: (msg) => console.log('\n📋 ' + msg)
};

// Store auth tokens
const tokens = {};

// Login function
async function loginUser(userType) {
    const user = testUsers[userType];
    try {
        const response = await axios.post(`${BASE_URL}/users/login`, {
            email: user.email,
            password: user.password,
            role: user.role
        });
        
        if (response.data.success) {
            tokens[userType] = response.data.token;
            log.success(`${user.role} login successful`);
            return true;
        }
    } catch (error) {
        log.error(`${user.role} login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test API access
async function testEndpoint(userType, method, endpoint, expectedStatus, description) {
    const token = tokens[userType];
    if (!token) {
        log.error(`No token for ${userType}`);
        return false;
    }

    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios(config);
        
        if (expectedStatus === 200 && response.status === 200) {
            log.success(`${userType} - ${description}: Access granted (as expected)`);
            return true;
        } else if (expectedStatus !== 200 && response.status === 200) {
            log.error(`${userType} - ${description}: Should be blocked but access granted`);
            return false;
        }
        
    } catch (error) {
        if (expectedStatus === 403 && error.response?.status === 403) {
            log.success(`${userType} - ${description}: Correctly blocked (403)`);
            return true;
        } else if (expectedStatus === 401 && error.response?.status === 401) {
            log.success(`${userType} - ${description}: Correctly blocked (401)`);
            return true;
        } else if (expectedStatus === 200) {
            log.error(`${userType} - ${description}: Should have access but blocked (${error.response?.status})`);
            return false;
        } else {
            log.warning(`${userType} - ${description}: Unexpected status ${error.response?.status}`);
            return false;
        }
    }
}

// Define expected access permissions
const accessMatrix = {
    // Medical Records endpoints
    '/medical-records/enhanced': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can view all records
        'Patient': 403,    // ✗ Cannot view all records
        'Receptionist': 403, // ✗ Limited access
        'Technician': 403,   // ✗ No access
        'BillingStaff': 403  // ✗ No access
    },
    '/medical-records/statistics': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can view statistics
        'Patient': 403,    // ✗ Cannot view statistics
        'Receptionist': 403, // ✗ No access
        'Technician': 403,   // ✗ No access
        'BillingStaff': 403  // ✗ No access
    },
    '/medical-records/summary': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can view summary
        'Patient': 403,    // ✗ Cannot view summary
        'Receptionist': 403, // ✗ No access
        'Technician': 403,   // ✗ No access
        'BillingStaff': 403  // ✗ No access
    },
    '/medical-records/my-records': {
        'Admin': 200,      // ✓ Can view (as admin)
        'Doctor': 403,     // ✗ Should not access this patient endpoint
        'Patient': 200,    // ✓ Can view own records
        'Receptionist': 403, // ✗ No access
        'Technician': 403,   // ✗ No access
        'BillingStaff': 403  // ✗ No access
    },
    
    // Lab System endpoints
    '/lab/tests': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can order tests
        'Patient': 403,    // ✗ Cannot view all tests
        'Receptionist': 403, // ✗ Limited access
        'Technician': 200,   // ✓ Lab management
        'BillingStaff': 403  // ✗ No access
    },
    '/lab/queue': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 403,     // ✗ Cannot manage queue
        'Patient': 403,    // ✗ No access
        'Receptionist': 403, // ✗ No access
        'Technician': 200,   // ✓ Queue management
        'BillingStaff': 403  // ✗ No access
    },
    '/lab/results': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can view results
        'Patient': 200,    // ✓ Can view own results
        'Receptionist': 403, // ✗ No access
        'Technician': 200,   // ✓ Enter results
        'BillingStaff': 403  // ✗ No access
    },
    '/lab/reports': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 200,     // ✓ Can view reports
        'Patient': 200,    // ✓ Can view own reports
        'Receptionist': 403, // ✗ No access
        'Technician': 403,   // ✗ Only supervisors
        'BillingStaff': 403  // ✗ No access
    },
    
    // Billing System endpoints
    '/billing/invoices': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 403,     // ✗ No billing access
        'Patient': 403,    // ✗ Cannot view all invoices
        'Receptionist': 200, // ✓ Invoice management (FIXED)
        'Technician': 403,   // ✗ No access
        'BillingStaff': 200  // ✓ Billing operations
    },
    '/billing/reports/billing': {
        'Admin': 200,      // ✓ Full access
        'Doctor': 403,     // ✗ No billing access
        'Patient': 403,    // ✗ No access
        'Receptionist': 403, // ✗ Limited access
        'Technician': 403,   // ✗ No access
        'BillingStaff': 200  // ✓ Billing reports
    }
};

async function runComprehensiveTest() {
    log.header('DETAILED ROLE-BASED ACCESS CONTROL TEST');
    log.info('Testing precise permissions for each endpoint');

    // Step 1: Login all users
    log.section('USER AUTHENTICATION');
    const userTypes = Object.keys(testUsers);
    for (const userType of userTypes) {
        await loginUser(userType);
    }

    // Step 2: Test each endpoint against access matrix
    let totalTests = 0;
    let passedTests = 0;
    
    log.section('ACCESS CONTROL VERIFICATION');
    
    for (const endpoint in accessMatrix) {
        log.info(`\n🔍 Testing endpoint: ${endpoint}`);
        
        for (const userType of userTypes) {
            const user = testUsers[userType];
            const expectedStatus = accessMatrix[endpoint][user.role];
            
            if (expectedStatus !== undefined) {
                totalTests++;
                const testDescription = `${endpoint} access`;
                const success = await testEndpoint(userType, 'GET', endpoint, expectedStatus, testDescription);
                if (success) passedTests++;
            }
        }
    }

    // Step 3: Results summary
    log.section('TEST RESULTS SUMMARY');
    log.info(`Total tests: ${totalTests}`);
    log.info(`Passed: ${passedTests}`);
    log.info(`Failed: ${totalTests - passedTests}`);
    log.info(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        log.success('🎉 ALL ACCESS CONTROL TESTS PASSED!');
    } else {
        log.error(`💥 ${totalTests - passedTests} ACCESS CONTROL ISSUES FOUND`);
        
        log.section('RECOMMENDATIONS TO FIX');
        log.info('1. Check middleware authorization in routes');
        log.info('2. Verify requireRole() calls with correct role arrays');
        log.info('3. Ensure isAuthenticated() is applied before requireRole()');
        log.info('4. Check router file imports and middleware order');
    }
}

// Run the test
runComprehensiveTest().catch(console.error);
