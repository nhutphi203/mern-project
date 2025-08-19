import mongoose from 'mongoose';
import { Appointment } from '../../models/appointmentSchema.js';

const departments = [
    'Cardiology',
    'Internal Medicine',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Neurology',
    'Emergency Medicine',
    'Radiology'
];

const generateAppointmentDate = () => {
    const now = new Date();
    const future = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
    return future.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const seedAppointments = async (users) => {
    try {
        if (!users || !users.patients || !users.doctors) {
            throw new Error('Users data is required for seeding appointments');
        }

        // Clear existing appointments
        await Appointment.deleteMany({});

        const appointments = [];
        const { patients, doctors } = users;

        // Create 20 sample appointments
        for (let i = 0; i < 20; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const department = departments[Math.floor(Math.random() * departments.length)];

            const statuses = ['Pending', 'Accepted', 'Completed', 'Checked-in'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const appointment = {
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                nic: patient.nic,
                dob: patient.dob,
                gender: patient.gender,
                appointment_date: generateAppointmentDate(),
                department: department,
                doctor: {
                    firstName: doctor.firstName.replace('Dr. ', ''),
                    lastName: doctor.lastName
                },
                hasVisited: Math.random() > 0.5,
                address: `${123 + i} Main Street, City ${i + 1}, State`,
                doctorId: doctor._id,
                patientId: patient._id,
                status: status
            };

            appointments.push(appointment);
        }

        const createdAppointments = await Appointment.insertMany(appointments);
        console.log(`✅ Successfully seeded ${createdAppointments.length} appointments`);

        return createdAppointments;
    } catch (error) {
        console.error('❌ Error seeding appointments:', error);
        throw error;
    }
};
