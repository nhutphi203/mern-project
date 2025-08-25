/**
 * Lab Management Data Factory - Creates comprehensive lab test data
 * Learned from Phase 1&2&3: No external dependencies, pure JavaScript implementation
 * Ensures consistent data generation without ES module conflicts
 */

class LabFactory {
  /**
   * Create comprehensive lab test order
   */
  static createLabTest(patientId, doctorId, overrides = {}) {
    const testTypes = [
      'Complete Blood Count (CBC)', 'Basic Metabolic Panel', 'Lipid Panel',
      'Liver Function Test', 'Thyroid Function Test', 'Urinalysis',
      'Blood Glucose', 'HbA1c', 'PT/INR', 'Vitamin D', 'Cholesterol',
      'Kidney Function Test', 'Cardiac Markers', 'Inflammatory Markers'
    ];

    const urgencyLevels = ['Routine', 'Urgent', 'STAT', 'Critical'];
    const testStatuses = ['Ordered', 'Collected', 'Processing', 'Completed', 'Cancelled', 'Pending Review'];
    const sampleTypes = ['Blood', 'Urine', 'Saliva', 'Tissue', 'Stool', 'Swab'];

    const baseTest = {
      testId: this.generateTestId(),
      orderId: this.generateOrderId(),
      patientId,
      doctorId,

      // Test Information
      testName: this.getRandomElement(testTypes),
      testCode: this.generateTestCode(),
      category: this.getRandomElement(['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology']),
      sampleType: this.getRandomElement(sampleTypes),

      // Scheduling and Status
      orderedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      scheduledDate: this.generateLabDateTime(),
      collectionTime: null, // Will be set when collected
      completedAt: null, // Will be set when completed
      status: this.getRandomElement(testStatuses),
      urgency: this.getRandomElement(urgencyLevels),

      // Sample Information
      sampleId: this.generateSampleId(),
      tubeType: this.getRandomElement(['Red Top', 'Purple Top', 'Blue Top', 'Green Top', 'Gold Top']),
      volume: this.randomFloat(1, 10, 1), // mL
      preservative: this.getRandomElement(['EDTA', 'Heparin', 'Citrate', 'None']),

      // Collection Details
      collectedBy: null, // Lab technician ID
      collectionSite: this.getRandomElement(['Lab Room A', 'Lab Room B', 'Patient Room', 'Emergency Department']),
      collectionMethod: this.getRandomElement(['Venipuncture', 'Finger Stick', 'Urine Collection', 'Swab']),

      // Processing Information
      processedBy: null, // Lab technician ID
      analyzer: this.getRandomElement(['Analyzer-1', 'Analyzer-2', 'Manual', 'STAT-Analyzer']),
      batchNumber: this.generateBatchNumber(),
      qualityControl: this.getRandomElement(['Pass', 'Fail', 'Pending']),

      // Clinical Information
      clinicalIndication: this.getRandomElement([
        'Routine screening',
        'Follow-up monitoring',
        'Diagnostic workup',
        'Pre-operative clearance',
        'Symptom evaluation'
      ]),

      icd10Code: this.generateICD10Code(),
      fastingRequired: this.getRandomElement([true, false]),
      specialInstructions: this.getRandomElement([
        null,
        'Fasting for 12 hours required',
        'Avoid medications 24h before',
        'Morning collection preferred',
        'Handle with care - fragile sample'
      ]),

      // Results Information
      results: [], // Will contain actual test results
      referenceRanges: this.generateReferenceRanges(),
      abnormalFlags: [],
      criticalValues: [],

      // Review and Approval
      reviewedBy: null, // Pathologist/Doctor ID
      approvedBy: null, // Senior pathologist ID
      reviewStatus: this.getRandomElement(['Pending', 'Under Review', 'Approved', 'Requires Attention']),

      // Billing and Insurance
      cptCode: this.generateCPTCode(),
      billableAmount: this.randomFloat(25, 500, 2),
      insuranceCovered: this.getRandomElement([true, false]),
      patientResponsibility: this.randomFloat(5, 100, 2),

      // Communication
      resultNotification: this.getRandomElement(['Pending', 'Sent', 'Failed']),
      notificationMethod: this.getRandomElement(['Email', 'SMS', 'Phone', 'Portal']),

      // Metadata
      priority: this.randomInt(1, 10),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return { ...baseTest, ...overrides };
  }

  /**
   * Create lab test results
   */
  static createLabResults(testId, overrides = {}) {
    const resultTypes = ['Numeric', 'Text', 'Positive/Negative', 'Qualitative'];

    const baseResults = {
      resultId: this.generateResultId(),
      testId,

      // Result Data
      testComponent: this.getRandomElement([
        'Hemoglobin', 'White Blood Cells', 'Platelets', 'Glucose',
        'Creatinine', 'ALT', 'AST', 'Cholesterol', 'HDL', 'LDL'
      ]),

      value: this.generateTestValue(),
      unit: this.getRandomElement(['mg/dL', 'g/dL', 'cells/μL', 'IU/L', 'mmol/L', '%']),
      referenceRange: '70-100 mg/dL',

      // Status Indicators
      isAbnormal: this.getRandomElement([true, false]),
      isCritical: this.getRandomElement([true, false]),
      flag: this.getRandomElement(['Normal', 'High', 'Low', 'Critical', 'Panic']),

      // Technical Details
      resultType: this.getRandomElement(resultTypes),
      method: this.getRandomElement(['Automated', 'Manual', 'Semi-automated']),
      dilution: this.getRandomElement(['1:1', '1:2', '1:10', 'None']),

      // Quality Control
      qcStatus: this.getRandomElement(['Pass', 'Fail', 'Warning']),
      calibrationStatus: 'Valid',
      instrumentStatus: 'Operational',

      // Timestamps
      analyzedAt: new Date(),
      verifiedAt: null,
      reportedAt: null,

      // Comments and Notes
      technicalComments: this.getRandomElement([
        null,
        'Sample slightly hemolyzed',
        'Repeat analysis performed',
        'Quality control passed'
      ]),

      clinicalComments: this.getRandomElement([
        null,
        'Further testing recommended',
        'Correlate with clinical findings',
        'Repeat in 2 weeks'
      ])
    };

    return { ...baseResults, ...overrides };
  }

  /**
   * Create lab queue entry for workflow management
   */
  static createLabQueueEntry(testId, overrides = {}) {
    const queueTypes = ['Collection', 'Processing', 'Review', 'Approval', 'Reporting'];
    const priorities = ['Low', 'Normal', 'High', 'STAT', 'Critical'];

    const baseEntry = {
      queueId: this.generateQueueId(),
      testId,
      queueType: this.getRandomElement(queueTypes),
      priority: this.getRandomElement(priorities),

      // Queue Management
      position: this.randomInt(1, 50),
      estimatedWaitTime: this.randomInt(15, 180), // minutes
      assignedTo: null, // Staff member ID

      // Status Tracking
      status: this.getRandomElement(['Waiting', 'In Progress', 'Completed', 'On Hold']),
      enteredQueue: new Date(),
      startedProcessing: null,
      completedProcessing: null,

      // Workflow Information
      workstation: this.getRandomElement(['Station-1', 'Station-2', 'Station-3', 'Review-Desk']),
      batchGroup: this.generateBatchNumber(),

      // Special Handling
      specialHandling: this.getRandomElement([
        null,
        'Handle with care',
        'Time sensitive',
        'Requires supervisor approval',
        'Urgent processing'
      ]),

      notes: this.getRandomElement([
        null,
        'Rush order from ER',
        'Patient waiting for results',
        'Doctor called for expedite'
      ])
    };

    return { ...baseEntry, ...overrides };
  }

  /**
   * Create lab equipment/analyzer data
   */
  static createLabEquipment(overrides = {}) {
    const equipmentTypes = ['Hematology Analyzer', 'Chemistry Analyzer', 'Microscope', 'Centrifuge', 'Incubator'];
    const manufacturers = ['Abbott', 'Roche', 'Siemens', 'Beckman Coulter', 'Bio-Rad'];

    const baseEquipment = {
      equipmentId: this.generateEquipmentId(),
      name: this.getRandomElement(equipmentTypes),
      manufacturer: this.getRandomElement(manufacturers),
      model: this.generateModelNumber(),
      serialNumber: this.generateSerialNumber(),

      // Status and Location
      status: this.getRandomElement(['Operational', 'Down', 'Maintenance', 'Calibration']),
      location: this.getRandomElement(['Lab Room A', 'Lab Room B', 'Hematology Lab', 'Chemistry Lab']),

      // Maintenance Information
      lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      maintenanceSchedule: this.getRandomElement(['Weekly', 'Monthly', 'Quarterly']),

      // Calibration Data
      lastCalibration: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      calibrationStatus: this.getRandomElement(['Valid', 'Expired', 'Due', 'Failed']),
      calibrationDueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),

      // Performance Metrics
      testsProcessed: this.randomInt(100, 10000),
      uptimePercentage: this.randomFloat(85, 99.9, 1),
      errorRate: this.randomFloat(0.1, 2.0, 2),

      // Technical Specifications
      capacity: this.randomInt(50, 500), // tests per hour
      supportedTests: this.getRandomElements([
        'CBC', 'CMP', 'Lipid Panel', 'Liver Panel', 'Thyroid Panel'
      ], { min: 2, max: 5 }),

      // Quality Control
      qcStatus: this.getRandomElement(['Pass', 'Fail', 'Warning']),
      lastQcCheck: new Date(),
      qcResults: this.generateQCResults()
    };

    return { ...baseEquipment, ...overrides };
  }

