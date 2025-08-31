// email.service.js (Đã sửa)
import nodemailer from 'nodemailer';

class EmailService {
    // Thuộc tính transporter được khai báo trong constructor
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendOTP(email, otp, firstName) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verify Your MediFlow Account - OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">MediFlow</h1>
                        <p style="color: white; margin: 5px 0;">Your Health, Our Priority</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #333;">Hello ${firstName}!</h2>
                        <p style="color: #666; font-size: 16px;">
                            Thank you for registering with MediFlow. To complete your registration, 
                            please use the verification code below:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background: #667eea; color: white; 
                                      padding: 15px 30px; border-radius: 8px; font-size: 24px; 
                                      font-weight: bold; letter-spacing: 2px;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p style="color: #666;">
                            This code will expire in <strong>10 minutes</strong>. 
                            If you didn't request this, please ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 14px; text-align: center;">
                            © 2024 MediFlow. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            // Ném lỗi để catchAsyncErrors có thể bắt được
            throw new Error(error.message);
        }
    }

    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to MediFlow!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome to MediFlow!</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #333;">Hello ${firstName}!</h2>
                        <p style="color: #666; font-size: 16px;">
                            Your account has been successfully verified. You can now access all MediFlow services.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/login" 
                               style="display: inline-block; background: #667eea; color: white; 
                                      padding: 12px 25px; text-decoration: none; border-radius: 6px;">
                                Login to Your Account
                            </a>
                        </div>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Welcome email send error:', error);
            // Ném lỗi để catchAsyncErrors có thể bắt được
            throw new Error(error.message);
        }
    }
}

export const emailService = new EmailService();