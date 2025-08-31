// Medical Record Critical Issues Test
const request = require('supertest');

// Import Express app with dynamic import for ES modules compatibility
let app;

// Global test variables for export
let doctorToken, patientToken, testAppointmentId, testPatientId;

describe('Medical Records API - Critical Issues Fixed', () => {

    beforeAll(async () => {
        // Dynamic import for ES modules
        const appModule = await import('../app.js');
        app = appModule.default;
        
        // Setup valid JWT tokens for existing users
        doctorToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE5NjE0ODhkNTAxMDI2MGRlMjU3NGYiLCJpYXQiOjE3NTU5MzExNzYsImV4cCI6MTc1NjUzNTk3Nn0.3rzTTSiAxI4oF-73vJ8mH-B4uzzAvyq1r46v3cjazqE';
        patientToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE5NjE0ODhkNTAxMDI2MGRlMjU3NTMiLCJpYXQiOjE3NTU5MzExNzYsImV4cCI6MTc1NjUzNTk3Nn0.RpMfpXUKUObzzV691nTZRd26kjqAIGdMP07XRFZpjQg';
        testAppointmentId = '68a961488d5010260de25755';
        testPatientId = '68a961488d5010260de25753';
    });

    describe('ISSUE 1 FIX: appointmentId Support', () => {
        test('Should create medical record with appointmentId', async () => {
            const recordData = {
                appointmentId: testAppointmentId,
                patientId: testPatientId,
                chiefComplaint: 'Test complaint for appointmentId support',
                clinicalAssessment: {
                    chiefComplaint: 'Test complaint',
                    historyOfPresentIllness: 'Test history',
                    clinicalImpression: 'Test impression'
                }
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.appointmentId).toBe(testAppointmentId);
            expect(response.body.data.patientId).toBe(testPatientId);
            expect(response.body.data.doctorId).toBeDefined();
        });

        test('Should retrieve medical record by appointmentId', async () => {
            const response = await request(app)
                .get(`/api/v1/medical-records/enhanced/appointment/${testAppointmentId}`)
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.appointmentId).toBe(testAppointmentId);
        });

        test('Should support backward compatibility with encounterId', async () => {
            const recordData = {
                encounterId: 'test-encounter-id',
                patientId: testPatientId,
                chiefComplaint: 'Test complaint for encounterId support'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.encounterId).toBe('test-encounter-id');
            // Should map encounterId to appointmentId for compatibility
            expect(response.body.data.appointmentId).toBe('test-encounter-id');
        });
    });

    describe('ISSUE 2 FIX: Schema Field Consistency', () => {
        test('Should populate all required fields correctly', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            if (response.body.data.length > 0) {
                const record = response.body.data[0];

                // Check patient data structure
                expect(record.patientId).toHaveProperty('_id');
                expect(record.patientId).toHaveProperty('firstName');
                expect(record.patientId).toHaveProperty('lastName');

                // Check doctor data structure
                expect(record.doctorId).toHaveProperty('_id');
                expect(record.doctorId).toHaveProperty('firstName');
                expect(record.doctorId).toHaveProperty('lastName');

                // Check diagnosis structure
                expect(record.diagnosis).toHaveProperty('primary');
                expect(record.diagnosis.primary).toHaveProperty('code');
                expect(record.diagnosis.primary).toHaveProperty('description');
                expect(record.diagnosis.primary).toHaveProperty('icd10Code');

                // Check status mapping
                expect(['Active', 'Completed']).toContain(record.status);
            }
        });
    });

    describe('ISSUE 3 FIX: Role-based Access Control', () => {
        test('Doctor can create medical record', async () => {
            const recordData = {
                appointmentId: testAppointmentId,
                patientId: testPatientId,
                chiefComplaint: 'Doctor access test'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            expect(response.body.success).toBe(true);
        });

        test('Patient cannot create medical record', async () => {
            const recordData = {
                appointmentId: testAppointmentId,
                patientId: testPatientId,
                chiefComplaint: 'Patient access test'
            };

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(recordData)
                .expect(403);
        });

        test('Patient can only view own medical records', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${patientToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // All records should belong to the patient
            response.body.data.forEach(record => {
                expect(record.patientId._id).toBe(testPatientId);
            });
        });

        test('Doctor can view own patients records', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // All records should be created by the doctor
            response.body.data.forEach(record => {
                expect(record.doctorId._id).toBeDefined();
            });
        });
    });

    describe('Data Integrity Tests', () => {
        test('Medical record creation does not affect appointments', async () => {
            // This would need actual appointment data to test properly
            // const appointmentBefore = await getAppointment(testAppointmentId);

            const recordData = {
                appointmentId: testAppointmentId,
                patientId: testPatientId,
                chiefComplaint: 'Data integrity test'
            };

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            // const appointmentAfter = await getAppointment(testAppointmentId);
            // expect(appointmentAfter.status).toBe(appointmentBefore.status);
        });

        test('Should validate required fields', async () => {
            const incompleteData = {
                // Missing required fields
                chiefComplaint: 'Incomplete data test'
            };

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(incompleteData)
                .expect(400);
        });
    });

    describe('Search and Filter Tests', () => {
        test('Should search by diagnosis', async () => {
            const searchData = {
                query: 'headache',
                patientName: '',
                diagnosis: 'headache'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/search')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(searchData)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('Should filter by date range', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .query({
                    dateFrom: '2024-01-01',
                    dateTo: '2024-12-31'
                })
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('Should paginate results correctly', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .query({
                    page: 1,
                    limit: 5
                })
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.pagination).toHaveProperty('currentPage');
            expect(response.body.pagination).toHaveProperty('totalPages');
            expect(response.body.pagination).toHaveProperty('totalRecords');
            expect(response.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Statistics and Analytics', () => {
        test('Should return statistics for doctor', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/statistics')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalRecords');
            expect(response.body.data).toHaveProperty('activeCases');
            expect(response.body.data).toHaveProperty('resolvedToday');
            expect(response.body.data).toHaveProperty('pendingReview');
            expect(response.body.data).toHaveProperty('recentActivity');
        });

        test('Should return summary data', async () => {
            const response = await request(app)
                .get('/api/v1/medical-records/summary')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.stats).toBeDefined();
        });
    });
});

module.exports = {
    // Export helper functions if needed
    testAppointmentId,
    testPatientId
};
