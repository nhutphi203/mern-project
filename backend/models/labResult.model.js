import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    result: {
        value: mongoose.Schema.Types.Mixed, // Number, String, or Object
        unit: String,
        isAbnormal: {
            type: Boolean,
            default: false
        },
        flag: {
            type: String,
            enum: ['Normal', 'High', 'Low', 'Critical', 'Abnormal'],
            default: 'Normal'
        }
    },
    referenceRange: String,
    interpretation: String,
    comments: String,
    performedAt: {
        type: Date,
        default: Date.now
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Reviewed', 'Amended', 'Cancelled'],
        default: 'Pending'
    },
    methodology: String,
    instrument: String
}, { timestamps: true });

export const LabResult = mongoose.model('LabResult', labResultSchema);
