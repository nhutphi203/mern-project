import { apiRequest } from './apiClient';

// Simple interface for medical records with fallback support
export interface MedicalRecord {
    _id: string;
    appointmentId?: string;
    
    // Patient info (can be populated object or string ID)
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        address?: string;
    } | string;
    
    // Doctor info (can be populated object or string ID)
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        specialization?: string;
        licenseNumber?: string;
    } | string;

    // Core medical data with fallbacks
    chiefComplaint?: string;
    symptoms?: string;
    diagnosis?: string;
    assessment?: string;
    treatmentPlan?: string;
    plan?: string;
    notes?: string;
    
    // Additional fields
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string[];
    medications?: string[];
    allergies?: string[];
    
    // Vital signs
    vitalSigns?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
        weight?: number;
        height?: number;
        bmi?: number;
    };

    // Record metadata
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    version?: number;
    isActive?: boolean;
}
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
        weight?: number;
        height?: number;
        bmi?: number;
    };
    physicalExamination: {
        general?: string;
        heent?: string;
        cardiovascular?: string;
        respiratory?: string;
        abdomen?: string;
        neurological?: string;
        musculoskeletal?: string;
        skin?: string;
    };

    // Clinical Assessment
    assessment: string;
    diagnosis: {
        primary: {
            code: string;
            description: string;
            icd10Code?: string;
        };
        secondary?: Array<{
            code: string;
            description: string;
            icd10Code?: string;
        }>;
    };

    // Treatment Plan
    plan: {
        medications?: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
            instructions?: string;
        }>;
        procedures?: Array<{
            name: string;
            description: string;
            scheduledDate?: string;
        }>;
        followUp?: {
            date: string;
            provider: string;
            notes?: string;
        };
        patientEducation?: string[];
        dietaryRecommendations?: string[];
        activityRestrictions?: string[];
    };

    // Lab Orders and Results
    labOrders?: Array<{
        _id: string;
        testName: string;
        status: string;
        orderDate: string;
        results?: {
            value: string;
            unit: string;
            normalRange: string;
            status: 'Normal' | 'Abnormal' | 'Critical';
        };
    }>;

    // Progress Notes
    progressNotes?: Array<{
        date: string;
        provider: string;
        note: string;
        type: 'Progress' | 'Consultation' | 'Procedure' | 'Discharge';
    }>;

    // Record Metadata
    status: 'Active' | 'Completed' | 'Cancelled';
    priority: 'Routine' | 'Urgent' | 'Emergent';
    isConfidential: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface MedicalRecordSummary {
    _id: string;
    patientName: string;
    patientId: string;
    diagnosis: string;
    icd10Code: string;
    lastUpdated: string;
    status: 'Active' | 'Resolved' | 'Under Treatment';
    doctor: string;
    priority: 'High' | 'Medium' | 'Low';
    chiefComplaint: string;
}

export interface MedicalRecordsStats {
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

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface CreateMedicalRecordRequest {
    patientId: string;
    appointmentId?: string; // ✅ FIXED: Add appointmentId support
    encounterId?: string;   // Keep for backward compatibility
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory?: string[];
    medications?: string[];
    allergies?: string[];
    socialHistory?: {
        smoking?: string;
        alcohol?: string;
        drugs?: string;
        occupation?: string;
    };
    familyHistory?: string[];
    vitalSigns?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
        weight?: number;
        height?: number;
    };
    physicalExamination?: {
        general?: string;
        heent?: string;
        cardiovascular?: string;
        respiratory?: string;
        abdomen?: string;
        neurological?: string;
        musculoskeletal?: string;
        skin?: string;
    };
    assessment: string;
    diagnosis: {
        primary: {
            code: string;
            description: string;
            icd10Code?: string;
        };
        secondary?: Array<{
            code: string;
            description: string;
            icd10Code?: string;
        }>;
    };
    plan?: {
        medications?: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
            instructions?: string;
        }>;
        procedures?: Array<{
            name: string;
            description: string;
            scheduledDate?: string;
        }>;
        followUp?: {
            date: string;
            provider: string;
            notes?: string;
        };
        patientEducation?: string[];
        dietaryRecommendations?: string[];
        activityRestrictions?: string[];
    };
    priority?: 'Routine' | 'Urgent' | 'Emergent';
    isConfidential?: boolean;
}

// API Service class
export class MedicalRecordsAPI {
    private static baseUrl = '/api/v1/medical-records';

