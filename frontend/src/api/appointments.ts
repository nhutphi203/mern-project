// src/api/appointments.ts
import { apiRequest } from './config';
import type { Appointment, AppointmentRequest } from './types';

export const appointmentApi = {
    // Create new appointment (patient only)
    createAppointment: async (data: AppointmentRequest) => {
        return apiRequest<{ appointment: Appointment }>('/api/v1/appointment/post', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all appointments (admin only)
    getAllAppointments: async () => {
        return apiRequest<{ appointments: Appointment[] }>('/api/v1/appointment/getall');
    },

    // Get patient's own appointments (patient only)
    getMyAppointments: async () => {
        return apiRequest<{ appointments: Appointment[] }>('/api/v1/appointment/my-appointments');
    },

    // Get doctor's appointments (doctor only)
    getDoctorAppointments: async () => {
        return apiRequest<{ appointments: Appointment[] }>('/api/v1/appointment/doctor-appointments');
    },

    // Update appointment status (admin only)
    updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
        return apiRequest<{ appointment: Appointment }>(`/api/v1/appointment/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    // Delete appointment (admin only)
    deleteAppointment: async (id: string) => {
        return apiRequest(`/api/v1/appointment/delete/${id}`, {
            method: 'DELETE',
        });
    },
};