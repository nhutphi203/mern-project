/**
 * Test Data Factory for Hospital Management System
 * Generates realistic, valid test data for all entities
 */

import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

class TestDataFactory {
    constructor() {
        this.createdData = {
            users: [],
            appointments: [],
            medicalRecords: [],
            vitalSigns: [],
            invoices: []
        };
    }

    /**
     * Generate valid test user for each role
     */
    generateUser(role = 'Patient', overrides = {}) {
        const baseUser = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: `${role.toLowerCase()}.${faker.string.alphanumeric(8)}@test.hospital.com`,
            password: 'TestPassword123!',
            phone: this.generateValidPhone(),
            gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
            dob: faker.date.between({ from: '1950-01-01', to: '2000-12-31' }).toISOString().split('T')[0],
            address: faker.location.streetAddress(),
            role: role,
            isTestData: true,
            ...overrides
        };

        // Role-specific fields
        switch (role) {
            case 'Patient':
                baseUser.nic = this.generateValidNIC();
                baseUser.emergencyContact = {
                    name: faker.person.fullName(),
                    phone: this.generateValidPhone(),
                    relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
                };
                break;
            case 'Doctor':
                baseUser.specialization = faker.helpers.arrayElement([
                    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'
                ]);
                baseUser.department = faker.helpers.arrayElement([
                    'Internal Medicine', 'Surgery', 'Emergency', 'Pediatrics'
                ]);
                baseUser.licenseNumber = `DOC${faker.string.numeric(6)}`;
                break;
            case 'Nurse':
                baseUser.department = faker.helpers.arrayElement([
                    'ICU', 'Emergency', 'General Ward', 'Pediatrics'
                ]);
                baseUser.shift = faker.helpers.arrayElement(['Morning', 'Evening', 'Night']);
                break;
        }

