import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { MedicalRecord } from "../models/medicalRecordSchema.js";
import { User } from "../models/userScheme.js";

/**
 * @desc    Create a new prescription for a medical record
 * @route   POST /api/v1/prescriptions
 * @access  Private (Doctor only)
 */
export const createPrescription = catchAsyncErrors(async (req, res, next) => {
    const { medicalRecordId, medications } = req.body;
    const doctorId = req.user.id; // Lấy từ middleware isAuthenticated

    // 1. Kiểm tra dữ liệu đầu vào
    if (!medicalRecordId || !medications || !Array.isArray(medications) || medications.length === 0) {
        return next(new ErrorHandler("Medical Record ID and at least one medication are required.", 400));
    }

    // 2. Tìm hồ sơ bệnh án tương ứng
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
        return next(new ErrorHandler("Medical Record not found.", 404));
    }

    // 3. Đảm bảo bác sĩ tạo đơn thuốc chính là bác sĩ của hồ sơ bệnh án
    if (medicalRecord.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("You are not authorized to create a prescription for this medical record.", 403));
    }

    // 4. Tạo đơn thuốc mới
    const prescription = await Prescription.create({
        medicalRecordId,
        patientId: medicalRecord.patientId,
        doctorId,
        medications,
        // Các trường khác như digitalSignature sẽ được cập nhật sau
    });

    res.status(201).json({
        success: true,
        message: "Prescription created successfully!",
        prescription,
    });
});

/**
 * @desc    Get all prescriptions for a specific medical record
 * @route   GET /api/v1/prescriptions/record/:recordId
 * @access  Private (Doctor or Patient of the record)
 */
export const getPrescriptionsForRecord = catchAsyncErrors(async (req, res, next) => {
    const { recordId } = req.params;
    const user = req.user;

    const prescriptions = await Prescription.find({ medicalRecordId: recordId }).populate("doctorId", "firstName lastName");

    if (!prescriptions || prescriptions.length === 0) {
        return next(new ErrorHandler("No prescriptions found for this medical record.", 404));
    }

    // Kiểm tra quyền: người dùng phải là bệnh nhân hoặc bác sĩ của đơn thuốc
    const patientId = prescriptions[0].patientId.toString();
    const doctorId = prescriptions[0].doctorId._id.toString();

    if (user.role !== 'Admin' && user.id !== patientId && user.id !== doctorId) {
        return next(new ErrorHandler("You are not authorized to view these prescriptions.", 403));
    }

    res.status(200).json({
        success: true,
        prescriptions,
    });
});

/**
 * @desc    Get all prescriptions for a specific patient
 * @route   GET /api/v1/prescriptions/patient/:patientId
 * @access  Private (The patient themselves, or any Doctor/Admin)
 */
export const getPrescriptionsForPatient = catchAsyncErrors(async (req, res, next) => {
    const { patientId } = req.params;
    const user = req.user;

    // Phân quyền: Bệnh nhân chỉ được xem đơn thuốc của chính mình
    if (user.role === 'Patient' && user.id !== patientId) {
        return next(new ErrorHandler("You are not authorized to view this patient's prescriptions.", 403));
    }

    const prescriptions = await Prescription.find({ patientId })
        .populate("doctorId", "firstName lastName doctorDepartment")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: prescriptions.length,
        prescriptions,
    });
});
