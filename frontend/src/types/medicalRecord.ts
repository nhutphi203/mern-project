// Enhanced Medical Record TypeScript Interfaces - CRITICAL FIXES

export interface PatientInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}

export interface DoctorInfo {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    licenseNumber?: string;
    department?: string;
}

export interface AppointmentInfo {
    _id: string;
    appointment_date: string;
    status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
    department?: string;
    appointmentType?: string;
}

export interface EncounterInfo {
    _id: string;
    type: string;
    status: string;
    scheduledDateTime: string;
}

export interface DiagnosisInfo {
    code: string;
    description: string;
    icd10Code: string;
    diagnosisType?: 'Primary' | 'Secondary' | 'Differential' | 'Rule Out' | 'History';
    severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    status?: 'Active' | 'Resolved' | 'Chronic' | 'In Remission';
    onsetDate?: string;
    resolvedDate?: string;
    confidence?: 'Confirmed' | 'Probable' | 'Possible' | 'Suspected';
}

export interface MedicationInfo {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    prescribedDate?: string;
    status?: 'Active' | 'Completed' | 'Discontinued';
}

export interface ProcedureInfo {
    name: string;
    description: string;
    scheduledDate?: string;
    completedDate?: string;
    status?: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    measuredAt?: string;
}

export interface PhysicalExamination {
    general?: string;
    heent?: string; // Head, Eyes, Ears, Nose, Throat
    cardiovascular?: string;
    respiratory?: string;
    abdomen?: string;
    neurological?: string;
    musculoskeletal?: string;
    skin?: string;
    extremities?: string;
}

export interface ClinicalAssessment {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems?: {
        constitutional?: string;
        cardiovascular?: string;
        respiratory?: string;
        gastrointestinal?: string;
        genitourinary?: string;
        musculoskeletal?: string;
        neurological?: string;
        psychiatric?: string;
        endocrine?: string;
        hematologic?: string;
        allergic?: string;
    };
    physicalExam?: {
        vitalSigns?: VitalSigns;
        generalAppearance?: string;
        head?: string;
        eyes?: string;
        ears?: string;
        nose?: string;
        throat?: string;
        neck?: string;
        chest?: string;
        heart?: string;
        abdomen?: string;
        extremities?: string;
        neurological?: string;
        skin?: string;
    };
    clinicalImpression?: string;
    differentialDiagnosis?: string[];
    assessedBy?: string;
    assessedDate?: string;
}

export interface TreatmentPlan {
    medications: MedicationInfo[];
    procedures: ProcedureInfo[];
    followUp?: {
        date?: string;
        provider?: string;
        notes?: string;
    };
    patientEducation: string[];
    dietaryRecommendations: string[];
    activityRestrictions: string[];
}

export interface LabOrder {
    _id?: string;
    testName: string;
    testCode?: string;
    priority?: 'Routine' | 'Urgent' | 'STAT';
    status?: 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';
    orderedDate?: string;
    scheduledDate?: string;
    completedDate?: string;
    results?: string;
    notes?: string;
}

export interface ProgressNote {
    date: string;
    provider: string;
    note: string;
    type: 'Progress' | 'Consultation' | 'Procedure' | 'Discharge' | 'Follow-up';
}

// MAIN INTERFACE - FIXED FOR CRITICAL ISSUES
export interface EnhancedMedicalRecord {
    _id: string;

    // ISSUE 1 FIX: Support both appointmentId and encounterId
    appointmentId?: string | AppointmentInfo; // NEW: Primary appointment reference
    encounterId?: string | EncounterInfo;     // LEGACY: Backward compatibility

    // Core patient and provider info
    patientId: string | PatientInfo;
    doctorId: string | DoctorInfo;          // ISSUE 1 FIX: Consistent doctorId field

    // Clinical data - ISSUE 2 FIX: Proper structure
    clinicalAssessment: ClinicalAssessment;

    // Legacy flat fields for backward compatibility
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string[];
    medications?: string[];
    allergies?: string[];
    socialHistory?: Record<string, string | number | boolean>;
    familyHistory?: string[];
    vitalSigns?: VitalSigns;
    physicalExamination?: PhysicalExamination;
    assessment?: string;

    // ISSUE 2 FIX: Structured diagnosis with proper ICD-10 support
    diagnosis: {
        primary: DiagnosisInfo;
        secondary: DiagnosisInfo[];
    };

    // Treatment and care plan
    plan: TreatmentPlan;
    labOrders?: LabOrder[];
    progressNotes: ProgressNote[];

