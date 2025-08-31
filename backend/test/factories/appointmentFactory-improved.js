/**
 * Appointment Data Factory - Creates comprehensive appointment test data
 * Learned from Phase 1&2: No external dependencies, pure JavaScript implementation
 * Ensures consistent data generation without ES module conflicts
 */

class AppointmentFactory {
    /**
     * Create comprehensive appointment with all scheduling details
     */
    static createAppointment(patientId, doctorId, overrides = {}) {
        const appointmentTypes = [
            'Consultation', 'Follow-up', 'Emergency', 'Surgery',
            'Physical Therapy', 'Lab Work', 'Diagnostic'
        ];

        const departments = [
            'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
            'Pediatrics', 'Gynecology', 'Emergency', 'Surgery'
        ];

        const statuses = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

        const priorities = ['Low', 'Normal', 'High', 'Urgent'];

        // Generate realistic appointment time (business hours)
        const appointmentDate = this.generateBusinessDateTime();

        const baseAppointment = {
            appointmentId: this.generateAppointmentId(),
            patientId,
            doctorId,

            // Scheduling Information
            appointmentDate,
            appointmentTime: this.generateTimeSlot(),
            duration: this.getRandomElement([15, 30, 45, 60, 90, 120]), // minutes
            appointmentType: this.getRandomElement(appointmentTypes),
            department: this.getRandomElement(departments),

            // Status and Priority
            status: this.getRandomElement(statuses),
            priority: this.getRandomElement(priorities),

            // Clinical Information
            reasonForVisit: this.getRandomElement([
                'Annual check-up',
                'Follow-up visit',
                'New patient consultation',
                'Medication review',
                'Symptom evaluation',
                'Preventive care',
                'Test results review'
            ]),

            symptoms: this.getRandomElements([
                'Headache', 'Fatigue', 'Chest pain', 'Shortness of breath',
                'Nausea', 'Dizziness', 'Joint pain', 'Fever'
            ], { min: 0, max: 3 }),

            // Booking Information
            bookedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            bookedBy: this.getRandomElement(['Patient', 'Doctor', 'Receptionist', 'System']),

            // Location and Resources
            roomNumber: this.getRandomElement(['101', '102', '201', '202', '301', '302']),
            floor: this.getRandomElement(['1st Floor', '2nd Floor', '3rd Floor']),
            building: this.getRandomElement(['Main Building', 'East Wing', 'West Wing']),

            // Communication
            notificationsSent: this.getRandomElement([true, false]),
            remindersSent: this.randomInt(0, 3),

            // Insurance and Billing
            insuranceVerified: this.getRandomElement([true, false]),
            copayAmount: this.randomFloat(0, 50, 2),
            estimatedCost: this.randomFloat(100, 500, 2),

            // Special Requirements
            specialInstructions: this.getRandomElement([
                null,
                'Fasting required',
                'Bring previous test results',
                'Wheelchair accessible',
                'Interpreter needed',
                'Emergency contact required'
            ]),

            equipmentNeeded: this.getRandomElements([
                'ECG Machine', 'X-Ray', 'Ultrasound', 'Blood Pressure Monitor'
            ], { min: 0, max: 2 }),

            // Follow-up
            isFollowUp: this.getRandomElement([true, false]),
            previousAppointmentId: null, // Will be set if follow-up
            nextAppointmentScheduled: this.getRandomElement([true, false]),

            // Notes
            notes: this.getRandomElement([
                'Patient is new to the practice',
                'Regular follow-up appointment',
                'Urgent consultation needed',
                'Routine checkup',
                null
            ]),

            // Metadata
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        };

        return { ...baseAppointment, ...overrides };
    }

