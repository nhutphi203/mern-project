import { config } from 'dotenv';
import axios from 'axios';
import colors from 'colors';

config({ path: './config/config.env' });

const BASE_URL = 'http://localhost:4000/api/v1';

const log = {
    success: (msg) => console.log('✅ ' + msg.green),
    error: (msg) => console.log('❌ ' + msg.red),
    warning: (msg) => console.log('⚠️  ' + msg.yellow),
    info: (msg) => console.log('ℹ️  ' + msg.blue),
    header: (msg) => console.log('\n' + '🧪 ' + msg.cyan.bold),
    endpoint: (method, path) => console.log(`   ${method.toUpperCase()} ${path}`.gray)
};

// Test credentials - Using existing doctor from database
const TEST_DOCTOR_CREDENTIALS = {
    email: 'test.doctor.lab@hospital.com',
    password: 'password123',
    role: 'Doctor'
};

let doctorToken = '';

async function authenticateDoctor() {
    log.header('DOCTOR AUTHENTICATION');
    try {
        const response = await axios.post(`${BASE_URL}/users/login`, TEST_DOCTOR_CREDENTIALS);
        
        if (response.data.success) {
            doctorToken = response.data.token;
            const user = response.data.user;
            log.success(`Doctor authenticated: ${user.firstName} ${user.lastName} (${user.role})`);
            log.info(`Doctor ID: ${user._id}`);
            log.info(`Department: ${user.doctorDepartment || 'Not specified'}`);
            return true;
        } else {
            log.error('Doctor authentication failed: ' + response.data.message);
            return false;
        }
    } catch (error) {
        console.log('Full error details:', error.response?.data || error.message);
        log.error('Doctor authentication error: ' + (error.response?.data?.message || error.message));
        return false;
    }
}

