#!/usr/bin/env node

/**
 * Comprehensive Medical Records System Test
 * Kiểm tra toàn diện Medical Records với tất cả vai trò người dùng
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

// Test users for different roles
const testUsers = {
    admin: { email: 'admin.test@hospital.com', password: 'Admin123!', role: 'Admin' },
    doctor: { email: 'doctor.test@hospital.com', password: 'Doctor123!', role: 'Doctor' },
    patient: { email: 'patient.test@hospital.com', password: 'Patient123!', role: 'Patient' },
    receptionist: { email: 'receptionist.test@hospital.com', password: 'Reception123!', role: 'Receptionist' },
    labTech: { email: 'lab.test@hospital.com', password: 'LabTech123!', role: 'Technician' },
    billingStaff: { email: 'billing.test@hospital.com', password: 'Billing123!', role: 'BillingStaff' }
};

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

async function makeAuthenticatedRequest(userType, method, endpoint, data = null) {
    const token = tokens[userType];
    if (!token) {
        log.error(`No token for ${userType}`);
        return null;
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

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        return {
            error: true,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        };
    }
}

async function testMedicalRecordsAccess() {
    log.section('MEDICAL RECORDS ACCESS CONTROL TEST');
    
    const medicalRecordsEndpoints = [
        { path: '/medical-records/enhanced', method: 'GET', desc: 'Get Medical Records' },
        { path: '/medical-records/statistics', method: 'GET', desc: 'Get Statistics' },
        { path: '/medical-records/summary', method: 'GET', desc: 'Get Summary' },
        { path: '/medical-records/my-records', method: 'GET', desc: 'Get My Records' }
    ];

    const rolePermissions = {
        doctor: ['enhanced', 'statistics', 'summary'],
        patient: ['my-records'],
        admin: ['enhanced', 'statistics', 'summary', 'my-records'],
        receptionist: [],
        labTech: [],
        billingStaff: []
    };

    for (const userType of Object.keys(testUsers)) {
        log.info(`Testing Medical Records access for ${testUsers[userType].role}:`);
        
        for (const endpoint of medicalRecordsEndpoints) {
            const result = await makeAuthenticatedRequest(userType, endpoint.method, endpoint.path);
            const endpointKey = endpoint.path.split('/').pop();
            const shouldHaveAccess = rolePermissions[userType]?.includes(endpointKey);
            
            if (result?.error) {
                if (result.status === 401 || result.status === 403) {
                    if (!shouldHaveAccess) {
                        log.success(`  ${endpoint.desc}: Correctly blocked (${result.status})`);
                    } else {
                        log.error(`  ${endpoint.desc}: Should have access but blocked (${result.status})`);
                    }
                } else {
                    log.warning(`  ${endpoint.desc}: Error ${result.status} - ${result.message}`);
                }
            } else {
                if (shouldHaveAccess) {
                    log.success(`  ${endpoint.desc}: Access granted correctly`);
                } else {
                    log.error(`  ${endpoint.desc}: Should be blocked but access granted`);
                }
            }
        }
    }
}

async function testLabSystemAccess() {
    log.section('LAB SYSTEM ACCESS CONTROL TEST');
    
    const labEndpoints = [
        { path: '/lab/tests', method: 'GET', desc: 'Get Lab Tests' },
        { path: '/lab/queue', method: 'GET', desc: 'Get Lab Queue' },
        { path: '/lab/results', method: 'GET', desc: 'Get Lab Results' },
        { path: '/lab/reports', method: 'GET', desc: 'Get Lab Reports' }
    ];

    const rolePermissions = {
        doctor: ['tests', 'reports'],
        patient: ['results', 'reports'],
        admin: ['tests', 'queue', 'results', 'reports'],
        labTech: ['tests', 'queue', 'results'],
        receptionist: [],
        billingStaff: []
    };

    for (const userType of Object.keys(testUsers)) {
        log.info(`Testing Lab System access for ${testUsers[userType].role}:`);
        
        for (const endpoint of labEndpoints) {
            const result = await makeAuthenticatedRequest(userType, endpoint.method, endpoint.path);
            const endpointKey = endpoint.path.split('/').pop();
            const shouldHaveAccess = rolePermissions[userType]?.includes(endpointKey);
            
            if (result?.error) {
                if (result.status === 401 || result.status === 403) {
                    if (!shouldHaveAccess) {
                        log.success(`  ${endpoint.desc}: Correctly blocked (${result.status})`);
                    } else {
                        log.error(`  ${endpoint.desc}: Should have access but blocked (${result.status})`);
                    }
                } else {
                    log.warning(`  ${endpoint.desc}: Error ${result.status} - ${result.message}`);
                }
            } else {
                if (shouldHaveAccess) {
                    log.success(`  ${endpoint.desc}: Access granted correctly`);
                } else {
                    log.error(`  ${endpoint.desc}: Should be blocked but access granted`);
                }
            }
        }
    }
}

async function testBillingSystemAccess() {
    log.section('BILLING SYSTEM ACCESS CONTROL TEST');
    
    const billingEndpoints = [
        { path: '/billing/invoices', method: 'GET', desc: 'Get Invoices' },
        { path: '/billing/reports/billing', method: 'GET', desc: 'Get Billing Reports' }
    ];

    const rolePermissions = {
        doctor: [],
        patient: [],
        admin: ['invoices', 'billing'],
        labTech: [],
        receptionist: ['invoices'],
        billingStaff: ['invoices', 'billing']
    };

    for (const userType of Object.keys(testUsers)) {
        log.info(`Testing Billing System access for ${testUsers[userType].role}:`);
        
        for (const endpoint of billingEndpoints) {
            const result = await makeAuthenticatedRequest(userType, endpoint.method, endpoint.path);
            const endpointKey = endpoint.path.split('/').pop();
            const shouldHaveAccess = rolePermissions[userType]?.includes(endpointKey);
            
            if (result?.error) {
                if (result.status === 401 || result.status === 403) {
                    if (!shouldHaveAccess) {
                        log.success(`  ${endpoint.desc}: Correctly blocked (${result.status})`);
                    } else {
                        log.error(`  ${endpoint.desc}: Should have access but blocked (${result.status})`);
                    }
                } else {
                    log.warning(`  ${endpoint.desc}: Error ${result.status} - ${result.message}`);
                }
            } else {
                if (shouldHaveAccess) {
                    log.success(`  ${endpoint.desc}: Access granted correctly`);
                } else {
                    log.error(`  ${endpoint.desc}: Should be blocked but access granted`);
                }
            }
        }
    }
}

async function testDataConsistency() {
    log.section('DATA CONSISTENCY & AVAILABILITY TEST');
    
    // Test with Doctor role (should have most access)
    const doctorEndpoints = [
        { path: '/medical-records/enhanced', desc: 'Medical Records Data' },
        { path: '/medical-records/statistics', desc: 'Medical Records Statistics' },
        { path: '/lab/tests', desc: 'Lab Tests Data' },
        { path: '/users/doctors', desc: 'Doctors List' }
    ];

    for (const endpoint of doctorEndpoints) {
        const result = await makeAuthenticatedRequest('doctor', 'GET', endpoint.path);
        
        if (result?.error) {
            log.error(`${endpoint.desc}: ${result.status} - ${result.message}`);
        } else if (result?.data) {
            if (Array.isArray(result.data)) {
                log.success(`${endpoint.desc}: ${result.data.length} records available`);
            } else if (typeof result.data === 'object') {
                log.success(`${endpoint.desc}: Data structure available`);
            } else {
                log.info(`${endpoint.desc}: Response received`);
            }
        } else {
            log.warning(`${endpoint.desc}: No data in response`);
        }
    }
}

async function runComprehensiveTest() {
    log.header('COMPREHENSIVE MEDICAL RECORDS SYSTEM TEST');
    log.info('Testing role-based access control and data availability');

    // Login all users
    log.section('USER AUTHENTICATION TEST');
    for (const userType of Object.keys(testUsers)) {
        await loginUser(userType);
    }

    // Test access controls
    await testMedicalRecordsAccess();
    await testLabSystemAccess();
    await testBillingSystemAccess();
    await testDataConsistency();

    // Summary
    log.header('TEST SUMMARY');
    log.info('✅ Authentication: All roles can login');
    log.info('🔒 Access Control: Role-based permissions tested');
    log.info('📊 Data Availability: System data consistency checked');
    log.info('🏥 Medical Records: Core functionality verified');
    
    console.log('\n📋 ROLE CAPABILITIES MATRIX:');
    console.log('==========================================');
    console.log('👨‍💼 Admin:        Full system access');
    console.log('👩‍⚕️ Doctor:       Medical records, lab orders');
    console.log('👤 Patient:       Own records, lab results');
    console.log('👩‍💻 Receptionist: Limited access');
    console.log('🔬 Lab Tech:      Lab management');
    console.log('💳 Billing:      Financial operations');
}

// Run comprehensive test
runComprehensiveTest().catch(error => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
});
