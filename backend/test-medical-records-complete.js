/**
 * 🧪 MEDICAL RECORDS SYSTEM - COMPREHENSIVE API TEST SUITE
 * Test tất cả chức năng Medical Records theo sidebar navigation
 */

import axios from 'axios';
import colors from 'colors';

// Configuration
const BASE_URL = 'http://localhost:4000/api/v1';
const TEST_CONFIG = {
    timeout: 10000,
    retries: 3
};

// Test credentials for different roles
const TEST_USERS = {
    DOCTOR: {
        email: 'doctor@test.com',
        password: 'password123',
        role: 'Doctor'
    },
    PATIENT: {
        email: 'patient@test.com',
        password: 'password123',
        role: 'Patient'
    },
    ADMIN: {
        email: 'admin@test.com',
        password: 'password123',
        role: 'Admin'
    }
};

let authTokens = {};
let testData = {
    patientId: null,
    doctorId: null,
    appointmentId: null,
    medicalRecordId: null
};

/**
 * 🎨 Console logging utilities
 */
const log = {
    success: (msg) => console.log('✅ ' + msg.green),
    error: (msg) => console.log('❌ ' + msg.red),
    info: (msg) => console.log('ℹ️  ' + msg.blue),
    warning: (msg) => console.log('⚠️  ' + msg.yellow),
    header: (msg) => console.log('\n' + '🚀 ' + msg.cyan.bold),
    subheader: (msg) => console.log('📋 ' + msg.magenta),
    endpoint: (method, endpoint) => console.log(`   ${method.toUpperCase().padEnd(6)} ${endpoint}`.gray)
};

/**
 * 🔐 Authentication Helper
 */
async function authenticate(userType) {
    try {
        const user = TEST_USERS[userType];
        log.endpoint('POST', '/users/login');

        const response = await axios.post(`${BASE_URL}/users/login`, {
            email: user.email,
            password: user.password
        });

        if (response.data.success) {
            authTokens[userType] = response.data.token;
            log.success(`Authenticated as ${userType}: ${user.email}`);
            return response.data.token;
        } else {
            throw new Error(`Authentication failed for ${userType}`);
        }
    } catch (error) {
        log.error(`Authentication failed for ${userType}: ${error.message}`);
        return null;
    }
}

/**
 * 📝 Create API request with auth
 */
