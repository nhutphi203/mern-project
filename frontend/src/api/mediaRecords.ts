// frontend/src/api/mediaRecords.ts - Phiên bản đã sửa lỗi
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Hàm helper để thực hiện request API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    // Nếu không có content thì không parse JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (!response.ok) throw new Error('API request failed with no content');
        return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Định nghĩa kiểu dữ liệu cho MediaRecord - PHIÊN BẢN ĐẦY ĐỦ
interface MediaRecord {
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
export const mediaRecordApi = {
    /**
     * [SỬA LỖI] Lấy media records cho một cuộc hẹn.
     * Sửa endpoint từ `/api/v1/medicalrecords?appointmentId=...` thành `/api/v1/medical-records/media/...`
     */
    getForAppointment: async (appointmentId: string): Promise<{ success: boolean; mediaRecords: MediaRecord[] }> => {
        return apiRequest(`/api/v1/medical-records/media/${appointmentId}`);
    },

    /**
     * [MỚI] Upload một file media mới.
     * Gửi FormData nên không set Content-Type header.
     */
    upload: async (formData: FormData): Promise<{ success: boolean; mediaRecord: MediaRecord; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/medical-records/media/upload`, {
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

    /**
     * [MỚI] Xóa một file media.
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        return apiRequest(`/api/v1/medical-records/media/${id}`, {
            method: 'DELETE',
        });
    },
};
