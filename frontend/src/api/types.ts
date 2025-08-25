
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
    role: 'Admin' | 'Patient' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Lab Technician' | 'BillingStaff' | 'LabSupervisor' | 'Pharmacist' | 'Insurance Staff'// Thêm 2 roles mới;
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
    role: 'Admin' | 'Patient' | 'Doctor' | 'Nurse';
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
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled' | 'Checked-in'; // ✅ Đã cập nhật đầy đủ
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

export interface AppointmentStats {
    totalAppointments: number;
    // Dùng [key: string]: number để cho phép các thuộc tính động
    // như pendingAppointments, acceptedAppointments, etc.
    pendingAppointments?: number;
    acceptedAppointments?: number;
    rejectedAppointments?: number;
    completedAppointments?: number;
    checkedinAppointments?: number;
    cancelledAppointments?: number;
    // Có thể thêm các thuộc tính thống kê khác ở đây trong tương lai
    [key: string]: number | undefined;
}
export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
}
export interface MediaRecord {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string; // MIME type, ví dụ: 'image/png', 'application/pdf'
    fileSize: number; // Kích thước file tính bằng bytes
    description: string;
    appointmentId: string;
    patientId: string;
    doctorId: { // Populate thông tin người upload
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
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
export interface Encounter {
    _id: string;
    appointmentId: string;
    patientId: string;
    receptionistId: string;
    checkInTime: string; // Dạng chuỗi ISO date
    checkOutTime?: string;
    status: 'InProgress' | 'Finished' | 'Cancelled';
    serviceOrders?: string[]; // Mảng các ID của y lệnh
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Định nghĩa cấu trúc của Lượt khám đã được populate với thông tin chi tiết
export interface PopulatedEncounter extends Omit<Encounter, 'patientId' | 'appointmentId'> {
    // Thay vì chỉ có ID, chúng ta có toàn bộ object User (đã được rút gọn)
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    // Tương tự, có object Appointment
    appointmentId: {
        _id: string;
        appointment_date: string;
    };
}