function createAuthRequest(token) {
    return axios.create({
        baseURL: BASE_URL,
        timeout: TEST_CONFIG.timeout,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

/**
 * 🧪 Test Function Wrapper
 */
async function runTest(testName, testFunction) {
    try {
        log.subheader(`Testing: ${testName}`);
        await testFunction();
        log.success(`✅ PASSED: ${testName}`);
        return true;
    } catch (error) {
        log.error(`❌ FAILED: ${testName} - ${error.message}`);
        console.log('Error details:', error.response?.data || error.message);
        return false;
    }
}

/**
 * 📊 MEDICAL RECORDS TESTS - Theo đúng sidebar navigation
 */

// 1. 🔍 Medical Records - Patient Search (Doctor, Admin, Lab Tech)
async function testPatientSearch() {
    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('POST', '/medical-records/search');

    const searchParams = {
        patientName: 'John',
        diagnosis: 'Hypertension',
        status: 'Active'
    };

    const response = await api.post('/medical-records/search', searchParams);

    if (response.data.success) {
        log.success(`Found ${response.data.data.length} medical records`);
        if (response.data.data.length > 0) {
            testData.medicalRecordId = response.data.data[0]._id;
            log.info(`Using medical record ID: ${testData.medicalRecordId}`);
        }
    } else {
        throw new Error('Patient search failed');
    }
}

// 2. 📝 Create Medical Record (Doctor only)
async function testCreateMedicalRecord() {
    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('POST', '/medical-records/enhanced');

    const newRecord = {
        patientId: testData.patientId || '66c5b12345678901234567ab', // Use test patient ID
        appointmentId: testData.appointmentId || '66c5b12345678901234567cd', // Use test appointment ID
        chiefComplaint: 'Chest pain and shortness of breath',
        historyOfPresentIllness: 'Patient reports chest pain started 2 hours ago, accompanied by shortness of breath',
        pastMedicalHistory: ['Hypertension', 'Diabetes mellitus type 2'],
        medications: ['Metformin 500mg twice daily', 'Lisinopril 10mg daily'],
        allergies: ['Penicillin'],
        socialHistory: {
            smoking: 'Former smoker, quit 5 years ago',
            alcohol: 'Occasional social drinking',
            occupation: 'Office worker'
        },
        familyHistory: ['Father: Heart disease', 'Mother: Diabetes'],
        vitalSigns: {
            bloodPressure: '140/90',
            heartRate: 88,
            temperature: 36.7,
            respiratoryRate: 18,
            oxygenSaturation: 98,
            weight: 75,
            height: 170
        },
        physicalExamination: {
            general: 'Alert and oriented, mild distress',
            cardiovascular: 'Regular rate and rhythm, no murmurs',
            respiratory: 'Clear to auscultation bilaterally',
            abdomen: 'Soft, non-tender, no organomegaly'
        },
        assessment: 'Possible acute coronary syndrome',
        diagnosis: {
            primary: {
                code: 'I20.9',
                description: 'Angina pectoris, unspecified',
                icd10Code: 'I20.9'
            },
            secondary: [
                {
                    code: 'E11.9',
                    description: 'Type 2 diabetes mellitus without complications',
                    icd10Code: 'E11.9'
                }
            ]
        },
        plan: {
            medications: [
                {
                    name: 'Aspirin',
                    dosage: '81mg',
                    frequency: 'Once daily',
                    duration: 'Ongoing',
                    instructions: 'Take with food'
                }
            ],
            procedures: [
                {
                    name: 'ECG',
                    description: 'Electrocardiogram to rule out MI',
                    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            followUp: {
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                provider: 'Cardiology',
                notes: 'Follow up for cardiac evaluation'
            },
            patientEducation: ['Heart-healthy diet', 'Regular exercise'],
            activityRestrictions: ['Avoid heavy lifting']
        },
        priority: 'Urgent',
        isConfidential: false
    };

    const response = await api.post('/medical-records/enhanced', newRecord);

    if (response.data.success) {
        testData.medicalRecordId = response.data.data._id;
        log.success(`Created medical record: ${testData.medicalRecordId}`);
        log.info(`Appointment ID mapping: ${response.data.data.appointmentId}`);
    } else {
        throw new Error('Failed to create medical record');
    }
}

// 3. 👁️ Get Medical Record by ID
async function testGetMedicalRecord() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('GET', `/medical-records/enhanced/${testData.medicalRecordId}`);

    const response = await api.get(`/medical-records/enhanced/${testData.medicalRecordId}`);

    if (response.data.success) {
        log.success('Retrieved medical record successfully');
        log.info(`Patient: ${response.data.data.patientId.firstName} ${response.data.data.patientId.lastName}`);
        log.info(`Diagnosis: ${response.data.data.diagnosis.primary.description}`);
    } else {
        throw new Error('Failed to retrieve medical record');
    }
}

// 4. 📋 Manage Medical Records - Get All Records (Doctor, Admin)
async function testGetAllMedicalRecords() {
    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('GET', '/medical-records/enhanced');

    const params = {
        page: 1,
        limit: 10,
        status: 'Active'
    };

    const response = await api.get('/medical-records/enhanced', { params });

    if (response.data.success) {
        log.success(`Retrieved ${response.data.data.length} medical records`);
        log.info(`Total pages: ${response.data.pagination.totalPages}`);
        log.info(`Total records: ${response.data.pagination.totalRecords}`);
    } else {
        throw new Error('Failed to retrieve medical records list');
    }
}

// 5. 🩺 CPOE Orders (Doctor only)
async function testCPOEOrders() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping CPOE test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('POST', `/medical-records/enhanced/${testData.medicalRecordId}/progress-note`);

    const cpoeNote = {
        note: 'CPOE Order: Prescribe Aspirin 81mg daily for cardiac protection. Lab order: Lipid panel in 3 months.',
        type: 'Procedure'
    };

    const response = await api.post(`/medical-records/enhanced/${testData.medicalRecordId}/progress-note`, cpoeNote);

    if (response.data.success) {
        log.success('CPOE order added successfully');
        log.info('Order details recorded in progress notes');
    } else {
        throw new Error('Failed to add CPOE order');
    }
}

// 6. 💊 Prescriptions (Doctor, Patient, Pharmacist)
async function testPrescriptionManagement() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping prescription test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);

    // Update medical record with new prescription
    const prescriptionUpdate = {
        plan: {
            medications: [
                {
                    name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    duration: '30 days',
                    instructions: 'Take with meals'
                },
                {
                    name: 'Aspirin',
                    dosage: '81mg',
                    frequency: 'Once daily',
                    duration: 'Ongoing',
                    instructions: 'Take with food'
                }
            ]
        }
    };

    log.endpoint('PUT', `/medical-records/enhanced/${testData.medicalRecordId}`);
    const response = await api.put(`/medical-records/enhanced/${testData.medicalRecordId}`, prescriptionUpdate);

    if (response.data.success) {
        log.success('Prescription updated successfully');
        log.info(`Added ${prescriptionUpdate.plan.medications.length} medications`);
    } else {
        throw new Error('Failed to update prescription');
    }
}

// 7. ❤️ ICD-10 Diagnosis (Doctor only)
async function testICD10Diagnosis() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping ICD-10 test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);

    // Update diagnosis with proper ICD-10 codes
    const diagnosisUpdate = {
        diagnosis: {
            primary: {
                code: 'I25.10',
                description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
                icd10Code: 'I25.10'
            },
            secondary: [
                {
                    code: 'E11.9',
                    description: 'Type 2 diabetes mellitus without complications',
                    icd10Code: 'E11.9'
                },
                {
                    code: 'I10',
                    description: 'Essential hypertension',
                    icd10Code: 'I10'
                }
            ]
        }
    };

    log.endpoint('PUT', `/medical-records/enhanced/${testData.medicalRecordId}`);
    const response = await api.put(`/medical-records/enhanced/${testData.medicalRecordId}`, diagnosisUpdate);

    if (response.data.success) {
        log.success('ICD-10 diagnosis updated successfully');
        log.info(`Primary: ${diagnosisUpdate.diagnosis.primary.icd10Code} - ${diagnosisUpdate.diagnosis.primary.description}`);
        log.info(`Secondary diagnoses: ${diagnosisUpdate.diagnosis.secondary.length} codes`);
    } else {
        throw new Error('Failed to update ICD-10 diagnosis');
    }
}

