import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../middlewares/errorMiddleware.js'
import { Appointment } from '../models/appointmentSchema.js';
import { User } from '../models/userScheme.js'

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_date, // Sửa lỗi: appointment_data -> appointment_date
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !nic ||
        !dob ||
        !gender ||
        !appointment_date ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address
    ) {
        return next(new ErrorHandler("Please fill full form!", 400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department
    })
    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found", 404))
    }
    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctors Conflict! Please contact through email or Phone", 404))
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
        appointment_date, // Sửa lỗi
        department,
        doctor: {  // Sửa lỗi: dovtor -> doctor
            firstName: doctor_firstName,
            lastName: doctor_lastName
        },
        hasVisited,
        address,
        doctorId,
        patientId
    });
    res.status(200).json({
        success: true,
        message: "Appointment sent successfully",
        appointment,
    })
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    // Populate thông tin bệnh nhân và bác sĩ để hiển thị tên
    const appointments = await Appointment.find()
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName doctorDepartment');

    res.status(200).json({
        success: true,
        appointments,
    })
})

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
        return next(new ErrorHandler("Invalid status", 400));
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    appointment = await Appointment.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Appointment status updated",
        appointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment deleted!"
    })
})

// Thêm controller để bệnh nhân lấy lịch hẹn của chính mình
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
        .populate('doctorId', 'firstName lastName doctorDepartment')
        .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

    res.status(200).json({
        success: true,
        appointments,
    })
})

// Thêm controller để bác sĩ lấy lịch hẹn được gán cho mình
export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'firstName lastName email phone')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        appointments,
    })
})