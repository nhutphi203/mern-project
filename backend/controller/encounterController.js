import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Encounter } from "../models/encounter.model.js";
import { Appointment } from "../models/appointmentSchema.js";

export const encounterController = {
    /**
     * @desc    Lấy hàng chờ khám của bác sĩ TRONG NGÀY HÔM NAY
     * @route   GET /api/v1/encounters/doctor-queue
     * @access  Private (Doctor only)
     */
    getDoctorQueue: catchAsyncErrors(async (req, res, next) => {
        const doctorId = req.user._id;

        // ✅ BƯỚC 1: Tạo string ngày hôm nay với format đúng
        const today = new Date();
        const todayString = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

        console.log(`[Doctor Queue] Fetching queue for doctor ${doctorId} on ${todayString}`);

        // ✅ BƯỚC 2: Tìm appointments có status "Checked-in" và appointment_date hôm nay
        const todayAppointments = await Appointment.find({
            doctorId: doctorId,
            status: 'Checked-in',
            // Sử dụng regex để match ngày vì appointment_date là string
            appointment_date: { $regex: `^${todayString}` }
        });

        console.log(`[Doctor Queue] Found ${todayAppointments.length} checked-in appointments today`);

        if (todayAppointments.length === 0) {
            console.log('[Doctor Queue] No checked-in appointments for today');
            return res.status(200).json({
                success: true,
                data: {
                    encounters: []
                }
            });
        }

        // ✅ BƯỚC 3: Lấy appointmentIds
        const appointmentIds = todayAppointments.map(apt => apt._id);

        // ✅ BƯỚC 4: Tìm encounters tương ứng
        const waitingQueue = await Encounter.find({
            appointmentId: { $in: appointmentIds },
            status: 'InProgress'
        })
            .populate({
                path: 'patientId',
                select: 'firstName lastName'
            })
            .populate({
                path: 'appointmentId',
                select: 'appointment_date department status'
            })
            .sort({ checkInTime: 1 });

        console.log(`[Doctor Queue] Found ${waitingQueue.length} encounters in waiting queue`);

        // ✅ BƯỚC 5: Trả về đúng cấu trúc mà frontend expect
        res.status(200).json({
            success: true,
            data: {
                encounters: waitingQueue
            }
        });
    }),

    /**
     * @desc    Lấy thông tin chi tiết của một lượt khám
     * @route   GET /api/v1/encounters/:id
     * @access  Private
     */
    getEncounterDetails: catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const encounter = await Encounter.findById(id)
            .populate('patientId', 'firstName lastName email phone')
            .populate({
                path: 'appointmentId',
                select: 'appointment_date department',
                populate: {
                    path: 'doctorId',
                    select: 'firstName lastName'
                }
            });

        if (!encounter) {
            return next(new ErrorHandler('Encounter not found.', 404));
        }

        res.status(200).json({
            success: true,
            data: encounter,
        });
    }),
};