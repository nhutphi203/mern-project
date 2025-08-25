import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { MedicalRecord } from '../models/medicalRecordSchema.js'; // Schema cho hồ sơ bệnh án
import { Appointment } from '../models/appointmentSchema.js';
import cloudinary from 'cloudinary';

// ===============================================
// --- HÀM XỬ LÝ MEDICAL RECORD (DỮ LIỆU LÂM SÀNG) ---
// ===============================================

// Get all medical records with pagination and filters
export const getAllMedicalRecords = catchAsyncErrors(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        status,
        priority,
        patientId,
        doctorId,
        dateFrom,
        dateTo
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const totalRecords = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName doctorDepartment')
        .populate('appointmentId', 'appointment_date department')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    res.status(200).json({
        success: true,
        data: records,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalRecords,
            pages: Math.ceil(totalRecords / limit)
        }
    });
});

// Get medical records summary for reports
export const getRecordsSummary = catchAsyncErrors(async (req, res, next) => {
    const records = await MedicalRecord.find()
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName')
        .sort({ updatedAt: -1 })
        .limit(20);

    const summaryData = records.map(record => ({
        _id: record._id,
        patientName: record.patientId ?
            `${record.patientId.firstName} ${record.patientId.lastName}` :
            'Unknown Patient',
        patientId: record.patientId?._id || 'Unknown ID',
        diagnosis: record.diagnosis || 'No diagnosis',
        icd10Code: record.icd10Code || '',
        chiefComplaint: record.symptoms || 'No chief complaint',
        lastUpdated: record.updatedAt,
        status: record.status || 'Active',
        doctor: record.doctorId ?
            `${record.doctorId.firstName} ${record.doctorId.lastName}` :
            'Unknown Doctor',
        priority: record.priority || 'Medium'
    }));

    res.status(200).json({
        success: true,
        data: summaryData
    });
});

// Get medical records statistics
export const getStatistics = catchAsyncErrors(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalRecords = await MedicalRecord.countDocuments();
    const activeCases = await MedicalRecord.countDocuments({ status: 'Active' });
    const resolvedToday = await MedicalRecord.countDocuments({
        status: 'Resolved',
        updatedAt: { $gte: today }
    });
    const pendingReview = await MedicalRecord.countDocuments({ status: 'Pending' });

    const createdToday = await MedicalRecord.countDocuments({
        createdAt: { $gte: today }
    });
    const updatedToday = await MedicalRecord.countDocuments({
        updatedAt: { $gte: today }
    });

    res.status(200).json({
        success: true,
        data: {
            totalRecords,
            activeCases,
            resolvedToday,
            pendingReview,
            recentActivity: {
                created: createdToday,
                updated: updatedToday,
                reviewed: resolvedToday
            }
        }
    });
});

// Create new medical record
export const createMedicalRecord = catchAsyncErrors(async (req, res, next) => {
    const { patientId, doctorId, appointmentId, diagnosis, symptoms, treatmentPlan, notes } = req.body;

    if (!patientId || !doctorId || !appointmentId || !diagnosis || !symptoms || !treatmentPlan) {
        return next(new ErrorHandler("All required fields must be provided", 400));
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    const existingRecord = await MedicalRecord.findOne({ appointmentId });
    if (existingRecord) {
        return next(new ErrorHandler("Medical record already exists for this appointment", 400));
    }

    const medicalRecord = await MedicalRecord.create({
        patientId,
        doctorId,
        appointmentId,
        diagnosis,
        symptoms,
        treatmentPlan,
        notes: notes || '',
    });

    res.status(201).json({
        success: true,
        message: "Medical record created successfully",
        record: medicalRecord,
    });
});

// Get medical record by appointment ID
export const getMedicalRecordByAppointment = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId } = req.params;
    const record = await MedicalRecord.findOne({ appointmentId })
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName doctorDepartment');

    if (!record) {
        return res.status(200).json({
            success: true,
            message: "No medical record found for this appointment.",
            record: null,
        });
    }

    res.status(200).json({
        success: true,
        record,
    });
});

// Get patient's entire medical history
export const getPatientMedicalHistory = catchAsyncErrors(async (req, res, next) => {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patientId })
        .populate('doctorId', 'firstName lastName doctorDepartment')
        .populate('appointmentId', 'appointment_date department')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        records: records || [],
        count: records.length,
    });
});

// Get medical record by ID
export const getMedicalRecordById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName doctorDepartment');

    if (!record) {
        return next(new ErrorHandler("Medical record not found", 404));
    }

    res.status(200).json({
        success: true,
        record,
    });
});

// Update medical record
export const updateMedicalRecord = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { diagnosis, symptoms, treatmentPlan, notes } = req.body;

    const record = await MedicalRecord.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                diagnosis,
                symptoms,
                treatmentPlan,
                notes,
                updatedAt: new Date(),
            }
        },
        { new: true, runValidators: true }
    );

    if (!record) {
        return next(new ErrorHandler("Medical record not found or could not be updated", 404));
    }

    res.status(200).json({
        success: true,
        message: "Medical record updated successfully",
        record,
    });
});


// ===============================================
// --- HÀM MỚI ĐỂ XỬ LÝ MEDIA RECORDS ---
// ===============================================

// Lấy tất cả media records cho một cuộc hẹn cụ thể
export const getMediaRecordsByAppointment = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId } = req.params;

    // [SỬA] Sử dụng model 'MedicalRecord' đã được import
    const mediaRecords = await MedicalRecord.find({ appointmentId })
        .populate('doctorId', 'firstName lastName');

    // Logic này đã đúng: trả về mảng rỗng nếu không có dữ liệu
    res.status(200).json({
        success: true,
        mediaRecords: mediaRecords || [],
    });
});
// Upload một media record mới
export const uploadMediaRecord = catchAsyncErrors(async (req, res, next) => {
    // ... (logic upload không đổi) ...

    // [SỬA] Sử dụng model 'MedicalRecord' để tạo bản ghi
    const mediaRecord = await MedicalRecord.create({
        appointmentId,
        patientId,
        doctorId,
        description,
        fileName: file.name,
        fileUrl: cloudinaryResponse.secure_url,
        fileType: file.mimetype,
        fileSize: cloudinaryResponse.bytes,
        cloudinary_id: cloudinaryResponse.public_id,
    });

    res.status(201).json({
        success: true,
        message: "Upload file media thành công!",
        mediaRecord,
    });
});

// DELETE: Xóa một media record
export const deleteMediaRecord = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // [SỬA] Sử dụng model 'MedicalRecord' để tìm kiếm
    const mediaRecord = await MedicalRecord.findById(id);

    if (!mediaRecord) {
        return next(new ErrorHandler("Không tìm thấy file media.", 404));
    }

    await cloudinary.v2.uploader.destroy(mediaRecord.cloudinary_id);
    await mediaRecord.deleteOne();

    res.status(200).json({
        success: true,
        message: "Xóa file media thành công!",
    });
});