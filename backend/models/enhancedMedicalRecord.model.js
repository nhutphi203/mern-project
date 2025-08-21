// Enhanced Medical Record Schema with ICD-10 and CPOE integration
import mongoose from "mongoose";

// Diagnosis Schema with ICD-10 integration
const diagnosisSchema = new mongoose.Schema({
    icd10Code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    icd10Description: {
        type: String,
        required: true
    },
    diagnosisType: {
        type: String,
        enum: ['Primary', 'Secondary', 'Differential', 'Rule Out', 'History'],
        required: true
    },
    clinicalNotes: String,
    severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe', 'Critical'],
        default: 'Moderate'
    },
    onsetDate: Date,
    resolvedDate: Date,
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'Chronic', 'In Remission'],
        default: 'Active'
    },
    confidence: {
        type: String,
        enum: ['Confirmed', 'Probable', 'Possible', 'Suspected'],
        default: 'Confirmed'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Treatment Plan Schema integrated with CPOE
const treatmentPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true
    },
    planType: {
        type: String,
        enum: ['Medication', 'Procedure', 'Therapy', 'Surgery', 'Monitoring', 'Lifestyle'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    objectives: [String],

    // CPOE Integration
    cpoeOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CPOE'
    },

    // Treatment details
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    duration: String,
    frequency: String,
    dosage: String,
    instructions: String,

    // Progress tracking
    status: {
        type: String,
        enum: ['Planned', 'Active', 'Completed', 'Discontinued', 'On Hold'],
        default: 'Planned'
    },
    progress: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Improving', 'Stable', 'Declining', 'Completed'],
        default: 'Not Started'
    },
    effectivenessRating: {
        type: Number,
        min: 1,
        max: 5
    },

    // Clinical outcomes
    outcomes: [{
        date: Date,
        outcome: String,
        measuredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Side effects or complications
    adverseEvents: [{
        date: Date,
        event: String,
        severity: {
            type: String,
            enum: ['Mild', 'Moderate', 'Severe']
        },
        resolved: Boolean
    }],

    prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { _id: true, timestamps: true });

// Clinical Assessment Schema
const clinicalAssessmentSchema = new mongoose.Schema({
    // Chief Complaint
    chiefComplaint: {
        type: String,
        required: true
    },

    // History of Present Illness
    historyOfPresentIllness: {
        type: String,
        required: true
    },

    // Review of Systems
    reviewOfSystems: {
        constitutional: String,
        cardiovascular: String,
        respiratory: String,
        gastrointestinal: String,
        genitourinary: String,
        musculoskeletal: String,
        neurological: String,
        psychiatric: String,
        endocrine: String,
        hematologic: String,
        allergic: String
    },

    // Physical Examination
    physicalExam: {
        vitalSigns: {
            bloodPressure: String,
            heartRate: Number,
            temperature: Number,
            respiratoryRate: Number,
            oxygenSaturation: Number,
            weight: Number,
            height: Number,
            bmi: Number
        },
        generalAppearance: String,
        head: String,
        eyes: String,
        ears: String,
        nose: String,
        throat: String,
        neck: String,
        chest: String,
        heart: String,
        abdomen: String,
        extremities: String,
        neurological: String,
        skin: String
    },

    // Assessment and Plan
    clinicalImpression: String,
    differentialDiagnosis: [String],

    assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { _id: false, timestamps: true });

// Medical Record Version Schema for tracking changes
const medicalRecordVersionSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true,
    },

    // Snapshot of data at time of version
    diagnoses: [diagnosisSchema],
    treatmentPlans: [treatmentPlanSchema],
    clinicalAssessment: clinicalAssessmentSchema,

    // Version metadata
    changeReason: String,
    changedFields: [String],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

// Enhanced Medical Record Schema
const enhancedMedicalRecordSchema = new mongoose.Schema({
    // Core references
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    encounterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encounter',
        required: true,
        index: true
    },

    // Clinical Data
    clinicalAssessment: clinicalAssessmentSchema,

    // Diagnoses with ICD-10
    diagnoses: [diagnosisSchema],

    // Treatment Plans with CPOE integration
    treatmentPlans: [treatmentPlanSchema],

    // Associated Orders
    cpoeOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CPOE'
    }],

    // Lab and Imaging Results
    labResults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabResult'
    }],
    radiologyResults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RadiologyResult'
    }],

    // Document attachments (existing functionality)
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        cloudinary_id: String,
        description: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Clinical notes and observations
    progressNotes: [{
        noteType: {
            type: String,
            enum: ['Progress', 'Consultation', 'Procedure', 'Discharge', 'Follow-up'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        authorRole: String,
        isConfidential: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Follow-up and care coordination
    followUpPlan: {
        nextAppointment: Date,
        followUpInstructions: String,
        warningSignsToWatch: [String],
        emergencyContacts: String,
        medicationReconciliation: Boolean,
        dischargeInstructions: String
    },

    // Quality and compliance
    qualityMetrics: {
        diagnosticAccuracy: Number,
        treatmentEffectiveness: Number,
        patientSatisfaction: Number,
        adherenceToGuidelines: Boolean,
        timeToTreatment: Number // minutes
    },

    // Record status and workflow
    recordStatus: {
        type: String,
        enum: ['Draft', 'In Progress', 'Completed', 'Reviewed', 'Finalized', 'Amended'],
        default: 'Draft'
    },

    // Version control
    currentVersion: {
        type: Number,
        default: 1
    },
    versions: [medicalRecordVersionSchema],

    // Compliance and signatures
    electronicSignature: {
        signedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        signedAt: Date,
        signatureHash: String,
        ipAddress: String
    },

    // Audit trail
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: Date,

    // Privacy and security
    accessLog: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
            enum: ['View', 'Edit', 'Print', 'Export', 'Share']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String
    }]

}, {
    timestamps: true,
    collection: 'medical_records'
});

