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


export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    // Populate thông tin bệnh nhân và bác sĩ với nhiều field hơn
    const appointments = await Appointment.find()
        .populate('patientId', 'firstName lastName email phone nic dob gender')
        .populate('doctorId', 'firstName lastName doctorDepartment specialization docAvatar')
        .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

    res.status(200).json({
        success: true,
        appointments,
    })
})

export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
    // req.user.id được lấy từ middleware isPatientAuthenticated
    const appointments = await Appointment.find({ patientId: req.user.id })
        .populate('doctorId', 'firstName lastName doctorDepartment docAvatar') // Lấy thông tin bác sĩ
        .populate('patientId', 'firstName lastName email phone') // Lấy thông tin bệnh nhân (tùy chọn)
        .sort({ appointment_date: -1 }); // Sắp xếp mới nhất lên đầu

    res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
    });
});
export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'firstName lastName email phone nic dob gender')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        appointments,
    })
})

// Thêm API endpoint mới để lấy appointments với filter linh hoạt
export const getAppointmentsByFilter = catchAsyncErrors(async (req, res, next) => {
    const { department, doctorId, status, startDate, endDate } = req.query;

    // Xây dựng filter object
    let filter = {};

    if (department) filter.department = department;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;

    // Filter theo ngày nếu có
    if (startDate || endDate) {
        filter.appointment_date = {};
        if (startDate) filter.appointment_date.$gte = startDate;
        if (endDate) filter.appointment_date.$lte = endDate;
    }

    const appointments = await Appointment.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName doctorDepartment specialization docAvatar')
        .sort({ appointment_date: 1 }); // Sắp xếp theo ngày hẹn

    res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
    })
})

// Thêm API để lấy thống kê appointments
export const getAppointmentStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Appointment.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const departmentStats = await Appointment.aggregate([
        {
            $group: {
                _id: "$department",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        success: true,
        stats: {
            byStatus: stats,
            byDepartment: departmentStats
        }
    })
})