async function testLabManagementEndpoints() {
    log.header('LAB MANAGEMENT ENDPOINTS TESTING');
    
    const headers = {
        'Authorization': `Bearer ${doctorToken}`,
        'Content-Type': 'application/json'
    };

    const endpoints = [
        // Lab Orders
        { method: 'GET', path: '/lab/orders', desc: 'Get lab orders' },
        { method: 'POST', path: '/lab/orders', desc: 'Create lab order' },
        { method: 'GET', path: '/lab/orders/my-orders', desc: 'Get doctor lab orders' },
        
        // Lab Results  
        { method: 'GET', path: '/lab/results', desc: 'Get lab results' },
        { method: 'GET', path: '/lab/results/pending', desc: 'Get pending results' },
        { method: 'GET', path: '/lab/results/my-results', desc: 'Get doctor results' },
        
        // Lab Queue
        { method: 'GET', path: '/lab/queue', desc: 'Get lab queue' },
        { method: 'GET', path: '/lab/queue/status', desc: 'Get queue status' },
        
        // Lab Reports
        { method: 'GET', path: '/lab/reports', desc: 'Get lab reports' },
        { method: 'GET', path: '/lab/reports/statistics', desc: 'Get lab statistics' },
        
        // Lab Tests
        { method: 'GET', path: '/lab/tests', desc: 'Get available tests' },
        { method: 'GET', path: '/lab/tests/categories', desc: 'Get test categories' }
    ];

    const results = {
        success: 0,
        accessDenied: 0,
        notFound: 0,
        otherErrors: 0
    };

    for (const endpoint of endpoints) {
        log.endpoint(endpoint.method, endpoint.path);
        
        try {
            let response;
            
            if (endpoint.method === 'GET') {
                response = await axios.get(`${BASE_URL}${endpoint.path}`, { headers });
            } else if (endpoint.method === 'POST') {
                // Sample data for POST requests
                const sampleData = {
                    patientId: '66c5b12345678901234567ab',
                    tests: ['CBC', 'Blood Sugar'],
                    priority: 'Normal',
                    notes: 'Routine checkup'
                };
                response = await axios.post(`${BASE_URL}${endpoint.path}`, sampleData, { headers });
            }
            
            if (response.data.success) {
                log.success(`${endpoint.desc}: SUCCESS`);
                if (response.data.data) {
                    log.info(`   Data count: ${Array.isArray(response.data.data) ? response.data.data.length : 'Object'}`);
                }
                results.success++;
            } else {
                log.warning(`${endpoint.desc}: ${response.data.message}`);
                results.otherErrors++;
            }
            
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            
            if (status === 403) {
                log.error(`${endpoint.desc}: ACCESS DENIED - ${message}`);
                results.accessDenied++;
            } else if (status === 404) {
                log.warning(`${endpoint.desc}: NOT FOUND - ${message}`);
                results.notFound++;
            } else {
                log.error(`${endpoint.desc}: ERROR (${status}) - ${message}`);
                results.otherErrors++;
            }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

async function testSpecificLabFunctionality() {
    log.header('SPECIFIC LAB FUNCTIONALITY TESTING');
    
    const headers = {
        'Authorization': `Bearer ${doctorToken}`,
        'Content-Type': 'application/json'
    };

    // Test 1: Doctor creating lab order
    log.info('1. Testing doctor creating lab order...');
    try {
        const labOrderData = {
            patientId: '66c5b12345678901234567ab', // Sample patient ID
            appointmentId: '66c5b12345678901234567cd', // Sample appointment ID
            tests: [
                {
                    testName: 'Complete Blood Count (CBC)',
                    testCode: 'CBC001',
                    category: 'Hematology',
                    priority: 'Normal'
                },
                {
                    testName: 'Blood Glucose',
                    testCode: 'GLU001', 
                    category: 'Chemistry',
                    priority: 'Normal'
                }
            ],
            clinicalNotes: 'Routine checkup - patient reports fatigue',
            urgency: 'Normal',
            expectedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        const response = await axios.post(`${BASE_URL}/lab/orders`, labOrderData, { headers });
        
        if (response.data.success) {
            log.success('Lab order created successfully');
            log.info(`Order ID: ${response.data.data._id}`);
            log.info(`Tests ordered: ${response.data.data.tests.length}`);
        } else {
            log.error('Lab order creation failed: ' + response.data.message);
        }
    } catch (error) {
        log.error('Lab order creation error: ' + (error.response?.data?.message || error.message));
    }

    // Test 2: Doctor viewing patient lab results
    log.info('2. Testing doctor viewing lab results...');
    try {
        const response = await axios.get(`${BASE_URL}/lab/results?limit=5`, { headers });
        
        if (response.data.success) {
            log.success(`Retrieved ${response.data.data?.length || 0} lab results`);
            if (response.data.data && response.data.data.length > 0) {
                const result = response.data.data[0];
                log.info(`Sample result: ${result.testName} - ${result.status}`);
            }
        } else {
            log.error('Lab results retrieval failed: ' + response.data.message);
        }
    } catch (error) {
        log.error('Lab results error: ' + (error.response?.data?.message || error.message));
    }

    // Test 3: Doctor viewing lab queue
    log.info('3. Testing doctor viewing lab queue...');
    try {
        const response = await axios.get(`${BASE_URL}/lab/queue`, { headers });
        
        if (response.data.success) {
            log.success(`Lab queue retrieved with ${response.data.data?.length || 0} items`);
        } else {
            log.error('Lab queue retrieval failed: ' + response.data.message);
        }
    } catch (error) {
        log.error('Lab queue error: ' + (error.response?.data?.message || error.message));
    }
}

async function analyzeLabPermissions() {
    log.header('LAB PERMISSIONS ANALYSIS');
    
    log.info('Expected doctor lab permissions:');
    log.info('✅ Should be able to: Create lab orders for patients');
    log.info('✅ Should be able to: View lab results for own patients');
    log.info('✅ Should be able to: View lab queue status');
    log.info('✅ Should be able to: Access lab reports for own orders');
    log.info('❌ Should NOT be able to: Modify lab results (Lab Tech only)');
    log.info('❌ Should NOT be able to: Delete lab orders (Admin only)');
    log.info('❌ Should NOT be able to: Access all lab data (LabSupervisor only)');
}

async function runLabManagementTests() {
    log.header('DOCTOR LAB MANAGEMENT TESTING SUITE');
    log.info('Testing lab management functionality with Doctor role permissions');

    // Step 1: Authenticate as doctor
    const isAuthenticated = await authenticateDoctor();
    if (!isAuthenticated) {
        log.error('Cannot proceed without doctor authentication');
        return;
    }

    // Step 2: Test all lab endpoints
    const endpointResults = await testLabManagementEndpoints();

    // Step 3: Test specific lab functionality
    await testSpecificLabFunctionality();

    // Step 4: Analyze permissions
    await analyzeLabPermissions();

    // Step 5: Summary
    log.header('TEST SUMMARY');
    log.info(`✅ Successful requests: ${endpointResults.success}`);
    log.warning(`⚠️  Not found endpoints: ${endpointResults.notFound}`);
    log.error(`❌ Access denied: ${endpointResults.accessDenied}`);
    log.error(`🔧 Other errors: ${endpointResults.otherErrors}`);

    if (endpointResults.accessDenied > 0) {
        log.header('ACCESS DENIED ISSUES DETECTED');
        log.error('Doctor role is being denied access to lab management features');
        log.info('Possible causes:');
        log.info('1. Missing lab management routes in backend');
        log.info('2. Incorrect role permissions in middleware');
        log.info('3. Missing Doctor role in lab router configurations');
        log.info('4. Authentication token issues');
    }

    if (endpointResults.notFound > 0) {
        log.header('MISSING ENDPOINTS DETECTED');
        log.warning('Some lab management endpoints are not implemented');
        log.info('Check if lab router is properly mounted in app.js');
    }
}

// Run the tests
runLabManagementTests().catch(console.error);
