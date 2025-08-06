// frontend/src/api/appointments.ts
import { apiRequest } from './config';
import type {
    Appointment,
    AppointmentRequest,
    PopulatedAppointment,
    AppointmentFilter,
    AppointmentStats
} from './types';

export const appointmentApi = {
    // Create new appointment (patient only)
    createAppointment: async (data: AppointmentRequest) => {
        return apiRequest<{ appointment: Appointment }>('/api/v1/appointment/post', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all appointments (admin only) - trả về populated data
    getAllAppointments: async () => {
        return apiRequest<{ appointments: PopulatedAppointment[] }>('/api/v1/appointment/getall');
    },

    // Get patient's own appointments (patient only)
    getMyAppointments: async () => {
        return apiRequest<{ appointments: PopulatedAppointment[] }>('/api/v1/appointment/my-appointments');
    },

    // Get doctor's appointments (doctor only)
    getDoctorAppointments: async () => {
        return apiRequest<{ appointments: PopulatedAppointment[] }>('/api/v1/appointment/doctor-appointments');
    },

    // Filter appointments (admin only) - API mới
    filterAppointments: async (filter: AppointmentFilter) => {
        const queryParams = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        return apiRequest<{
            appointments: PopulatedAppointment[];
            count: number
        }>(`/api/v1/appointment/filter?${queryParams.toString()}`);
    },

    // Get appointment statistics (admin only) - API mới
    getAppointmentStats: async () => {
        return apiRequest<{ stats: AppointmentStats }>('/api/v1/appointment/stats');
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