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

    // Enhanced Workflow System
    workflowStatus: {
        currentStep: {
            type: String,
            enum: ['draft', 'doctor_review', 'nurse_verify', 'billing_review', 'insurance_process', 'finalized', 'archived'],
            default: 'draft'
        },
        nextSteps: [{
            step: String,
            allowedRoles: [String],
            conditions: mongoose.Schema.Types.Mixed
        }],
        stepHistory: [{
            step: String,
            previousStep: String,
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            performedAt: {
                type: Date,
                default: Date.now
            },
            action: String,
            comments: String,
            metadata: mongoose.Schema.Types.Mixed
        }],
        workflowType: {
            type: String,
            enum: ['standard', 'emergency', 'insurance_required', 'complex_case'],
            default: 'standard'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        blockers: [{
            type: String,
            reason: String,
            blockedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            blockedAt: Date,
            resolvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            resolvedAt: Date
        }],
        estimatedCompletionTime: Date,
        actualCompletionTime: Date
    },

    // Role-based Access Control for Workflow
    accessControl: {
        currentOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedTo: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: String,
            assignedAt: Date,
            deadline: Date
        }],
        permissions: {
            canRead: [String], // roles that can read
            canEdit: [String], // roles that can edit
            canApprove: [String], // roles that can approve
            canReject: [String] // roles that can reject
        }
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
    }],

    // Active status for soft delete
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }

}, {
    timestamps: true,
    collection: 'medical_records'
});

// ===== WORKFLOW METHODS =====

// Workflow transition method
enhancedMedicalRecordSchema.methods.transitionTo = function(newStep, userId, action = 'advance', comments = '') {
    const oldStep = this.workflowStatus.currentStep;
    
    // Add to step history
    this.workflowStatus.stepHistory.push({
        step: newStep,
        previousStep: oldStep,
        performedBy: userId,
        action: action,
        comments: comments,
        performedAt: new Date()
    });
    
    // Update current step
    this.workflowStatus.currentStep = newStep;
    
    // Update record status based on workflow step
    switch(newStep) {
        case 'draft':
            this.recordStatus = 'Draft';
            break;
        case 'doctor_review':
        case 'nurse_verify':
            this.recordStatus = 'In Progress';
            break;
        case 'billing_review':
        case 'insurance_process':
            this.recordStatus = 'Completed';
            break;
        case 'finalized':
            this.recordStatus = 'Finalized';
            this.workflowStatus.actualCompletionTime = new Date();
            break;
        case 'archived':
            this.recordStatus = 'Amended';
            break;
    }
    
    return this.save();
};

// Check if user can perform action on current step
enhancedMedicalRecordSchema.methods.canUserPerformAction = function(userId, userRole, action) {
    // Check if user is assigned to this record
    const assignment = this.accessControl.assignedTo.find(a => a.user.toString() === userId.toString());
    if (!assignment) return false;
    
    // Check role permissions
    switch(action) {
        case 'read':
            return this.accessControl.permissions.canRead.includes(userRole);
        case 'edit':
            return this.accessControl.permissions.canEdit.includes(userRole);
        case 'approve':
            return this.accessControl.permissions.canApprove.includes(userRole);
        case 'reject':
            return this.accessControl.permissions.canReject.includes(userRole);
        default:
            return false;
    }
};

// Get next available steps for current user
enhancedMedicalRecordSchema.methods.getNextStepsForUser = function(userRole) {
    return this.workflowStatus.nextSteps.filter(step => 
        step.allowedRoles.includes(userRole)
    );
};

// Add workflow blocker
enhancedMedicalRecordSchema.methods.addBlocker = function(type, reason, userId) {
    this.workflowStatus.blockers.push({
        type: type,
        reason: reason,
        blockedBy: userId,
        blockedAt: new Date()
    });
    return this.save();
};

