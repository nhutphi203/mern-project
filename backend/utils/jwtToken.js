export const sendToken = (user, statusCode, res, message) => {
    const token = user.generateJsonWebToken(); // Gọi method từ userSchema
    const cookieName = `${user.role.toLowerCase()}Token`; // patientToken, adminToken...

    // Thiết lập tùy chọn cho cookie
    const options = {
        // Chuyển đổi ngày hết hạn từ .env (ví dụ: "7d") sang mili giây
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure: true, // Bật khi deploy
        // sameSite: "None" // Bật khi deploy
    };

    res.status(statusCode).cookie(cookieName, token, options).json({
        success: true,
        user,
        message,
        token, // Gửi kèm token trong response để frontend có thể dùng ngay
    });
};