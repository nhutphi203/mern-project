
// src/api/appointments.ts
import { apiRequest } from './config';
import type { Appointment, AppointmentRequest } from './types';

export const appointmentApi = {
    // Create new appointment (patient only)
    createAppointment: async (data: AppointmentRequest) => {
        return apiRequest<{ appointment: Appointment }>('/appointment/post', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all appointments (admin only)
    getAllAppointments: async () => {
        return apiRequest<{ appointments: Appointment[] }>('/appointment/getall');
    },

    // Update appointment status (admin only)
    updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
        return apiRequest<{ appointment: Appointment }>(`/appointment/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    // Delete appointment (admin only)
    deleteAppointment: async (id: string) => {
        return apiRequest(`/appointment/delete/${id}`, {
            method: 'DELETE',
        });
    },
};
