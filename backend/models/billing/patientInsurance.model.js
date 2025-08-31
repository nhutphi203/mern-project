import mongoose from 'mongoose';

const patientInsuranceSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    insuranceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InsuranceProvider',
        required: true
    },
    policyNumber: {
        type: String,
        required: true
    },
    groupNumber: String,
    subscriberName: {
        type: String,
        required: true
    },
    subscriberDOB: Date,
    relationship: {
        type: String,
        enum: ['Self', 'Spouse', 'Child', 'Other'],
        required: true
    },
    effectiveDate: {
        type: Date,
        required: true
    },
    expirationDate: Date,
    copayAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deductibleAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    isPrimary: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure one primary insurance per patient
patientInsuranceSchema.index({ patientId: 1, isPrimary: 1 }, {
    unique: true,
    partialFilterExpression: { isPrimary: true, isActive: true }
});

export const PatientInsurance = mongoose.model('PatientInsurance', patientInsuranceSchema);
