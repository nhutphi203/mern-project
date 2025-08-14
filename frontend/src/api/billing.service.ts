// frontend/src/api/billing.service.ts

import { Invoice } from './billing.types.ts';

const API_BASE = '/api/v1/billing';

export const billingService = {
    // Create invoice from encounter
    async createInvoice(invoiceData: {
        encounterId: string;
        patientId: string;
        appointmentId: string;
        consultationFee?: number;
        labOrders?: string[];
        prescriptions?: string[];
        procedures?: Array<{
            description: string;
            code: string;
            quantity: number;
            unitPrice: number;
        }>;
        additionalItems?: Array<{
            type: string;
            description: string;
            serviceCode: string;
            quantity: number;
            unitPrice: number;
        }>;
    }): Promise<{ success: boolean; message: string; invoice: Invoice }> {
        const response = await fetch(`${API_BASE}/invoices`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create invoice');
        }

        return response.json();
    },

    // Get all invoices with filtering
    async getAllInvoices(params?: {
        status?: string;
        patientId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        invoices: Invoice[];
        count: number;
        total: number;
        currentPage: number;
        totalPages: number;
    }> {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.patientId) searchParams.append('patientId', params.patientId);
        if (params?.startDate) searchParams.append('startDate', params.startDate);
        if (params?.endDate) searchParams.append('endDate', params.endDate);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_BASE}/invoices?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invoices');
        }

        return response.json();
    },

    // Get invoice by ID
    async getInvoiceById(id: string): Promise<{ success: boolean; invoice: Invoice }> {
        const response = await fetch(`${API_BASE}/invoices/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invoice');
        }

        return response.json();
    },

    // Process payment
    async processPayment(
        invoiceId: string,
        paymentData: {
            method: 'Cash' | 'Card' | 'Transfer' | 'Check';
            amount: number;
            transactionId?: string;
            cardLast4?: string;
            notes?: string;
        }
    ): Promise<{
        success: boolean;
        message: string;
        invoice: {
            invoiceNumber: string;
            totalAmount: number;
            totalPaid: number;
            balance: number;
            status: string;
        };
    }> {
        const response = await fetch(`${API_BASE}/invoices/${invoiceId}/payments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process payment');
        }

        return response.json();
    },

    // Submit insurance claim
    async submitInsuranceClaim(
        invoiceId: string,
        claimData: {
            claimNumber: string;
        }
    ): Promise<{ success: boolean; message: string; claimNumber: string }> {
        const response = await fetch(`${API_BASE}/invoices/${invoiceId}/insurance/submit`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(claimData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit insurance claim');
        }

        return response.json();
    },

    // Update insurance claim status
    async updateInsuranceClaimStatus(
        invoiceId: string,
        statusData: {
            claimStatus: 'Pending' | 'Approved' | 'Denied' | 'Partial';
            approvedAmount?: number;
            denialReason?: string;
        }
    ): Promise<{ success: boolean; message: string; invoice: Invoice }> {
        const response = await fetch(`${API_BASE}/invoices/${invoiceId}/insurance/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update claim status');
        }

        return response.json();
    },

    // Generate billing report
    async getBillingReport(params: {
        startDate?: string;
        endDate?: string;
        reportType?: 'summary' | 'detailed';
    }): Promise<{ success: boolean; reportType: string; period: unknown; summary?: unknown; serviceBreakdown?: unknown[]; invoices?: [] }> {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.reportType) searchParams.append('reportType', params.reportType);

        const response = await fetch(`${API_BASE}/reports/billing?${searchParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to generate billing report');
        }

        return response.json();
    },

    // Get patient billing history
    async getPatientBillingHistory(patientId: string): Promise<{
        success: boolean;
        patientId: string;
        summary: {
            totalBilled: number;
            totalPaid: number;
            currentBalance: number;
            invoiceCount: number;
        };
        billingHistory: Invoice[];
    }> {
        const response = await fetch(`${API_BASE}/patients/${patientId}/billing-history`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch patient billing history');
        }

        return response.json();
    },

    // Insurance management APIs
    async getAllInsuranceProviders(isActive = true): Promise<{
        success: boolean;
        providers: Array<{
            _id: string;
            providerName: string;
            providerCode: string;
            contractDetails?: {
                reimbursementRate: number;
            };
            isActive: boolean;
        }>;
        count: number;
    }> {
        const response = await fetch(`${API_BASE}/insurance/providers?isActive=${isActive}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch insurance providers');
        }

        return response.json();
    },

    // Get patient insurance
    async getPatientInsurance(patientId: string): Promise<{
        success: boolean;
        insurances: Array<{
            _id: string;
            policyNumber: string;
            groupNumber?: string;
            subscriberName: string;
            isPrimary: boolean;
            isActive: boolean;
            insuranceProviderId: {
                _id: string;
                providerName: string;
                providerCode: string;
            };
        }>;
    }> {
        const response = await fetch(`${API_BASE}/patients/${patientId}/insurance`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch patient insurance');
        }

        return response.json();
    },
};