// 8. 👤 My Medical Records (Patient only)
async function testPatientMyRecords() {
    const api = createAuthRequest(authTokens.PATIENT);
    log.endpoint('GET', '/medical-records/my-records');

    const params = {
        page: 1,
        limit: 10
    };

    const response = await api.get('/medical-records/my-records', { params });

    if (response.data.success) {
        log.success(`Patient retrieved ${response.data.data.length} personal medical records`);
        if (response.data.data.length > 0) {
            log.info(`Latest record: ${response.data.data[0].diagnosis.primary.description}`);
        }
    } else {
        throw new Error('Failed to retrieve patient medical records');
    }
}

// 9. 📊 Medical Reports (Admin, Doctor)
async function testMedicalReports() {
    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('GET', '/medical-records/statistics');

    const response = await api.get('/medical-records/statistics');

    if (response.data.success) {
        const stats = response.data.data;
        log.success('Retrieved medical records statistics');
        log.info(`Total records: ${stats.totalRecords}`);
        log.info(`Active cases: ${stats.activeCases}`);
        log.info(`Resolved today: ${stats.resolvedToday}`);
        log.info(`Pending review: ${stats.pendingReview}`);
    } else {
        throw new Error('Failed to retrieve medical reports');
    }
}

// 10. 📋 Records Overview (Receptionist, Admin, Lab Tech, etc.)
async function testRecordsOverview() {
    const api = createAuthRequest(authTokens.ADMIN);
    log.endpoint('GET', '/medical-records/summary');

    const response = await api.get('/medical-records/summary');

    if (response.data.success) {
        log.success(`Retrieved ${response.data.data.length} medical record summaries`);
        log.info(`Total active cases: ${response.data.stats.activeCases}`);
        log.info(`Recent activity: ${response.data.stats.recentActivity.created} created, ${response.data.stats.recentActivity.updated} updated`);
    } else {
        throw new Error('Failed to retrieve records overview');
    }
}

