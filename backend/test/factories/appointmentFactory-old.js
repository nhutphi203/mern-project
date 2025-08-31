/**
 * Appointment Data Factory - Creates comprehensive appointment test data
 * Learned from Phase 1&2: No external dependencies, pure JavaScript implementation
 * Ensures consistent data generation without ES module conflicts
 */

class AppointmentFactory {
  /**
   * Create comprehensive appointment with all required fields
   */
  static createAppointment(patientId, doctorId, overrides = {}) {
    const appointmentDate = faker.date.future({ years: 1 });
    const duration = faker.helpers.arrayElement([15, 30, 45, 60]); // minutes
    
    const baseAppointment = {
      patientId,
      doctorId,
      
      // Scheduling Information
      appointmentDate,
      appointmentTime: this.generateTimeSlot(),
      duration,
      endTime: new Date(appointmentDate.getTime() + (duration * 60000)),
      
      // Appointment Details
      appointmentType: faker.helpers.arrayElement([
        'Consultation',
        'Follow-up',
        'Check-up',
        'Emergency',
        'Procedure',
        'Lab Results Review',
        'Vaccination',
        'Physical Therapy'
      ]),
      
      department: faker.helpers.arrayElement([
        'Internal Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Dermatology',
        'Pediatrics',
        'Emergency',
        'Surgery'
      ]),
      
      // Patient Information
      reasonForVisit: faker.helpers.arrayElement([
        'Annual physical examination',
        'Follow-up for hypertension',
        'Chest pain evaluation',
        'Skin rash consultation',
        'Headache assessment',
        'Joint pain evaluation',
        'Lab results discussion',
        'Medication review'
      ]),
      
      symptoms: faker.helpers.arrayElements([
        'Fatigue', 'Headache', 'Nausea', 'Dizziness', 'Pain', 'Fever'
      ], { min: 0, max: 3 }),
      
      // Administrative
      priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Urgent']),
      status: faker.helpers.arrayElement([
        'Scheduled', 
        'Confirmed', 
        'In Progress', 
        'Completed', 
        'Cancelled', 
        'No Show', 
        'Rescheduled'
      ]),
      
      // Booking Information
      bookedBy: faker.helpers.arrayElement(['Patient', 'Receptionist', 'Doctor', 'System']),
      bookingDate: faker.date.recent({ days: 30 }),
      
      // Contact Information
      patientPhone: faker.phone.number('##########'),
      preferredContactMethod: faker.helpers.arrayElement(['Phone', 'Email', 'SMS']),
      
      // Insurance & Billing
      insuranceRequired: faker.datatype.boolean(),
      insuranceVerified: faker.datatype.boolean(),
      estimatedCost: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
      
      // Special Requirements
      interpreter: faker.datatype.boolean() ? faker.helpers.arrayElement(['Spanish', 'French', 'Chinese']) : null,
      wheelchairAccess: faker.datatype.boolean(),
      specialInstructions: faker.lorem.sentence(),
      
      // Follow-up Information
      isFollowUp: faker.datatype.boolean(),
      previousAppointmentId: null, // Will be set for follow-ups
      nextAppointmentRequired: faker.datatype.boolean(),
      
      // Notifications
      reminderSent: faker.datatype.boolean(),
      confirmationSent: faker.datatype.boolean(),
      
      // Metadata
      createdAt: faker.date.recent({ days: 30 }),
      updatedAt: new Date(),
      lastModifiedBy: 'System'
    };

    return { ...baseAppointment, ...overrides };
  }

