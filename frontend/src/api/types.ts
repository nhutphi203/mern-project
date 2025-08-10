
// src/api/types.ts
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    role: 'Admin' | 'Patient' | 'Doctor';
    doctorDepartment?: string;
    specialization?: string; // Thêm field mới
    licenseNumber?: string; // Thêm field mới
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
    doctorId: string | PopulatedDoctor; // Có thể là string hoặc object sau populate
    patientId: string | PopulatedPatient; // Có thể là string hoặc object sau populate
    address: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    createdAt: string;
    updatedAt: string;
}
export interface PopulatedDoctor {
    _id: string;
    firstName: string;
    lastName: string;
    doctorDepartment: string;
    specialization?: string;
    docAvatar?: {
        public_id: string;
        url: string;
    };
}
export interface PopulatedPatient {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
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
export interface PopulatedAppointment extends Omit<Appointment, 'doctorId' | 'patientId'> {
    doctorId: PopulatedDoctor;
    patientId: PopulatedPatient;
}

export interface AppointmentFilter {
    department?: string;
    doctorId?: string;
    status?: 'Pending' | 'Accepted' | 'Rejected';
    startDate?: string;
    endDate?: string;
}

// Thống kê appointments
export interface AppointmentStats {
    byStatus: Array<{ _id: string; count: number }>;
    byDepartment: Array<{ _id: string; count: number }>;
}export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
}

// Định nghĩa cấu trúc cho một đơn thuốc (dữ liệu gốc từ DB)
export interface Prescription {
    _id: string;
    medicalRecordId: string;
    patientId: string;
    doctorId: string;
    medications: Medication[];
    digitalSignature?: string;
    status: 'New' | 'Dispensed' | 'Cancelled';
    dispensedDate?: string;
    createdAt: string;
    updatedAt: string;
}

// Định nghĩa cấu trúc cho đơn thuốc sau khi đã populate thông tin bác sĩ
export interface PopulatedPrescription extends Omit<Prescription, 'doctorId'> {
    doctorId: PopulatedDoctor;
}