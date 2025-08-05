import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userScheme.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const logout = catchAsyncErrors(async (req, res, next) => {
    // Middleware đã xác thực và gắn req.user, nên ta biết được vai trò
    const userRole = req.user.role;

    // Xác định tên cookie dựa trên vai trò
    const cookieName = userRole === 'Admin' ? 'adminToken' : 'patientToken';

    res
        .status(200)
        .cookie(cookieName, "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            // Thêm các tùy chọn secure và sameSite cho môi trường production
            // secure: true,
            // sameSite: "None",
        })
        .json({
            success: true,
            message: "User Logged Out Successfully!",
        });
});
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic, role } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role) {
        return next(new ErrorHandler("Please fill full form!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User with this email already registered", 400));
    }

    const user = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic, role,
    });

    if (!user) {
        return next(new ErrorHandler("User registration failed. Please try again.", 500));
    }

    // Luồng đăng ký này là đúng: chỉ thông báo, không tự động đăng nhập.
    res.status(201).json({
        success: true,
        message: "Patient registered successfully! Please log in.",
    });
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide all details!", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        // Luôn trả về thông báo chung để bảo mật
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        // Luôn trả về thông báo chung để bảo mật
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    if (role !== user.role) {
        return next(new ErrorHandler(`User with this role not found!`, 400));
    }

    generateToken(user, "User logged in successfully!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
        return next(new ErrorHandler("please fill full form!", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`));
    }
    const admin = await User.create({ firstName, lastName, email, phone, password, gender, dob, nic, role: "Admin" })

    res.status(200).json({
        success: true,
        message: "New Admin Registered!",
    })
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
    })
});


export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar required!", 400))
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webP"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400))
    }
    const { firstName, lastName, email, phone, password, gender, dob, nic, role, doctorDepartment } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role || !doctorDepartment) {
        return next(new ErrorHandler("Please provide full details", 400))
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400))
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error")
    }

    const doctor = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic, role, doctorDepartment, docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "New doctor registered",
        doctor
    })
})

// DẤU NGOẶC NHỌN THỪA Ở ĐÂY ĐÃ ĐƯỢC XÓA BỎ