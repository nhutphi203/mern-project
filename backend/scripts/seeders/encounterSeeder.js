import mongoose from 'mongoose';
import { Encounter } from '../../models/encounter.model.js';

export const seedEncounters = async (appointments, users) => {
    try {
        if (!appointments || !users || !users.receptionists) {
            throw new Error('Appointments and users data are required for seeding encounters');
        }

        // Clear existing encounters
        await Encounter.deleteMany({});

        const encounters = [];
        const { receptionists } = users;

        // Create encounters for checked-in appointments
        const checkedInAppointments = appointments.filter(app => app.status === 'Checked-in');

        for (const appointment of checkedInAppointments) {
            const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];

            const statuses = ['InProgress', 'Finished'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const checkInTime = new Date(appointment.appointment_date);
            checkInTime.setHours(8 + Math.floor(Math.random() * 10)); // Random hour between 8-18

            let checkOutTime = null;
            if (status === 'Finished') {
                checkOutTime = new Date(checkInTime.getTime() + (30 + Math.random() * 90) * 60 * 1000); // 30-120 minutes later
            }

            const encounter = {
                appointmentId: appointment._id,
                patientId: appointment.patientId,
                receptionistId: receptionist._id,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                status: status,
                notes: status === 'Finished' ? 'Patient consultation completed successfully' : 'Patient currently being seen by doctor'
            };

            encounters.push(encounter);
        }

        // Also create some additional encounters for other appointments
        const otherAppointments = appointments.filter(app => app.status === 'Accepted').slice(0, 5);

        for (const appointment of otherAppointments) {
            const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];

            const checkInTime = new Date(appointment.appointment_date);
            checkInTime.setHours(8 + Math.floor(Math.random() * 10));

            const encounter = {
                appointmentId: appointment._id,
                patientId: appointment.patientId,
                receptionistId: receptionist._id,
                checkInTime: checkInTime,
                checkOutTime: null,
                status: 'InProgress',
                notes: 'Patient checked in and waiting for consultation'
            };

            encounters.push(encounter);
        }

        const createdEncounters = await Encounter.insertMany(encounters);
        console.log(`✅ Successfully seeded ${createdEncounters.length} encounters`);

        return createdEncounters;
    } catch (error) {
        console.error('❌ Error seeding encounters:', error);
        throw error;
    }
};
