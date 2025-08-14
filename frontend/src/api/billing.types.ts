export interface InvoiceItem {
    type: 'Consultation' | 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Procedure' | 'Room';
    description: string;
    serviceCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    netAmount: number;
}

export interface Payment {
    _id: string;
    method: 'Cash' | 'Card' | 'Insurance' | 'Transfer' | 'Check';
    amount: number;
    transactionId?: string;
    cardLast4?: string;
    insuranceClaimId?: string;
    paidAt: string;
    processedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    notes?: string;
}

export interface Insurance {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
    coveragePercent: number;
    coverageAmount: number;
    deductible: number;
    patientResponsibility: number;
    claimSubmitted: boolean;
    claimNumber?: string;
    claimStatus: 'Pending' | 'Approved' | 'Denied' | 'Partial';
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        dob: string;
        gender: string;
    };
    encounterId: string;
    appointmentId: {
        _id: string;
        appointment_date: string;
        department: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    totalAmount: number;
    insurance?: Insurance;
    payments: Payment[];
    totalPaid: number;
    balance: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
    sentAt?: string;
    dueDate?: string;
    paidAt?: string;
    notes?: string;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
}
