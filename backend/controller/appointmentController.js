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
    // Sử dụng Promise.all để chạy các câu lệnh đếm song song, tăng hiệu năng
    const [
        totalAppointments,
        pendingAppointments,
        acceptedAppointments,
        rejectedAppointments,
    ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "Pending" }),
        Appointment.countDocuments({ status: "Accepted" }),
        Appointment.countDocuments({ status: "Rejected" }),
    ]);

    res.status(200).json({
        success: true,
        stats: {
            totalAppointments,
            pendingAppointments,
            acceptedAppointments,
            rejectedAppointments,
        },
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