// Indexes for performance
enhancedMedicalRecordSchema.index({ patientId: 1, createdAt: -1 });
enhancedMedicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
enhancedMedicalRecordSchema.index({ 'diagnoses.icd10Code': 1 });
enhancedMedicalRecordSchema.index({ recordStatus: 1 });

// Virtual fields
enhancedMedicalRecordSchema.virtual('primaryDiagnosis').get(function () {
    return this.diagnoses.find(d => d.diagnosisType === 'Primary');
});

enhancedMedicalRecordSchema.virtual('activeTreatments').get(function () {
    return this.treatmentPlans.filter(t => t.status === 'Active');
});

// Instance methods
enhancedMedicalRecordSchema.methods.addDiagnosis = function (diagnosisData, userId) {
    diagnosisData.addedBy = userId;
    this.diagnoses.push(diagnosisData);
    this.lastModifiedBy = userId;
    this.lastModifiedAt = new Date();
    return this.save();
};

enhancedMedicalRecordSchema.methods.addTreatmentPlan = function (treatmentData, userId) {
    treatmentData.prescribedBy = userId;
    this.treatmentPlans.push(treatmentData);
    this.lastModifiedBy = userId;
    this.lastModifiedAt = new Date();
    return this.save();
};

enhancedMedicalRecordSchema.methods.addProgressNote = function (noteData, userId, userRole) {
    noteData.author = userId;
    noteData.authorRole = userRole;
    this.progressNotes.push(noteData);
    this.lastModifiedBy = userId;
    this.lastModifiedAt = new Date();
    return this.save();
};

enhancedMedicalRecordSchema.methods.logAccess = function (userId, action, ipAddress) {
    this.accessLog.push({
        userId,
        action,
        ipAddress,
        timestamp: new Date()
    });
    return this.save();
};

enhancedMedicalRecordSchema.methods.signRecord = function (userId, ipAddress) {
    this.electronicSignature = {
        signedBy: userId,
        signedAt: new Date(),
        signatureHash: `signature_${Date.now()}_${userId}`, // Simple hash - implement proper crypto
        ipAddress
    };
    this.recordStatus = 'Finalized';
    return this.save();
};

// Pre-save middleware for version control
enhancedMedicalRecordSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.currentVersion += 1;
        this.lastModifiedAt = new Date();
    }
    next();
});

export const EnhancedMedicalRecord = mongoose.model("EnhancedMedicalRecord", enhancedMedicalRecordSchema);
