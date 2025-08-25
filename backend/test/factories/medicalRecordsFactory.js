/**
 * Medical Records Data Factory - Creates comprehensive medical record test data
 * Supports ICD-10 codes, lab results, prescriptions, and clinical documentation
 */

class MedicalRecordsFactory {
  /**
   * Create comprehensive medical record with all sections
   */
  static createMedicalRecord(patientId, doctorId, overrides = {}) {
    const baseRecord = {
      patientId,
      doctorId,
      recordNumber: this.generateRecordNumber(),
      visitDate: new Date(),

      // Chief Complaint & History
      chiefComplaint: this.getRandomElement([
        'Chest pain and shortness of breath',
        'Persistent headache for 3 days',
        'Abdominal pain with nausea',
        'Fever and fatigue',
        'Joint pain and stiffness'
      ]),

      historyOfPresentIllness: 'Patient presents with 3-day history of symptoms. No previous similar episodes.',
      pastMedicalHistory: this.getRandomElements([
        'Hypertension', 'Diabetes Type 2', 'Asthma', 'GERD', 'Arthritis'
      ], { min: 0, max: 3 }),

      medications: this.generateMedications(),
      allergies: this.generateAllergies(),

      // Physical Examination
      physicalExamination: {
        vitalSigns: this.generateVitalSigns(),
        generalAppearance: this.getRandomElement([
          'Alert and oriented', 'Appears ill', 'Well-nourished', 'Anxious'
        ]),
        systems: {
          cardiovascular: 'Regular rate and rhythm',
          respiratory: 'Clear breath sounds bilaterally',
          neurological: 'Alert and oriented x3',
          gastrointestinal: 'Soft, non-tender abdomen',
          musculoskeletal: 'Full range of motion'
        }
      },

      // Diagnosis with ICD-10 codes
      diagnosis: {
        primary: this.generateDiagnosis(),
        secondary: this.getRandomElements(this.getICD10Codes(), { min: 0, max: 2 })
      },

      // Treatment Plan
      treatmentPlan: {
        medications: this.generatePrescriptions(),
        procedures: this.getRandomElements([
          'Blood pressure monitoring', 'Glucose monitoring', 'Physical therapy'
        ], { min: 0, max: 2 }),
        followUp: this.getRandomElement([
          '1 week', '2 weeks', '1 month', '3 months'
        ]),
        instructions: 'Continue current medications and follow up as scheduled'
      },

      // Lab Orders & Results
      labOrders: this.generateLabOrders(),
      labResults: this.generateLabResults(),

      // Progress Notes
      progressNotes: [{
        date: new Date(),
        note: 'Patient doing well, responding to treatment',
        provider: doctorId
      }],

      // Document metadata
      recordType: this.getRandomElement([
        'Outpatient Visit', 'Emergency Visit', 'Inpatient Admission', 'Follow-up'
      ]),
      department: this.getRandomElement([
        'Internal Medicine', 'Emergency', 'Cardiology', 'Neurology', 'Orthopedics'
      ]),

      status: 'Active',
      confidentialityLevel: 'Standard',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return { ...baseRecord, ...overrides };
  }

  /**
   * Generate unique medical record number
   */
  static generateRecordNumber() {
    return `MR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  /**
   * Generate realistic vital signs
   */
  static generateVitalSigns() {
    return {
      temperature: this.randomFloat(96.5, 101.5, 1),
      bloodPressure: {
        systolic: this.randomInt(90, 180),
        diastolic: this.randomInt(60, 110)
      },
      heartRate: this.randomInt(60, 120),
      respiratoryRate: this.randomInt(12, 25),
      oxygenSaturation: this.randomInt(95, 100),
      weight: this.randomFloat(40, 150, 1),
      height: this.randomInt(140, 200),
      bmi: null, // Will be calculated
      painScale: this.randomInt(0, 10)
    };
  }

  /**
   * Generate medications list
   */
  static generateMedications() {
    const medications = [
      'Lisinopril 10mg', 'Metformin 500mg', 'Atorvastatin 20mg',
      'Omeprazole 20mg', 'Ibuprofen 400mg', 'Albuterol inhaler'
    ];

    return this.getRandomElements(medications, { min: 0, max: 4 }).map(med => ({
      name: med,
      dosage: this.getRandomElement(['Once daily', 'Twice daily', 'As needed']),
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      prescribedBy: 'Dr. Previous Provider'
    }));
  }

  /**
   * Generate allergies
   */
  static generateAllergies() {
    const commonAllergies = [
      'Penicillin', 'Sulfa drugs', 'Latex', 'Shellfish', 'Peanuts', 'NKDA'
    ];

    return this.getRandomElements(commonAllergies, { min: 1, max: 3 }).map(allergy => ({
      allergen: allergy,
      reaction: this.getRandomElement(['Rash', 'Difficulty breathing', 'Swelling', 'Nausea']),
      severity: this.getRandomElement(['Mild', 'Moderate', 'Severe'])
    }));
  }

  /**
   * Generate diagnosis with ICD-10 codes
   */
  static generateDiagnosis() {
    const diagnoses = [
      { condition: 'Essential hypertension', icd10: 'I10' },
      { condition: 'Type 2 diabetes mellitus', icd10: 'E11.9' },
      { condition: 'Acute upper respiratory infection', icd10: 'J06.9' },
      { condition: 'Gastroesophageal reflux disease', icd10: 'K21.9' },
      { condition: 'Osteoarthritis of knee', icd10: 'M17.9' }
    ];

    return this.getRandomElement(diagnoses);
  }

  /**
   * Get comprehensive ICD-10 codes for testing
   */
  static getICD10Codes() {
    return [
      { condition: 'Acute myocardial infarction', icd10: 'I21.9' },
      { condition: 'Pneumonia', icd10: 'J18.9' },
      { condition: 'Chronic kidney disease', icd10: 'N18.9' },
      { condition: 'Depression', icd10: 'F32.9' },
      { condition: 'Migraine', icd10: 'G43.9' },
      { condition: 'Asthma', icd10: 'J45.9' },
      { condition: 'Hyperlipidemia', icd10: 'E78.5' },
      { condition: 'Anxiety disorder', icd10: 'F41.9' }
    ];
  }

  /**
   * Generate prescription data
   */
  static generatePrescriptions() {
    const medications = [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: '7 days' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'QD', duration: '30 days' },
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', duration: '90 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'PRN', duration: 'As needed' }
    ];

    return this.getRandomElements(medications, { min: 1, max: 3 }).map(med => ({
      ...med,
      prescribedDate: new Date(),
      pharmacyInstructions: 'Take with food',
      refills: this.randomInt(0, 5),
      genericAllowed: Math.random() > 0.5
    }));
  }

  /**
   * Generate lab orders
   */
  static generateLabOrders() {
    const labTests = [
      'Complete Blood Count (CBC)',
      'Basic Metabolic Panel (BMP)',
      'Lipid Panel',
      'Liver Function Tests',
      'Thyroid Function Tests',
      'Hemoglobin A1C',
      'Urinalysis',
      'Chest X-ray'
    ];

    return this.getRandomElements(labTests, { min: 1, max: 4 }).map(test => ({
      testName: test,
      orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      priority: this.getRandomElement(['Routine', 'STAT', 'Urgent']),
      status: this.getRandomElement(['Ordered', 'In Progress', 'Completed']),
      instructions: 'Fasting required for 12 hours'
    }));
  }

  /**
   * Generate realistic lab results
   */
  static generateLabResults() {
    const results = [
      {
        testName: 'Complete Blood Count',
        results: {
          'WBC': { value: this.randomFloat(4.0, 11.0, 1), unit: 'K/uL', reference: '4.0-11.0' },
          'RBC': { value: this.randomFloat(4.2, 5.8, 1), unit: 'M/uL', reference: '4.2-5.8' },
          'Hemoglobin': { value: this.randomFloat(12.0, 16.0, 1), unit: 'g/dL', reference: '12.0-16.0' },
          'Hematocrit': { value: this.randomFloat(36.0, 48.0, 1), unit: '%', reference: '36.0-48.0' }
        },
        completedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        technician: 'Lab Tech ID',
        status: 'Final'
      }
    ];

    return results;
  }

  /**
   * Create discharge summary
   */
  static createDischargeSummary(patientId, doctorId, overrides = {}) {
    const baseSummary = {
      patientId,
      attendingPhysician: doctorId,
      admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dischargeDate: new Date(),

      admissionDiagnosis: this.generateDiagnosis(),
      dischargeDiagnosis: this.generateDiagnosis(),

      hospitalCourse: 'Patient was admitted with acute symptoms and responded well to treatment.',
      procedures: this.getRandomElements([
        'IV fluid therapy', 'Cardiac monitoring', 'Physical therapy'
      ], { min: 1, max: 3 }),

      dischargeCondition: this.getRandomElement([
        'Stable', 'Improved', 'Good', 'Fair'
      ]),

      dischargeMedications: this.generatePrescriptions(),
      followUpInstructions: 'Continue medications and follow up with primary care',

      dietRestrictions: this.getRandomElement([
        'Regular diet', 'Low sodium', 'Diabetic diet', 'Clear liquids'
      ]),

      activityRestrictions: this.getRandomElement([
        'No restrictions', 'Light activity', 'Bed rest', 'Physical therapy'
      ]),

      followUpAppointments: [{
        department: 'Primary Care',
        timeframe: '1-2 weeks',
        instructions: 'Schedule with primary care provider'
      }],

      createdAt: new Date(),
      status: 'Final'
    };

    return { ...baseSummary, ...overrides };
  }

  /**
   * Create progress note
   */
  static createProgressNote(patientId, providerId, overrides = {}) {
    const baseNote = {
      patientId,
      providerId,
      noteDate: new Date(),
      noteType: this.getRandomElement([
        'Progress Note', 'Consultation', 'Procedure Note', 'Discharge Note'
      ]),

      subjective: 'Patient reports feeling better with current treatment',
      objective: {
        vitalSigns: this.generateVitalSigns(),
        physicalExam: 'Physical examination shows improvement'
      },
      assessment: 'Patient is responding well to treatment',
      plan: 'Continue current treatment plan and monitor progress',

      signature: {
        providerId,
        timestamp: new Date(),
        verified: true
      }
    };

    return { ...baseNote, ...overrides };
  }

  /**
   * Generate bulk medical records for testing
   */
  static createBulkMedicalRecords(count = 50, patientIds = [], doctorIds = []) {
    const records = [];

    for (let i = 0; i < count; i++) {
      const patientId = this.getRandomElement(patientIds);
      const doctorId = this.getRandomElement(doctorIds);

      records.push(this.createMedicalRecord(patientId, doctorId));
    }

    return records;
  }

  // Utility methods
  static getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static getRandomElements(array, { min = 1, max = array.length } = {}) {
    const count = this.randomInt(min, max);
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }
}

export default MedicalRecordsFactory;

module.exports = MedicalRecordsFactory;
