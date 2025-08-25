// Diagnosis Controller - Tích hợp với Medical Records
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { ICD10 } from '../models/icd10.model.js';
import { Diagnosis } from '../models/diagnosis.model.js';

export const diagnosisController = {
    // Add diagnosis to medical record
    addDiagnosis: catchAsyncErrors(async (req, res, next) => {
        const { medicalRecordId } = req.params;
        const {
            icd10Code,
            customDescription,
            type = 'Primary',
            severity = 'Moderate',
            status = 'Active',
            confidence = 'Probable',
            onsetDate,
            clinicalNotes
        } = req.body;

        // Validate ICD-10 code exists
        const icd10 = await ICD10.findOne({ code: icd10Code.toUpperCase() });
        if (!icd10) {
            return next(new ErrorHandler('Invalid ICD-10 code', 400));
        }

        // Get medical record to extract patientId
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const medicalRecord = await EnhancedMedicalRecord.findById(medicalRecordId);
        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        // Create diagnosis
        const diagnosis = new Diagnosis({
            medicalRecordId,
            doctorId: req.user._id,
            patientId: medicalRecord.patientId,
            icd10Code: icd10Code.toUpperCase(),
            icd10Description: icd10.shortDescription,
            customDescription,
            type,
            severity,
            status,
            confidence,
            onsetDate: onsetDate ? new Date(onsetDate) : undefined,
            clinicalNotes,
            createdBy: req.user._id
        });

        await diagnosis.save();

        // Update ICD-10 usage count
        await icd10.incrementUsage();

        // Populate response
        await diagnosis.populate([
            { path: 'doctorId', select: 'firstName lastName specialization' },
            { path: 'patientId', select: 'firstName lastName' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Diagnosis added successfully',
            data: diagnosis
        });
    }),

    // Get diagnoses for medical record
    getDiagnosesByRecord: catchAsyncErrors(async (req, res, next) => {
        const { medicalRecordId } = req.params;
        const { type, status } = req.query;

        let filter = { medicalRecordId };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const diagnoses = await Diagnosis.find(filter)
            .populate('doctorId', 'firstName lastName specialization')
            .populate('createdBy', 'firstName lastName')
            .populate('lastModifiedBy', 'firstName lastName')
            .sort({ type: 1, diagnosedDate: -1 }); // Primary first, then by date

        res.status(200).json({
            success: true,
            count: diagnoses.length,
            data: diagnoses
        });
    }),

    // Get patient's diagnosis history
    getPatientDiagnoses: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;
        const {
            status = 'Active',
            limit = 20,
            page = 1,
            icd10Category
        } = req.query;

        let filter = { patientId };
        if (status !== 'all') filter.status = status;

        const skip = (page - 1) * limit;

        let pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: 'icd10codes',
                    localField: 'icd10Code',
                    foreignField: 'code',
                    as: 'icd10Info'
                }
            }
        ];

        if (icd10Category) {
            pipeline.push({
                $match: { 'icd10Info.category': icd10Category }
            });
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            {
                $lookup: {
                    from: 'enhancedmedicalrecords',
                    localField: 'medicalRecordId',
                    foreignField: '_id',
                    as: 'medicalRecord'
                }
            },
            { $sort: { diagnosedDate: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        const diagnoses = await Diagnosis.aggregate(pipeline);
        const total = await Diagnosis.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: diagnoses.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: diagnoses
        });
    }),

    // Update diagnosis
    updateDiagnosis: catchAsyncErrors(async (req, res, next) => {
        const { diagnosisId } = req.params;
        const updates = req.body;

        const diagnosis = await Diagnosis.findById(diagnosisId);
        if (!diagnosis) {
            return next(new ErrorHandler('Diagnosis not found', 404));
        }

        // Check permission - only doctor who created or assigned doctor can update
        if (diagnosis.doctorId.toString() !== req.user._id.toString() &&
            req.user.role !== 'Admin') {
            return next(new ErrorHandler('Not authorized to update this diagnosis', 403));
        }

        // Update fields
        Object.assign(diagnosis, updates);
        diagnosis.lastModifiedBy = req.user._id;
        diagnosis.version += 1;

        await diagnosis.save();
        await diagnosis.populate([
            { path: 'doctorId', select: 'firstName lastName specialization' },
            { path: 'lastModifiedBy', select: 'firstName lastName' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Diagnosis updated successfully',
            data: diagnosis
        });
    }),

    // Delete diagnosis (soft delete by changing status)
    deleteDiagnosis: catchAsyncErrors(async (req, res, next) => {
        const { diagnosisId } = req.params;

        const diagnosis = await Diagnosis.findById(diagnosisId);
        if (!diagnosis) {
            return next(new ErrorHandler('Diagnosis not found', 404));
        }

        // Check permission
        if (diagnosis.doctorId.toString() !== req.user._id.toString() &&
            req.user.role !== 'Admin') {
            return next(new ErrorHandler('Not authorized to delete this diagnosis', 403));
        }

        // Soft delete by marking as resolved
        diagnosis.status = 'Resolved';
        diagnosis.resolvedDate = new Date();
        diagnosis.lastModifiedBy = req.user._id;
        diagnosis.version += 1;

        await diagnosis.save();

        res.status(200).json({
            success: true,
            message: 'Diagnosis deleted successfully'
        });
    }),

    // Get diagnosis statistics
    getDiagnosisStatistics: catchAsyncErrors(async (req, res, next) => {
        const { dateFrom, dateTo, category, doctorId } = req.query;

        let matchFilter = {};

        if (dateFrom || dateTo) {
            matchFilter.diagnosedDate = {};
            if (dateFrom) matchFilter.diagnosedDate.$gte = new Date(dateFrom);
            if (dateTo) matchFilter.diagnosedDate.$lte = new Date(dateTo);
        }

        if (doctorId) matchFilter.doctorId = new mongoose.Types.ObjectId(doctorId);

        let pipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'icd10codes',
                    localField: 'icd10Code',
                    foreignField: 'code',
                    as: 'icd10Info'
                }
            },
            { $unwind: '$icd10Info' }
        ];

        if (category) {
            pipeline.push({ $match: { 'icd10Info.category': category } });
        }

        // Top diagnoses by frequency
        const topDiagnoses = await Diagnosis.aggregate([
            ...pipeline,
            {
                $group: {
                    _id: {
                        code: '$icd10Code',
                        description: '$icd10Description'
                    },
                    count: { $sum: 1 },
                    severityBreakdown: {
                        $push: '$severity'
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Diagnoses by category
        const categoryStats = await Diagnosis.aggregate([
            ...pipeline,
            {
                $group: {
                    _id: '$icd10Info.category',
                    count: { $sum: 1 },
                    avgSeverity: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$severity', 'Mild'] }, then: 1 },
                                    { case: { $eq: ['$severity', 'Moderate'] }, then: 2 },
                                    { case: { $eq: ['$severity', 'Severe'] }, then: 3 },
                                    { case: { $eq: ['$severity', 'Critical'] }, then: 4 }
                                ],
                                default: 2
                            }
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                topDiagnoses,
                categoryStats,
                totalDiagnoses: await Diagnosis.countDocuments(matchFilter)
            }
        });
    }),

    // Search diagnoses across the system
    searchDiagnoses: catchAsyncErrors(async (req, res, next) => {
        const {
            query,
            patientName,
            doctorName,
            icd10Code,
            status,
            severity,
            dateFrom,
            dateTo,
            limit = 20,
            page = 1
        } = req.query;

        let searchFilter = {};

        if (query) {
            searchFilter.$or = [
                { icd10Description: { $regex: query, $options: 'i' } },
                { customDescription: { $regex: query, $options: 'i' } },
                { clinicalNotes: { $regex: query, $options: 'i' } }
            ];
        }

        if (icd10Code) searchFilter.icd10Code = icd10Code.toUpperCase();
        if (status) searchFilter.status = status;
        if (severity) searchFilter.severity = severity;

        if (dateFrom || dateTo) {
            searchFilter.diagnosedDate = {};
            if (dateFrom) searchFilter.diagnosedDate.$gte = new Date(dateFrom);
            if (dateTo) searchFilter.diagnosedDate.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        let pipeline = [
            { $match: searchFilter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: '$patient' },
            { $unwind: '$doctor' }
        ];

        if (patientName) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'patient.firstName': { $regex: patientName, $options: 'i' } },
                        { 'patient.lastName': { $regex: patientName, $options: 'i' } }
                    ]
                }
            });
        }

        if (doctorName) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'doctor.firstName': { $regex: doctorName, $options: 'i' } },
                        { 'doctor.lastName': { $regex: doctorName, $options: 'i' } }
                    ]
                }
            });
        }

        pipeline.push(
            { $sort: { diagnosedDate: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        const diagnoses = await Diagnosis.aggregate(pipeline);
        const total = await Diagnosis.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            count: diagnoses.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: diagnoses
        });
    })
};

export default diagnosisController;
