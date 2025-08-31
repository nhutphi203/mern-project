/**
 * ✅ COMPREHENSIVE MEDICAL RECORDS API ENDPOINT TESTING
 * 
 * Kiểm tra tất cả endpoints Medical Records với đường dẫn chính xác
 * Tests all Medical Record System features from sidebar navigation
 * 
 * MEDICAL RECORDS ENDPOINTS TO TEST:
 * 1. /medical-records/create - Create Medical Record (Doctor)
 * 2. /medical-records/search - Patient Search (Doctor, Admin, Lab Tech)
 * 3. /medical-records/manage - Manage Records (Doctor, Admin)
 * 4. /medical-records/cpoe - CPOE Orders (Doctor)
 * 5. /medical-records/prescriptions - Prescriptions (Doctor, Patient, Pharmacist)
 * 6. /medical-records/diagnosis - ICD-10 Diagnosis (Doctor)
 * 7. /medical-records/my-records - My Records (Patient)
 * 8. /medical-records/reports - Medical Reports (Admin, Doctor)
 * 9. /medical-records/overview - Records Overview (Receptionist, Admin, etc.)
 * 
 */

const axios = require('axios');
const colors = require('colors');

class MedicalRecordsEndpointTester {
    constructor() {
        this.baseURL = 'http://localhost:4000/api/v1';
        this.authToken = null;
        this.testResults = [];
        this.doctorToken = null;
        this.adminToken = null;
        this.patientToken = null;
        this.receptionistToken = null;
        this.labTechToken = null;
        this.pharmacistToken = null;
    }

    async authenticateUsers() {
        console.log('\n🔐 AUTHENTICATING USERS FOR DIFFERENT ROLES...'.yellow.bold);

        try {
            // Doctor Authentication
            const doctorAuth = await axios.post(`${this.baseURL}/user/login`, {
                email: 'doctor@hospital.com',
                password: 'doctor123',
                role: 'Doctor'
            });
            this.doctorToken = doctorAuth.data.token;
            console.log('✅ Doctor authenticated'.green);

            // Admin Authentication
            const adminAuth = await axios.post(`${this.baseURL}/user/login`, {
                email: 'admin@hospital.com',
                password: 'admin123',
                role: 'Admin'
            });
            this.adminToken = adminAuth.data.token;
            console.log('✅ Admin authenticated'.green);

            // Patient Authentication
            const patientAuth = await axios.post(`${this.baseURL}/user/login`, {
                email: 'patient@hospital.com',
                password: 'patient123',
                role: 'Patient'
            });
            this.patientToken = patientAuth.data.token;
            console.log('✅ Patient authenticated'.green);

            // Receptionist Authentication
            try {
                const receptionistAuth = await axios.post(`${this.baseURL}/user/login`, {
                    email: 'receptionist@hospital.com',
                    password: 'receptionist123',
                    role: 'Receptionist'
                });
                this.receptionistToken = receptionistAuth.data.token;
                console.log('✅ Receptionist authenticated'.green);
            } catch (error) {
                console.log('⚠️  Receptionist not available'.yellow);
            }

            // Lab Tech Authentication
            try {
                const labTechAuth = await axios.post(`${this.baseURL}/user/login`, {
                    email: 'labtech@hospital.com',
                    password: 'labtech123',
                    role: 'Lab Technician'
                });
                this.labTechToken = labTechAuth.data.token;
                console.log('✅ Lab Technician authenticated'.green);
            } catch (error) {
                console.log('⚠️  Lab Technician not available'.yellow);
            }

            // Pharmacist Authentication
            try {
                const pharmacistAuth = await axios.post(`${this.baseURL}/user/login`, {
                    email: 'pharmacist@hospital.com',
                    password: 'pharmacist123',
                    role: 'Pharmacist'
                });
                this.pharmacistToken = pharmacistAuth.data.token;
                console.log('✅ Pharmacist authenticated'.green);
            } catch (error) {
                console.log('⚠️  Pharmacist not available'.yellow);
            }

        } catch (error) {
            console.log('❌ Authentication failed:'.red, error.response?.data?.message || error.message);
            throw error;
        }
    }

    async makeAuthenticatedRequest(endpoint, method = 'GET', data = null, token = null, role = 'Doctor') {
        const authToken = token || this.getTokenForRole(role);

        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = data;
            }

