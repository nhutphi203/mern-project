const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',

        },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

export const mediaRecordApi = {
    // Get media records for appointment
    getForAppointment: async (appointmentId) => {
        return apiRequest(`/api/v1/medicalrecords?appointmentId=${appointmentId}`);
    },

    // Upload new media record
    upload: async (appointmentId, file, description) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('appointmentId', appointmentId);
        formData.append('description', description || '');

        const response = await fetch(`${API_BASE_URL}/api/v1/medicalrecords`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    },

    // Delete media record
    delete: async (id) => {
        return apiRequest(`/api/v1/medicalrecords/${id}`, {
            method: 'DELETE',
        });
    },
};
