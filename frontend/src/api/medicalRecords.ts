import { apiRequest } from './apiClient';

// Types for Medical Records
export interface MedicalRecord {
    _id: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        address?: string;
        insuranceInfo?: {
            provider: string;
            policyNumber: string;
            groupNumber?: string;
        };
    };
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        specialization?: string;
        licenseNumber?: string;
    };
    encounterId?: {
        _id: string;
        type: string;
        status: string;
        scheduledDateTime: string;
    };

    // Medical Record Details
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory: string[];
    medications: string[];
    allergies: string[];
    socialHistory: {
        smoking?: string;
        alcohol?: string;
        drugs?: string;
        occupation?: string;
    };
    familyHistory: string[];

    // Physical Examination
    vitalSigns: {
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
    encounterId?: string;
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

// Default export
export default MedicalRecordsAPI;
