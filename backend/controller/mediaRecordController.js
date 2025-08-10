
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { MedicalRecord } from '../models/medicalRecordSchema.js';
import { Appointment } from '../models/appointmentSchema.js';
import cloudinary from 'cloudinary';

// @desc    Get all media records for an appointment
// @route   GET /api/v1/medicalrecords?appointmentId=<id>
// @access  Private (Doctor or Patient of the appointment)
export const getMediaRecords = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId } = req.query;
    const user = req.user;

    if (!appointmentId) {
        return next(new ErrorHandler("Appointment ID is required", 400));
    }

    // Verify appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    // Check if user is doctor or patient of this appointment
    const isAuthorized =
        user.role === 'Admin' ||
        appointment.doctorId.toString() === user._id.toString() ||
        appointment.patientId.toString() === user._id.toString();

    if (!isAuthorized) {
        return next(new ErrorHandler("You are not authorized to view these records", 403));
    }

    const mediaRecords = await MedicalRecord.find({ appointmentId })
        .populate('uploadedBy', 'firstName lastName role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: mediaRecords.length,
        mediaRecords,
    });
});

// @desc    Upload new media record
// @route   POST /api/v1/medicalrecords
// @access  Private (Doctor only)
export const uploadMediaRecord = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId, description } = req.body;
    const user = req.user;

    if (!appointmentId) {
        return next(new ErrorHandler("Appointment ID is required", 400));
    }

    if (!req.files || !req.files.file) {
        return next(new ErrorHandler("Please select a file to upload", 400));
    }

    // Verify appointment exists and user is the doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    if (appointment.doctorId.toString() !== user._id.toString() && user.role !== 'Admin') {
        return next(new ErrorHandler("Only the assigned doctor can upload media records", 403));
    }

    const file = req.files.file;

    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
        return next(new ErrorHandler("File type not supported. Only JPG, PNG, PDF, and MP4 are allowed", 400));
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return next(new ErrorHandler("File size too large. Maximum size is 10MB", 400));
    }

    try {
        // Determine file type
        let fileType = 'document';
        if (file.mimetype.startsWith('image/')) fileType = 'image';
        else if (file.mimetype.startsWith('video/')) fileType = 'video';

        // Upload to Cloudinary
        const resourceType = fileType === 'video' ? 'video' : 'auto';
        const cloudinaryResponse = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: `medical-records/${appointmentId}`,
            resource_type: resourceType,
        });

        // Create media record
        const mediaRecord = await MedicalRecord.create({
            appointmentId,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            fileType,
            fileName: file.name,
            fileUrl: cloudinaryResponse.secure_url,
            cloudinaryPublicId: cloudinaryResponse.public_id,
            fileSize: file.size,
            mimeType: file.mimetype,
            description: description || '',
            uploadedBy: user._id,
        });

        await mediaRecord.populate('uploadedBy', 'firstName lastName role');

        res.status(201).json({
            success: true,
            message: "Media record uploaded successfully",
            mediaRecord,
        });

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return next(new ErrorHandler("Error uploading file to cloud storage", 500));
    }
});

// @desc    Delete media record
// @route   DELETE /api/v1/medicalrecords/:id
// @access  Private (Doctor who uploaded it or Admin)
export const deleteMediaRecord = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;

    const mediaRecord = await MedicalRecord.findById(id);
    if (!mediaRecord) {
        return next(new ErrorHandler("Media record not found", 404));
    }

    // Check authorization
    const isAuthorized =
        user.role === 'Admin' ||
        mediaRecord.uploadedBy.toString() === user._id.toString();

    if (!isAuthorized) {
        return next(new ErrorHandler("You can only delete records you uploaded", 403));
    }

    try {
        // Delete from Cloudinary
        if (mediaRecord.cloudinaryPublicId) {
            const resourceType = mediaRecord.fileType === 'video' ? 'video' : 'image';
            await cloudinary.v2.uploader.destroy(mediaRecord.cloudinaryPublicId, {
                resource_type: resourceType
            });
        }

        // Delete from database
        await mediaRecord.deleteOne();

        res.status(200).json({
            success: true,
            message: "Media record deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting media record:", error);
        return next(new ErrorHandler("Error deleting file", 500));
    }
});