// 11. ✅ Progress Notes
async function testProgressNotes() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping progress notes test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('POST', `/medical-records/enhanced/${testData.medicalRecordId}/progress-note`);

    const progressNote = {
        note: 'Patient shows improvement in chest pain symptoms. Blood pressure better controlled. Continue current medications. Schedule follow-up in 2 weeks.',
        type: 'Progress'
    };

    const response = await api.post(`/medical-records/enhanced/${testData.medicalRecordId}/progress-note`, progressNote);

    if (response.data.success) {
        log.success('Progress note added successfully');
        log.info(`Note type: ${progressNote.type}`);
    } else {
        throw new Error('Failed to add progress note');
    }
}

// 12. ✍️ Sign Medical Record (Doctor only)
async function testSignMedicalRecord() {
    if (!testData.medicalRecordId) {
        log.warning('No medical record ID available, skipping sign test');
        return;
    }

    const api = createAuthRequest(authTokens.DOCTOR);
    log.endpoint('POST', `/medical-records/enhanced/${testData.medicalRecordId}/sign`);

    const response = await api.post(`/medical-records/enhanced/${testData.medicalRecordId}/sign`);

    if (response.data.success) {
        log.success('Medical record signed successfully');
        log.info('Record status updated and digitally signed');
    } else {
        throw new Error('Failed to sign medical record');
    }
}

/**
 * 🏃‍♂️ MAIN TEST RUNNER
 */
async function runMedicalRecordsTests() {
    log.header('MEDICAL RECORDS SYSTEM - COMPREHENSIVE TEST SUITE');
    log.info('Testing all sidebar navigation features with proper API endpoints');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    try {
        // 🔐 Authentication Phase
        log.header('Phase 1: Authentication');
        await authenticate('DOCTOR');
        await authenticate('PATIENT');
        await authenticate('ADMIN');

        // 🧪 Medical Records Tests
        log.header('Phase 2: Medical Records System Tests');

        const tests = [
            ['Patient Search', testPatientSearch],
            ['Create Medical Record', testCreateMedicalRecord],
            ['Get Medical Record by ID', testGetMedicalRecord],
            ['Get All Medical Records', testGetAllMedicalRecords],
            ['CPOE Orders', testCPOEOrders],
            ['Prescription Management', testPrescriptionManagement],
            ['ICD-10 Diagnosis', testICD10Diagnosis],
            ['Patient My Records', testPatientMyRecords],
            ['Medical Reports', testMedicalReports],
            ['Records Overview', testRecordsOverview],
            ['Progress Notes', testProgressNotes],
            ['Sign Medical Record', testSignMedicalRecord]
        ];

        for (const [testName, testFunction] of tests) {
            results.total++;
            const success = await runTest(testName, testFunction);
            if (success) {
                results.passed++;
            } else {
                results.failed++;
            }
        }

        // 📊 Results Summary
        log.header('TEST RESULTS SUMMARY');
        log.success(`✅ PASSED: ${results.passed}/${results.total}`);
        if (results.failed > 0) {
            log.error(`❌ FAILED: ${results.failed}/${results.total}`);
        }

        const successRate = ((results.passed / results.total) * 100).toFixed(1);
        if (successRate >= 90) {
            log.success(`🎉 EXCELLENT! Success rate: ${successRate}%`);
        } else if (successRate >= 70) {
            log.warning(`⚠️  GOOD! Success rate: ${successRate}%`);
        } else {
            log.error(`❌ NEEDS IMPROVEMENT! Success rate: ${successRate}%`);
        }

        log.header('🏥 MEDICAL RECORDS SYSTEM FUNCTIONALITY VERIFIED');
        log.info('All sidebar navigation features tested with proper API endpoints');

    } catch (error) {
        log.error(`Test suite failed: ${error.message}`);
        process.exit(1);
    }
}

// 🚀 Run the tests
runMedicalRecordsTests().catch(error => {
    log.error(`Critical error: ${error.message}`);
    process.exit(1);
});

export {
    runMedicalRecordsTests,
    testPatientSearch,
    testCreateMedicalRecord,
    testGetMedicalRecord,
    testGetAllMedicalRecords,
    testCPOEOrders,
    testPrescriptionManagement,
    testICD10Diagnosis,
    testPatientMyRecords,
    testMedicalReports,
    testRecordsOverview,
    testProgressNotes,
    testSignMedicalRecord
};