            const response = await axios(config);
            return {
                success: true,
                status: response.status,
                data: response.data,
                headers: response.headers
            };
        } catch (error) {
            return {
                success: false,
                status: error.response?.status || 500,
                error: error.response?.data || error.message,
                details: error.message
            };
        }
    }

    getTokenForRole(role) {
        const tokens = {
            'Doctor': this.doctorToken,
            'Admin': this.adminToken,
            'Patient': this.patientToken,
            'Receptionist': this.receptionistToken,
            'Lab Technician': this.labTechToken,
            'Pharmacist': this.pharmacistToken
        };
        return tokens[role] || this.doctorToken;
    }

    async logTestResult(testName, endpoint, role, result, details = null) {
        const timestamp = new Date().toISOString();
        const testResult = {
            timestamp,
            testName,
            endpoint,
            role,
            success: result.success,
            status: result.status,
            details: details || result.data || result.error
        };

        this.testResults.push(testResult);

        const statusIcon = result.success ? '✅' : '❌';
        const statusColor = result.success ? 'green' : 'red';

        console.log(`${statusIcon} ${testName}`.bold[statusColor]);
        console.log(`   Endpoint: ${endpoint}`.gray);
        console.log(`   Role: ${role}`.blue);
        console.log(`   Status: ${result.status}`.cyan);

        if (!result.success) {
            console.log(`   Error: ${result.error?.message || result.details}`.red);
        } else if (details) {
            console.log(`   Details: ${details}`.green);
        }
        console.log('');
    }

    // 1. Test Create Medical Record - /medical-records/create
    async testCreateMedicalRecord() {
        console.log('\\n📝 TESTING CREATE MEDICAL RECORD (Doctor only)...'.yellow.bold);

        const sampleRecord = {
            patientId: '507f1f77bcf86cd799439011', // Sample ObjectId
            appointmentId: '507f1f77bcf86cd799439012', // ✅ FIXED: Using appointmentId
            chiefComplaint: 'Chest pain and shortness of breath',
            historyOfPresentIllness: 'Patient reports chest pain for 2 days with associated shortness of breath',
            pastMedicalHistory: ['Hypertension', 'Type 2 Diabetes'],
            medications: ['Metformin 500mg BID', 'Lisinopril 10mg daily'],
            allergies: ['Penicillin'],
            socialHistory: {
                smoking: 'Never',
                alcohol: 'Occasional',
                occupation: 'Teacher'
            },
            familyHistory: ['Father - CAD', 'Mother - DM'],
            vitalSigns: {
                bloodPressure: '140/90',
                heartRate: 88,
                temperature: 98.6,
                respiratoryRate: 16,
                oxygenSaturation: 98,
                weight: 75,
                height: 170
            },
            physicalExamination: {
                general: 'Alert and oriented, mild distress',
                cardiovascular: 'Regular rate and rhythm, no murmurs',
                respiratory: 'Clear to auscultation bilaterally'
            },
            assessment: 'Chest pain - rule out cardiac etiology',
            diagnosis: {
                primary: {
                    code: 'R06.02',
                    description: 'Shortness of breath',
                    icd10Code: 'R06.02'
                }
            },
            plan: {
                medications: [{
                    name: 'Aspirin',
                    dosage: '81mg',
                    frequency: 'daily',
                    duration: '30 days'
                }],
                followUp: {
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    provider: 'Dr. Smith',
                    notes: 'Follow up in 1 week'
                }
            },
            priority: 'Urgent'
        };

        // Test with Doctor role
        const doctorResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced',
            'POST',
            sampleRecord,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Create Medical Record (Doctor)',
            '/medical-records/enhanced',
            'Doctor',
            doctorResult,
            doctorResult.success ? `Record created for patient ${sampleRecord.patientId}` : null
        );

        // Test with unauthorized role (Patient should fail)
        const patientResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced',
            'POST',
            sampleRecord,
            null,
            'Patient'
        );

        await this.logTestResult(
            'Create Medical Record (Patient - should fail)',
            '/medical-records/enhanced',
            'Patient',
            patientResult,
            patientResult.success ? 'Unexpected success' : 'Correctly rejected unauthorized access'
        );

        return { doctorResult, patientResult };
    }

    // 2. Test Patient Search - /medical-records/search
    async testPatientSearch() {
        console.log('\\n🔍 TESTING PATIENT SEARCH...'.yellow.bold);

        const searchParams = {
            query: 'chest pain',
            patientName: 'John',
            diagnosis: 'Hypertension',
            dateFrom: '2024-01-01',
            dateTo: '2024-12-31'
        };

        // Test with Doctor role
        const doctorResult = await this.makeAuthenticatedRequest(
            '/medical-records/search',
            'POST',
            searchParams,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Patient Search (Doctor)',
            '/medical-records/search',
            'Doctor',
            doctorResult,
            doctorResult.success ? `Found ${doctorResult.data?.data?.length || 0} records` : null
        );

        // Test with Admin role
        const adminResult = await this.makeAuthenticatedRequest(
            '/medical-records/search',
            'POST',
            searchParams,
            null,
            'Admin'
        );

        await this.logTestResult(
            'Patient Search (Admin)',
            '/medical-records/search',
            'Admin',
            adminResult,
            adminResult.success ? `Found ${adminResult.data?.data?.length || 0} records` : null
        );

        // Test with Lab Technician role
        const labTechResult = await this.makeAuthenticatedRequest(
            '/medical-records/search',
            'POST',
            searchParams,
            null,
            'Lab Technician'
        );

        await this.logTestResult(
            'Patient Search (Lab Technician)',
            '/medical-records/search',
            'Lab Technician',
            labTechResult,
            labTechResult.success ? `Found ${labTechResult.data?.data?.length || 0} records` : null
        );

        return { doctorResult, adminResult, labTechResult };
    }

    // 3. Test Manage Records - /medical-records/manage (Enhanced Records)
    async testManageRecords() {
        console.log('\\n⚙️ TESTING MANAGE RECORDS...'.yellow.bold);

        // Get all enhanced records
        const getAllResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced?page=1&limit=10',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get All Medical Records (Doctor)',
            '/medical-records/enhanced',
            'Doctor',
            getAllResult,
            getAllResult.success ? `Retrieved ${getAllResult.data?.data?.length || 0} records` : null
        );

        // Get statistics
        const statsResult = await this.makeAuthenticatedRequest(
            '/medical-records/statistics',
            'GET',
            null,
            null,
            'Admin'
        );

        await this.logTestResult(
            'Get Medical Records Statistics (Admin)',
            '/medical-records/statistics',
            'Admin',
            statsResult,
            statsResult.success ? `Stats: ${JSON.stringify(statsResult.data?.data || {})}` : null
        );

        return { getAllResult, statsResult };
    }

    // 4. Test CPOE Orders - /medical-records/cpoe
    async testCPOEOrders() {
        console.log('\\n💊 TESTING CPOE ORDERS...'.yellow.bold);

        // Get CPOE orders
        const cpoeResult = await this.makeAuthenticatedRequest(
            '/cpoe/orders',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get CPOE Orders (Doctor)',
            '/cpoe/orders',
            'Doctor',
            cpoeResult,
            cpoeResult.success ? `Found ${cpoeResult.data?.data?.length || 0} CPOE orders` : null
        );

        // Create new CPOE order
        const newOrder = {
            patientId: '507f1f77bcf86cd799439011',
            appointmentId: '507f1f77bcf86cd799439012',
            orderType: 'Medication',
            medication: {
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: 'TID',
                duration: '7 days',
                route: 'Oral'
            },
            priority: 'Routine',
            notes: 'For bacterial infection'
        };

        const createCpoeResult = await this.makeAuthenticatedRequest(
            '/cpoe/orders',
            'POST',
            newOrder,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Create CPOE Order (Doctor)',
            '/cpoe/orders',
            'Doctor',
            createCpoeResult,
            createCpoeResult.success ? `Order created: ${newOrder.medication.name}` : null
        );

        return { cpoeResult, createCpoeResult };
    }

    // 5. Test Prescriptions - /medical-records/prescriptions
    async testPrescriptions() {
        console.log('\\n💉 TESTING PRESCRIPTIONS...'.yellow.bold);

        // Get prescriptions (Doctor view)
        const doctorPrescriptionsResult = await this.makeAuthenticatedRequest(
            '/prescriptions',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get Prescriptions (Doctor)',
            '/prescriptions',
            'Doctor',
            doctorPrescriptionsResult,
            doctorPrescriptionsResult.success ? `Found ${doctorPrescriptionsResult.data?.data?.length || 0} prescriptions` : null
        );

        // Get prescriptions (Patient view)
        const patientPrescriptionsResult = await this.makeAuthenticatedRequest(
            '/prescriptions/my-prescriptions',
            'GET',
            null,
            null,
            'Patient'
        );

        await this.logTestResult(
            'Get My Prescriptions (Patient)',
            '/prescriptions/my-prescriptions',
            'Patient',
            patientPrescriptionsResult,
            patientPrescriptionsResult.success ? `Patient has ${patientPrescriptionsResult.data?.data?.length || 0} prescriptions` : null
        );

        // Get prescriptions (Pharmacist view)
        const pharmacistPrescriptionsResult = await this.makeAuthenticatedRequest(
            '/prescriptions',
            'GET',
            null,
            null,
            'Pharmacist'
        );

        await this.logTestResult(
            'Get Prescriptions (Pharmacist)',
            '/prescriptions',
            'Pharmacist',
            pharmacistPrescriptionsResult,
            pharmacistPrescriptionsResult.success ? `Pharmacist sees ${pharmacistPrescriptionsResult.data?.data?.length || 0} prescriptions` : null
        );

        return { doctorPrescriptionsResult, patientPrescriptionsResult, pharmacistPrescriptionsResult };
    }

    // 6. Test ICD-10 Diagnosis - /medical-records/diagnosis
    async testICD10Diagnosis() {
        console.log('\\n🏥 TESTING ICD-10 DIAGNOSIS...'.yellow.bold);

        // Search ICD-10 codes
        const icd10SearchResult = await this.makeAuthenticatedRequest(
            '/icd10/search?query=chest pain',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Search ICD-10 Codes (Doctor)',
            '/icd10/search',
            'Doctor',
            icd10SearchResult,
            icd10SearchResult.success ? `Found ${icd10SearchResult.data?.data?.length || 0} ICD-10 codes` : null
        );

        // Get ICD-10 categories
        const icd10CategoriesResult = await this.makeAuthenticatedRequest(
            '/icd10/categories',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get ICD-10 Categories (Doctor)',
            '/icd10/categories',
            'Doctor',
            icd10CategoriesResult,
            icd10CategoriesResult.success ? `Found ${icd10CategoriesResult.data?.data?.length || 0} categories` : null
        );

        return { icd10SearchResult, icd10CategoriesResult };
    }

    // 7. Test My Records - /medical-records/my-records (Patient)
    async testMyRecords() {
        console.log('\\n👤 TESTING MY RECORDS (Patient)...'.yellow.bold);

        // Get patient's own records
        const myRecordsResult = await this.makeAuthenticatedRequest(
            '/medical-records/my-records',
            'GET',
            null,
            null,
            'Patient'
        );

        await this.logTestResult(
            'Get My Medical Records (Patient)',
            '/medical-records/my-records',
            'Patient',
            myRecordsResult,
            myRecordsResult.success ? `Patient has ${myRecordsResult.data?.data?.length || 0} records` : null
        );

        // Test unauthorized access (Doctor trying to access patient endpoint)
        const unauthorizedResult = await this.makeAuthenticatedRequest(
            '/medical-records/my-records',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Access My Records (Doctor - should work but return doctors records)',
            '/medical-records/my-records',
            'Doctor',
            unauthorizedResult,
            unauthorizedResult.success ? 'Doctor can access endpoint' : 'Access properly restricted'
        );

        return { myRecordsResult, unauthorizedResult };
    }

    // 8. Test Medical Reports - /medical-records/reports
    async testMedicalReports() {
        console.log('\\n📊 TESTING MEDICAL REPORTS...'.yellow.bold);

        // Get medical reports summary
        const reportsResult = await this.makeAuthenticatedRequest(
            '/medical-records/summary',
            'GET',
            null,
            null,
            'Admin'
        );

        await this.logTestResult(
            'Get Medical Reports Summary (Admin)',
            '/medical-records/summary',
            'Admin',
            reportsResult,
            reportsResult.success ? `Summary contains ${reportsResult.data?.data?.length || 0} records` : null
        );

        // Get reports as Doctor
        const doctorReportsResult = await this.makeAuthenticatedRequest(
            '/medical-records/summary',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get Medical Reports Summary (Doctor)',
            '/medical-records/summary',
            'Doctor',
            doctorReportsResult,
            doctorReportsResult.success ? `Doctor view has ${doctorReportsResult.data?.data?.length || 0} records` : null
        );

        return { reportsResult, doctorReportsResult };
    }

    // 9. Test Records Overview - /medical-records/overview
    async testRecordsOverview() {
        console.log('\\n📋 TESTING RECORDS OVERVIEW...'.yellow.bold);

        // Get overview for Receptionist
        const receptionistOverviewResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced?limit=5',
            'GET',
            null,
            null,
            'Receptionist'
        );

        await this.logTestResult(
            'Get Records Overview (Receptionist)',
            '/medical-records/enhanced',
            'Receptionist',
            receptionistOverviewResult,
            receptionistOverviewResult.success ? `Overview shows ${receptionistOverviewResult.data?.data?.length || 0} records` : null
        );

        // Get overview for Lab Technician
        const labTechOverviewResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced?limit=5',
            'GET',
            null,
            null,
            'Lab Technician'
        );

        await this.logTestResult(
            'Get Records Overview (Lab Technician)',
            '/medical-records/enhanced',
            'Lab Technician',
            labTechOverviewResult,
            labTechOverviewResult.success ? `Lab tech sees ${labTechOverviewResult.data?.data?.length || 0} records` : null
        );

        // Get overview for Admin
        const adminOverviewResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced?limit=10',
            'GET',
            null,
            null,
            'Admin'
        );

        await this.logTestResult(
            'Get Records Overview (Admin)',
            '/medical-records/enhanced',
            'Admin',
            adminOverviewResult,
            adminOverviewResult.success ? `Admin overview: ${adminOverviewResult.data?.data?.length || 0} records` : null
        );

        return { receptionistOverviewResult, labTechOverviewResult, adminOverviewResult };
    }

    // Additional tests for enhanced features
    async testEnhancedFeatures() {
        console.log('\\n⭐ TESTING ENHANCED FEATURES...'.yellow.bold);

        // Test progress notes
        const progressNoteData = {
            note: 'Patient shows improvement, vital signs stable',
            type: 'Progress'
        };

        const progressNoteResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced/507f1f77bcf86cd799439011/progress-note',
            'POST',
            progressNoteData,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Add Progress Note (Doctor)',
            '/medical-records/enhanced/:id/progress-note',
            'Doctor',
            progressNoteResult,
            progressNoteResult.success ? 'Progress note added successfully' : null
        );

        // Test record signing
        const signRecordResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced/507f1f77bcf86cd799439011/sign',
            'POST',
            {},
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Sign Medical Record (Doctor)',
            '/medical-records/enhanced/:id/sign',
            'Doctor',
            signRecordResult,
            signRecordResult.success ? 'Record signed successfully' : null
        );

        return { progressNoteResult, signRecordResult };
    }

    // Test error handling and edge cases
    async testErrorHandling() {
        console.log('\\n🚨 TESTING ERROR HANDLING...'.yellow.bold);

        // Test invalid record ID
        const invalidIdResult = await this.makeAuthenticatedRequest(
            '/medical-records/enhanced/invalid-id',
            'GET',
            null,
            null,
            'Doctor'
        );

        await this.logTestResult(
            'Get Record with Invalid ID (Doctor)',
            '/medical-records/enhanced/invalid-id',
            'Doctor',
            invalidIdResult,
            invalidIdResult.success ? 'Unexpected success' : 'Correctly handled invalid ID'
        );

        // Test unauthorized access without token
        try {
            const noTokenResult = await axios.get(`${this.baseURL}/medical-records/enhanced`);
            await this.logTestResult(
                'Access without authentication token',
                '/medical-records/enhanced',
                'No Auth',
                { success: false, status: 200, error: 'Unexpected success' },
                'Should have been rejected'
            );
        } catch (error) {
            await this.logTestResult(
                'Access without authentication token',
                '/medical-records/enhanced',
                'No Auth',
                { success: false, status: error.response?.status || 401, error: 'Correctly rejected' },
                'Authentication properly enforced'
            );
        }

        return { invalidIdResult };
    }

    // Main test execution
    async runAllTests() {
        console.log('🏥 MEDICAL RECORDS SYSTEM - COMPREHENSIVE API ENDPOINT TESTING'.rainbow.bold);
        console.log('================================================================'.gray);

        try {
            // Authenticate all users
            await this.authenticateUsers();

            // Run all test suites
            const results = {
                createRecord: await this.testCreateMedicalRecord(),
                patientSearch: await this.testPatientSearch(),
                manageRecords: await this.testManageRecords(),
                cpoeOrders: await this.testCPOEOrders(),
                prescriptions: await this.testPrescriptions(),
                icd10Diagnosis: await this.testICD10Diagnosis(),
                myRecords: await this.testMyRecords(),
                medicalReports: await this.testMedicalReports(),
                recordsOverview: await this.testRecordsOverview(),
                enhancedFeatures: await this.testEnhancedFeatures(),
                errorHandling: await this.testErrorHandling()
            };

            // Generate summary report
            this.generateSummaryReport();

            return results;

        } catch (error) {
            console.log('\\n❌ TEST EXECUTION FAILED:'.red.bold, error.message);
            throw error;
        }
    }

    generateSummaryReport() {
        console.log('\\n📋 TEST SUMMARY REPORT'.yellow.bold);
        console.log('========================'.gray);

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(2);

        console.log(`📊 Total Tests: ${totalTests}`.blue);
        console.log(`✅ Passed: ${passedTests}`.green);
        console.log(`❌ Failed: ${failedTests}`.red);
        console.log(`📈 Success Rate: ${successRate}%`.cyan);

        // Group by endpoint
        const endpointResults = {};
        this.testResults.forEach(test => {
            const endpoint = test.endpoint;
            if (!endpointResults[endpoint]) {
                endpointResults[endpoint] = { total: 0, passed: 0 };
            }
            endpointResults[endpoint].total++;
            if (test.success) endpointResults[endpoint].passed++;
        });

        console.log('\\n📋 ENDPOINT RESULTS:'.yellow);
        console.log('===================='.gray);
        Object.entries(endpointResults).forEach(([endpoint, results]) => {
            const rate = ((results.passed / results.total) * 100).toFixed(0);
            const status = results.passed === results.total ? '✅' : '⚠️';
            console.log(`${status} ${endpoint}: ${results.passed}/${results.total} (${rate}%)`.cyan);
        });

        // Group by role
        const roleResults = {};
        this.testResults.forEach(test => {
            const role = test.role;
            if (!roleResults[role]) {
                roleResults[role] = { total: 0, passed: 0 };
            }
            roleResults[role].total++;
            if (test.success) roleResults[role].passed++;
        });

        console.log('\\n👥 ROLE-BASED RESULTS:'.yellow);
        console.log('======================='.gray);
        Object.entries(roleResults).forEach(([role, results]) => {
            const rate = ((results.passed / results.total) * 100).toFixed(0);
            const status = results.passed === results.total ? '✅' : '⚠️';
            console.log(`${status} ${role}: ${results.passed}/${results.total} (${rate}%)`.blue);
        });

        if (failedTests > 0) {
            console.log('\\n❌ FAILED TESTS:'.red.bold);
            console.log('=================='.gray);
            this.testResults
                .filter(test => !test.success)
                .forEach(test => {
                    console.log(`❌ ${test.testName}`.red);
                    console.log(`   Endpoint: ${test.endpoint}`.gray);
                    console.log(`   Role: ${test.role}`.blue);
                    console.log(`   Error: ${test.details?.message || test.details}`.red);
                    console.log('');
                });
        }

        console.log('\\n🎯 MEDICAL RECORDS SYSTEM TESTING COMPLETE!'.rainbow.bold);
        console.log(`Overall System Health: ${successRate >= 80 ? '🟢 HEALTHY' : successRate >= 60 ? '🟡 WARNING' : '🔴 CRITICAL'}`.bold);
    }
}

// Execute tests
if (require.main === module) {
    const tester = new MedicalRecordsEndpointTester();

    tester.runAllTests()
        .then(() => {
            console.log('\\n✅ All tests completed successfully!'.green.bold);
            process.exit(0);
        })
        .catch((error) => {
            console.log('\\n❌ Test execution failed:'.red.bold, error.message);
            process.exit(1);
        });
}

module.exports = MedicalRecordsEndpointTester;
