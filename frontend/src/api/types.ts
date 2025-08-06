
// src/api/types.ts
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female'; // Cho phép cả 'Other'
    role: 'Admin' | 'Patient' | 'Doctor';
    doctorDepartment?: string;
    docAvatar?: {
        public_id: string;
        url: string;
    };
}
export interface MessageResponse {
    success: boolean;
    message: string;
}
export interface LoginRequest {
    email: string;
    password: string;
    role: 'Admin' | 'Patient' | 'Doctor';
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other'; // Cho phép cả 'Other'
    dob: string;
    nic: string;
    role: 'Patient' | 'Doctor' | 'Admin'; // ✅ Cho phép cả 3 vai trò

    // Thêm các trường tùy chọn cho bác sĩ
    specialization?: string;
    licenseNumber?: string;
    doctorDepartment?: string;
}

export interface Appointment {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female';
    appointment_date: string;
    department: string;
    doctor: {
        firstName: string;
        lastName: string;
    };
    hasVisited: boolean;
    doctorId: string;
    patientId: string;
    address: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface AppointmentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female';
    appointment_date: string;
    department: string;
    doctor_firstName: string;
    doctor_lastName: string;
    hasVisited: boolean;
    address: string;
    doctorId: string;

}

export interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

export interface MessageRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

export interface MedicalRecord {
    _id: string;
    diagnosedDate: string;
    condition: string;
    notes: string;
    doctor: string; // ID của bác sĩ
}

export interface MedicalHistoryEntry {
    _id: string;
    condition: string;
    diagnosedDate?: string;
    treatment?: string;
    notes?: string;
    doctor?: string; // Sẽ là ID, hoặc object nếu populate
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface Immunization {
    _id: string;
    vaccineName: string;
    dateReceived: string;
}

export interface PatientProfileData {
    _id: string;
    patient: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    bloodType?: string;
    allergies: string[];
    medicalHistory: MedicalHistoryEntry[]; // Dùng interface mới
    immunizations: Immunization[];
    emergencyContact?: EmergencyContact;
    createdAt: string;
    updatedAt: string;
}