  /**
   * Generate realistic time slots during business hours
   */
  static generateTimeSlot() {
    const hours = faker.number.int({ min: 8, max: 17 }); // 8 AM to 5 PM
    const minutes = faker.helpers.arrayElement([0, 15, 30, 45]);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Create emergency appointment
   */
  static createEmergencyAppointment(patientId, doctorId, overrides = {}) {
    const emergencyData = {
      appointmentType: 'Emergency',
      priority: 'Urgent',
      status: 'Scheduled',
      appointmentDate: new Date(),
      appointmentTime: new Date().toTimeString().substring(0, 5),
      reasonForVisit: faker.helpers.arrayElement([
        'Chest pain',
        'Severe headache',
        'Difficulty breathing',
        'Severe abdominal pain',
        'High fever',
        'Allergic reaction'
      ]),
      department: 'Emergency',
      duration: 60,
      bookedBy: 'Emergency'
    };

    return this.createAppointment(patientId, doctorId, { ...emergencyData, ...overrides });
  }

  /**
   * Create follow-up appointment
   */
  static createFollowUpAppointment(patientId, doctorId, previousAppointmentId, overrides = {}) {
    const followUpData = {
      appointmentType: 'Follow-up',
      isFollowUp: true,
      previousAppointmentId,
      reasonForVisit: 'Follow-up for previous consultation',
      priority: 'Medium',
      status: 'Scheduled',
      appointmentDate: faker.date.future({ days: 30 })
    };

    return this.createAppointment(patientId, doctorId, { ...followUpData, ...overrides });
  }

  /**
   * Create recurring appointments (e.g., physical therapy)
   */
  static createRecurringAppointments(patientId, doctorId, sessions = 6, overrides = {}) {
    const appointments = [];
    const baseDate = faker.date.future({ days: 7 });
    
    for (let i = 0; i < sessions; i++) {
      const appointmentDate = new Date(baseDate);
      appointmentDate.setDate(appointmentDate.getDate() + (i * 7)); // Weekly sessions
      
      const recurringData = {
        appointmentType: 'Physical Therapy',
        appointmentDate,
        sessionNumber: i + 1,
        totalSessions: sessions,
        isRecurring: true,
        recurrencePattern: 'Weekly'
      };

      appointments.push(this.createAppointment(patientId, doctorId, { ...recurringData, ...overrides }));
    }

    return appointments;
  }

  /**
   * Create appointment with specific status
   */
  static createAppointmentWithStatus(patientId, doctorId, status, overrides = {}) {
    const statusSpecificData = {
      status,
      ...this.getStatusSpecificData(status)
    };

    return this.createAppointment(patientId, doctorId, { ...statusSpecificData, ...overrides });
  }

  /**
   * Get status-specific data for appointments
   */
  static getStatusSpecificData(status) {
    switch (status) {
      case 'Completed':
        return {
          appointmentDate: faker.date.past({ days: 30 }),
          completedAt: faker.date.recent({ days: 7 }),
          doctorNotes: faker.lorem.paragraph(),
          nextAppointmentRequired: faker.datatype.boolean()
        };
      
      case 'Cancelled':
        return {
          cancelledAt: faker.date.recent({ days: 7 }),
          cancellationReason: faker.helpers.arrayElement([
            'Patient request',
            'Doctor unavailable',
            'Emergency',
            'Weather conditions',
            'Patient illness'
          ]),
          cancelledBy: faker.helpers.arrayElement(['Patient', 'Doctor', 'Receptionist'])
        };
      
      case 'No Show':
        return {
          appointmentDate: faker.date.past({ days: 7 }),
          noShowRecorded: true,
          followUpRequired: true
        };
      
      case 'Rescheduled':
        return {
          originalDate: faker.date.past({ days: 7 }),
          rescheduleReason: faker.helpers.arrayElement([
            'Patient request',
            'Doctor schedule change',
            'Emergency',
            'Equipment issue'
          ]),
          rescheduledBy: faker.helpers.arrayElement(['Patient', 'Doctor', 'Receptionist'])
        };
      
      default:
        return {};
    }
  }

  /**
   * Create appointment slot for scheduling availability
   */
  static createAppointmentSlot(doctorId, date, timeSlot, overrides = {}) {
    const baseSlot = {
      doctorId,
      date,
      timeSlot,
      duration: 30, // Default 30 minutes
      isAvailable: true,
      isBooked: false,
      appointmentId: null,
      slotType: faker.helpers.arrayElement(['Regular', 'Emergency', 'Consultation']),
      department: faker.helpers.arrayElement([
        'Internal Medicine', 'Cardiology', 'Neurology'
      ]),
      createdAt: new Date()
    };

    return { ...baseSlot, ...overrides };
  }

  /**
   * Generate daily schedule for a doctor
   */
  static generateDoctorSchedule(doctorId, date, overrides = {}) {
    const schedule = {
      doctorId,
      date,
      startTime: '08:00',
      endTime: '17:00',
      lunchBreak: {
        start: '12:00',
        end: '13:00'
      },
      availableSlots: [],
      bookedSlots: [],
      isAvailable: true,
      department: faker.helpers.arrayElement([
        'Internal Medicine', 'Cardiology', 'Neurology'
      ])
    };

    // Generate time slots
    const slots = this.generateTimeSlots('08:00', '17:00', 30, ['12:00-13:00']);
    schedule.availableSlots = slots;

    return { ...schedule, ...overrides };
  }

  /**
   * Generate time slots for a given period
   */
  static generateTimeSlots(startTime, endTime, duration, breaks = []) {
    const slots = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    
    for (let time = start; time < end; time += duration) {
      const timeStr = this.minutesToTime(time);
      const isBreak = breaks.some(breakPeriod => {
        const [breakStart, breakEnd] = breakPeriod.split('-');
        return time >= this.timeToMinutes(breakStart) && time < this.timeToMinutes(breakEnd);
      });
      
      if (!isBreak) {
        slots.push({
          time: timeStr,
          duration,
          isAvailable: true,
          isBooked: false
        });
      }
    }
    
    return slots;
  }

  /**
   * Helper: Convert time string to minutes
   */
  static timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper: Convert minutes to time string
   */
  static minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Create bulk appointments for load testing
   */
  static createBulkAppointments(count = 100, patientIds = [], doctorIds = []) {
    const appointments = [];
    
    for (let i = 0; i < count; i++) {
      const patientId = faker.helpers.arrayElement(patientIds);
      const doctorId = faker.helpers.arrayElement(doctorIds);
      
      appointments.push(this.createAppointment(patientId, doctorId));
    }
    
    return appointments;
  }

  /**
   * Create appointment with specific date range
   */
  static createAppointmentInDateRange(patientId, doctorId, startDate, endDate, overrides = {}) {
    const appointmentDate = faker.date.between({ from: startDate, to: endDate });
    
    return this.createAppointment(patientId, doctorId, {
      appointmentDate,
      ...overrides
    });
  }

  /**
   * Create appointment notification data
   */
  static createAppointmentNotification(appointmentId, type, overrides = {}) {
    const baseNotification = {
      appointmentId,
      type, // 'reminder', 'confirmation', 'cancellation', 'rescheduling'
      method: faker.helpers.arrayElement(['Email', 'SMS', 'Phone Call']),
      message: this.generateNotificationMessage(type),
      sentAt: faker.date.recent({ days: 7 }),
      status: faker.helpers.arrayElement(['Sent', 'Delivered', 'Failed', 'Pending']),
      recipient: faker.helpers.arrayElement(['Patient', 'Doctor', 'Both']),
      scheduledFor: faker.date.future({ days: 1 })
    };

    return { ...baseNotification, ...overrides };
  }

  /**
   * Generate notification message based on type
   */
  static generateNotificationMessage(type) {
    const messages = {
      reminder: 'You have an upcoming appointment scheduled for tomorrow at 10:00 AM with Dr. Smith.',
      confirmation: 'Your appointment has been confirmed for tomorrow at 10:00 AM with Dr. Smith.',
      cancellation: 'Your appointment scheduled for tomorrow at 10:00 AM has been cancelled.',
      rescheduling: 'Your appointment has been rescheduled to next week Tuesday at 2:00 PM.'
    };

    return messages[type] || 'Appointment notification';
  }
}

export default AppointmentFactory;
