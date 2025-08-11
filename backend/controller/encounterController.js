import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Encounter } from "../models/encounter.model.js";

export const encounterController = {
    /**
     * @desc    Lấy hàng chờ khám của bác sĩ TRONG NGÀY HÔM NAY
     * @route   GET /api/v1/encounters/doctor-queue
     * @access  Private (Doctor only)
     */
    getDoctorQueue: catchAsyncErrors(async (req, res, next) => {
        const doctorId = req.user._id;

        // ✅ BƯỚC 1: Xác định khoảng thời gian của ngày hôm nay
        // Đặt thời gian về đầu ngày (00:00:00)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Đặt thời gian về cuối ngày (23:59:59)
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // ✅ BƯỚC 2: Thêm điều kiện lọc theo ngày vào câu lệnh find()
        const waitingQueue = await Encounter.find({
            doctorId: doctorId,
            status: 'InProgress',
            // Chỉ lấy các encounter có `checkInTime` nằm trong ngày hôm nay
            checkInTime: {
                $gte: startOfDay, // Lớn hơn hoặc bằng đầu ngày
                $lte: endOfDay    // Nhỏ hơn hoặc bằng cuối ngày
            }
        })
            .populate({
                path: 'patientId',
                select: 'firstName lastName'
            })
            .sort({ checkInTime: 1 }); // Sắp xếp theo thứ tự check-in

        res.status(200).json({
            success: true,
            // Key 'encounters' này phải khớp với cách frontend đang đọc dữ liệu
            encounters: waitingQueue,
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
                populate: { // Populate lồng nhau để lấy tên bác sĩ từ appointment
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