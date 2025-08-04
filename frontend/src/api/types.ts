
// src/api/types.ts
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nic: string;
    dob: string;
    gender: 'Male' | 'Female';
    role: 'Admin' | 'Patient' | 'Doctor';
    doctorDepartment?: string;
    docAvatar?: {
        public_id: string;
        url: string;
    };
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
    gender: 'Male' | 'Female';
    dob: string;
    nic: string;
    role: 'Patient';
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
    appointment_data: string;
    department: string;
    doctor_firstName: string;
    doctor_lastName: string;
    hasVisited: boolean;
    address: string;
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
