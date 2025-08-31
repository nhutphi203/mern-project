import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema({
    claimNumber: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientInsuranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientInsurance',
        required: true
    },
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Doctor
        required: true
    },
    // Claim details
    serviceDate: {
        type: Date,
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    // Diagnosis codes for claim
    diagnosisCodes: [{
        icd10Code: {
            type: String,
            required: true
        },
        description: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    // Procedure codes for claim
    procedureCodes: [{
        cptCode: {
            type: String,
            required: true
        },
        description: String,
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    // Financial details
    totalClaimAmount: {
        type: Number,
        required: true,
        min: 0
    },
    approvedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    patientResponsibility: {
        copay: {
            type: Number,
            default: 0,
            min: 0
        },
        deductible: {
            type: Number,
            default: 0,
            min: 0
        },
        coinsurance: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    // Claim status tracking
    status: {
        type: String,
        enum: [
            'Draft',
            'Submitted',
            'Under Review',
            'Approved',
            'Partially Approved',
            'Denied',
            'Paid',
            'Rejected',
            'Appeal Submitted',
            'Appeal Approved',
            'Appeal Denied',
            'Closed'
        ],
        default: 'Draft'
    },
    // Status history
    statusHistory: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        },
        reason: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],
    // Insurance response
    insuranceResponse: {
        responseDate: Date,
        explanationOfBenefits: String,
        denialReason: String,
        adjustmentReason: String,
        reimbursementRate: Number
    },
    // Prior authorization
    priorAuthorization: {
        isRequired: {
            type: Boolean,
            default: false
        },
        authorizationNumber: String,
        authorizationDate: Date,
        expirationDate: Date,
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Denied', 'Expired']
        }
    },
    // Additional information
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: String,
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for remaining balance
insuranceClaimSchema.virtual('remainingBalance').get(function () {
    return this.totalClaimAmount - this.paidAmount;
});

// Virtual for total patient responsibility
insuranceClaimSchema.virtual('totalPatientResponsibility').get(function () {
    return (this.patientResponsibility.copay || 0) +
        (this.patientResponsibility.deductible || 0) +
        (this.patientResponsibility.coinsurance || 0);
});

// Indexes for performance
insuranceClaimSchema.index({ patientId: 1, serviceDate: -1 });
insuranceClaimSchema.index({ patientInsuranceId: 1 });
insuranceClaimSchema.index({ status: 1 });
insuranceClaimSchema.index({ submissionDate: -1 });
insuranceClaimSchema.index({ 'diagnosisCodes.icd10Code': 1 });
insuranceClaimSchema.index({ 'procedureCodes.cptCode': 1 });

// Pre-save middleware to generate claim number
insuranceClaimSchema.pre('save', async function (next) {
    if (this.isNew && !this.claimNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            claimNumber: new RegExp(`^CLM-${year}`)
        });
        this.claimNumber = `CLM-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Methods
insuranceClaimSchema.methods.updateStatus = function (newStatus, reason, updatedBy, notes) {
    this.statusHistory.push({
        status: this.status,
        reason,
        updatedBy,
        notes,
        date: new Date()
    });
    this.status = newStatus;
    this.lastUpdatedBy = updatedBy;
    return this.save();
};

insuranceClaimSchema.methods.calculatePatientResponsibility = function (insuranceProvider) {
    const reimbursementRate = insuranceProvider?.contractDetails?.reimbursementRate || 80;
    const insuranceCoverage = (this.totalClaimAmount * reimbursementRate) / 100;

    this.patientResponsibility.coinsurance = this.totalClaimAmount - insuranceCoverage;
    return this.patientResponsibility;
};

export const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);
