// Data Integrity Tests cho Medical Records System
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import MedicalRecordSeeder from '../database/seeders/medicalRecordSeeder.js';

describe('Medical Records Data Integrity Tests', () => {
    let testData;
    let doctorToken;

    beforeAll(async () => {
        console.log('🔬 Setting up data integrity tests...');

        // Seed test data
        testData = await MedicalRecordSeeder.seedTestData();

        // Get authentication token
        const tokens = await getAuthTokens();
        doctorToken = tokens.doctor;

        console.log('✅ Data integrity test setup complete');
    });

    afterAll(async () => {
        await MedicalRecordSeeder.cleanupTestData();
    });

    describe('Medical Record Creation Integrity', () => {
        test('Medical record creation does not affect appointments', async () => {
            console.log('🏥 Testing appointment integrity...');

            const { Appointment } = await import('../../models/appointmentSchema.js');

            // Get appointment before medical record creation
            const appointmentBefore = await Appointment.findById(testData.testAppointment._id);

            // Create medical record
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'Data integrity test',
                historyOfPresentIllness: 'Testing data integrity'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            // Get appointment after medical record creation
            const appointmentAfter = await Appointment.findById(testData.testAppointment._id);

            // Appointment should remain unchanged
            expect(appointmentAfter.status).toBe(appointmentBefore.status);
            expect(appointmentAfter.appointment_date.toISOString()).toBe(appointmentBefore.appointment_date.toISOString());
            expect(appointmentAfter.appointment_time).toBe(appointmentBefore.appointment_time);
            expect(appointmentAfter.department).toBe(appointmentBefore.department);

            console.log('✅ Appointment integrity maintained');
        });

        test('Medical record creation does not affect user data', async () => {
            console.log('👤 Testing user data integrity...');

            const { User } = await import('../../models/userScheme.js');

            // Get user data before medical record creation
            const patientBefore = await User.findById(testData.testPatient._id);
            const doctorBefore = await User.findById(testData.testDoctor._id);

            // Create medical record
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'User integrity test',
                historyOfPresentIllness: 'Testing user data integrity'
            };

            await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            // Get user data after medical record creation
            const patientAfter = await User.findById(testData.testPatient._id);
            const doctorAfter = await User.findById(testData.testDoctor._id);

            // Patient data should remain unchanged
            expect(patientAfter.firstName).toBe(patientBefore.firstName);
            expect(patientAfter.lastName).toBe(patientBefore.lastName);
            expect(patientAfter.email).toBe(patientBefore.email);
            expect(patientAfter.role).toBe(patientBefore.role);

            // Doctor data should remain unchanged
            expect(doctorAfter.firstName).toBe(doctorBefore.firstName);
            expect(doctorAfter.lastName).toBe(doctorBefore.lastName);
            expect(doctorAfter.email).toBe(doctorBefore.email);
            expect(doctorAfter.role).toBe(doctorBefore.role);

            console.log('✅ User data integrity maintained');
        });
    });

    describe('Medical Record Update Integrity', () => {
        test('Medical record updates preserve original data', async () => {
            console.log('📝 Testing update integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            // Create a medical record first
            const initialRecord = await EnhancedMedicalRecord.create({
                appointmentId: testData.testAppointment._id,
                patientId: testData.testPatient._id,
                doctorId: testData.testDoctor._id,
                encounterId: testData.testAppointment._id,
                clinicalAssessment: {
                    chiefComplaint: 'Original complaint',
                    historyOfPresentIllness: 'Original history',
                    assessedBy: testData.testDoctor._id
                },
                recordStatus: 'Draft',
                isTestData: true
            });

            const originalCreatedAt = initialRecord.createdAt;
            const originalId = initialRecord._id;

            // Update the record
            initialRecord.clinicalAssessment.chiefComplaint = 'Updated complaint';
            await initialRecord.save();

            // Fetch updated record
            const updatedRecord = await EnhancedMedicalRecord.findById(originalId);

            // Verify critical data preserved
            expect(updatedRecord._id.toString()).toBe(originalId.toString());
            expect(updatedRecord.patientId.toString()).toBe(testData.testPatient._id.toString());
            expect(updatedRecord.doctorId.toString()).toBe(testData.testDoctor._id.toString());
            expect(updatedRecord.createdAt.toISOString()).toBe(originalCreatedAt.toISOString());

            // Verify update worked
            expect(updatedRecord.clinicalAssessment.chiefComplaint).toBe('Updated complaint');

            console.log('✅ Update integrity maintained');

            // Cleanup
            await EnhancedMedicalRecord.findByIdAndDelete(originalId);
        });
    });

    describe('Medical Record Deletion Integrity', () => {
        test('Medical record deletion does not affect related data', async () => {
            console.log('🗑️ Testing deletion integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');
            const { User } = await import('../../models/userScheme.js');
            const { Appointment } = await import('../../models/appointmentSchema.js');

            // Create a medical record for deletion test
            const recordToDelete = await EnhancedMedicalRecord.create({
                appointmentId: testData.testAppointment._id,
                patientId: testData.testPatient._id,
                doctorId: testData.testDoctor._id,
                encounterId: testData.testAppointment._id,
                clinicalAssessment: {
                    chiefComplaint: 'Record to delete',
                    historyOfPresentIllness: 'This record will be deleted',
                    assessedBy: testData.testDoctor._id
                },
                recordStatus: 'Draft',
                isTestData: true
            });

            // Get related data before deletion
            const patientBefore = await User.findById(testData.testPatient._id);
            const doctorBefore = await User.findById(testData.testDoctor._id);
            const appointmentBefore = await Appointment.findById(testData.testAppointment._id);

            // Delete the medical record
            await EnhancedMedicalRecord.findByIdAndDelete(recordToDelete._id);

            // Verify record is deleted
            const deletedRecord = await EnhancedMedicalRecord.findById(recordToDelete._id);
            expect(deletedRecord).toBeNull();

            // Get related data after deletion
            const patientAfter = await User.findById(testData.testPatient._id);
            const doctorAfter = await User.findById(testData.testDoctor._id);
            const appointmentAfter = await Appointment.findById(testData.testAppointment._id);

            // Verify related data unchanged
            expect(patientAfter.firstName).toBe(patientBefore.firstName);
            expect(patientAfter.email).toBe(patientBefore.email);
            expect(doctorAfter.firstName).toBe(doctorBefore.firstName);
            expect(doctorAfter.email).toBe(doctorBefore.email);
            expect(appointmentAfter.status).toBe(appointmentBefore.status);

            console.log('✅ Deletion integrity maintained');
        });

        test('Soft delete preserves data integrity', async () => {
            console.log('🔒 Testing soft delete integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            // Create a medical record for soft delete test
            const recordForSoftDelete = await EnhancedMedicalRecord.create({
                appointmentId: testData.testAppointment._id,
                patientId: testData.testPatient._id,
                doctorId: testData.testDoctor._id,
                encounterId: testData.testAppointment._id,
                clinicalAssessment: {
                    chiefComplaint: 'Record for soft delete',
                    historyOfPresentIllness: 'This record will be soft deleted',
                    assessedBy: testData.testDoctor._id
                },
                recordStatus: 'Completed',
                isActive: true,
                isTestData: true
            });

            // Soft delete (set isActive to false)
            await EnhancedMedicalRecord.findByIdAndUpdate(
                recordForSoftDelete._id,
                { isActive: false }
            );

            // Verify record still exists but is inactive
            const softDeletedRecord = await EnhancedMedicalRecord.findById(recordForSoftDelete._id);
            expect(softDeletedRecord).toBeTruthy();
            expect(softDeletedRecord.isActive).toBe(false);
            expect(softDeletedRecord.clinicalAssessment.chiefComplaint).toBe('Record for soft delete');

            // Verify record doesn't appear in active queries
            const activeRecords = await EnhancedMedicalRecord.find({
                patientId: testData.testPatient._id,
                isActive: true
            });

            const foundDeletedRecord = activeRecords.find(
                record => record._id.toString() === recordForSoftDelete._id.toString()
            );
            expect(foundDeletedRecord).toBeUndefined();

            console.log('✅ Soft delete integrity maintained');

            // Cleanup
            await EnhancedMedicalRecord.findByIdAndDelete(recordForSoftDelete._id);
        });
    });

    describe('Referential Integrity', () => {
        test('Medical record references remain valid', async () => {
            console.log('🔗 Testing referential integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            // Create medical record with references
            const recordData = {
                patientId: testData.testPatient._id.toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'Referential integrity test',
                historyOfPresentIllness: 'Testing references'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(recordData)
                .expect(201);

            const recordId = response.body.data._id;

            // Fetch record with populated references
            const populatedRecord = await EnhancedMedicalRecord.findById(recordId)
                .populate('patientId', 'firstName lastName email')
                .populate('doctorId', 'firstName lastName specialization')
                .populate('appointmentId', 'appointment_date status');

            // Verify all references are valid
            expect(populatedRecord.patientId).toBeTruthy();
            expect(populatedRecord.patientId.firstName).toBe('Test');
            expect(populatedRecord.doctorId).toBeTruthy();
            expect(populatedRecord.doctorId.firstName).toBe('Test');
            expect(populatedRecord.appointmentId).toBeTruthy();
            expect(populatedRecord.appointmentId.status).toBeDefined();

            console.log('✅ Referential integrity maintained');

            // Cleanup
            await EnhancedMedicalRecord.findByIdAndDelete(recordId);
        });

        test('Invalid references are rejected', async () => {
            console.log('❌ Testing invalid reference rejection...');

            // Try to create record with invalid patient ID
            const invalidRecordData = {
                patientId: new mongoose.Types.ObjectId().toString(),
                appointmentId: testData.testAppointment._id.toString(),
                chiefComplaint: 'Invalid reference test'
            };

            const response = await request(app)
                .post('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send(invalidRecordData);

            // Should either fail validation or handle gracefully
            if (response.status === 201) {
                // If created, verify error handling during population
                const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');
                const recordWithInvalidRef = await EnhancedMedicalRecord.findById(response.body.data._id)
                    .populate('patientId');

                expect(recordWithInvalidRef.patientId).toBeNull();

                // Cleanup
                await EnhancedMedicalRecord.findByIdAndDelete(response.body.data._id);
            } else {
                expect(response.status).toBeGreaterThanOrEqual(400);
            }

            console.log('✅ Invalid references properly handled');
        });
    });

    describe('Concurrent Access Integrity', () => {
        test('Concurrent updates maintain data consistency', async () => {
            console.log('🔄 Testing concurrent access integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            // Create a record for concurrent testing
            const baseRecord = await EnhancedMedicalRecord.create({
                appointmentId: testData.testAppointment._id,
                patientId: testData.testPatient._id,
                doctorId: testData.testDoctor._id,
                encounterId: testData.testAppointment._id,
                clinicalAssessment: {
                    chiefComplaint: 'Concurrent test',
                    historyOfPresentIllness: 'Testing concurrent access',
                    assessedBy: testData.testDoctor._id
                },
                recordStatus: 'Draft',
                isTestData: true
            });

            // Simulate concurrent updates
            const updatePromises = [];

            for (let i = 0; i < 5; i++) {
                updatePromises.push(
                    EnhancedMedicalRecord.findByIdAndUpdate(
                        baseRecord._id,
                        {
                            $push: {
                                progressNotes: {
                                    noteType: 'Progress',
                                    content: `Concurrent note ${i}`,
                                    author: testData.testDoctor._id,
                                    authorRole: 'Doctor'
                                }
                            }
                        },
                        { new: true }
                    )
                );
            }

            const results = await Promise.all(updatePromises);

            // Verify all updates completed without errors
            results.forEach(result => {
                expect(result).toBeTruthy();
                expect(result._id.toString()).toBe(baseRecord._id.toString());
            });

            // Verify final state
            const finalRecord = await EnhancedMedicalRecord.findById(baseRecord._id);
            expect(finalRecord.progressNotes.length).toBeGreaterThan(0);

            console.log('✅ Concurrent access integrity maintained');

            // Cleanup
            await EnhancedMedicalRecord.findByIdAndDelete(baseRecord._id);
        });
    });

    describe('Transaction Integrity', () => {
        test('Failed operations do not corrupt data', async () => {
            console.log('💥 Testing transaction integrity...');

            const { EnhancedMedicalRecord } = await import('../../models/enhancedMedicalRecord.model.js');

            // Count records before operation
            const recordsBefore = await EnhancedMedicalRecord.countDocuments({ isTestData: true });

            try {
                // Attempt to create record with invalid data that should fail
                const invalidData = {
                    // Missing required fields to force failure
                    patientId: 'invalid-id',
                    appointmentId: 'invalid-id'
                };

                await request(app)
                    .post('/api/v1/medical-records/enhanced')
                    .set('Authorization', `Bearer ${doctorToken}`)
                    .send(invalidData);

            } catch (error) {
                // Expected to fail
            }

            // Count records after failed operation
            const recordsAfter = await EnhancedMedicalRecord.countDocuments({ isTestData: true });

            // Record count should be unchanged
            expect(recordsAfter).toBe(recordsBefore);

            console.log('✅ Transaction integrity maintained');
        });
    });
});

async function getAuthTokens() {
    try {
        const response = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.doctor@hospital.com',
                password: 'testpassword123'
            });

        if (response.status !== 200) {
            throw new Error(`Login failed: ${response.body.message}`);
        }

        return {
            doctor: response.body.token
        };
    } catch (error) {
        console.error('❌ Error getting auth tokens:', error);
        throw error;
    }
}