// Resolve workflow blocker
enhancedMedicalRecordSchema.methods.resolveBlocker = function(blockerId, userId) {
    const blocker = this.workflowStatus.blockers.id(blockerId);
    if (blocker) {
        blocker.resolvedBy = userId;
        blocker.resolvedAt = new Date();
    }
    return this.save();
};

// Static method to get records by workflow step
enhancedMedicalRecordSchema.statics.getByWorkflowStep = function(step, userRole = null) {
    const query = { 'workflowStatus.currentStep': step };
    if (userRole) {
        query['accessControl.permissions.canRead'] = userRole;
    }
    return this.find(query).populate('patient doctor').populate('accessControl.currentOwner');
};

// Virtual for workflow completion percentage
enhancedMedicalRecordSchema.virtual('workflowProgress').get(function() {
    const steps = ['draft', 'doctor_review', 'nurse_verify', 'billing_review', 'insurance_process', 'finalized'];
    const currentIndex = steps.indexOf(this.workflowStatus.currentStep);
    return Math.round(((currentIndex + 1) / steps.length) * 100);
});

// Pre-save middleware to update workflow next steps
enhancedMedicalRecordSchema.pre('save', function(next) {
    if (this.isModified('workflowStatus.currentStep')) {
        this.updateNextSteps();
    }
    next();
});

// Method to update next steps based on current step and workflow type
enhancedMedicalRecordSchema.methods.updateNextSteps = function() {
    const currentStep = this.workflowStatus.currentStep;
    const workflowType = this.workflowStatus.workflowType;
    
    // Clear current next steps
    this.workflowStatus.nextSteps = [];
    
    // Define next steps based on current step
    switch(currentStep) {
        case 'draft':
            this.workflowStatus.nextSteps.push({
                step: 'doctor_review',
                allowedRoles: ['doctor', 'admin'],
                conditions: { hasPatientData: true }
            });
            break;
        
        case 'doctor_review':
            this.workflowStatus.nextSteps.push({
                step: 'nurse_verify',
                allowedRoles: ['nurse', 'admin'],
                conditions: { doctorApproved: true }
            });
            if (workflowType === 'emergency') {
                this.workflowStatus.nextSteps.push({
                    step: 'finalized',
                    allowedRoles: ['doctor', 'admin'],
                    conditions: { emergencyOverride: true }
                });
            }
            break;
        
        case 'nurse_verify':
            this.workflowStatus.nextSteps.push({
                step: 'billing_review',
                allowedRoles: ['billing_staff', 'admin'],
                conditions: { nurseVerified: true }
            });
            break;
        
        case 'billing_review':
            if (workflowType === 'insurance_required') {
                this.workflowStatus.nextSteps.push({
                    step: 'insurance_process',
                    allowedRoles: ['insurance_staff', 'admin'],
                    conditions: { billingApproved: true }
                });
            } else {
                this.workflowStatus.nextSteps.push({
                    step: 'finalized',
                    allowedRoles: ['billing_staff', 'admin'],
                    conditions: { billingApproved: true }
                });
            }
            break;
        
        case 'insurance_process':
            this.workflowStatus.nextSteps.push({
                step: 'finalized',
                allowedRoles: ['insurance_staff', 'admin'],
                conditions: { insuranceApproved: true }
            });
            break;
        
        case 'finalized':
            this.workflowStatus.nextSteps.push({
                step: 'archived',
                allowedRoles: ['admin'],
                conditions: { retentionPeriodExpired: true }
            });
            break;
    }
};

// Index for efficient workflow queries
enhancedMedicalRecordSchema.index({ 'workflowStatus.currentStep': 1 });
enhancedMedicalRecordSchema.index({ 'accessControl.assignedTo.user': 1 });
enhancedMedicalRecordSchema.index({ 'workflowStatus.priority': 1 });
enhancedMedicalRecordSchema.index({ 'workflowStatus.estimatedCompletionTime': 1 });

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
export default EnhancedMedicalRecord;
