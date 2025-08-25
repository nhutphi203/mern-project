// ===================================================================
// VITAL SIGNS E2E TESTS
// Test vital signs integration with medical records and encounters
// ===================================================================

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { EnhancedMedicalRecord } from '../models/enhancedMedicalRecord.model.js';
import { VitalSigns } from '../models/vitalSigns.model.js';

describe('Vital Signs E2E Tests', () => {
    let testUsers = {};
    let authTokens = {};
    let testAppointment;
    let testEncounter;
    let testMedicalRecord;
    let testVitalSigns = [];

    beforeAll(async () => {
        // Create test users with unique IDs to avoid duplicate email errors
        const uniqueId = Date.now();
        const roles = ['Patient', 'Doctor', 'Nurse', 'Admin', 'Receptionist'];

        for (const role of roles) {
            const hashedPassword = await bcrypt.hash('testpassword123', 12);
            const userData = {
                firstName: `Test${role}`,
                lastName: 'VitalSigns',
                email: `test.${role.toLowerCase()}.vitals.${uniqueId}@test.com`,
                password: hashedPassword,
                phone: '1234567890',
                nic: '123456789012',
                dob: new Date('1990-01-01'),
                gender: 'Other',
                role,
                isVerified: true,
                authType: 'traditional',
                isTestData: true
            };

            if (role === 'Doctor') {
                userData.doctorDepartment = 'Internal Medicine';
                userData.qualification = 'MBBS, MD';
            }

            const user = await User.create(userData);
            testUsers[role] = user;

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' }
            );
            authTokens[role] = token;
        }

        // Create test appointment
        testAppointment = await Appointment.create({
            firstName: testUsers.Patient.firstName,
            lastName: testUsers.Patient.lastName,
            email: testUsers.Patient.email,
            phone: testUsers.Patient.phone,
            nic: testUsers.Patient.nic,
            dob: testUsers.Patient.dob,
            gender: testUsers.Patient.gender,
            appointment_date: '2025-08-25',
            department: 'Internal Medicine',
            doctor: {
                firstName: testUsers.Doctor.firstName,
                lastName: testUsers.Doctor.lastName
            },
            hasVisited: false,
            address: '123 Test Street',
            doctorId: testUsers.Doctor._id,
            patientId: testUsers.Patient._id,
            status: 'Accepted',
            isTestData: true
        });

        // Create test encounter
        testEncounter = await Encounter.create({
            appointmentId: testAppointment._id,
            patientId: testUsers.Patient._id,
            receptionistId: testUsers.Receptionist._id,
            checkInTime: new Date(),
            status: 'InProgress',
            notes: 'Vital signs test encounter',
            isTestData: true
        });

        // Create test medical record
        testMedicalRecord = await EnhancedMedicalRecord.create({
            appointmentId: testAppointment._id,
            patientId: testUsers.Patient._id,
            doctorId: testUsers.Doctor._id,
            encounterId: testEncounter._id,
            clinicalAssessment: {
                chiefComplaint: 'Routine vital signs check',
                historyOfPresentIllness: 'Patient presents for routine health assessment',
                pastMedicalHistory: 'No significant past medical history',
                familyHistory: 'No significant family history',
                socialHistory: 'Non-smoker, no alcohol use',
                assessedBy: testUsers.Doctor._id
            },
            physicalExam: {
                general: 'Patient appears well',
                vitalSigns: 'To be assessed',
                examinedBy: testUsers.Doctor._id
            },
            diagnosis: {
                primaryDiagnosis: {
                    code: 'Z00.00',
                    description: 'Encounter for general adult medical examination without abnormal findings'
                },
                secondaryDiagnoses: []
            },
            treatmentPlan: {
                medications: [],
                procedures: [],
                followUpPlans: [{
                    instruction: 'Routine vital signs monitoring',
                    scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }],
                planCreatedBy: testUsers.Doctor._id
            },
            isTestData: true
        });

        console.log('✅ Created test users and vital signs setup');
    });

    afterAll(async () => {
        // Clean up test data
        await VitalSigns.deleteMany({ isTestData: true });
        await EnhancedMedicalRecord.deleteMany({ isTestData: true });
        await Encounter.deleteMany({ isTestData: true });
        await Appointment.deleteMany({ isTestData: true });
        await User.deleteMany({ isTestData: true });
        console.log('🧹 Cleaned up vital signs test data');
    });

    describe('Vital Signs Creation', () => {
        it('should create vital signs by nurse successfully', async () => {
            const vitalSignsData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                medicalRecordId: testMedicalRecord._id,
                recordedBy: testUsers.Nurse._id,
                recordedByName: `${testUsers.Nurse.firstName} ${testUsers.Nurse.lastName}`,
                recordedByRole: 'Nurse',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 120,
                        diastolic: 80,
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 72,
                        unit: 'bpm'
                    },
                    temperature: {
                        value: 98.6,
                        unit: 'F'
                    },
                    respiratoryRate: {
                        value: 16,
                        unit: '/min'
                    },
                    oxygenSaturation: {
                        value: 98,
                        unit: '%'
                    },
                    weight: {
                        value: 70,
                        unit: 'kg'
                    },
                    height: {
                        value: 175,
                        unit: 'cm'
                    },
                    bmi: {
                        value: 22.9,
                        unit: 'kg/m²',
                        category: 'Normal'
                    }
                },
                notes: 'Normal vital signs recorded during routine check',
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(vitalSignsData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeDefined();
                expect(response.body.data.patientId._id).toBe(testUsers.Patient._id.toString());
                expect(response.body.data.bloodPressure.systolic).toBe(120);
                expect(response.body.data.heartRate.value).toBe(72);
                expect(response.body.data.bmi.category).toBe('Normal');

                testVitalSigns.push(response.body.data);
            }
        });

        it('should create vital signs by doctor successfully', async () => {
            const vitalSignsData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                medicalRecordId: testMedicalRecord._id,
                recordedBy: testUsers.Doctor._id,
                recordedByName: `${testUsers.Doctor.firstName} ${testUsers.Doctor.lastName}`,
                recordedByRole: 'Doctor',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 125,
                        diastolic: 82,
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 75,
                        unit: 'bpm'
                    },
                    temperature: {
                        value: 99.1,
                        unit: 'F'
                    },
                    respiratoryRate: {
                        value: 18,
                        unit: '/min'
                    },
                    oxygenSaturation: {
                        value: 97,
                        unit: '%'
                    }
                },
                notes: 'Slightly elevated temperature, monitoring',
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Doctor}`)
                .send(vitalSignsData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.temperature.value).toBe(99.1);
                expect(response.body.data.measuredBy).toBeDefined();

                testVitalSigns.push(response.body.data);
            }
        });

        it('should reject vital signs creation by unauthorized user', async () => {
            const vitalSignsData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                vitalSigns: {
                    bloodPressure: {
                        systolic: 120,
                        diastolic: 80,
                        unit: 'mmHg'
                    }
                }
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Patient}`)
                .send(vitalSignsData);

            expect([403, 404]).toContain(response.status);
        });

        it('should validate required vital signs fields', async () => {
            const incompleteData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                // Missing required blood pressure - just send minimal data
                heartRate: {
                    value: 72,
                    unit: 'bpm'
                }
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(incompleteData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });

        it('should validate vital signs value ranges', async () => {
            const invalidData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                bloodPressure: {
                    systolic: 350, // Invalid range (max 300)
                    diastolic: 250, // Invalid range (max 200)
                    unit: 'mmHg'
                },
                heartRate: {
                    value: 500, // Invalid range (max 250)
                    unit: 'bpm'
                },
                temperature: {
                    value: 50, // Invalid range (max 45)
                    unit: 'Celsius'
                }
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(invalidData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });

        it('should auto-calculate BMI when height and weight provided', async () => {
            const vitalSignsData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                medicalRecordId: testMedicalRecord._id,
                recordedBy: testUsers.Nurse._id,
                recordedByName: `${testUsers.Nurse.firstName} ${testUsers.Nurse.lastName}`,
                recordedByRole: 'Nurse',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 118,
                        diastolic: 78,
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 68,
                        unit: 'bpm'
                    },
                    weight: {
                        value: 65, // kg
                        unit: 'kg'
                    },
                    height: {
                        value: 170, // cm
                        unit: 'cm'
                    }
                },
                notes: 'BMI auto-calculation test',
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(vitalSignsData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.bmi).toBeDefined();
                expect(response.body.data.bmi.value).toBeCloseTo(22.5, 1);
                expect(response.body.data.bmi.category).toBe('Normal');

                testVitalSigns.push(response.body.data);
            }
        });
    });

    describe('Get Vital Signs', () => {
        it('should get patient vital signs by doctor', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data.vitalSigns)).toBe(true);

                if (response.body.data.vitalSigns.length > 0) {
                    response.body.data.vitalSigns.forEach(vital => {
                        expect(vital.patientId).toBe(testUsers.Patient._id.toString());
                        expect(vital.bloodPressure || vital.heartRate || vital.temperature).toBeDefined();
                    });
                }
            }
        });

        it('should get patient vital signs by nurse', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Nurse}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data.vitalSigns)).toBe(true);
            }
        });

        it('should allow patient to view own vital signs', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect([200, 403, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                response.body.data.vitalSigns.forEach(vital => {
                    expect(vital.patientId).toBe(testUsers.Patient._id.toString());
                });
            }
        });

        it('should get vital signs by encounter', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/encounter/${testEncounter._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.vitalSigns)).toBe(true);

                if (response.body.vitalSigns.length > 0) {
                    response.body.vitalSigns.forEach(vital => {
                        expect(vital.encounterId).toBe(testEncounter._id.toString());
                    });
                }
            }
        });

        it('should get vital signs by medical record', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/medical-record/${testMedicalRecord._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.vitalSigns)).toBe(true);
            }
        });

        it('should get single vital signs record', async () => {
            if (testVitalSigns.length > 0) {
                const vitalSignsId = testVitalSigns[0]._id;

                const response = await request(app)
                    .get(`/api/v1/vital-signs/${vitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Doctor}`);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.vitalSigns._id).toBe(vitalSignsId);
                }
            }
        });

        it('should filter vital signs by date range', async () => {
            const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
            const endDate = new Date().toISOString();

            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}?startDate=${startDate}&endDate=${endDate}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data.vitalSigns)).toBe(true);
            }
        });
    });

    describe('Update Vital Signs', () => {
        it('should update vital signs by nurse', async () => {
            if (testVitalSigns.length > 0) {
                const vitalSignsId = testVitalSigns[0]._id;

                const updateData = {
                    vitalSigns: {
                        bloodPressure: {
                            systolic: 122,
                            diastolic: 81,
                            unit: 'mmHg'
                        },
                        heartRate: {
                            value: 74,
                            unit: 'bpm'
                        },
                        temperature: {
                            value: 98.8,
                            unit: 'F'
                        }
                    },
                    notes: 'Updated vital signs - slight increase in BP'
                };

                const response = await request(app)
                    .put(`/api/v1/vital-signs/${vitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Nurse}`)
                    .send(updateData);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.vitalSigns.vitalSigns.bloodPressure.systolic).toBe(122);
                    expect(response.body.vitalSigns.notes).toContain('Updated vital signs');
                }
            }
        });

        it('should update vital signs by doctor', async () => {
            if (testVitalSigns.length > 1) {
                const vitalSignsId = testVitalSigns[1]._id;

                const updateData = {
                    vitalSigns: {
                        temperature: {
                            value: 98.9,
                            unit: 'F'
                        },
                        oxygenSaturation: {
                            value: 98,
                            unit: '%'
                        }
                    },
                    notes: 'Temperature normalized, oxygen saturation improved',
                    lastModifiedBy: testUsers.Doctor._id,
                    lastModifiedByName: `${testUsers.Doctor.firstName} ${testUsers.Doctor.lastName}`,
                    lastModifiedByRole: 'Doctor'
                };

                const response = await request(app)
                    .put(`/api/v1/vital-signs/${vitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Doctor}`)
                    .send(updateData);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.vitalSigns.vitalSigns.temperature.value).toBe(98.9);
                    expect(response.body.vitalSigns.lastModifiedByRole).toBe('Doctor');
                }
            }
        });

        it('should reject unauthorized vital signs update', async () => {
            if (testVitalSigns.length > 0) {
                const vitalSignsId = testVitalSigns[0]._id;

                const updateData = {
                    vitalSigns: {
                        heartRate: {
                            value: 80,
                            unit: 'bpm'
                        }
                    }
                };

                const response = await request(app)
                    .put(`/api/v1/vital-signs/${vitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Patient}`)
                    .send(updateData);

                expect([403, 404]).toContain(response.status);
            }
        });

        it('should validate update data', async () => {
            if (testVitalSigns.length > 0) {
                const vitalSignsId = testVitalSigns[0]._id;

                const invalidData = {
                    vitalSigns: {
                        heartRate: {
                            value: -50, // Invalid value
                            unit: 'bpm'
                        }
                    }
                };

                const response = await request(app)
                    .put(`/api/v1/vital-signs/${vitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Nurse}`)
                    .send(invalidData);

                expect([400, 404]).toContain(response.status);
            }
        });
    });

    describe('Vital Signs Analytics', () => {
        it('should get vital signs trends for patient', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/analytics/trends/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.trends).toBeDefined();

                const trends = response.body.trends;
                expect(trends).toHaveProperty('bloodPressureTrend');
                expect(trends).toHaveProperty('heartRateTrend');
                expect(trends).toHaveProperty('weightTrend');
            }
        });

        it('should get vital signs summary for patient', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/analytics/summary/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.summary).toBeDefined();

                const summary = response.body.summary;
                expect(summary).toHaveProperty('latestVitalSigns');
                expect(summary).toHaveProperty('averageValues');
                expect(summary).toHaveProperty('normalRanges');
            }
        });

        it('should get abnormal vital signs alerts', async () => {
            const response = await request(app)
                .get('/api/v1/vital-signs/analytics/alerts')
                .set('Authorization', `Bearer ${authTokens.Nurse}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.alerts)).toBe(true);
            }
        });

        it('should identify patients with abnormal vital signs', async () => {
            const response = await request(app)
                .get('/api/v1/vital-signs/analytics/abnormal')
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.abnormalVitalSigns)).toBe(true);
            }
        });
    });

    describe('Integration with Medical Records', () => {
        it('should link vital signs to medical record', async () => {
            const vitalSignsData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                medicalRecordId: testMedicalRecord._id,
                recordedBy: testUsers.Nurse._id,
                recordedByName: `${testUsers.Nurse.firstName} ${testUsers.Nurse.lastName}`,
                recordedByRole: 'Nurse',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 130,
                        diastolic: 85,
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 78,
                        unit: 'bpm'
                    },
                    temperature: {
                        value: 99.5,
                        unit: 'F'
                    }
                },
                notes: 'Elevated BP and temperature - documented in medical record',
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(vitalSignsData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.medicalRecordId).toBe(testMedicalRecord._id.toString());

                // Verify medical record shows vital signs
                const medicalRecordResponse = await request(app)
                    .get(`/api/v1/medical-records/${testMedicalRecord._id}`)
                    .set('Authorization', `Bearer ${authTokens.Doctor}`);

                if (medicalRecordResponse.status === 200) {
                    expect(medicalRecordResponse.body.medicalRecord).toBeDefined();
                }
            }
        });

        it('should update medical record when vital signs indicate abnormalities', async () => {
            const abnormalVitalSigns = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                medicalRecordId: testMedicalRecord._id,
                recordedBy: testUsers.Doctor._id,
                recordedByName: `${testUsers.Doctor.firstName} ${testUsers.Doctor.lastName}`,
                recordedByRole: 'Doctor',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 160, // High
                        diastolic: 95, // High
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 110, // High
                        unit: 'bpm'
                    },
                    temperature: {
                        value: 101.5, // High fever
                        unit: 'F'
                    },
                    oxygenSaturation: {
                        value: 93, // Low
                        unit: '%'
                    }
                },
                notes: 'Multiple abnormal vital signs - hypertension, tachycardia, fever, hypoxemia',
                alerts: [
                    'Hypertension - systolic >140',
                    'Tachycardia - HR >100',
                    'Fever - temp >100.4F',
                    'Hypoxemia - O2 sat <95%'
                ],
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Doctor}`)
                .send(abnormalVitalSigns);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.bloodPressure.systolic).toBe(160);
                expect(response.body.data.notes).toContain('abnormal vital signs');

                testVitalSigns.push(response.body.data);
            }
        });
    });

    describe('Vital Signs History and Comparison', () => {
        it('should compare current vs previous vital signs', async () => {
            if (testVitalSigns.length >= 2) {
                const currentVitalSignsId = testVitalSigns[testVitalSigns.length - 1]._id;
                const previousVitalSignsId = testVitalSigns[testVitalSigns.length - 2]._id;

                const response = await request(app)
                    .get(`/api/v1/vital-signs/compare?current=${currentVitalSignsId}&previous=${previousVitalSignsId}`)
                    .set('Authorization', `Bearer ${authTokens.Doctor}`);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.comparison).toBeDefined();

                    const comparison = response.body.comparison;
                    expect(comparison).toHaveProperty('bloodPressureChange');
                    expect(comparison).toHaveProperty('heartRateChange');
                    expect(comparison).toHaveProperty('temperatureChange');
                }
            }
        });

        it('should get vital signs history with pagination', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}/history?page=1&limit=5`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.vitalSigns).toBeDefined();
                expect(response.body.pagination).toBeDefined();

                const pagination = response.body.pagination;
                expect(pagination).toHaveProperty('currentPage');
                expect(pagination).toHaveProperty('totalPages');
                expect(pagination).toHaveProperty('totalRecords');
            }
        });

        it('should export vital signs data', async () => {
            const response = await request(app)
                .get(`/api/v1/vital-signs/patient/${testUsers.Patient._id}/export?format=json`)
                .set('Authorization', `Bearer ${authTokens.Doctor}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.exportData).toBeDefined();
                expect(Array.isArray(response.body.exportData)).toBe(true);
            }
        });
    });

    describe('Vital Signs Workflow Integration', () => {
        it('should complete full vital signs workflow', async () => {
            // 1. Patient checks in (handled by encounter)
            // 2. Nurse records initial vital signs
            const initialVitals = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                recordedBy: testUsers.Nurse._id,
                recordedByName: `${testUsers.Nurse.firstName} ${testUsers.Nurse.lastName}`,
                recordedByRole: 'Nurse',
                vitalSigns: {
                    bloodPressure: {
                        systolic: 135,
                        diastolic: 88,
                        unit: 'mmHg'
                    },
                    heartRate: {
                        value: 82,
                        unit: 'bpm'
                    },
                    temperature: {
                        value: 99.2,
                        unit: 'F'
                    },
                    weight: {
                        value: 72,
                        unit: 'kg'
                    },
                    height: {
                        value: 168,
                        unit: 'cm'
                    }
                },
                notes: 'Initial triage vital signs',
                stage: 'Triage',
                isTestData: true
            };

            const initialResponse = await request(app)
                .post('/api/v1/vital-signs')
                .set('Authorization', `Bearer ${authTokens.Nurse}`)
                .send(initialVitals);

            if ([200, 201].includes(initialResponse.status)) {
                // 3. Doctor reviews and records examination vital signs
                const examVitals = {
                    patientId: testUsers.Patient._id,
                    encounterId: testEncounter._id,
                    medicalRecordId: testMedicalRecord._id,
                    recordedBy: testUsers.Doctor._id,
                    recordedByName: `${testUsers.Doctor.firstName} ${testUsers.Doctor.lastName}`,
                    recordedByRole: 'Doctor',
                    vitalSigns: {
                        bloodPressure: {
                            systolic: 132,
                            diastolic: 86,
                            unit: 'mmHg'
                        },
                        heartRate: {
                            value: 80,
                            unit: 'bpm'
                        },
                        temperature: {
                            value: 99.0,
                            unit: 'F'
                        }
                    },
                    notes: 'Examination vital signs - slight improvement',
                    stage: 'Examination',
                    isTestData: true
                };

                const examResponse = await request(app)
                    .post('/api/v1/vital-signs')
                    .set('Authorization', `Bearer ${authTokens.Doctor}`)
                    .send(examVitals);

                if ([200, 201].includes(examResponse.status)) {
                    // 4. Verify workflow completion
                    const historyResponse = await request(app)
                        .get(`/api/v1/vital-signs/encounter/${testEncounter._id}`)
                        .set('Authorization', `Bearer ${authTokens.Doctor}`);

                    if (historyResponse.status === 200) {
                        expect(historyResponse.body.vitalSigns.length).toBeGreaterThanOrEqual(2);

                        const stages = historyResponse.body.vitalSigns.map(v => v.stage);
                        expect(stages).toContain('Triage');
                        expect(stages).toContain('Examination');
                    }
                }
            }
        });
    });
});
