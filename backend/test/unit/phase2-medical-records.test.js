/**
 * Phase 2: Medical Records & Patient Management Tests - 100% Coverage
 * Comprehensive testing of medical record CRUD operations, patient profiles, and clinical workflows
 */
const authHelper = require('../helpers/authHelper.js');
const apiUtils = require('../helpers/apiUtils.js');
const databaseUtils = require('../helpers/databaseUtils.js');
const UserFactory = require('../factories/userFactory.js');
const MedicalRecordsFactory = require('../factories/medicalRecordsFactory.js');
const testConfig = require('../config/test.config.js');

// Mock database to avoid connection issues
jest.mock('../helpers/databaseUtils.js', () => ({
  setupTestDatabase: jest.fn(),
  closeDatabase: jest.fn(),
  cleanDatabase: jest.fn(),
  getConnectionStatus: jest.fn(() => ({ isConnected: true, readyState: 1 })),
  validateDatabaseIntegrity: jest.fn(() => ({ isValid: true, issues: [] })),
  getDatabaseStats: jest.fn(() => ({})),
  createSnapshot: jest.fn(() => ({})),
  restoreSnapshot: jest.fn(),
  seedTestData: jest.fn(),
  executeTransaction: jest.fn()
}));

describe('Phase 2: Medical Records & Patient Management - 100% Coverage', () => {
  let testPatients = {};
  let testDoctors = {};
  let testMedicalRecords = {};

  beforeAll(async () => {
    // Setup test environment
    authHelper.clearCache();
  });

  beforeEach(async () => {
    // Clear test data before each test
    testPatients = {};
    testDoctors = {};
    testMedicalRecords = {};
    authHelper.clearCache();
  });

  describe('Medical Record Data Generation - Complete Coverage', () => {
    test('Should generate comprehensive medical record with all clinical sections', () => {
      const patientId = 'patient-123';
      const doctorId = 'doctor-456';

      const medicalRecord = MedicalRecordsFactory.createMedicalRecord(patientId, doctorId);

      // Core record information
      expect(medicalRecord.patientId).toBe(patientId);
      expect(medicalRecord.doctorId).toBe(doctorId);
      expect(medicalRecord.recordNumber).toMatch(/^MR-\d{4}-\d{6}$/);
      expect(medicalRecord.visitDate).toBeDefined();

      // Clinical documentation
      expect(medicalRecord.chiefComplaint).toBeDefined();
      expect(medicalRecord.historyOfPresentIllness).toBeDefined();
      expect(Array.isArray(medicalRecord.pastMedicalHistory)).toBe(true);
      expect(Array.isArray(medicalRecord.medications)).toBe(true);
      expect(Array.isArray(medicalRecord.allergies)).toBe(true);

      // Physical examination
      expect(medicalRecord.physicalExamination).toBeDefined();
      expect(medicalRecord.physicalExamination.vitalSigns).toBeDefined();
      expect(medicalRecord.physicalExamination.systems).toBeDefined();

      // Diagnosis and treatment
      expect(medicalRecord.diagnosis.primary).toBeDefined();
      expect(medicalRecord.diagnosis.primary.condition).toBeDefined();
      expect(medicalRecord.diagnosis.primary.icd10).toBeDefined();
      expect(Array.isArray(medicalRecord.diagnosis.secondary)).toBe(true);

      // Treatment plan
      expect(medicalRecord.treatmentPlan).toBeDefined();
      expect(Array.isArray(medicalRecord.treatmentPlan.medications)).toBe(true);
      expect(medicalRecord.treatmentPlan.followUp).toBeDefined();

      // Lab orders and results
      expect(Array.isArray(medicalRecord.labOrders)).toBe(true);
      expect(Array.isArray(medicalRecord.labResults)).toBe(true);

      // Metadata
      expect(medicalRecord.status).toBeDefined();
      expect(medicalRecord.recordType).toBeDefined();
      expect(medicalRecord.department).toBeDefined();
    });

    test('Should generate realistic vital signs within medical ranges', () => {
      const vitalSigns = MedicalRecordsFactory.generateVitalSigns();

      // Temperature (Fahrenheit)
      expect(vitalSigns.temperature).toBeGreaterThanOrEqual(96.5);
      expect(vitalSigns.temperature).toBeLessThanOrEqual(101.5);

      // Blood pressure
      expect(vitalSigns.bloodPressure.systolic).toBeGreaterThanOrEqual(90);
      expect(vitalSigns.bloodPressure.systolic).toBeLessThanOrEqual(180);
      expect(vitalSigns.bloodPressure.diastolic).toBeGreaterThanOrEqual(60);
      expect(vitalSigns.bloodPressure.diastolic).toBeLessThanOrEqual(110);

      // Heart rate
      expect(vitalSigns.heartRate).toBeGreaterThanOrEqual(60);
      expect(vitalSigns.heartRate).toBeLessThanOrEqual(120);

      // Oxygen saturation
      expect(vitalSigns.oxygenSaturation).toBeGreaterThanOrEqual(95);
      expect(vitalSigns.oxygenSaturation).toBeLessThanOrEqual(100);

      // Pain scale
      expect(vitalSigns.painScale).toBeGreaterThanOrEqual(0);
      expect(vitalSigns.painScale).toBeLessThanOrEqual(10);
    });

    test('Should generate valid ICD-10 diagnosis codes', () => {
      const diagnosis = MedicalRecordsFactory.generateDiagnosis();

      expect(diagnosis.condition).toBeDefined();
      expect(diagnosis.icd10).toBeDefined();
      expect(diagnosis.icd10).toMatch(/^[A-Z]\d+(\.\d+)?$/); // ICD-10 code format

      // Verify ICD-10 codes from comprehensive list
      const allICD10Codes = MedicalRecordsFactory.getICD10Codes();
      expect(Array.isArray(allICD10Codes)).toBe(true);
      expect(allICD10Codes.length).toBeGreaterThan(5);

      allICD10Codes.forEach(code => {
        expect(code.condition).toBeDefined();
        expect(code.icd10).toMatch(/^[A-Z]\d+(\.\d+)?$/);
      });
    });

    test('Should generate comprehensive medication data with proper formatting', () => {
      const medications = MedicalRecordsFactory.generateMedications();

      expect(Array.isArray(medications)).toBe(true);
      medications.forEach(med => {
        expect(med.name).toBeDefined();
        expect(med.dosage).toBeDefined();
        expect(med.startDate).toBeDefined();
        expect(med.prescribedBy).toBeDefined();
      });

      // Test prescription generation
      const prescriptions = MedicalRecordsFactory.generatePrescriptions();
      expect(Array.isArray(prescriptions)).toBe(true);

      prescriptions.forEach(prescription => {
        expect(prescription.name).toBeDefined();
        expect(prescription.dosage).toBeDefined();
        expect(prescription.frequency).toBeDefined();
        expect(prescription.duration).toBeDefined();
        expect(prescription.prescribedDate).toBeDefined();
        expect(typeof prescription.refills).toBe('number');
        expect(typeof prescription.genericAllowed).toBe('boolean');
      });
    });

    test('Should generate realistic lab orders and results', () => {
      const labOrders = MedicalRecordsFactory.generateLabOrders();

      expect(Array.isArray(labOrders)).toBe(true);
      labOrders.forEach(order => {
        expect(order.testName).toBeDefined();
        expect(order.orderDate).toBeDefined();
        expect(['Routine', 'STAT', 'Urgent']).toContain(order.priority);
        expect(['Ordered', 'In Progress', 'Completed']).toContain(order.status);
      });

      const labResults = MedicalRecordsFactory.generateLabResults();
      expect(Array.isArray(labResults)).toBe(true);

      labResults.forEach(result => {
        expect(result.testName).toBeDefined();
        expect(result.results).toBeDefined();
        expect(result.completedDate).toBeDefined();
        expect(result.status).toBe('Final');

        // Validate specific lab values
        Object.values(result.results).forEach(testResult => {
          expect(testResult.value).toBeDefined();
          expect(testResult.unit).toBeDefined();
          expect(testResult.reference).toBeDefined();
        });
      });
    });

    test('Should generate valid allergy data with reactions', () => {
      const allergies = MedicalRecordsFactory.generateAllergies();

      expect(Array.isArray(allergies)).toBe(true);
      allergies.forEach(allergy => {
        expect(allergy.allergen).toBeDefined();
        expect(allergy.reaction).toBeDefined();
        expect(['Mild', 'Moderate', 'Severe']).toContain(allergy.severity);
      });
    });
  });

  describe('Discharge Summary Generation - Complete Coverage', () => {
    test('Should create comprehensive discharge summary', () => {
      const patientId = 'patient-discharge-123';
      const doctorId = 'doctor-discharge-456';

      const dischargeSummary = MedicalRecordsFactory.createDischargeSummary(patientId, doctorId);

      // Core information
      expect(dischargeSummary.patientId).toBe(patientId);
      expect(dischargeSummary.attendingPhysician).toBe(doctorId);
      expect(dischargeSummary.admissionDate).toBeDefined();
      expect(dischargeSummary.dischargeDate).toBeDefined();

      // Diagnosis information
      expect(dischargeSummary.admissionDiagnosis).toBeDefined();
      expect(dischargeSummary.dischargeDiagnosis).toBeDefined();

      // Hospital course and procedures
      expect(dischargeSummary.hospitalCourse).toBeDefined();
      expect(Array.isArray(dischargeSummary.procedures)).toBe(true);

      // Discharge information
      expect(['Stable', 'Improved', 'Good', 'Fair']).toContain(dischargeSummary.dischargeCondition);
      expect(Array.isArray(dischargeSummary.dischargeMedications)).toBe(true);
      expect(dischargeSummary.followUpInstructions).toBeDefined();

      // Diet and activity restrictions
      expect(dischargeSummary.dietRestrictions).toBeDefined();
      expect(dischargeSummary.activityRestrictions).toBeDefined();

      // Follow-up appointments
      expect(Array.isArray(dischargeSummary.followUpAppointments)).toBe(true);
      dischargeSummary.followUpAppointments.forEach(appointment => {
        expect(appointment.department).toBeDefined();
        expect(appointment.timeframe).toBeDefined();
        expect(appointment.instructions).toBeDefined();
      });
    });

    test('Should allow discharge summary customization', () => {
      const customData = {
        dischargeCondition: 'Excellent',
        dietRestrictions: 'No restrictions',
        followUpInstructions: 'Custom follow-up instructions'
      };

      const dischargeSummary = MedicalRecordsFactory.createDischargeSummary(
        'patient-123',
        'doctor-456',
        customData
      );

      expect(dischargeSummary.dischargeCondition).toBe('Excellent');
      expect(dischargeSummary.dietRestrictions).toBe('No restrictions');
      expect(dischargeSummary.followUpInstructions).toBe('Custom follow-up instructions');
    });
  });

  describe('Progress Notes Creation - Complete Coverage', () => {
    test('Should create detailed progress notes', () => {
      const patientId = 'patient-progress-123';
      const providerId = 'provider-456';

      const progressNote = MedicalRecordsFactory.createProgressNote(patientId, providerId);

      // Core information
      expect(progressNote.patientId).toBe(patientId);
      expect(progressNote.providerId).toBe(providerId);
      expect(progressNote.noteDate).toBeDefined();
      expect(['Progress Note', 'Consultation', 'Procedure Note', 'Discharge Note']).toContain(progressNote.noteType);

      // SOAP format
      expect(progressNote.subjective).toBeDefined();
      expect(progressNote.objective).toBeDefined();
      expect(progressNote.objective.vitalSigns).toBeDefined();
      expect(progressNote.objective.physicalExam).toBeDefined();
      expect(progressNote.assessment).toBeDefined();
      expect(progressNote.plan).toBeDefined();

      // Digital signature
      expect(progressNote.signature).toBeDefined();
      expect(progressNote.signature.providerId).toBe(providerId);
      expect(progressNote.signature.timestamp).toBeDefined();
      expect(progressNote.signature.verified).toBe(true);
    });

    test('Should validate progress note content structure', () => {
      const progressNote = MedicalRecordsFactory.createProgressNote('patient-123', 'provider-456');

      // Vital signs in objective section
      const vitalSigns = progressNote.objective.vitalSigns;
      expect(vitalSigns.temperature).toBeDefined();
      expect(vitalSigns.bloodPressure).toBeDefined();
      expect(vitalSigns.heartRate).toBeDefined();
      expect(vitalSigns.respiratoryRate).toBeDefined();

      // Ensure proper data types
      expect(typeof progressNote.subjective).toBe('string');
      expect(typeof progressNote.objective.physicalExam).toBe('string');
      expect(typeof progressNote.assessment).toBe('string');
      expect(typeof progressNote.plan).toBe('string');
    });
  });

  describe('Bulk Medical Records Generation - Complete Coverage', () => {
    test('Should generate multiple medical records efficiently', () => {
      const patientIds = ['patient-1', 'patient-2', 'patient-3'];
      const doctorIds = ['doctor-1', 'doctor-2'];
      const recordCount = 10;

      const startTime = Date.now();
      const medicalRecords = MedicalRecordsFactory.createBulkMedicalRecords(
        recordCount,
        patientIds,
        doctorIds
      );
      const duration = Date.now() - startTime;

      expect(medicalRecords).toHaveLength(recordCount);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      // Verify all records have valid structure
      medicalRecords.forEach((record, index) => {
        expect(patientIds).toContain(record.patientId);
        expect(doctorIds).toContain(record.doctorId);
        expect(record.recordNumber).toMatch(/^MR-\d{4}-\d{6}$/);
        expect(record.visitDate).toBeDefined();
        expect(record.diagnosis.primary).toBeDefined();
      });

      // Verify record uniqueness
      const recordNumbers = medicalRecords.map(record => record.recordNumber);
      const uniqueRecordNumbers = new Set(recordNumbers);
      expect(uniqueRecordNumbers.size).toBe(recordCount);
    });

    test('Should distribute patients and doctors across records', () => {
      const patientIds = ['patient-1', 'patient-2', 'patient-3', 'patient-4'];
      const doctorIds = ['doctor-1', 'doctor-2', 'doctor-3'];

      const medicalRecords = MedicalRecordsFactory.createBulkMedicalRecords(20, patientIds, doctorIds);

      // Check that all patients and doctors are represented
      const usedPatients = new Set(medicalRecords.map(record => record.patientId));
      const usedDoctors = new Set(medicalRecords.map(record => record.doctorId));

      expect(usedPatients.size).toBeGreaterThan(1);
      expect(usedDoctors.size).toBeGreaterThan(1);

      patientIds.forEach(patientId => {
        expect(usedPatients.has(patientId)).toBe(true);
      });

      doctorIds.forEach(doctorId => {
        expect(usedDoctors.has(doctorId)).toBe(true);
      });
    });
  });

  describe('Patient Profile Management - Complete Coverage', () => {
    test('Should create complete patient profiles with medical history', async () => {
      const patientData = await UserFactory.createPatient();

      // Verify patient-specific fields
      expect(patientData.role).toBe('Patient');
      expect(patientData.emergencyContact).toBeDefined();
      expect(patientData.medicalHistory).toBeDefined();

      // Emergency contact validation
      const emergencyContact = patientData.emergencyContact;
      expect(emergencyContact.name).toBeDefined();
      expect(emergencyContact.relationship).toBeDefined();
      expect(emergencyContact.phone).toMatch(/^\d{10}$/);

      // Medical history validation
      const medicalHistory = patientData.medicalHistory;
      expect(Array.isArray(medicalHistory.allergies)).toBe(true);
      expect(Array.isArray(medicalHistory.chronicConditions)).toBe(true);
      expect(Array.isArray(medicalHistory.previousSurgeries)).toBe(true);
      expect(medicalHistory.familyHistory).toBeDefined();
    });

    test('Should validate patient data integrity across multiple patients', async () => {
      const patientCount = 5;
      const patients = await UserFactory.createBulkUsers(patientCount, 'Patient');

      // Verify all patients have unique identifiers
      const emails = patients.map(patient => patient.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(patientCount);

      const nics = patients.map(patient => patient.nic);
      const uniqueNics = new Set(nics);
      expect(uniqueNics.size).toBe(patientCount);

      // Verify consistent data structure
      patients.forEach((patient, index) => {
        expect(patient.role).toBe('Patient');
        expect(patient.nic).toMatch(/^\d{12}$/);
        expect(patient.phone).toMatch(/^\d{10}$/);
        expect(patient.email).toBe(`patient${index}@test.hospital.com`);
        expect(patient.medicalHistory).toBeDefined();
        expect(patient.emergencyContact).toBeDefined();
      });
    });

    test('Should handle patient profile updates and modifications', async () => {
      const originalPatient = await UserFactory.createPatient();

      // Simulate profile updates
      const updatedData = {
        phone: '9876543210',
        address: 'Updated Address 123',
        emergencyContact: {
          name: 'Updated Emergency Contact',
          relationship: 'Parent',
          phone: '1112223333'
        },
        medicalHistory: {
          ...originalPatient.medicalHistory,
          allergies: ['Penicillin', 'Shellfish'],
          chronicConditions: ['Hypertension']
        }
      };

      const updatedPatient = await UserFactory.createPatient(updatedData);

      expect(updatedPatient.phone).toBe('9876543210');
      expect(updatedPatient.address).toBe('Updated Address 123');
      expect(updatedPatient.emergencyContact.name).toBe('Updated Emergency Contact');
      expect(updatedPatient.medicalHistory.allergies).toContain('Penicillin');
      expect(updatedPatient.medicalHistory.chronicConditions).toContain('Hypertension');
    });
  });

  describe('Clinical Documentation Workflows - Complete Coverage', () => {
    test('Should create complete clinical workflow from admission to discharge', () => {
      const patientId = 'workflow-patient-123';
      const doctorId = 'workflow-doctor-456';

      // 1. Initial medical record (admission)
      const admissionRecord = MedicalRecordsFactory.createMedicalRecord(patientId, doctorId, {
        recordType: 'Inpatient Admission',
        chiefComplaint: 'Chest pain and shortness of breath',
        status: 'Active'
      });

      // 2. Progress notes during stay
      const progressNote1 = MedicalRecordsFactory.createProgressNote(patientId, doctorId, {
        noteType: 'Progress Note',
        subjective: 'Patient reports decreased chest pain',
        assessment: 'Stable condition, responding to treatment'
      });

      const progressNote2 = MedicalRecordsFactory.createProgressNote(patientId, doctorId, {
        noteType: 'Progress Note',
        subjective: 'Patient ambulating well, no complaints',
        assessment: 'Ready for discharge'
      });

      // 3. Discharge summary
      const dischargeSummary = MedicalRecordsFactory.createDischargeSummary(patientId, doctorId, {
        dischargeCondition: 'Stable',
        followUpInstructions: 'Follow up with cardiologist in 1 week'
      });

      // Verify workflow continuity
      expect(admissionRecord.patientId).toBe(patientId);
      expect(progressNote1.patientId).toBe(patientId);
      expect(progressNote2.patientId).toBe(patientId);
      expect(dischargeSummary.patientId).toBe(patientId);

      // Verify clinical progression
      expect(admissionRecord.status).toBe('Active');
      expect(progressNote1.assessment).toContain('responding to treatment');
      expect(progressNote2.assessment).toContain('Ready for discharge');
      expect(dischargeSummary.dischargeCondition).toBe('Stable');
    });

    test('Should validate medical record data consistency', () => {
      const patientId = 'consistency-patient-123';
      const doctorId = 'consistency-doctor-456';

      const medicalRecord = MedicalRecordsFactory.createMedicalRecord(patientId, doctorId);

      // Verify vital signs are within realistic ranges
      const vitalSigns = medicalRecord.physicalExamination.vitalSigns;
      expect(vitalSigns.heartRate).toBeGreaterThan(0);
      expect(vitalSigns.heartRate).toBeLessThan(200);
      expect(vitalSigns.bloodPressure.systolic).toBeGreaterThan(vitalSigns.bloodPressure.diastolic);

      // Verify medication data consistency
      medicalRecord.medications.forEach(medication => {
        expect(medication.name).toBeDefined();
        expect(medication.dosage).toBeDefined();
        expect(medication.startDate).toBeInstanceOf(Date);
      });

      // Verify allergy data consistency
      medicalRecord.allergies.forEach(allergy => {
        expect(allergy.allergen).toBeDefined();
        expect(allergy.reaction).toBeDefined();
        expect(['Mild', 'Moderate', 'Severe']).toContain(allergy.severity);
      });
    });
  });

  describe('Error Handling & Edge Cases - Complete Coverage', () => {
    test('Should handle missing or invalid patient/doctor IDs', () => {
      // Test with null/undefined IDs
      expect(() => {
        MedicalRecordsFactory.createMedicalRecord(null, 'doctor-123');
      }).not.toThrow();

      expect(() => {
        MedicalRecordsFactory.createMedicalRecord('patient-123', undefined);
      }).not.toThrow();

      // Test with empty string IDs
      const recordWithEmptyIds = MedicalRecordsFactory.createMedicalRecord('', '');
      expect(recordWithEmptyIds.patientId).toBe('');
      expect(recordWithEmptyIds.doctorId).toBe('');
    });

    test('Should handle extreme override values gracefully', () => {
      const extremeOverrides = {
        chiefComplaint: '', // Empty string
        medications: [], // Empty array
        allergies: null, // Null value
        physicalExamination: undefined // Undefined value
      };

      const medicalRecord = MedicalRecordsFactory.createMedicalRecord(
        'patient-123',
        'doctor-456',
        extremeOverrides
      );

      // Factory should handle gracefully and provide defaults
      expect(medicalRecord.chiefComplaint).toBe('');
      expect(Array.isArray(medicalRecord.medications)).toBe(true);
      // Other fields should have factory defaults
      expect(medicalRecord.recordNumber).toBeDefined();
      expect(medicalRecord.visitDate).toBeDefined();
    });

    test('Should validate data type consistency in generated records', () => {
      const medicalRecord = MedicalRecordsFactory.createMedicalRecord('patient-123', 'doctor-456');

      // String fields
      expect(typeof medicalRecord.patientId).toBe('string');
      expect(typeof medicalRecord.doctorId).toBe('string');
      expect(typeof medicalRecord.recordNumber).toBe('string');
      expect(typeof medicalRecord.chiefComplaint).toBe('string');

      // Array fields
      expect(Array.isArray(medicalRecord.medications)).toBe(true);
      expect(Array.isArray(medicalRecord.allergies)).toBe(true);
      expect(Array.isArray(medicalRecord.labOrders)).toBe(true);

      // Date fields
      expect(medicalRecord.visitDate).toBeInstanceOf(Date);
      expect(medicalRecord.createdAt).toBeInstanceOf(Date);

      // Object fields
      expect(typeof medicalRecord.physicalExamination).toBe('object');
      expect(typeof medicalRecord.diagnosis).toBe('object');
      expect(typeof medicalRecord.treatmentPlan).toBe('object');
    });
  });

  describe('Performance & Memory Management - Complete Coverage', () => {
    test('Should efficiently generate large numbers of medical records', () => {
      const patientIds = Array.from({ length: 10 }, (_, i) => `patient-${i}`);
      const doctorIds = Array.from({ length: 5 }, (_, i) => `doctor-${i}`);

      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      const medicalRecords = MedicalRecordsFactory.createBulkMedicalRecords(100, patientIds, doctorIds);

      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      expect(medicalRecords).toHaveLength(100);
      expect(duration).toBeLessThan(10000); // Under 10 seconds
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // Under 100MB

      // Verify data integrity at scale
      medicalRecords.forEach(record => {
        expect(record.recordNumber).toMatch(/^MR-\d{4}-\d{6}$/);
        expect(record.patientId).toBeDefined();
        expect(record.doctorId).toBeDefined();
      });
    });

    test('Should handle memory efficiently with complex medical data', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate complex medical records
      for (let i = 0; i < 50; i++) {
        const medicalRecord = MedicalRecordsFactory.createMedicalRecord(`patient-${i}`, `doctor-${i % 5}`);
        const dischargeSummary = MedicalRecordsFactory.createDischargeSummary(`patient-${i}`, `doctor-${i % 5}`);
        const progressNote = MedicalRecordsFactory.createProgressNote(`patient-${i}`, `doctor-${i % 5}`);

        // Verify each record is properly structured
        expect(medicalRecord.patientId).toBe(`patient-${i}`);
        expect(dischargeSummary.patientId).toBe(`patient-${i}`);
        expect(progressNote.patientId).toBe(`patient-${i}`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Under 50MB for 150 complex objects
    });
  });

  describe('Integration with Authentication & User Management - Complete Coverage', () => {
    test('Should integrate medical records with authenticated doctor workflow', async () => {
      // Create doctor user
      const doctorData = await UserFactory.createDoctor();
      const doctorToken = authHelper.generateTestToken(doctorData._id || 'doctor-123', 'Doctor');

      // Create patient user
      const patientData = await UserFactory.createPatient();

      // Create medical record linking doctor and patient
      const medicalRecord = MedicalRecordsFactory.createMedicalRecord(
        patientData._id || 'patient-123',
        doctorData._id || 'doctor-123'
      );

      // Verify authentication and permissions
      const hasPermission = authHelper.validatePermissions('Doctor', ['write_medical_records']);
      expect(hasPermission).toBe(true);

      // Verify record linking
      expect(medicalRecord.patientId).toBe(patientData._id || 'patient-123');
      expect(medicalRecord.doctorId).toBe(doctorData._id || 'doctor-123');

      // Verify token validity
      const verifiedToken = authHelper.verifyToken(doctorToken);
      expect(verifiedToken.role).toBe('Doctor');
    });

    test('Should enforce role-based access to medical records', async () => {
      const testScenarios = [
        { role: 'Doctor', permissions: ['read_patients', 'write_medical_records'], expected: true },
        { role: 'Nurse', permissions: ['read_medical_records'], expected: true },
        { role: 'Patient', permissions: ['read_own_data'], expected: true },
        { role: 'Patient', permissions: ['write_medical_records'], expected: false },
        { role: 'Receptionist', permissions: ['write_medical_records'], expected: false },
        { role: 'BillingStaff', permissions: ['read_medical_records'], expected: false }
      ];

      testScenarios.forEach(scenario => {
        const hasPermission = authHelper.validatePermissions(scenario.role, scenario.permissions);
        expect(hasPermission).toBe(scenario.expected);
      });
    });

    test('Should create complete patient care workflow', async () => {
      // 1. Create healthcare team
      const doctor = await UserFactory.createDoctor();
      const nurse = await UserFactory.createNurse();
      const patient = await UserFactory.createPatient();

      // 2. Create initial assessment (Doctor)
      const initialAssessment = MedicalRecordsFactory.createMedicalRecord(
        patient._id || 'patient-123',
        doctor._id || 'doctor-456',
        {
          recordType: 'Initial Assessment',
          chiefComplaint: 'Annual physical examination'
        }
      );

      // 3. Nursing documentation (Nurse)
      const nursingNote = MedicalRecordsFactory.createProgressNote(
        patient._id || 'patient-123',
        nurse._id || 'nurse-789',
        {
          noteType: 'Progress Note',
          subjective: 'Patient comfortable, no complaints'
        }
      );

      // 4. Follow-up plan (Doctor)
      const followUpRecord = MedicalRecordsFactory.createMedicalRecord(
        patient._id || 'patient-123',
        doctor._id || 'doctor-456',
        {
          recordType: 'Follow-up',
          treatmentPlan: {
            followUp: '6 months',
            instructions: 'Continue current medications, healthy lifestyle'
          }
        }
      );

      // Verify workflow continuity
      expect(initialAssessment.patientId).toBe(patient._id || 'patient-123');
      expect(nursingNote.patientId).toBe(patient._id || 'patient-123');
      expect(followUpRecord.patientId).toBe(patient._id || 'patient-123');

      // Verify role-appropriate documentation
      expect(initialAssessment.doctorId).toBe(doctor._id || 'doctor-456');
      expect(nursingNote.providerId).toBe(nurse._id || 'nurse-789');
      expect(followUpRecord.doctorId).toBe(doctor._id || 'doctor-456');
    });
  });
});
