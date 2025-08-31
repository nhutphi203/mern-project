import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { MedicalRecord } from "../models/medicalRecordSchema.js";
import { User } from "../models/userScheme.js";

// Helper function để kiểm tra quyền sở hữu
const checkOwnership = (prescription, user) => {
    if (prescription.doctorId.toString() !== user.id.toString()) {
        throw new ErrorHandler("You are not authorized to perform this action.", 403);
    }
};

/**
 * @desc    Create a new prescription
 * @route   POST /api/v1/prescriptions
 * @access  Private (Doctor only)
 */
export const createPrescription = catchAsyncErrors(async (req, res, next) => {
    const { medicalRecordId, medications, digitalSignature } = req.body;
    const doctorId = req.user.id;

    if (!medicalRecordId || !medications || !Array.isArray(medications) || medications.length === 0) {
        return next(new ErrorHandler("Medical Record ID and at least one medication are required.", 400));
    }
    if (!digitalSignature) {
        return next(new ErrorHandler("Digital signature is required.", 400));
    }

    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
        return next(new ErrorHandler("Medical Record not found.", 404));
    }

    if (medicalRecord.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("You are not authorized to create a prescription for this medical record.", 403));
    }

    const prescription = await Prescription.create({
        medicalRecordId,
        patientId: medicalRecord.patientId,
        doctorId,
        medications,
        digitalSignature,
        dateSigned: new Date(),
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
 * @access  Private
 */
export const getPrescriptionsForRecord = catchAsyncErrors(async (req, res, next) => {
    const { recordId } = req.params;
    const prescriptions = await Prescription.find({ medicalRecordId: recordId })
        .populate("doctorId", "firstName lastName doctorDepartment")
        .sort({ createdAt: -1 });

    // Note: Cần thêm logic phân quyền ở đây để đảm bảo chỉ patient hoặc doctor liên quan mới xem được

    res.status(200).json({
        success: true,
        count: prescriptions.length,
        prescriptions,
    });
});


/**
 * @desc    Update a prescription
 * @route   PUT /api/v1/prescriptions/:id
 * @access  Private (Doctor only, owner)
 */
export const updatePrescription = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { medications, status } = req.body;

    let prescription = await Prescription.findById(id);
    if (!prescription) {
        return next(new ErrorHandler("Prescription not found.", 404));
    }

    // Chỉ bác sĩ tạo đơn thuốc mới có quyền sửa
    checkOwnership(prescription, req.user);

    // Cập nhật các trường
    if (medications) prescription.medications = medications;
    if (status) prescription.status = status;

    prescription = await prescription.save();

    res.status(200).json({
        success: true,
        message: "Prescription updated successfully!",
        prescription,
    });
});

/**
 * @desc    Delete a prescription
 * @route   DELETE /api/v1/prescriptions/:id
 * @access  Private (Doctor only, owner)
 */
export const deletePrescription = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);

    if (!prescription) {
        return next(new ErrorHandler("Prescription not found.", 404));
    }

    // Chỉ bác sĩ tạo đơn thuốc mới có quyền xóa
    checkOwnership(prescription, req.user);

    await prescription.deleteOne();

    res.status(200).json({
        success: true,
        message: "Prescription deleted successfully!",
    });
});

// Các hàm khác như getPrescriptionsForPatient có thể giữ nguyên
export const getPrescriptionsForPatient = catchAsyncErrors(async (req, res, next) => {
    const { patientId } = req.params;
    const user = req.user;

    if (user.role === 'Patient' && user.id !== patientId) {
        return next(new ErrorHandler("You are not authorized to view this patient's prescriptions.", 403));
    }

    const prescriptions = await Prescription.find({ patientId })
        .populate("doctorId", "firstName lastName doctorDepartment")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        prescriptions,
    });
});