    // Get all medical records (with role-based filtering)
    static async getAllRecords(params?: {
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        patientId?: string;
        doctorId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        success: boolean;
        data: MedicalRecord[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalRecords: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/enhanced${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<{
            success: boolean;
            data: MedicalRecord[];
            pagination: PaginationInfo;
        }>(url);
    }

    // Get records summary for dashboard
    static async getRecordsSummary(): Promise<{
        success: boolean;
        data: MedicalRecordSummary[];
        stats: MedicalRecordsStats;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecordSummary[];
            stats: MedicalRecordsStats;
        }>(`${this.baseUrl}/summary`);
    }

    // Get specific medical record by ID
    static async getRecordById(id: string): Promise<{
        success: boolean;
        data: MedicalRecord;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord;
        }>(`${this.baseUrl}/enhanced/${id}`);
    }

    // Get patient's medical records (for patient role)
    static async getMyRecords(params?: {
        page?: number;
        limit?: number;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        success: boolean;
        data: MedicalRecord[];
        pagination: PaginationInfo;
    }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/my-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<{
            success: boolean;
            data: MedicalRecord[];
            pagination: PaginationInfo;
        }>(url);
    }

    // Create new medical record
    static async createRecord(recordData: CreateMedicalRecordRequest): Promise<{
        success: boolean;
        data: MedicalRecord;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord;
            message: string;
        }>(`${this.baseUrl}/enhanced`, {
            method: 'POST',
            data: recordData,
        });
    }

    // Update medical record
    static async updateRecord(id: string, recordData: Partial<CreateMedicalRecordRequest>): Promise<{
        success: boolean;
        data: MedicalRecord;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord;
            message: string;
        }>(`${this.baseUrl}/enhanced/${id}`, {
            method: 'PUT',
            data: recordData,
        });
    }

    // Delete medical record (admin only)
    static async deleteRecord(id: string): Promise<{
        success: boolean;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            message: string;
        }>(`${this.baseUrl}/enhanced/${id}`, {
            method: 'DELETE',
        });
    }

    // Search medical records
    static async searchRecords(searchParams: {
        query?: string;
        patientName?: string;
        diagnosis?: string;
        icd10Code?: string;
        doctorName?: string;
        dateFrom?: string;
        dateTo?: string;
        status?: string;
        priority?: string;
    }): Promise<{
        success: boolean;
        data: MedicalRecord[];
        total: number;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord[];
            total: number;
        }>(`${this.baseUrl}/search`, {
            method: 'POST',
            data: searchParams,
        });
    }

    // Get medical record statistics
    static async getStatistics(): Promise<{
        success: boolean;
        data: MedicalRecordsStats;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecordsStats;
        }>(`${this.baseUrl}/statistics`);
    }

    // Add progress note to medical record
    static async addProgressNote(recordId: string, noteData: {
        note: string;
        type: 'Progress' | 'Consultation' | 'Procedure' | 'Discharge';
    }): Promise<{
        success: boolean;
        data: MedicalRecord;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord;
            message: string;
        }>(`${this.baseUrl}/enhanced/${recordId}/progress-note`, {
            method: 'POST',
            data: noteData,
        });
    }

    // Sign/approve medical record (doctor only)
    static async signRecord(recordId: string): Promise<{
        success: boolean;
        data: MedicalRecord;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: MedicalRecord;
            message: string;
        }>(`${this.baseUrl}/enhanced/${recordId}/sign`, {
            method: 'POST',
        });
    }
}

// ==========================================
// DIAGNOSIS INTERFACES
// ==========================================
export interface Diagnosis {
    _id: string;
    medicalRecordId: string;
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        specialization?: string;
    };
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    icd10Code: string;
    icd10Description: string;
    customDescription?: string;
    type: 'Primary' | 'Secondary' | 'Differential' | 'Rule Out' | 'History';
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    status: 'Active' | 'Resolved' | 'Chronic' | 'In Remission';
    confidence: 'Confirmed' | 'Probable' | 'Possible' | 'Suspected';
    onsetDate?: string;
    diagnosedDate: string;
    resolvedDate?: string;
    clinicalNotes?: string;
    complications?: Array<{
        description: string;
        date: string;
        severity: 'Minor' | 'Major' | 'Life-threatening';
    }>;
    relatedDiagnoses?: string[];
    createdBy: string;
    lastModifiedBy?: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface ICD10Code {
    code: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    commonUsage: number;
}

