import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../middlewares/errorMiddleware.js'
import { Appointment } from '../models/appointmentSchema.js';
import { User } from '../models/userScheme.js'

// Controller để Patient tạo lịch hẹn mới
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !appointment_date || !department || !doctor_firstName || !doctor_lastName || !address) {
        return next(new ErrorHandler("Please fill full form!", 400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department
    });

    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found", 404));
    }
    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctors conflict! Please contact through email or phone!", 404));
    }

    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;
    const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited,
        address,
        doctorId,
        patientId,
    });

    res.status(200).json({
        success: true,
        message: "Appointment sent successfully!",
        appointment,
    });
});
export const filterAppointments = catchAsyncErrors(async (req, res, next) => {
    // --- BẮT ĐẦU PHẦN DEBUG ---
    console.log("=========================================");
    console.log("✅ filterAppointments function was called!");
    console.log("▶️ req.query received:", req.query);
    console.log("=========================================");
    // --- KẾT THÚC PHẦN DEBUG ---

    const { doctorId, status, startDate, endDate } = req.query;
    const query = {};

    if (status) {
        const validStatuses = Appointment.schema.path('status').enumValues;
        if (!validStatuses.includes(status)) {
            return next(new ErrorHandler(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`, 400));
        }
        query.status = status;
    }

    if (doctorId) {
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return next(new ErrorHandler('Invalid Doctor ID format.', 400));
        }
        query.doctorId = doctorId; // Đảm bảo query cũng dùng đúng tên trường
    }


    if (startDate || endDate) {
        query.appointment_date = {};
        if (startDate) {
            query.appointment_date.$gte = new Date(startDate);
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setDate(endOfDay.getDate() + 1);
            query.appointment_date.$lt = endOfDay;
        }
    }

    if (Object.keys(query).length === 0) {
        return next(new ErrorHandler('Please provide at least one filter criterion.', 400));
    }

    console.log("🔍 Executing find with query:", query); // Log thêm query sẽ thực thi

    const appointments = await Appointment.find(query)
        .populate({ path: 'patientId', select: 'firstName lastName email' })
        .populate({ path: 'doctorId', select: 'firstName lastName' }); // ✅ Sửa 'doctor' thành 'doctorId'

    console.log(`✨ Found ${appointments.length} appointments.`);

    res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
    });
});
// Controller để Admin xem tất cả lịch hẹn
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.find()
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName');
    res.status(200).json({
        success: true,
        appointments
    });
});

// === CONTROLLER MỚI CHO BỆNH NHÂN VÀ BÁC SĨ ===
// Controller để Patient/Doctor xem lịch hẹn của chính mình
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    let query = {};

    // Tự động xây dựng câu truy vấn dựa trên vai trò
    if (user.role === "Patient") {
        query = { patientId: user._id };
    } else if (user.role === "Doctor") {
        query = { doctorId: user._id };
    }

    const appointments = await Appointment.find(query)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName doctorDepartment');

    res.status(200).json({
        success: true,
        appointments,
    });
});
// === KẾT THÚC PHẦN MỚI ===
export const getAppointmentById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName doctorDepartment');

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
        success: true,
        appointment,
    });
});
// Controller để Admin cập nhật trạng thái
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Appointment status updated!",
        appointment,
    });
});
export const getAppointmentStats = catchAsyncErrors(async (req, res, next) => {
    // 1. Tự động lấy tất cả các trạng thái hợp lệ từ Appointment Model
    const validStatuses = Appointment.schema.path('status').enumValues;

    // 2. Tạo một mảng các "lời hứa" (promises) để đếm song song
    const countPromises = validStatuses.map(status =>
        Appointment.countDocuments({ status: status })
    );

    // Thêm một promise để đếm tổng số
    const totalPromise = Appointment.countDocuments();

    // 3. Chạy tất cả các promise cùng một lúc để tăng hiệu năng
    const [totalAppointments, ...statusCounts] = await Promise.all([
        totalPromise,
        ...countPromises
    ]);

    // 4. Xây dựng đối tượng stats một cách tự động
    const stats = {
        totalAppointments,
    };

    validStatuses.forEach((status, index) => {
        // Tạo key động, ví dụ: 'pendingAppointments', 'acceptedAppointments'
        const key = `${status.toLowerCase().replace('-', '')}Appointments`;
        stats[key] = statusCounts[index];
    });

    res.status(200).json({
        success: true,
        stats,
    });
});
// Controller để Admin xóa lịch hẹn
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment deleted!",
    });
});