  /**
   * Create lab staff/technician data
   */
  static createLabStaff(overrides = {}) {
    const roles = ['Lab Technician', 'Senior Technician', 'Lab Supervisor', 'Pathologist', 'Lab Director'];
    const certifications = ['MLT', 'MLS', 'CLS', 'MT', 'PhD'];

    const baseStaff = {
      staffId: this.generateStaffId(),
      employeeId: this.generateEmployeeId(),

      // Personal Information
      firstName: this.getRandomElement(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa']),
      lastName: this.getRandomElement(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']),
      email: null, // Will be generated from name

      // Professional Information
      role: this.getRandomElement(roles),
      department: this.getRandomElement(['Hematology', 'Chemistry', 'Microbiology', 'Pathology']),
      certifications: this.getRandomElements(certifications, { min: 1, max: 3 }),
      licenseNumber: this.generateLicenseNumber(),

      // Work Schedule
      shift: this.getRandomElement(['Day', 'Evening', 'Night', 'Rotating']),
      workstation: this.getRandomElement(['Station-1', 'Station-2', 'Station-3', 'Review-Desk']),

      // Performance Metrics
      testsProcessedToday: this.randomInt(10, 100),
      accuracy: this.randomFloat(95, 99.9, 1),
      efficiency: this.randomFloat(85, 98, 1),

      // Status
      status: this.getRandomElement(['Active', 'On Break', 'Busy', 'Away']),
      lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),

      // Training and Competency
      trainings: this.getRandomElements([
        'Safety Training', 'Quality Control', 'New Equipment', 'HIPAA Compliance'
      ], { min: 2, max: 4 }),

      competencyAssessment: this.getRandomElement(['Current', 'Due', 'Overdue']),
      lastAssessment: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    };

    // Generate email from name
    if (baseStaff.firstName && baseStaff.lastName) {
      baseStaff.email = `${baseStaff.firstName.toLowerCase()}.${baseStaff.lastName.toLowerCase()}@hospital.com`;
    }

    return { ...baseStaff, ...overrides };
  }

  /**
   * Create lab workflow for testing complete process
   */
  static createLabWorkflow(testId, overrides = {}) {
    const workflowSteps = [
      'Order Received', 'Sample Collection', 'Sample Processing',
      'Analysis', 'Quality Review', 'Result Approval', 'Report Generated'
    ];

    const baseWorkflow = {
      workflowId: this.generateWorkflowId(),
      testId,
      currentStep: this.getRandomElement(workflowSteps),

      // Step Tracking
      steps: workflowSteps.map((step, index) => ({
        stepName: step,
        stepNumber: index + 1,
        status: index < 3 ? 'Completed' : 'Pending',
        startTime: index < 3 ? new Date(Date.now() - (workflowSteps.length - index) * 60 * 60 * 1000) : null,
        endTime: index < 3 ? new Date(Date.now() - (workflowSteps.length - index - 1) * 60 * 60 * 1000) : null,
        assignedTo: index < 3 ? this.generateStaffId() : null,
        notes: index < 3 ? 'Step completed successfully' : null
      })),

      // Timing Information
      totalProcessingTime: null,
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours

      // Status Tracking
      overallStatus: this.getRandomElement(['In Progress', 'Delayed', 'On Track', 'Expedited']),
      bottlenecks: this.getRandomElements([
        'Equipment Delay', 'Staff Shortage', 'Quality Issues', 'Sample Problem'
      ], { min: 0, max: 2 }),

      // Performance Metrics
      efficiency: this.randomFloat(80, 100, 1),
      qualityScore: this.randomFloat(90, 100, 1)
    };

    return { ...baseWorkflow, ...overrides };
  }

  /**
   * Create bulk lab tests for performance testing
   */
  static createBulkLabTests(count = 100, patientIds = [], doctorIds = []) {
    const tests = [];

    for (let i = 0; i < count; i++) {
      const patientId = this.getRandomElement(patientIds);
      const doctorId = this.getRandomElement(doctorIds);

      tests.push(this.createLabTest(patientId, doctorId));
    }

    return tests;
  }

  // ID Generation Methods
  static generateTestId() {
    return `LAB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateOrderId() {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  static generateTestCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters.charAt(Math.floor(Math.random() * letters.length)) +
      letters.charAt(Math.floor(Math.random() * letters.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  static generateSampleId() {
    return `S${new Date().getFullYear()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateBatchNumber() {
    return `B${new Date().toISOString().split('T')[0].replace(/-/g, '')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  static generateResultId() {
    return `RES-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  static generateQueueId() {
    return `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  static generateEquipmentId() {
    return `EQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static generateStaffId() {
    return `STAFF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static generateEmployeeId() {
    return `EMP${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  }

  static generateWorkflowId() {
    return `WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  static generateModelNumber() {
    return `Model-${Math.floor(Math.random() * 1000)}-${this.getRandomElement(['A', 'B', 'C', 'X', 'Y', 'Z'])}`;
  }

  static generateSerialNumber() {
    return `SN${new Date().getFullYear()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateLicenseNumber() {
    return `LIC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  // Helper Methods for Complex Data
  static generateLabDateTime() {
    const today = new Date();
    const futureDate = new Date(today.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Next 7 days

    // Lab hours: 6 AM to 10 PM
    const hour = this.randomInt(6, 21);
    const minute = this.getRandomElement([0, 15, 30, 45]);

    futureDate.setHours(hour, minute, 0, 0);
    return futureDate;
  }

  static generateTestValue() {
    return this.randomFloat(50, 200, 1);
  }

  static generateReferenceRanges() {
    return {
      normalRange: '70-100 mg/dL',
      lowCritical: '< 50 mg/dL',
      highCritical: '> 400 mg/dL',
      units: 'mg/dL'
    };
  }

  static generateICD10Code() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters.charAt(Math.floor(Math.random() * letters.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  static generateCPTCode() {
    return this.randomInt(80000, 89999).toString();
  }

  static generateQCResults() {
    return {
      level1: { result: 'Pass', value: this.randomFloat(95, 105, 1) },
      level2: { result: 'Pass', value: this.randomFloat(95, 105, 1) },
      level3: { result: 'Pass', value: this.randomFloat(95, 105, 1) }
    };
  }

  // Utility methods (consistent with other factories)
  static getRandomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  static getRandomElements(array, { min = 1, max = array.length } = {}) {
    if (!array || array.length === 0) return [];
    const count = this.randomInt(min, Math.min(max, array.length));
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

module.exports = LabFactory;