        this.createdData.users.push(baseUser);
        return baseUser;
    }

    /**
     * Generate valid appointment data
     */
    generateAppointment(patientId, doctorId, overrides = {}) {
        const appointment = {
            patientId: patientId || new mongoose.Types.ObjectId(),
            doctorId: doctorId || new mongoose.Types.ObjectId(),
            appointmentDate: faker.date.future(),
            appointmentTime: faker.helpers.arrayElement([
                '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
            ]),
            department: faker.helpers.arrayElement([
                'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'
            ]),
            reasonForVisit: faker.helpers.arrayElement([
                'Regular checkup',
                'Follow-up consultation',
                'Symptom evaluation',
                'Preventive care'
            ]),
            status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
            notes: faker.lorem.sentence(),
            isTestData: true,
            ...overrides
        };

        this.createdData.appointments.push(appointment);
        return appointment;
    }

    /**
     * Generate comprehensive medical record
     */
    generateMedicalRecord(patientId, doctorId, appointmentId, overrides = {}) {
        const medicalRecord = {
            patientId: patientId || new mongoose.Types.ObjectId(),
            doctorId: doctorId || new mongoose.Types.ObjectId(),
            appointmentId: appointmentId || new mongoose.Types.ObjectId(),
            visitDate: faker.date.recent(),

            // Clinical Assessment
            clinicalAssessment: {
                chiefComplaint: faker.helpers.arrayElement([
                    'Chest pain and shortness of breath',
                    'Persistent headache',
                    'Abdominal pain',
                    'Joint pain and stiffness'
                ]),
                historyOfPresentIllness: faker.lorem.paragraph(),
                physicalExam: {
                    vitalSigns: this.generateVitalSigns(),
                    generalAppearance: faker.lorem.sentence(),
                    systemicExamination: faker.lorem.paragraph()
                }
            },

            // Diagnoses
            diagnoses: [{
                icd10Code: faker.helpers.arrayElement(['I20.9', 'M79.3', 'K59.1', 'J06.9']),
                icd10Description: faker.helpers.arrayElement([
                    'Angina pectoris, unspecified',
                    'Panniculitis, unspecified',
                    'Functional diarrhea',
                    'Acute upper respiratory infection, unspecified'
                ]),
                diagnosisType: faker.helpers.arrayElement(['Primary', 'Secondary']),
                severity: faker.helpers.arrayElement(['Mild', 'Moderate', 'Severe'])
            }],

            // Treatment Plans
            treatmentPlans: [{
                planName: faker.helpers.arrayElement([
                    'Medication therapy',
                    'Physical therapy',
                    'Follow-up monitoring',
                    'Lifestyle modification'
                ]),
                planType: faker.helpers.arrayElement(['Medication', 'Therapy', 'Monitoring']),
                description: faker.lorem.sentence(),
                duration: faker.helpers.arrayElement(['1 week', '2 weeks', '1 month'])
            }],

            // Medications
            medications: [{
                name: faker.helpers.arrayElement(['Lisinopril', 'Metformin', 'Aspirin', 'Ibuprofen']),
                dosage: faker.helpers.arrayElement(['10mg', '500mg', '81mg', '200mg']),
                frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'As needed']),
                duration: faker.helpers.arrayElement(['7 days', '14 days', '30 days'])
            }],

            isTestData: true,
            ...overrides
        };

        this.createdData.medicalRecords.push(medicalRecord);
        return medicalRecord;
    }

    /**
     * Generate vital signs data
     */
    generateVitalSigns(patientId, overrides = {}) {
        const vitalSigns = {
            patientId: patientId || new mongoose.Types.ObjectId(),
            recordedDate: faker.date.recent(),
            recordedBy: new mongoose.Types.ObjectId(),

            measurements: {
                bloodPressure: {
                    systolic: faker.number.int({ min: 90, max: 180 }),
                    diastolic: faker.number.int({ min: 60, max: 120 })
                },
                heartRate: faker.number.int({ min: 60, max: 120 }),
                temperature: faker.number.float({ min: 96.0, max: 103.0, fractionDigits: 1 }),
                respiratoryRate: faker.number.int({ min: 12, max: 25 }),
                oxygenSaturation: faker.number.int({ min: 92, max: 100 }),
                weight: faker.number.float({ min: 40, max: 150, fractionDigits: 1 }),
                height: faker.number.int({ min: 140, max: 200 })
            },

            notes: faker.lorem.sentence(),
            isTestData: true,
            ...overrides
        };

        this.createdData.vitalSigns.push(vitalSigns);
        return vitalSigns;
    }

    /**
     * Generate billing/invoice data
     */
    generateInvoice(patientId, appointmentId, overrides = {}) {
        const services = [
            { name: 'Consultation', price: 150.00 },
            { name: 'Blood Test', price: 75.00 },
            { name: 'X-Ray', price: 200.00 },
            { name: 'Medication', price: 50.00 }
        ];

        const selectedServices = faker.helpers.arrayElements(services, { min: 1, max: 3 });
        const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);

        const invoice = {
            patientId: patientId || new mongoose.Types.ObjectId(),
            appointmentId: appointmentId || new mongoose.Types.ObjectId(),
            invoiceNumber: `INV${faker.string.numeric(6)}`,
            invoiceDate: faker.date.recent(),
            dueDate: faker.date.future({ days: 30 }),

            services: selectedServices.map(service => ({
                description: service.name,
                quantity: 1,
                unitPrice: service.price,
                totalPrice: service.price
            })),

            subtotal: totalAmount,
            tax: totalAmount * 0.1,
            totalAmount: totalAmount * 1.1,

            status: faker.helpers.arrayElement(['pending', 'paid', 'overdue']),
            paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'insurance']),

            isTestData: true,
            ...overrides
        };

        this.createdData.invoices.push(invoice);
        return invoice;
    }

    /**
     * Helper methods
     */
    generateValidPhone() {
        return faker.string.numeric(10); // Exactly 10 digits
    }

    generateValidNIC() {
        return faker.string.numeric(12); // Exactly 12 digits
    }

    /**
     * Generate complete test dataset
     */
    async generateCompleteDataset() {
        const dataset = {
            users: {},
            appointments: [],
            medicalRecords: [],
            vitalSigns: [],
            invoices: []
        };

        // Generate users for each role
        const roles = ['Admin', 'Doctor', 'Patient', 'Receptionist', 'Nurse', 'LabTechnician', 'BillingStaff'];

        for (const role of roles) {
            dataset.users[role.toLowerCase()] = [];
            for (let i = 0; i < 3; i++) {
                dataset.users[role.toLowerCase()].push(this.generateUser(role));
            }
        }

        // Generate related data
        const doctors = dataset.users.doctor;
        const patients = dataset.users.patient;

        for (let i = 0; i < 20; i++) {
            const patient = faker.helpers.arrayElement(patients);
            const doctor = faker.helpers.arrayElement(doctors);

            const appointment = this.generateAppointment(patient.email, doctor.email);
            dataset.appointments.push(appointment);

            if (faker.datatype.boolean(0.7)) { // 70% chance of having medical record
                const medicalRecord = this.generateMedicalRecord(
                    patient.email,
                    doctor.email,
                    appointment.id
                );
                dataset.medicalRecords.push(medicalRecord);
            }

            if (faker.datatype.boolean(0.8)) { // 80% chance of vital signs
                const vitalSigns = this.generateVitalSigns(patient.email);
                dataset.vitalSigns.push(vitalSigns);
            }

            if (faker.datatype.boolean(0.6)) { // 60% chance of invoice
                const invoice = this.generateInvoice(patient.email, appointment.id);
                dataset.invoices.push(invoice);
            }
        }

        return dataset;
    }

    /**
     * Cleanup generated test data
     */
    getCreatedDataIds() {
        return this.createdData;
    }

    reset() {
        this.createdData = {
            users: [],
            appointments: [],
            medicalRecords: [],
            vitalSigns: [],
            invoices: []
        };
    }
}

export default TestDataFactory;
