export interface LabTest {
    _id: string;
    testCode: string;
    testName: string;
    category: 'Hematology' | 'Chemistry' | 'Microbiology' | 'Immunology' | 'Pathology' | 'Radiology';
    department: string;
    normalRange: {
        min?: number;
        max?: number;
        unit?: string;
        textRange?: string;
        gender?: 'All' | 'Male' | 'Female';
    };
    price: number;
    turnaroundTime: number;
    specimen: 'Blood' | 'Urine' | 'Stool' | 'Sputum' | 'CSF' | 'Other';
    instructions?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LabOrderTest {
    testId: string;
    priority: 'Routine' | 'Urgent' | 'STAT';
    instructions?: string;
    status: 'Ordered' | 'Collected' | 'InProgress' | 'Completed' | 'Cancelled';
    collectedAt?: string;
    completedAt?: string;
}

export interface LabOrder {
    _id: string;
    orderId: string;
    encounterId: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        dob: string;
        gender: string;
    };
    doctorId: {
        _id: string;
        firstName: string;
        lastName: string;
        doctorDepartment: string;
    };
    tests: LabOrderTest[];
    clinicalInfo?: string;
    totalAmount: number;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
    orderedAt: string;
    completedAt?: string;
    notes?: string;
}

export interface LabResult {
    _id: string;
    orderId: string;
    testId: {
        _id: string;
        testName: string;
        category: string;
        normalRange: unknown;
    };
    patientId: string;
    technicianId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    result: {
        value: number | string;
        unit?: string;
        isAbnormal: boolean;
        flag: 'Normal' | 'High' | 'Low' | 'Critical' | 'Abnormal';
    };
    referenceRange: string;
    interpretation?: string;
    comments?: string;
    performedAt: string;
    verifiedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    verifiedAt?: string;
    status: 'Pending' | 'Completed' | 'Reviewed' | 'Amended' | 'Cancelled';
    methodology?: string;
    instrument?: string;
}
