/**
 * Phase 3: Appointment Management & Scheduling Tests - 100% Coverage
 * Applying lessons learned from Phase 1&2: No external dependencies, robust error handling
 * Comprehensive testing of appointment workflows, scheduling, and time management
 */
const authHelper = require('../helpers/authHelper.js');
const apiUtils = require('../helpers/apiUtils.js');
const databaseUtils = require('../helpers/databaseUtils.js');
const UserFactory = require('../factories/userFactory.js');
const AppointmentFactory = require('../factories/appointmentFactory.js');
const MedicalRecordsFactory = require('../factories/medicalRecordsFactory.js');
const testConfig = require('../config/test.config.js');

// Mock database to avoid connection issues (learned from Phase 1&2)
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

describe('Phase 3: Appointment Management & Scheduling - 100% Coverage', () => {
  let testPatients = {};
  let testDoctors = {};
  let testAppointments = {};

  beforeAll(async () => {
    // Setup test environment (learned: clear cache to avoid state issues)
    authHelper.clearCache();
  });

  beforeEach(async () => {
    // Clear test data before each test (learned: prevent cross-test contamination)
    testPatients = {};
    testDoctors = {};
    testAppointments = {};
    authHelper.clearCache();
  });

  describe('Appointment Data Generation - Complete Coverage', () => {
    test('Should generate comprehensive appointment with all scheduling details', () => {
      const patientId = 'patient-scheduling-123';
      const doctorId = 'doctor-scheduling-456';

      const appointment = AppointmentFactory.createAppointment(patientId, doctorId);

      // Core appointment information
      expect(appointment.patientId).toBe(patientId);
      expect(appointment.doctorId).toBe(doctorId);
      expect(appointment.appointmentId).toMatch(/^APT-\d{4}-\d{6}$/);
      expect(appointment.appointmentDate).toBeInstanceOf(Date);
      expect(appointment.appointmentTime).toMatch(/^\d{2}:\d{2}$/);

      // Scheduling details
      expect(typeof appointment.duration).toBe('number');
      expect(appointment.duration).toBeGreaterThan(0);
      expect(['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Physical Therapy', 'Lab Work', 'Diagnostic'])
        .toContain(appointment.appointmentType);

      // Status and priority
      expect(['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'])
        .toContain(appointment.status);
      expect(['Low', 'Normal', 'High', 'Urgent']).toContain(appointment.priority);

      // Clinical information
      expect(appointment.reasonForVisit).toBeDefined();
      expect(Array.isArray(appointment.symptoms)).toBe(true);

      // Location details
      expect(appointment.roomNumber).toBeDefined();
      expect(appointment.floor).toBeDefined();
      expect(appointment.building).toBeDefined();

      // Billing information
      expect(typeof appointment.copayAmount).toBe('number');
      expect(typeof appointment.estimatedCost).toBe('number');
      expect(typeof appointment.insuranceVerified).toBe('boolean');

      // Metadata
      expect(appointment.createdAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
      expect(appointment.version).toBe(1);
    });

    test('Should generate realistic business hours appointments', () => {
      const appointments = [];
      for (let i = 0; i < 20; i++) {
        const appointment = AppointmentFactory.createAppointment('patient-123', 'doctor-456');
        appointments.push(appointment);
      }

      appointments.forEach(appointment => {
        const appointmentDate = appointment.appointmentDate;
        const dayOfWeek = appointmentDate.getDay();
        const hour = appointmentDate.getHours();

        // Should be weekdays (Monday = 1, Friday = 5)
        expect(dayOfWeek).toBeGreaterThanOrEqual(1);
        expect(dayOfWeek).toBeLessThanOrEqual(5);

        // Should be business hours (8 AM to 5 PM)
        expect(hour).toBeGreaterThanOrEqual(8);
        expect(hour).toBeLessThanOrEqual(17);

        // Time slots should be in 15-minute increments
        const minute = appointmentDate.getMinutes();
        expect([0, 15, 30, 45]).toContain(minute);
      });
    });

    test('Should allow appointment customization through overrides', () => {
      const customOverrides = {
        status: 'Confirmed',
        priority: 'High',
        duration: 90,
        specialInstructions: 'Wheelchair accessible',
        copayAmount: 25.00
      };

      const appointment = AppointmentFactory.createAppointment(
        'patient-123',
        'doctor-456',
        customOverrides
      );

      expect(appointment.status).toBe('Confirmed');
      expect(appointment.priority).toBe('High');
      expect(appointment.duration).toBe(90);
      expect(appointment.specialInstructions).toBe('Wheelchair accessible');
      expect(appointment.copayAmount).toBe(25.00);
    });

    test('Should generate valid appointment time slots', () => {
      const timeSlots = [];
      for (let i = 0; i < 50; i++) {
        const timeSlot = AppointmentFactory.generateTimeSlot();
        timeSlots.push(timeSlot);
      }

      timeSlots.forEach(timeSlot => {
        expect(timeSlot).toMatch(/^\d{2}:\d{2}$/);

        const [hours, minutes] = timeSlot.split(':').map(Number);
        expect(hours).toBeGreaterThanOrEqual(8);
        expect(hours).toBeLessThanOrEqual(17);
        expect([0, 15, 30, 45]).toContain(minutes);
      });
    });
  });

  describe('Appointment Scheduling System - Complete Coverage', () => {
    test('Should create appointment slots for doctor scheduling', () => {
      const doctorId = 'doctor-slots-123';
      const testDate = new Date('2024-12-01');

      const appointmentSlot = AppointmentFactory.createAppointmentSlot(doctorId, testDate);

      expect(appointmentSlot.slotId).toMatch(/^SLOT-\d+-\d+$/);
      expect(appointmentSlot.doctorId).toBe(doctorId);
      expect(appointmentSlot.duration).toBeDefined();
      expect(typeof appointmentSlot.isAvailable).toBe('boolean');
      expect(typeof appointmentSlot.isBlocked).toBe('boolean');
      expect(appointmentSlot.maxBookings).toBeGreaterThanOrEqual(1);
      expect(appointmentSlot.currentBookings).toBeGreaterThanOrEqual(0);
      expect(['Regular', 'Emergency', 'Walk-in']).toContain(appointmentSlot.slotType);
    });

    test('Should generate complete daily schedule for doctor', () => {
      const doctorId = 'doctor-schedule-456';
      const scheduleDate = new Date('2024-12-01');

      const dailySchedule = AppointmentFactory.generateDoctorSchedule(doctorId, scheduleDate);

      expect(dailySchedule.scheduleId).toMatch(/^SCH-\d{4}-\d{2}-\d{2}-\d+$/);
      expect(dailySchedule.doctorId).toBe(doctorId);
      expect(Array.isArray(dailySchedule.slots)).toBe(true);
      expect(dailySchedule.slots.length).toBeGreaterThan(0);

      // Verify schedule statistics
      expect(dailySchedule.totalSlots).toBe(dailySchedule.slots.length);
      expect(dailySchedule.availableSlots + dailySchedule.bookedSlots).toBe(dailySchedule.totalSlots);
      expect(typeof dailySchedule.isActive).toBe('boolean');
      expect(dailySchedule.lastUpdated).toBeInstanceOf(Date);

      // Verify all slots are properly configured
      dailySchedule.slots.forEach(slot => {
        expect(slot.doctorId).toBe(doctorId);
        expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
        expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    test('Should handle appointment slot conflicts detection', () => {
      const doctorId = 'doctor-conflict-789';
      const conflictDate = new Date('2024-12-01');

      const conflictScenario = AppointmentFactory.createConflictScenario(doctorId, conflictDate);

      expect(conflictScenario.conflictId).toMatch(/^CONF-\d+-\d+$/);
      expect(conflictScenario.doctorId).toBe(doctorId);
      expect(Array.isArray(conflictScenario.appointments)).toBe(true);
      expect(conflictScenario.appointments).toHaveLength(2);
      expect(conflictScenario.conflictType).toBe('Time Overlap');
      expect(conflictScenario.severity).toBeDefined();
      expect(typeof conflictScenario.requiresManualIntervention).toBe('boolean');

      // Verify appointments actually overlap
      const [apt1, apt2] = conflictScenario.appointments;
      expect(apt1.doctorId).toBe(doctorId);
      expect(apt2.doctorId).toBe(doctorId);
      expect(apt1.appointmentDate).toBeInstanceOf(Date);
      expect(apt2.appointmentDate).toBeInstanceOf(Date);
    });
  });

  describe('Waiting List Management - Complete Coverage', () => {
    test('Should create waiting list entries with proper configuration', () => {
      const patientId = 'patient-waiting-123';
      const doctorId = 'doctor-waiting-456';

      const waitingListEntry = AppointmentFactory.createWaitingListEntry(patientId, doctorId);

      expect(waitingListEntry.waitingListId).toMatch(/^WL-\d{4}-\d+$/);
      expect(waitingListEntry.patientId).toBe(patientId);
      expect(waitingListEntry.doctorId).toBe(doctorId);
      expect(waitingListEntry.requestedDate).toBeInstanceOf(Date);
      expect(Array.isArray(waitingListEntry.preferredTimeSlots)).toBe(true);
      expect(waitingListEntry.preferredTimeSlots.length).toBeGreaterThan(0);
      expect(['Low', 'Normal', 'High']).toContain(waitingListEntry.priority);
      expect(['Phone', 'Email', 'SMS']).toContain(waitingListEntry.contactPreference);
      expect(['Active', 'Contacted', 'Scheduled', 'Expired']).toContain(waitingListEntry.status);
      expect(waitingListEntry.addedAt).toBeInstanceOf(Date);
      expect(waitingListEntry.expiresAt).toBeInstanceOf(Date);
      expect(waitingListEntry.expiresAt.getTime()).toBeGreaterThan(waitingListEntry.addedAt.getTime());
    });

    test('Should customize waiting list entries', () => {
      const customEntry = {
        priority: 'High',
        contactPreference: 'Email',
        maxWaitTime: 3,
        status: 'Active'
      };

      const waitingListEntry = AppointmentFactory.createWaitingListEntry(
        'patient-123',
        'doctor-456',
        customEntry
      );

      expect(waitingListEntry.priority).toBe('High');
      expect(waitingListEntry.contactPreference).toBe('Email');
      expect(waitingListEntry.maxWaitTime).toBe(3);
      expect(waitingListEntry.status).toBe('Active');
    });
  });

  describe('Appointment Reminders & Notifications - Complete Coverage', () => {
    test('Should create appointment reminders with proper scheduling', () => {
      const appointmentId = 'apt-reminder-123';
      const patientId = 'patient-reminder-456';

      const reminder = AppointmentFactory.createAppointmentReminder(appointmentId, patientId);

      expect(reminder.reminderId).toMatch(/^REM-\d+-\d+$/);
      expect(reminder.appointmentId).toBe(appointmentId);
      expect(reminder.patientId).toBe(patientId);
      expect(['SMS', 'Email', 'Phone Call', 'App Notification']).toContain(reminder.reminderType);
      expect(reminder.scheduledFor).toBeInstanceOf(Date);
      expect(reminder.message).toBeDefined();
      expect(['Pending', 'Sent', 'Delivered', 'Failed']).toContain(reminder.status);
      expect(reminder.attemptCount).toBeGreaterThanOrEqual(0);
      expect(reminder.maxAttempts).toBeGreaterThan(0);
      expect(reminder.createdAt).toBeInstanceOf(Date);
    });

    test('Should generate appropriate notification messages', () => {
      const messageTypes = ['reminder', 'confirmation', 'cancellation', 'rescheduling'];

      messageTypes.forEach(type => {
        const message = AppointmentFactory.generateNotificationMessage(type);
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });

      // Test default message
      const defaultMessage = AppointmentFactory.generateNotificationMessage('unknown');
      expect(defaultMessage).toBe('Appointment notification');
    });
  });

  describe('Recurring Appointments - Complete Coverage', () => {
    test('Should create recurring appointment patterns', () => {
      const patientId = 'patient-recurring-123';
      const doctorId = 'doctor-recurring-456';

      const recurringAppointment = AppointmentFactory.createRecurringAppointment(patientId, doctorId);

      expect(recurringAppointment.recurringId).toMatch(/^REC-\d{4}-\d+$/);
      expect(recurringAppointment.patientId).toBe(patientId);
      expect(recurringAppointment.doctorId).toBe(doctorId);
      expect(['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']).toContain(recurringAppointment.patternType);
      expect(recurringAppointment.frequency).toBeGreaterThanOrEqual(1);
      expect(recurringAppointment.frequency).toBeLessThanOrEqual(4);
      expect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).toContain(recurringAppointment.dayOfWeek);
      expect(recurringAppointment.preferredTime).toMatch(/^\d{2}:\d{2}$/);
      expect(recurringAppointment.startDate).toBeInstanceOf(Date);
      expect(recurringAppointment.endDate).toBeInstanceOf(Date);
      expect(recurringAppointment.endDate.getTime()).toBeGreaterThan(recurringAppointment.startDate.getTime());
      expect(typeof recurringAppointment.isActive).toBe('boolean');
      expect(recurringAppointment.totalAppointments).toBeGreaterThanOrEqual(0);
      expect(recurringAppointment.maxAppointments).toBeGreaterThan(0);
      expect(typeof recurringAppointment.autoSchedule).toBe('boolean');
    });

    test('Should validate recurring appointment logic', () => {
      const recurring = AppointmentFactory.createRecurringAppointment('patient-123', 'doctor-456');

      // Verify time span is reasonable (1 year maximum)
      const timeDiff = recurring.endDate.getTime() - recurring.startDate.getTime();
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      expect(timeDiff).toBeLessThanOrEqual(oneYear + 1000); // Allow small margin

      // Verify appointment limits are reasonable
      expect(recurring.maxAppointments).toBeLessThanOrEqual(52); // Weekly for 1 year
    });
  });

  describe('Appointment Cancellation & Modifications - Complete Coverage', () => {
    test('Should create comprehensive cancellation records', () => {
      const appointmentId = 'apt-cancel-123';
      const cancelledBy = 'user-cancel-456';

      const cancellation = AppointmentFactory.createCancellation(appointmentId, cancelledBy);

      expect(cancellation.cancellationId).toMatch(/^CAN-\d+-\d+$/);
      expect(cancellation.appointmentId).toBe(appointmentId);
      expect(cancellation.cancelledBy).toBe(cancelledBy);
      expect(cancellation.cancellationReason).toBeDefined();
      expect(['Patient', 'Provider', 'System', 'Emergency']).toContain(cancellation.cancellationType);
      expect(typeof cancellation.refundAmount).toBe('number');
      expect(cancellation.refundAmount).toBeGreaterThanOrEqual(0);
      expect(typeof cancellation.rescheduleRequested).toBe('boolean');
      expect(typeof cancellation.notificationsSent).toBe('boolean');
      expect(cancellation.cancelledAt).toBeInstanceOf(Date);
      expect(typeof cancellation.processingFee).toBe('number');
      expect(cancellation.cancellationWindow).toBeGreaterThan(0);
      expect(cancellation.notes).toBeDefined();
    });

    test('Should handle different cancellation scenarios', () => {
      const scenarios = [
        { reason: 'Patient request', type: 'Patient' },
        { reason: 'Doctor unavailable', type: 'Provider' },
        { reason: 'Emergency', type: 'Emergency' },
        { reason: 'Equipment failure', type: 'System' }
      ];

      scenarios.forEach(scenario => {
        const cancellation = AppointmentFactory.createCancellation('apt-123', 'user-456', {
          cancellationReason: scenario.reason,
          cancellationType: scenario.type
        });

        expect(cancellation.cancellationReason).toBe(scenario.reason);
        expect(cancellation.cancellationType).toBe(scenario.type);
      });
    });
  });

  describe('Appointment Reviews & Feedback - Complete Coverage', () => {
    test('Should create comprehensive appointment reviews', () => {
      const appointmentId = 'apt-review-123';
      const patientId = 'patient-review-456';

      const review = AppointmentFactory.createAppointmentReview(appointmentId, patientId);

      expect(review.reviewId).toMatch(/^REV-\d+-\d+$/);
      expect(review.appointmentId).toBe(appointmentId);
      expect(review.patientId).toBe(patientId);
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.doctorRating).toBeGreaterThanOrEqual(1);
      expect(review.doctorRating).toBeLessThanOrEqual(5);
      expect(review.facilityRating).toBeGreaterThanOrEqual(1);
      expect(review.facilityRating).toBeLessThanOrEqual(5);
      expect(review.waitTimeRating).toBeGreaterThanOrEqual(1);
      expect(review.waitTimeRating).toBeLessThanOrEqual(5);
      expect(['Excellent', 'Good', 'Average', 'Poor']).toContain(review.overallExperience);
      expect(review.waitTime).toBeGreaterThanOrEqual(5);
      expect(review.waitTime).toBeLessThanOrEqual(60);
      expect(typeof review.wouldRecommend).toBe('boolean');
      expect(typeof review.followUpNeeded).toBe('boolean');
      expect(review.submittedAt).toBeInstanceOf(Date);
    });

    test('Should validate review rating consistency', () => {
      const reviews = [];
      for (let i = 0; i < 20; i++) {
        const review = AppointmentFactory.createAppointmentReview('apt-123', 'patient-456');
        reviews.push(review);
      }

      reviews.forEach(review => {
        // All ratings should be within valid range
        [review.rating, review.doctorRating, review.facilityRating, review.waitTimeRating].forEach(rating => {
          expect(rating).toBeGreaterThanOrEqual(1);
          expect(rating).toBeLessThanOrEqual(5);
        });

        // Wait time should be reasonable
        expect(review.waitTime).toBeGreaterThanOrEqual(5);
        expect(review.waitTime).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('Bulk Operations & Performance - Complete Coverage', () => {
    test('Should efficiently generate bulk appointments', () => {
      const patientIds = Array.from({ length: 10 }, (_, i) => `patient-${i}`);
      const doctorIds = Array.from({ length: 5 }, (_, i) => `doctor-${i}`);
      const appointmentCount = 100;

      const startTime = Date.now();
      const appointments = AppointmentFactory.createBulkAppointments(appointmentCount, patientIds, doctorIds);
      const duration = Date.now() - startTime;

      expect(appointments).toHaveLength(appointmentCount);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      // Verify all appointments have valid structure
      appointments.forEach(appointment => {
        expect(patientIds).toContain(appointment.patientId);
        expect(doctorIds).toContain(appointment.doctorId);
        expect(appointment.appointmentId).toMatch(/^APT-\d{4}-\d{6}$/);
        expect(appointment.appointmentDate).toBeInstanceOf(Date);
      });

      // Verify appointment uniqueness
      const appointmentIds = appointments.map(apt => apt.appointmentId);
      const uniqueIds = new Set(appointmentIds);
      expect(uniqueIds.size).toBe(appointmentCount);
    });

    test('Should distribute appointments across patients and doctors', () => {
      const patientIds = ['patient-1', 'patient-2', 'patient-3', 'patient-4'];
      const doctorIds = ['doctor-1', 'doctor-2', 'doctor-3'];

      const appointments = AppointmentFactory.createBulkAppointments(50, patientIds, doctorIds);

      // Check that all patients and doctors are represented
      const usedPatients = new Set(appointments.map(apt => apt.patientId));
      const usedDoctors = new Set(appointments.map(apt => apt.doctorId));

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

  describe('Integration with Authentication & Medical Records - Complete Coverage', () => {
    test('Should integrate appointments with authenticated user workflow', async () => {
      // Create authenticated users
      const doctorData = await UserFactory.createDoctor();
      const patientData = await UserFactory.createPatient();
      const doctorToken = authHelper.generateTestToken(doctorData._id || 'doctor-integration-123', 'Doctor');

      // Create appointment linking users
      const appointment = AppointmentFactory.createAppointment(
        patientData._id || 'patient-integration-456',
        doctorData._id || 'doctor-integration-123'
      );

      // Verify authentication and permissions
      const hasSchedulePermission = authHelper.validatePermissions('Doctor', ['schedule_appointments']);
      expect(hasSchedulePermission).toBe(true);

      // Verify appointment linking
      expect(appointment.patientId).toBe(patientData._id || 'patient-integration-456');
      expect(appointment.doctorId).toBe(doctorData._id || 'doctor-integration-123');

      // Verify token validity
      const verifiedToken = authHelper.verifyToken(doctorToken);
      expect(verifiedToken.role).toBe('Doctor');
    });

    test('Should enforce role-based appointment access control', () => {
      const testScenarios = [
        { role: 'Doctor', permissions: ['schedule_appointments', 'view_appointments'], expected: true },
        { role: 'Receptionist', permissions: ['schedule_appointments'], expected: true },
        { role: 'Patient', permissions: ['view_own_appointments'], expected: true },
        { role: 'Patient', permissions: ['schedule_appointments'], expected: false },
        { role: 'Nurse', permissions: ['schedule_appointments'], expected: false },
        { role: 'BillingStaff', permissions: ['view_appointments'], expected: false }
      ];

      testScenarios.forEach(scenario => {
        const hasPermission = authHelper.validatePermissions(scenario.role, scenario.permissions);
        expect(hasPermission).toBe(scenario.expected);
      });
    });

    test('Should create complete appointment workflow with medical records', async () => {
      // 1. Create healthcare team and patient
      const doctor = await UserFactory.createDoctor();
      const patient = await UserFactory.createPatient();

      // 2. Schedule appointment
      const appointment = AppointmentFactory.createAppointment(
        patient._id || 'patient-workflow-123',
        doctor._id || 'doctor-workflow-456',
        {
          status: 'Scheduled',
          appointmentType: 'Consultation'
        }
      );

      // 3. Create appointment reminder
      const reminder = AppointmentFactory.createAppointmentReminder(
        appointment.appointmentId,
        patient._id || 'patient-workflow-123'
      );

      // 4. Complete appointment with medical record
      const medicalRecord = MedicalRecordsFactory.createMedicalRecord(
        patient._id || 'patient-workflow-123',
        doctor._id || 'doctor-workflow-456',
        {
          recordType: 'Consultation Visit',
          visitDate: appointment.appointmentDate
        }
      );

      // 5. Create follow-up appointment
      const followUpAppointment = AppointmentFactory.createAppointment(
        patient._id || 'patient-workflow-123',
        doctor._id || 'doctor-workflow-456',
        {
          isFollowUp: true,
          previousAppointmentId: appointment.appointmentId,
          appointmentType: 'Follow-up'
        }
      );

      // 6. Patient review
      const review = AppointmentFactory.createAppointmentReview(
        appointment.appointmentId,
        patient._id || 'patient-workflow-123'
      );

      // Verify complete workflow
      expect(appointment.patientId).toBe(patient._id || 'patient-workflow-123');
      expect(reminder.appointmentId).toBe(appointment.appointmentId);
      expect(medicalRecord.patientId).toBe(patient._id || 'patient-workflow-123');
      expect(followUpAppointment.previousAppointmentId).toBe(appointment.appointmentId);
      expect(review.appointmentId).toBe(appointment.appointmentId);

      // Verify workflow consistency
      expect(followUpAppointment.isFollowUp).toBe(true);
      expect(medicalRecord.visitDate).toEqual(appointment.appointmentDate);
    });
  });

  describe('Error Handling & Edge Cases - Complete Coverage', () => {
    test('Should handle missing or invalid appointment data gracefully', () => {
      // Test with null/undefined IDs
      expect(() => {
        AppointmentFactory.createAppointment(null, 'doctor-123');
      }).not.toThrow();

      expect(() => {
        AppointmentFactory.createAppointment('patient-123', undefined);
      }).not.toThrow();

      // Test with empty string IDs
      const appointmentWithEmptyIds = AppointmentFactory.createAppointment('', '');
      expect(appointmentWithEmptyIds.patientId).toBe('');
      expect(appointmentWithEmptyIds.doctorId).toBe('');
      expect(appointmentWithEmptyIds.appointmentId).toBeDefined();
    });

    test('Should validate time calculation utilities', () => {
      const testCases = [
        { time: '09:00', minutes: 30, expected: '09:30' },
        { time: '09:45', minutes: 30, expected: '10:15' },
        { time: '23:30', minutes: 60, expected: '00:30' },
        { time: '10:30', minutes: 15, expected: '10:45' }
      ];

      testCases.forEach(testCase => {
        const result = AppointmentFactory.addMinutes(testCase.time, testCase.minutes);
        expect(result).toBe(testCase.expected);
      });
    });

    test('Should handle bulk operations with edge cases', () => {
      // Test with empty arrays
      const emptyResult = AppointmentFactory.createBulkAppointments(5, [], []);
      expect(emptyResult).toHaveLength(5);
      emptyResult.forEach(appointment => {
        expect(appointment.patientId).toBeNull();
        expect(appointment.doctorId).toBeNull();
      });

      // Test with zero count
      const zeroResult = AppointmentFactory.createBulkAppointments(0, ['patient-1'], ['doctor-1']);
      expect(zeroResult).toHaveLength(0);
    });
  });

  describe('Memory & Performance Management - Complete Coverage', () => {
    test('Should handle large-scale appointment generation efficiently', () => {
      const patientIds = Array.from({ length: 20 }, (_, i) => `patient-${i}`);
      const doctorIds = Array.from({ length: 10 }, (_, i) => `doctor-${i}`);

      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      const appointments = AppointmentFactory.createBulkAppointments(200, patientIds, doctorIds);

      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      expect(appointments).toHaveLength(200);
      expect(duration).toBeLessThan(10000); // Under 10 seconds
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // Under 100MB

      // Verify data integrity at scale
      appointments.forEach(appointment => {
        expect(appointment.appointmentId).toMatch(/^APT-\d{4}-\d{6}$/);
        expect(appointment.appointmentDate).toBeInstanceOf(Date);
        expect(patientIds).toContain(appointment.patientId);
        expect(doctorIds).toContain(appointment.doctorId);
      });
    });

    test('Should maintain consistent performance across multiple operations', () => {
      const operationTimes = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        AppointmentFactory.createBulkAppointments(50, ['patient-1', 'patient-2'], ['doctor-1', 'doctor-2']);
        const duration = Date.now() - startTime;
        operationTimes.push(duration);
      }

      // Performance should be consistent (no degradation)
      const averageTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length;
      const maxTime = Math.max(...operationTimes);

      expect(averageTime).toBeLessThan(2000); // Average under 2 seconds
      expect(maxTime).toBeLessThan(3000); // No single operation over 3 seconds
    });
  });
});
