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

// --- THÊM HÀM MỚI ĐỂ LẤY USER THEO ID ---
/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Authenticated users)
 */

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" }).select("-password");
    res.status(200).json({
        success: true,
        doctors,
    });
});

// --- THÊM HÀM MỚI ĐỂ LẤY DANH SÁCH PATIENTS ---
/**
 * @desc    Get all patients (for Admin, Doctor, Receptionist)
 * @route   GET /api/v1/users/patients
 * @access  Private (Admin, Doctor, Receptionist)
 */
export const getAllPatients = catchAsyncErrors(async (req, res, next) => {
    console.log('🔍 [getAllPatients] Request received:', {
        method: req.method,
        url: req.url,
        query: req.query,
        user: req.user ? {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        } : 'No user in request'
    });

    // 🔧 FIX: Validate user exists (should be set by isAuthenticated middleware)
    if (!req.user) {
        console.error('❌ [getAllPatients] No user found in request - middleware may have failed');
        return next(new ErrorHandler('Authentication required. Please login first.', 401));
    }

    // 🔧 FIX: Check user permissions
    const allowedRoles = ['Admin', 'Doctor', 'Receptionist'];
    if (!allowedRoles.includes(req.user.role)) {
        console.warn('⚠️ [getAllPatients] Access denied for role:', req.user.role);
        return next(new ErrorHandler(`Access denied. Only ${allowedRoles.join(', ')} can view patient lists.`, 403));
    }

    const { search, gender, role, page = 1, limit = 10 } = req.query;

    // 🔧 FIX: Build filter object more safely
    const filter = { role: "Patient" };

    try {
        // Add search filter if provided
        if (search && search.trim()) {
            const searchTerm = search.trim();
            filter.$or = [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
            console.log('🔍 [getAllPatients] Search term applied:', searchTerm);
        }

        // Add gender filter if provided
        if (gender && ['Male', 'Female'].includes(gender)) {
            filter.gender = gender;
            console.log('🔍 [getAllPatients] Gender filter applied:', gender);
        }

        console.log('🔍 [getAllPatients] Final filter:', JSON.stringify(filter, null, 2));

        // Calculate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100, min 1
        const skip = (pageNum - 1) * limitNum;

        console.log('📄 [getAllPatients] Pagination:', { pageNum, limitNum, skip });

        // Execute query with pagination
        const patients = await User.find(filter)
            .select("-password -otpCode -otpExpires") // Exclude sensitive fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(); // Use lean() for better performance

        // Get total count for pagination
        const totalCount = await User.countDocuments(filter);

        console.log('✅ [getAllPatients] Query successful:', {
            patientsFound: patients.length,
            totalCount,
            pageNum,
            limitNum,
            totalPages: Math.ceil(totalCount / limitNum)
        });

        // 🔧 FIX: Return data in the format expected by frontend
        res.status(200).json({
            success: true,
            message: `Found ${patients.length} patients`,
            data: {
                patients,
                count: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });

    } catch (error) {
        console.error('❌ [getAllPatients] Database error:', {
            error: error.message,
            stack: error.stack,
            filter,
            user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
        });

        // 🔧 FIX: Handle specific MongoDB errors
        if (error.name === 'CastError') {
            return next(new ErrorHandler('Invalid search parameters provided.', 400));
        }

        return next(new ErrorHandler('Database error occurred while fetching patients.', 500));
    }
});

// 🔧 ENHANCED: Fix getUserById with better validation
export const getUserById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    console.log('🔍 [getUserById] Request for ID:', id, 'by user:', req.user?.role);

    // 🔧 FIX: Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('❌ [getUserById] Invalid ObjectId format:', id);
        return next(new ErrorHandler('Invalid user ID format.', 400));
    }

    // 🔧 FIX: Check permissions - users can view their own profile or authorized roles can view others
    const allowedRoles = ['Admin', 'Doctor', 'Receptionist'];
    const canViewOthers = allowedRoles.includes(req.user.role);
    const isOwnProfile = req.user._id.toString() === id;

    if (!canViewOthers && !isOwnProfile) {
        console.warn('⚠️ [getUserById] Access denied - user trying to view other profile');
        return next(new ErrorHandler('You can only view your own profile.', 403));
    }

    try {
        // Find user in DB by ID and exclude sensitive fields
        const user = await User.findById(id)
            .select("-password -otpCode -otpExpires")
            .lean();

        if (!user) {
            console.warn('⚠️ [getUserById] User not found for ID:', id);
            return next(new ErrorHandler("User not found.", 404));
        }

        console.log('✅ [getUserById] User found:', {
            id: user._id,
            role: user.role,
            email: user.email
        });

        // Return user object in the format expected by frontend
        res.status(200).json({
            success: true,
            message: 'User found successfully',
            user, // Direct user object for compatibility
        });

    } catch (error) {
        console.error('❌ [getUserById] Database error:', {
            error: error.message,
            userId: id,
            requestUser: req.user?._id
        });

        return next(new ErrorHandler('Error occurred while fetching user data.', 500));
    }
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