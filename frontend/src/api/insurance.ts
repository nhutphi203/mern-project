// Insurance System API

// Utility function for API requests
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Type definitions for Insurance System
export interface InsuranceProvider {
    _id: string;
    providerName: string;
    providerCode: string;
    contactInfo: {
        phone?: string;
        email?: string;
        website?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
        };
    };
    contractDetails: {
        contractNumber?: string;
        effectiveDate?: string;
        expirationDate?: string;
        reimbursementRate: number;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PatientInsurance {
    _id: string;
    patientId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    insuranceProviderId: string | InsuranceProvider;
    policyNumber: string;
    groupNumber?: string;
    subscriberName: string;
    subscriberDOB?: string;
    relationship: 'Self' | 'Spouse' | 'Child' | 'Other';
    effectiveDate: string;
    expirationDate?: string;
    copayAmount: number;
    deductibleAmount: number;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InsuranceClaim {
    _id: string;
    claimNumber: string;
    patientId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        dateOfBirth?: string;
    };
    patientInsuranceId: string | PatientInsurance;
    medicalRecordId: string;
    invoiceId: string;
    providerId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        specialization?: string;
    };
    serviceDate: string;
    submissionDate: string;
    diagnosisCodes: Array<{
        icd10Code: string;
        description?: string;
        isPrimary: boolean;
    }>;
    procedureCodes: Array<{
        cptCode: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
    }>;
    totalClaimAmount: number;
    approvedAmount: number;
    paidAmount: number;
    patientResponsibility: {
        copay: number;
        deductible: number;
        coinsurance: number;
    };
    status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' |
    'Denied' | 'Paid' | 'Rejected' | 'Appeal Submitted' | 'Appeal Approved' |
    'Appeal Denied' | 'Closed';
    statusHistory: Array<{
        status: string;
        date: string;
        reason?: string;
        updatedBy?: {
            _id: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        notes?: string;
    }>;
    insuranceResponse?: {
        responseDate?: string;
        explanationOfBenefits?: string;
        denialReason?: string;
        adjustmentReason?: string;
        reimbursementRate?: number;
    };
    priorAuthorization?: {
        isRequired: boolean;
        authorizationNumber?: string;
        authorizationDate?: string;
        expirationDate?: string;
        status?: 'Pending' | 'Approved' | 'Denied' | 'Expired';
    };
    attachments?: Array<{
        filename: string;
        originalName: string;
        path: string;
        mimeType: string;
        size: number;
        uploadedAt: string;
    }>;
    notes?: string;
    submittedBy: string | {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    lastUpdatedBy?: string | {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    remainingBalance?: number;
    totalPatientResponsibility?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInsuranceClaimRequest {
    patientId: string;
    patientInsuranceId: string;
    medicalRecordId: string;
    invoiceId: string;
    serviceDate: string;
    diagnosisCodes: Array<{
        icd10Code: string;
        description?: string;
        isPrimary: boolean;
    }>;
    procedureCodes: Array<{
        cptCode: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
    }>;
    totalClaimAmount: number;
    priorAuthorization?: {
        isRequired: boolean;
        authorizationNumber?: string;
        authorizationDate?: string;
        expirationDate?: string;
        status?: 'Pending' | 'Approved' | 'Denied' | 'Expired';
    };
    notes?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    totalRecords?: number;
    page?: number;
    totalPages?: number;
}

// Insurance Claims API Class
export class InsuranceClaimsAPI {
    private static baseUrl = '/api/v1/insurance';

    private static getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Create a new insurance claim
    static async createClaim(claimData: CreateInsuranceClaimRequest): Promise<ApiResponse<InsuranceClaim>> {
        return apiRequest<ApiResponse<InsuranceClaim>>(`${this.baseUrl}/claims`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(claimData)
        });
    }

    // Get all insurance claims with filtering
    static async getClaims(params?: {
        page?: number;
        limit?: number;
        status?: string;
        patientId?: string;
        patientName?: string;
        claimNumber?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<ApiResponse<InsuranceClaim[]>> {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/claims${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<ApiResponse<InsuranceClaim[]>>(url, {
            headers: this.getHeaders()
        });
    }

    // Get single insurance claim by ID
    static async getClaimById(claimId: string): Promise<ApiResponse<InsuranceClaim>> {
        return apiRequest<ApiResponse<InsuranceClaim>>(`${this.baseUrl}/claims/${claimId}`, {
            headers: this.getHeaders()
        });
    }

    // Update insurance claim
    static async updateClaim(
        claimId: string,
        updateData: Partial<CreateInsuranceClaimRequest> & {
            status?: string;
            statusReason?: string;
            statusNotes?: string;
        }
    ): Promise<ApiResponse<InsuranceClaim>> {
        return apiRequest<ApiResponse<InsuranceClaim>>(`${this.baseUrl}/claims/${claimId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(updateData)
        });
    }

    // Submit claim to insurance
    static async submitClaim(claimId: string): Promise<ApiResponse<InsuranceClaim>> {
        return apiRequest<ApiResponse<InsuranceClaim>>(`${this.baseUrl}/claims/${claimId}/submit`, {
            method: 'PATCH',
            headers: this.getHeaders()
        });
    }

    // Update claim status (Insurance Staff only)
    static async updateClaimStatus(
        claimId: string,
        statusData: {
            status: string;
            reason?: string;
            notes?: string;
            insuranceResponse?: {
                responseDate?: string;
                explanationOfBenefits?: string;
                denialReason?: string;
                adjustmentReason?: string;
                reimbursementRate?: number;
                approvedAmount?: number;
                paidAmount?: number;
            };
        }
    ): Promise<ApiResponse<InsuranceClaim>> {
        return apiRequest<ApiResponse<InsuranceClaim>>(`${this.baseUrl}/claims/${claimId}/status`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(statusData)
        });
    }

    // Delete/Cancel insurance claim
    static async deleteClaim(claimId: string): Promise<ApiResponse<void>> {
        return apiRequest<ApiResponse<void>>(`${this.baseUrl}/claims/${claimId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }

    // Get insurance claims statistics
    static async getStatistics(params?: {
        dateFrom?: string;
        dateTo?: string;
        providerId?: string;
    }): Promise<ApiResponse<{
        totalClaims: number;
        approvalRate: number;
        statusDistribution: Array<{
            _id: string;
            count: number;
        }>;
        financialSummary: {
            totalClaimAmount: number;
            totalApproved: number;
            totalPaid: number;
            avgClaimAmount: number;
            avgProcessingTime: number;
        };
        monthlyTrends: Array<{
            month: string;
            count: number;
            totalAmount: number;
        }>;
        topDiagnoses: Array<{
            _id: string;
            description: string;
            count: number;
        }>;
        topProcedures: Array<{
            _id: string;
            description: string;
            count: number;
            totalRevenue: number;
        }>;
    }>> {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/claims/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest<ApiResponse<{
            totalClaims: number;
            approvalRate: number;
            statusDistribution: Array<{
                _id: string;
                count: number;
            }>;
            financialSummary: {
                totalClaimAmount: number;
                totalApproved: number;
                totalPaid: number;
                avgClaimAmount: number;
                avgProcessingTime: number;
            };
            monthlyTrends: Array<{
                month: string;
                count: number;
                totalAmount: number;
            }>;
            topDiagnoses: Array<{
                _id: string;
                description: string;
                count: number;
            }>;
            topProcedures: Array<{
                _id: string;
                description: string;
                count: number;
                totalRevenue: number;
            }>;
        }>>(url, {
            headers: this.getHeaders()
        });
    }
}

// Patient Insurance API (for managing patient insurance information)
export class PatientInsuranceAPI {
    private static baseUrl = '/api/v1/patients'; // Assuming this endpoint exists

    private static getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Get patient insurance information
    static async getPatientInsurance(patientId: string): Promise<ApiResponse<PatientInsurance[]>> {
        return apiRequest<ApiResponse<PatientInsurance[]>>(`${this.baseUrl}/${patientId}/insurance`, {
            headers: this.getHeaders()
        });
    }

    // Add insurance to patient
    static async addPatientInsurance(
        patientId: string,
        insuranceData: Omit<PatientInsurance, '_id' | 'patientId' | 'createdAt' | 'updatedAt'>
    ): Promise<ApiResponse<PatientInsurance>> {
        return apiRequest<ApiResponse<PatientInsurance>>(`${this.baseUrl}/${patientId}/insurance`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(insuranceData)
        });
    }

    // Update patient insurance
    static async updatePatientInsurance(
        patientId: string,
        insuranceId: string,
        updateData: Partial<PatientInsurance>
    ): Promise<ApiResponse<PatientInsurance>> {
        return apiRequest<ApiResponse<PatientInsurance>>(`${this.baseUrl}/${patientId}/insurance/${insuranceId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(updateData)
        });
    }

    // Delete patient insurance
    static async deletePatientInsurance(patientId: string, insuranceId: string): Promise<ApiResponse<void>> {
        return apiRequest<ApiResponse<void>>(`${this.baseUrl}/${patientId}/insurance/${insuranceId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }
}

// Insurance Provider API (for managing insurance providers)
export class InsuranceProviderAPI {
    private static baseUrl = '/api/v1/insurance-providers'; // Assuming this endpoint exists

    private static getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Get all insurance providers
    static async getProviders(): Promise<ApiResponse<InsuranceProvider[]>> {
        return apiRequest<ApiResponse<InsuranceProvider[]>>(this.baseUrl, {
            headers: this.getHeaders()
        });
    }

    // Get active insurance providers
    static async getActiveProviders(): Promise<ApiResponse<InsuranceProvider[]>> {
        return apiRequest<ApiResponse<InsuranceProvider[]>>(`${this.baseUrl}?isActive=true`, {
            headers: this.getHeaders()
        });
    }

    // Search insurance providers
    static async searchProviders(query: string): Promise<ApiResponse<InsuranceProvider[]>> {
        return apiRequest<ApiResponse<InsuranceProvider[]>>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
            headers: this.getHeaders()
        });
    }
}