    // Record metadata - ISSUE 3 FIX: Consistent status mapping
    status: 'Draft' | 'Active' | 'Completed' | 'Under Treatment' | 'Resolved';
    priority: 'Low' | 'Routine' | 'Medium' | 'High' | 'Urgent' | 'Critical';
    isConfidential?: boolean;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    version?: number;

    // Electronic signature
    electronicSignature?: {
        signedBy?: string;
        signedAt?: string;
        signatureHash?: string;
        ipAddress?: string;
    };

    // Record status
    recordStatus?: 'Draft' | 'In Progress' | 'Completed' | 'Reviewed' | 'Finalized' | 'Amended';
}

// API Response interfaces
export interface MedicalRecordResponse {
    success: boolean;
    data: EnhancedMedicalRecord | EnhancedMedicalRecord[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    message?: string;
}

export interface MedicalRecordStats {
    totalRecords: number;
    activeCases: number;
    resolvedToday: number;
    pendingReview: number;
    recentActivity: {
        created: number;
        updated: number;
        reviewed: number;
    };
}

export interface MedicalRecordStatsResponse {
    success: boolean;
    data: MedicalRecordStats;
}

// Search interfaces
export interface MedicalRecordSearchParams {
    query?: string;
    patientName?: string;
    diagnosis?: string;
    icd10Code?: string;
    doctorName?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
}

export interface MedicalRecordFilters {
    status?: string;
    priority?: string;
    patientId?: string;
    doctorId?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Create/Update interfaces
export interface CreateMedicalRecordRequest {
    appointmentId?: string;     // ISSUE 1 FIX: Primary field
    encounterId?: string;       // LEGACY: Backward compatibility
    patientId: string;
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    clinicalAssessment?: Partial<ClinicalAssessment>;
    diagnosis?: {
        primary?: Partial<DiagnosisInfo>;
        secondary?: Partial<DiagnosisInfo>[];
    };
    plan?: Partial<TreatmentPlan>;
    vitalSigns?: VitalSigns;
    physicalExamination?: PhysicalExamination;
}

export interface UpdateMedicalRecordRequest extends Partial<CreateMedicalRecordRequest> {
    _id: string;
}

// Data transformation helpers - ISSUE 2 FIX
export const mapLegacyMedicalRecord = (record: Partial<EnhancedMedicalRecord> & Record<string, unknown>): EnhancedMedicalRecord => {
    return {
        // Required fields with defaults
        _id: record._id || '',
        patientId: record.patientId || '',
        doctorId: record.doctorId || '',
        chiefComplaint: record.chiefComplaint || '',
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: record.updatedAt || new Date().toISOString(),

        // Spread the rest of the record
        ...record,

        // ISSUE 1 FIX: Map encounterId to appointmentId if appointmentId is missing
        appointmentId: record.appointmentId || (typeof record.encounterId === 'string' ? record.encounterId : record.encounterId?._id),

        // ISSUE 2 FIX: Ensure diagnosis structure exists
        diagnosis: record.diagnosis || {
            primary: { code: '', description: '', icd10Code: '' },
            secondary: []
        },

        // ISSUE 2 FIX: Map legacy status to new status values
        status: mapRecordStatus(record.status || record.recordStatus),

        // ISSUE 2 FIX: Ensure required clinical assessment
        clinicalAssessment: record.clinicalAssessment || {
            chiefComplaint: record.chiefComplaint || '',
            historyOfPresentIllness: record.historyOfPresentIllness || ''
        },

        // ISSUE 2 FIX: Ensure treatment plan structure
        plan: record.plan || {
            medications: [],
            procedures: [],
            patientEducation: [],
            dietaryRecommendations: [],
            activityRestrictions: []
        },

        // Default values for required fields
        progressNotes: record.progressNotes || [],
        priority: record.priority || 'Routine'
    };
};

export const mapRecordStatus = (status: string): EnhancedMedicalRecord['status'] => {
    switch (status) {
        case 'Finalized':
        case 'Completed':
            return 'Completed';
        case 'In Progress':
        case 'Active':
            return 'Active';
        case 'Under Treatment':
            return 'Under Treatment';
        case 'Resolved':
            return 'Resolved';
        case 'Draft':
        default:
            return 'Draft';
    }
};

// Validation helpers
export const validateMedicalRecord = (record: CreateMedicalRecordRequest): string[] => {
    const errors: string[] = [];

    if (!record.patientId) {
        errors.push('Patient ID is required');
    }

    if (!record.appointmentId && !record.encounterId) {
        errors.push('Either appointmentId or encounterId is required');
    }

    if (!record.chiefComplaint || record.chiefComplaint.trim().length === 0) {
        errors.push('Chief complaint is required');
    }

    return errors;
};

export default EnhancedMedicalRecord;
