import mongoose from 'mongoose';

const encounterSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receptionistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    checkOutTime: Date,
    status: {
        type: String,
        enum: ['InProgress', 'Finished', 'Cancelled'],
        default: 'InProgress'
    },
    notes: String
}, { timestamps: true });

export const Encounter = mongoose.model('Encounter', encounterSchema);