export interface ICD10Category {
    code: string;
    title: string;
}

export interface DiagnosisStatistics {
    topDiagnoses: Array<{
        _id: {
            code: string;
            description: string;
        };
        count: number;
        severityBreakdown: string[];
    }>;
    categoryStats: Array<{
        _id: string;
        count: number;
        avgSeverity: number;
    }>;
    totalDiagnoses: number;
}

export interface CreateDiagnosisRequest {
    icd10Code: string;
    customDescription?: string;
    type?: 'Primary' | 'Secondary' | 'Differential' | 'Rule Out' | 'History';
    severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    status?: 'Active' | 'Resolved' | 'Chronic' | 'In Remission';
    confidence?: 'Confirmed' | 'Probable' | 'Possible' | 'Suspected';
    onsetDate?: string;
    clinicalNotes?: string;
}

export interface UpdateDiagnosisRequest extends Partial<CreateDiagnosisRequest> {
    resolvedDate?: string;
    complications?: Array<{
        description: string;
        date: string;
        severity: 'Minor' | 'Major' | 'Life-threatening';
    }>;
}

// ==========================================
// DIAGNOSIS API SERVICE
// ==========================================
export class DiagnosisAPI {
    private static baseUrl = '/api/v1/diagnosis';

    // Add diagnosis to medical record
    static async addDiagnosis(medicalRecordId: string, diagnosisData: CreateDiagnosisRequest): Promise<{
        success: boolean;
        data: Diagnosis;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: Diagnosis;
            message: string;
        }>(`${this.baseUrl}/medical-record/${medicalRecordId}`, {
            method: 'POST',
            data: diagnosisData,
        });
    }

    // Get diagnoses for medical record
    static async getDiagnosesByRecord(medicalRecordId: string, params?: {
        type?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        count: number;
        data: Diagnosis[];
    }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value);
                }
            });
        }

        const url = `${this.baseUrl}/medical-record/${medicalRecordId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<{
            success: boolean;
            count: number;
            data: Diagnosis[];
        }>(url);
    }

    // Get patient's diagnosis history
    static async getPatientDiagnoses(patientId: string, params?: {
        status?: string;
        limit?: number;
        page?: number;
        icd10Category?: string;
    }): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        totalPages: number;
        data: Diagnosis[];
    }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/patient/${patientId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<{
            success: boolean;
            count: number;
            total: number;
            page: number;
            totalPages: number;
            data: Diagnosis[];
        }>(url);
    }

    // Update diagnosis
    static async updateDiagnosis(diagnosisId: string, updates: UpdateDiagnosisRequest): Promise<{
        success: boolean;
        data: Diagnosis;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            data: Diagnosis;
            message: string;
        }>(`${this.baseUrl}/${diagnosisId}`, {
            method: 'PUT',
            data: updates,
        });
    }

    // Delete diagnosis
    static async deleteDiagnosis(diagnosisId: string): Promise<{
        success: boolean;
        message: string;
    }> {
        return apiRequest<{
            success: boolean;
            message: string;
        }>(`${this.baseUrl}/${diagnosisId}`, {
            method: 'DELETE',
        });
    }

    // Search ICD-10 codes
    static async searchICD10(query: string, limit: number = 20): Promise<{
        success: boolean;
        count: number;
        data: ICD10Code[];
    }> {
        return apiRequest<{
            success: boolean;
            count: number;
            data: ICD10Code[];
        }>(`${this.baseUrl}/icd10/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    }

    // Get ICD-10 categories
    static async getICD10Categories(): Promise<{
        success: boolean;
        count: number;
        data: ICD10Category[];
    }> {
        return apiRequest<{
            success: boolean;
            count: number;
            data: ICD10Category[];
        }>(`${this.baseUrl}/icd10/categories`);
    }

    // Get frequently used ICD-10 codes
    static async getFrequentICD10(limit: number = 50): Promise<{
        success: boolean;
        count: number;
        data: ICD10Code[];
    }> {
        return apiRequest<{
            success: boolean;
            count: number;
            data: ICD10Code[];
        }>(`${this.baseUrl}/icd10/frequent?limit=${limit}`);
    }

    // Get diagnosis statistics
    static async getDiagnosisStatistics(params?: {
        dateFrom?: string;
        dateTo?: string;
        category?: string;
        doctorId?: string;
    }): Promise<{
        success: boolean;
        data: DiagnosisStatistics;
    }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value);
                }
            });
        }

        const url = `${this.baseUrl}/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<{
            success: boolean;
            data: DiagnosisStatistics;
        }>(url);
    }

    // Search diagnoses across the system
    static async searchDiagnoses(searchParams: {
        query?: string;
        patientName?: string;
        doctorName?: string;
        icd10Code?: string;
        status?: string;
        severity?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        page?: number;
    }): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        totalPages: number;
        data: Diagnosis[];
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        return apiRequest<{
            success: boolean;
            count: number;
            total: number;
            page: number;
            totalPages: number;
            data: Diagnosis[];
        }>(`${this.baseUrl}/search?${queryParams.toString()}`);
    }

    // Get diagnosis statistics
    static async getStatistics(): Promise<{
        success: boolean;
        data: {
            totalDiagnoses: number;
            activeDiagnoses: number;
            resolvedDiagnoses: number;
            topDiagnoses: Array<{
                icd10Code: string;
                icd10Description: string;
                count: number;
            }>;
            monthlyTrends: Array<{
                month: string;
                count: number;
            }>;
            statusDistribution: Array<{
                status: string;
                count: number;
                percentage: number;
            }>;
        };
    }> {
        return apiRequest<{
            success: boolean;
            data: {
                totalDiagnoses: number;
                activeDiagnoses: number;
                resolvedDiagnoses: number;
                topDiagnoses: Array<{
                    icd10Code: string;
                    icd10Description: string;
                    count: number;
                }>;
                monthlyTrends: Array<{
                    month: string;
                    count: number;
                }>;
                statusDistribution: Array<{
                    status: string;
                    count: number;
                    percentage: number;
                }>;
            };
        }>(`${this.baseUrl}/statistics`);
    }
}

// ✅ ISSUE 2 FIX: Backward compatibility types and helper function
interface LegacyMedicalRecord {
    _id?: string;
    appointmentId?: string;
    encounterId?: { _id: string; type: string; status: string; scheduledDateTime: string; };
    clinicalAssessment?: {
        chiefComplaint?: string;
        clinicalImpression?: string;
    };
    [key: string]: unknown;
}

export const mapLegacyMedicalRecord = (record: LegacyMedicalRecord): MedicalRecord => {
    return {
        _id: record._id || '',
        appointmentId: record.appointmentId || record.encounterId?._id,
        encounterId: record.encounterId,
        patientId: (record.patientId as MedicalRecord['patientId']) || {
            _id: '',
            firstName: '',
            lastName: '',
            email: ''
        },
        doctorId: (record.doctorId as MedicalRecord['doctorId']) || {
            _id: '',
            firstName: '',
            lastName: ''
        },
        // Ensure all required fields have fallbacks
        diagnosis: (record.diagnosis as MedicalRecord['diagnosis']) || {
            primary: { code: '', description: '', icd10Code: '' },
            secondary: []
        },
        chiefComplaint: record.chiefComplaint as string || record.clinicalAssessment?.chiefComplaint || '',
        historyOfPresentIllness: record.historyOfPresentIllness as string || '',
        pastMedicalHistory: record.pastMedicalHistory as string[] || [],
        medications: record.medications as string[] || [],
        allergies: record.allergies as string[] || [],
        socialHistory: record.socialHistory as MedicalRecord['socialHistory'] || {},
        familyHistory: record.familyHistory as string[] || [],
        assessment: record.assessment as string || record.clinicalAssessment?.clinicalImpression || '',
        vitalSigns: record.vitalSigns as MedicalRecord['vitalSigns'] || {},
        physicalExamination: record.physicalExamination as MedicalRecord['physicalExamination'] || {},
        plan: record.plan as MedicalRecord['plan'] || {},
        labOrders: record.labOrders as MedicalRecord['labOrders'] || [],
        progressNotes: record.progressNotes as MedicalRecord['progressNotes'] || [],
        status: record.status as MedicalRecord['status'] || 'Active',
        priority: record.priority as MedicalRecord['priority'] || 'Routine',
        isConfidential: Boolean(record.isConfidential),
        createdAt: record.createdAt as string || new Date().toISOString(),
        updatedAt: record.updatedAt as string || new Date().toISOString(),
        version: Number(record.version) || 1
    };
};

// ✅ Data transformation helper for API responses
export const transformApiResponse = (apiData: LegacyMedicalRecord[]): MedicalRecord[] => {
    return apiData.map(mapLegacyMedicalRecord);
};

// Default export
export default MedicalRecordsAPI;