    /**
     * Generate unique appointment ID
     */
    static generateAppointmentId() {
        return `APT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    }

    /**
     * Generate time slot in business hours
     */
    static generateTimeSlot() {
        const hour = this.randomInt(8, 17);
        const minute = this.getRandomElement([0, 15, 30, 45]);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    /**
     * Generate business hours datetime (Mon-Fri, 8AM-6PM)
     */
    static generateBusinessDateTime() {
        const today = new Date();
        const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days

        // Ensure weekday (Monday = 1, Friday = 5)
        while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
            futureDate.setDate(futureDate.getDate() + 1);
        }

        // Set business hours (8 AM to 6 PM)
        const hour = this.randomInt(8, 17);
        const minute = this.getRandomElement([0, 15, 30, 45]);

        futureDate.setHours(hour, minute, 0, 0);
        return futureDate;
    }

    /**
     * Create appointment slot for scheduling system
     */
    static createAppointmentSlot(doctorId, date, overrides = {}) {
        const baseSlot = {
            slotId: this.generateSlotId(),
            doctorId,
            date: date || this.generateBusinessDateTime(),
            startTime: '09:00',
            endTime: '09:30',
            duration: 30,
            isAvailable: true,
            isBlocked: false,
            blockReason: null,
            maxBookings: 1,
            currentBookings: 0,
            slotType: this.getRandomElement(['Regular', 'Emergency', 'Walk-in']),
            createdAt: new Date()
        };

        return { ...baseSlot, ...overrides };
    }

    /**
     * Generate slot ID
     */
    static generateSlotId() {
        return `SLOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create waiting list entry
     */
    static createWaitingListEntry(patientId, doctorId, overrides = {}) {
        const baseEntry = {
            waitingListId: this.generateWaitingListId(),
            patientId,
            doctorId,
            requestedDate: this.generateBusinessDateTime(),
            preferredTimeSlots: this.getRandomElements(['Morning', 'Afternoon', 'Evening'], { min: 1, max: 2 }),
            priority: this.getRandomElement(['Low', 'Normal', 'High']),
            reasonForVisit: 'Follow-up appointment needed',
            contactPreference: this.getRandomElement(['Phone', 'Email', 'SMS']),
            maxWaitTime: this.getRandomElement([1, 3, 7, 14]), // days
            status: this.getRandomElement(['Active', 'Contacted', 'Scheduled', 'Expired']),
            addedAt: new Date(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        };

        return { ...baseEntry, ...overrides };
    }

    /**
     * Generate waiting list ID
     */
    static generateWaitingListId() {
        return `WL-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;
    }

    /**
     * Create appointment reminder
     */
    static createAppointmentReminder(appointmentId, patientId, overrides = {}) {
        const baseReminder = {
            reminderId: this.generateReminderId(),
            appointmentId,
            patientId,
            reminderType: this.getRandomElement(['SMS', 'Email', 'Phone Call', 'App Notification']),
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours before
            message: 'Reminder: You have an appointment scheduled',
            status: this.getRandomElement(['Pending', 'Sent', 'Delivered', 'Failed']),
            attemptCount: 0,
            maxAttempts: 3,
            createdAt: new Date()
        };

        return { ...baseReminder, ...overrides };
    }

    /**
     * Generate reminder ID
     */
    static generateReminderId() {
        return `REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create recurring appointment pattern
     */
    static createRecurringAppointment(patientId, doctorId, overrides = {}) {
        const baseRecurring = {
            recurringId: this.generateRecurringId(),
            patientId,
            doctorId,
            patternType: this.getRandomElement(['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']),
            frequency: this.randomInt(1, 4), // Every X weeks/months
            dayOfWeek: this.getRandomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
            preferredTime: this.getRandomElement(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
            duration: this.getRandomElement([30, 45, 60]),
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isActive: true,
            appointmentType: 'Follow-up',
            totalAppointments: 0,
            maxAppointments: this.randomInt(10, 52), // Up to 52 appointments
            autoSchedule: this.getRandomElement([true, false]),
            createdAt: new Date()
        };

        return { ...baseRecurring, ...overrides };
    }

    /**
     * Generate recurring appointment ID
     */
    static generateRecurringId() {
        return `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    }

    /**
     * Create appointment cancellation record
     */
    static createCancellation(appointmentId, cancelledBy, overrides = {}) {
        const baseCancellation = {
            cancellationId: this.generateCancellationId(),
            appointmentId,
            cancelledBy, // userId who cancelled
            cancellationReason: this.getRandomElement([
                'Patient request',
                'Doctor unavailable',
                'Emergency',
                'Equipment failure',
                'Weather conditions',
                'Personal emergency'
            ]),
            cancellationType: this.getRandomElement(['Patient', 'Provider', 'System', 'Emergency']),
            refundAmount: this.randomFloat(0, 100, 2),
            rescheduleRequested: this.getRandomElement([true, false]),
            notificationsSent: this.getRandomElement([true, false]),
            cancelledAt: new Date(),
            processingFee: this.randomFloat(0, 25, 2),
            cancellationWindow: this.randomInt(1, 72), // hours before appointment
            notes: 'Cancellation processed successfully'
        };

        return { ...baseCancellation, ...overrides };
    }

    /**
     * Generate cancellation ID
     */
    static generateCancellationId() {
        return `CAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create appointment review/feedback
     */
    static createAppointmentReview(appointmentId, patientId, overrides = {}) {
        const baseReview = {
            reviewId: this.generateReviewId(),
            appointmentId,
            patientId,
            rating: this.randomInt(1, 5),
            doctorRating: this.randomInt(1, 5),
            facilityRating: this.randomInt(1, 5),
            waitTimeRating: this.randomInt(1, 5),
            overallExperience: this.getRandomElement(['Excellent', 'Good', 'Average', 'Poor']),
            waitTime: this.randomInt(5, 60), // minutes
            comments: this.getRandomElement([
                'Great experience, doctor was very professional',
                'Long wait time but good care',
                'Efficient appointment, satisfied with care',
                'Could improve scheduling system',
                null
            ]),
            wouldRecommend: this.getRandomElement([true, false]),
            followUpNeeded: this.getRandomElement([true, false]),
            submittedAt: new Date()
        };

        return { ...baseReview, ...overrides };
    }

    /**
     * Generate review ID
     */
    static generateReviewId() {
        return `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Generate daily schedule for a doctor
     */
    static generateDoctorSchedule(doctorId, date, overrides = {}) {
        const slots = [];
        const startHour = 9;
        const endHour = 17;
        const slotDuration = 30; // minutes

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const slot = this.createAppointmentSlot(doctorId, date, {
                    startTime: slotTime,
                    endTime: this.addMinutes(slotTime, slotDuration),
                    isAvailable: Math.random() > 0.3 // 70% availability
                });
                slots.push(slot);
            }
        }

        const baseSchedule = {
            scheduleId: this.generateScheduleId(),
            doctorId,
            date,
            slots,
            totalSlots: slots.length,
            availableSlots: slots.filter(slot => slot.isAvailable).length,
            bookedSlots: slots.filter(slot => !slot.isAvailable).length,
            isActive: true,
            lastUpdated: new Date()
        };

        return { ...baseSchedule, ...overrides };
    }

    /**
     * Generate schedule ID
     */
    static generateScheduleId() {
        return `SCH-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create bulk appointments for testing
     */
    static createBulkAppointments(count = 50, patientIds = [], doctorIds = []) {
        const appointments = [];

        for (let i = 0; i < count; i++) {
            const patientId = this.getRandomElement(patientIds);
            const doctorId = this.getRandomElement(doctorIds);

            appointments.push(this.createAppointment(patientId, doctorId));
        }

        return appointments;
    }

    /**
     * Create appointment conflict scenario for testing
     */
    static createConflictScenario(doctorId, date) {
        const baseTime = new Date(date);
        baseTime.setHours(10, 0, 0, 0);

        return {
            conflictId: this.generateConflictId(),
            doctorId,
            conflictDate: date,
            appointments: [
                this.createAppointment('patient-1', doctorId, {
                    appointmentDate: new Date(baseTime),
                    duration: 60
                }),
                this.createAppointment('patient-2', doctorId, {
                    appointmentDate: new Date(baseTime.getTime() + 30 * 60 * 1000), // 30 min overlap
                    duration: 60
                })
            ],
            conflictType: 'Time Overlap',
            severity: 'High',
            autoResolution: false,
            requiresManualIntervention: true
        };
    }

    /**
     * Generate conflict ID
     */
    static generateConflictId() {
        return `CONF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Generate notification message
     */
    static generateNotificationMessage(type = 'reminder') {
        const messages = {
            reminder: 'Reminder: You have an appointment scheduled',
            confirmation: 'Your appointment has been confirmed',
            cancellation: 'Your appointment has been cancelled',
            rescheduling: 'Your appointment has been rescheduled'
        };

        return messages[type] || 'Appointment notification';
    }

    // Utility methods (learned from Phase 1&2 - keep them simple and dependency-free)
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

    static addMinutes(timeString, minutes) {
        const [hours, mins] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }
}

export default AppointmentFactory;

module.exports = AppointmentFactory;
