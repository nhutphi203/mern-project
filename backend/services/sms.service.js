import twilio from 'twilio';

class SMSService {
    // Thuộc tính 'client' được khởi tạo trong constructor
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    // Đã loại bỏ các chú thích kiểu (type annotations) khỏi tham số
    async sendOTP(phone, otp, firstName) {
        try {
            // Đảm bảo số điện thoại bắt đầu bằng mã quốc gia (+84)
            const formattedPhone = phone.startsWith('+') ? phone : `+84${phone.replace(/^0/, '')}`;

            const message = await this.client.messages.create({
                body: `Hello ${firstName}! Your MediFlow verification code is: ${otp}. This code expires in 10 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone,
            });

            return { success: true, messageId: message.sid };
        } catch (error) {
            console.error('SMS send error:', error);
            // Ném lỗi để middleware có thể bắt và xử lý
            throw new Error(error.message);
        }
    }
}

// Xuất một thực thể (instance) của class để sử dụng trong toàn bộ ứng dụng
export const smsService = new SMSService();