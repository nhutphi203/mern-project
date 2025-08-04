import { API_BASE_URL } from './config';

/**
 * Interface cho kiểu dữ liệu trả về của hàm pingServer.
 */
interface PingResponse {
    status: number;
}

/**
 * @description Hàm để kiểm tra kết nối đến máy chủ API bằng cách gửi một yêu cầu GET đơn giản.
 * @returns Promise<PingResponse>
 */
export const pingServer = async (): Promise<PingResponse> => {
    const url = `${API_BASE_URL}/ping`;
    try {
        const response = await fetch(url);
        // Trả về một đối tượng với thuộc tính status
        return { status: response.status };
    } catch (error) {
        console.error('Lỗi khi kiểm tra kết nối server:', error);
        // Trả về status 0 nếu có lỗi
        return { status: 0 };
    }
};
