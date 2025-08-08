import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userScheme.js";
import { sendToken } from "../utils/jwtToken.js"; // <<< SỬA LẠI TÊN IMPORT
import cloudinary from "cloudinary";
import ErrorHandler from "../middlewares/errorMiddleware.js";


// --- IMPORT CÁC SERVICE CẦN THIẾT ---
// Đảm bảo đường dẫn đến các tệp service là chính xác
import { emailService } from "../services/email.service.js";
// DẤU NGOẶC NHỌN THỪA Ở ĐÂY ĐÃ ĐƯỢC XÓA BỎimport { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";



// =================================================================
// --- CHỨC NĂNG ĐĂNG KÝ TRUYỀN THỐNG VÀ GỬI OTP ---
// =================================================================
export const register = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;

    // 1. Kiểm tra thông tin đầu vào
    if (!firstName || !lastName || !email || !password || !gender || !dob || !nic || !phone) {
        return next(new ErrorHandler("Please fill the full registration form!", 400));
    }

    // 2. Kiểm tra xem người dùng đã tồn tại và đã được xác thực chưa
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
        return next(new ErrorHandler("User with this email already exists!", 400));
    }

    // Nếu người dùng tồn tại nhưng chưa xác thực, xóa đi để tạo lại
    if (existingUser && !existingUser.isVerified) {
        await User.findByIdAndDelete(existingUser._id);
    }

    // 3. Tạo người dùng mới nhưng chưa xác thực
    const user = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic,
        role: "Patient", // Mặc định vai trò là Patient
        authType: 'traditional' // Kiểu xác thực là truyền thống
    });

    // 4. Tạo và gửi OTP qua email
    const otp = user.generateOTP('email'); // Tạo OTP cho email
    await user.save({ validateBeforeSave: false }); // Lưu OTP và thời gian hết hạn vào DB

    await emailService.sendOTP(user.email, otp, user.firstName); // Gửi email chứa OTP

    // 5. Trả về thông báo yêu cầu xác thực
    res.status(201).json({
        success: true,
        message: `Registration successful! An OTP has been sent to ${user.email}. Please verify to continue.`,
        // Trả về userId để client có thể dùng cho việc xác thực OTP
        userId: user._id
    });
});


// --- XÁC THỰC OTP ---
export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select("+otpCode +otpExpires");
    if (!user) {
        return next(new ErrorHandler("User not found or session expired.", 404));
    }
    if (!user.verifyOTP(otp)) {
        return next(new ErrorHandler("Invalid or expired OTP.", 400));
    }
    user.isVerified = true;
    user.clearOTP();
    await user.save();

    // Sau khi xác thực thành công, dùng sendToken để đăng nhập
    sendToken(user, 200, res, "Account verified successfully!");
});

// =================================================================
// --- GỬI LẠI OTP ---
// =================================================================
export const resendOtp = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return next(new ErrorHandler("User ID is required.", 400));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }
    if (user.isVerified) {
        return next(new ErrorHandler("Account is already verified.", 400));
    }

    // Tạo OTP mới và gửi lại
    // Ở đây mặc định gửi lại qua email, bạn có thể thêm logic để chọn email/sms
    const otp = user.generateOTP('email');
    await user.save({ validateBeforeSave: false });

    await emailService.sendOTP(user.email, otp, user.firstName);

    res.status(200).json({
        success: true,
        message: `A new OTP has been sent to ${user.email}.`
    });
});


// =================================================================
// --- ĐĂNG NHẬP (CẬP NHẬT) ---
// =================================================================
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide all details!", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Credentials.", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Credentials.", 401));
    }

    if (role !== user.role) {
        return next(new ErrorHandler(`User with provided role not found!`, 404));
    }

    // SỬA LẠI TÊN HÀM GỌI
    // Thay vì generateToken, hãy gọi sendToken
    sendToken(user, 200, res, "User logged in successfully!");
});




export const logout = catchAsyncErrors(async (req, res, next) => {
    // Lấy vai trò của người dùng từ req.user đã được middleware xác thực
    const userRole = req.user.role;

    // --- SỬA LẠI LOGIC TẠO TÊN COOKIE ---
    // Tự động tạo tên cookie dựa trên vai trò: "Patient" -> "patientToken", "Admin" -> "adminToken", etc.
    const cookieName = `${userRole.toLowerCase()}Token`;

    res.status(200).cookie(cookieName, "", {
        httpOnly: true,
        expires: new Date(Date.now()),
        // Nên có cho production để tăng bảo mật
        // secure: true,
        // sameSite: "None", 
    }).json({
        success: true,
        message: "User Logged Out Successfully!",
    });
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
        return next(new ErrorHandler("Please fill full form!", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`));
    }
    const admin = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic,
        role: "Admin",
        isVerified: true, // Admin tự động được xác thực
        authType: 'traditional'
    });

    res.status(200).json({
        success: true,
        message: "New Admin Registered!",
        admin
    });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar required!", 400));
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const { firstName, lastName, email, phone, password, gender, dob, nic, doctorDepartment, specialization, licenseNumber } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !doctorDepartment || !specialization || !licenseNumber) {
        return next(new ErrorHandler("Please provide full details for the doctor!", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error");
    }

    const doctor = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic,
        role: "Doctor",
        doctorDepartment,
        specialization,
        licenseNumber,
        isVerified: true, // Bác sĩ được thêm bởi admin nên được xác thực luôn
        authType: 'traditional',
        docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "New doctor registered",
        doctor,
    });
});