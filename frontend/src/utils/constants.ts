
// src/utils/constants.ts
export const DEPARTMENTS = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Ophthalmology',
    'General Medicine',
    'Emergency Medicine',
    'Dermatology',
    'Psychiatry',
    'Radiology'
] as const;

export const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
] as const;

export const APPOINTMENT_STATUS = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected'
} as const;

export const USER_ROLES = {
    ADMIN: 'Admin',
    PATIENT: 'Patient',
    DOCTOR: 'Doctor'
} as const;
