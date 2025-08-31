import mongoose from 'mongoose';

const DiagnosisSchema = new mongoose.Schema({
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // ICD-10 Information
    icd10Code: {
        type: String,
        required: true,
        index: true
    },
    icd10Description: {
        type: String,
        required: true
    },
    customDescription: {
        type: String // Doctor's custom diagnosis description
    },

    // Diagnosis Classification
    type: {
        type: String,
        enum: ['Primary', 'Secondary', 'Differential', 'Rule Out', 'History'],
        default: 'Primary'
    },
    severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe', 'Critical'],
        default: 'Moderate'
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'Chronic', 'In Remission'],
        default: 'Active'
    },
    confidence: {
        type: String,
        enum: ['Confirmed', 'Probable', 'Possible', 'Suspected'],
        default: 'Probable'
    },

    // Timeline
    onsetDate: {
        type: Date
    },
    diagnosedDate: {
        type: Date,
        default: Date.now
    },
    resolvedDate: {
        type: Date
    },

    // Clinical Context
    clinicalNotes: {
        type: String
    },
    complications: [{
        description: String,
        date: Date,
        severity: {
            type: String,
            enum: ['Minor', 'Major', 'Life-threatening']
        }
    }],

    // Related Information
    relatedDiagnoses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diagnosis'
    }],

    // Audit Trail
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    collection: 'diagnoses'
});

// Indexes for performance
DiagnosisSchema.index({ medicalRecordId: 1, type: 1 });
DiagnosisSchema.index({ patientId: 1, status: 1 });
DiagnosisSchema.index({ icd10Code: 1, status: 1 });
DiagnosisSchema.index({ doctorId: 1, diagnosedDate: -1 });

// Virtual for full diagnosis display
DiagnosisSchema.virtual('fullDescription').get(function () {
    return `${this.icd10Code}: ${this.customDescription || this.icd10Description}`;
});

// Method to update diagnosis status
DiagnosisSchema.methods.updateStatus = function (newStatus, userId) {
    this.status = newStatus;
    this.lastModifiedBy = userId;
    this.version += 1;

    if (newStatus === 'Resolved' && !this.resolvedDate) {
        this.resolvedDate = new Date();
    }

    return this.save();
};

export const Diagnosis = mongoose.model('Diagnosis', DiagnosisSchema);
