// Enhanced Medical Record Controller
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { EnhancedMedicalRecord } from '../models/enhancedMedicalRecord.model.js';
import { ICD10 } from '../models/icd10.model.js';
import { CPOE } from '../models/cpoe.model.js';

export const enhancedMedicalRecordController = {
    // Create new enhanced medical record
    createMedicalRecord: catchAsyncErrors(async (req, res, next) => {
        const {
            patientId,
            appointmentId,
            encounterId,
            chiefComplaint,
            historyOfPresentIllness,
            pastMedicalHistory,
            medications,
            allergies,
            socialHistory,
            familyHistory,
            reviewOfSystems,
            physicalExamination,
            vitalSigns,
            diagnosticResults,
            clinicalAssessment,
            carePlan,
            followUpInstructions
        } = req.body;

        const doctorId = req.user._id;

        // Build clinical assessment structure
        const clinicalAssessmentData = {
            chiefComplaint: chiefComplaint || clinicalAssessment?.chiefComplaint,
            historyOfPresentIllness: historyOfPresentIllness || clinicalAssessment?.historyOfPresentIllness,
            reviewOfSystems: reviewOfSystems || clinicalAssessment?.reviewOfSystems || {},
            physicalExam: physicalExamination || clinicalAssessment?.physicalExam || {},
            clinicalImpression: clinicalAssessment?.clinicalImpression || '',
            differentialDiagnosis: clinicalAssessment?.differentialDiagnosis || [],
            assessedBy: doctorId
        };

        // ✅ CRITICAL FIX: Proper appointmentId mapping with backward compatibility
        const medicalRecord = await EnhancedMedicalRecord.create({
            appointmentId, // FIXED: Use appointmentId directly
            patientId,
            doctorId, // Add doctorId for consistency
            encounterId: encounterId || appointmentId, // Keep encounterId for backward compatibility
            clinicalAssessment: clinicalAssessmentData,
            diagnoses: [],
            treatmentPlans: [],
            cpoeOrders: [],
            labResults: [],
            radiologyResults: [],
            attachments: [],
            progressNotes: [],
            followUpPlan: {
                followUpInstructions: followUpInstructions || ''
            },
            recordStatus: 'Draft',
            currentVersion: 1
        });

        // ✅ CRITICAL FIX: Enhanced populate with both appointmentId and encounterId support
        await medicalRecord.populate([
            { path: 'patientId', select: 'firstName lastName dateOfBirth email phone gender address' },
            { path: 'doctorId', select: 'firstName lastName specialization licenseNumber' },
            { path: 'appointmentId', select: 'appointment_date status department' },
            { path: 'encounterId', select: 'type status scheduledDateTime' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Enhanced medical record created successfully',
            data: medicalRecord
        });
    }),

    // Get medical record by encounter (support both encounterId and appointmentId)
    getMedicalRecordByEncounter: catchAsyncErrors(async (req, res, next) => {
        const { encounterId, appointmentId } = req.params;
        const recordId = encounterId || appointmentId;

        let filter = { isActive: true };
        if (encounterId) {
            filter.encounterId = recordId;
        } else if (appointmentId) {
            filter.appointmentId = recordId;
        }

        const medicalRecord = await EnhancedMedicalRecord.findOne(filter)
            .populate('patientId', 'firstName lastName dateOfBirth email phone gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .populate('appointmentId', 'appointment_date status department')
            .populate('encounterId', 'type status scheduledDateTime')
            .populate('diagnoses.icd10Code', 'code description category')
            .populate('treatmentPlans.cpoeOrderId')
            .populate('accessLog.userId', 'firstName lastName')
            .sort({ currentVersion: -1 });

        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        res.status(200).json({
            success: true,
            data: medicalRecord
        });
    }),

    // Get patient's medical history
    getPatientMedicalHistory: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const medicalRecords = await EnhancedMedicalRecord.find({
            patientId,
            isActive: true
        })
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .populate('appointmentId', 'appointment_date status department')
            .populate('encounterId', 'checkInTime status type')
            .populate('diagnoses.icd10Code', 'code description')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalRecords = await EnhancedMedicalRecord.countDocuments({
            patientId,
            isActive: true
        });

        res.status(200).json({
            success: true,
            count: medicalRecords.length,
            total: totalRecords,
            page: parseInt(page),
            totalPages: Math.ceil(totalRecords / limit),
            data: medicalRecords
        });
    }),

    // Add diagnosis to medical record
    addDiagnosis: catchAsyncErrors(async (req, res, next) => {
        const { recordId } = req.params;
        const { icd10Code, description, type, clinicalNotes, severity, status } = req.body;

        const medicalRecord = await EnhancedMedicalRecord.findById(recordId);
        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        // Verify ICD-10 code exists
        const icd10 = await ICD10.findById(icd10Code);
        if (!icd10) {
            return next(new ErrorHandler('Invalid ICD-10 code', 400));
        }

        const newDiagnosis = {
            icd10Code,
            description: description || icd10.description,
            type: type || 'Primary',
            clinicalNotes,
            severity,
            status: status || 'Active',
            diagnosedBy: req.user._id,
            diagnosedDate: new Date()
        };

        medicalRecord.diagnoses.push(newDiagnosis);

        // Add to audit trail
        medicalRecord.auditTrail.push({
            action: 'Diagnosis Added',
            performedBy: req.user._id,
            timestamp: new Date(),
            changes: `Added diagnosis: ${icd10.code} - ${icd10.description}`
        });

        await medicalRecord.save();

        // Update ICD-10 usage statistics
        await ICD10.findByIdAndUpdate(icd10Code, {
            $inc: { usageCount: 1 },
            $set: { lastUsed: new Date() }
        });

        await medicalRecord.populate('diagnoses.icd10Code', 'code description category');

        res.status(200).json({
            success: true,
            message: 'Diagnosis added successfully',
            data: medicalRecord
        });
    }),

    // Add treatment plan item
    addTreatmentPlan: catchAsyncErrors(async (req, res, next) => {
        const { recordId } = req.params;
        const {
            type,
            description,
            instructions,
            cpoeOrderId,
            startDate,
            endDate,
            frequency,
            dosage,
            expectedOutcome,
            monitoring
        } = req.body;

        const medicalRecord = await EnhancedMedicalRecord.findById(recordId);
        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        const treatmentItem = {
            type,
            description,
            instructions,
            cpoeOrderId,
            startDate,
            endDate,
            frequency,
            dosage,
            expectedOutcome,
            monitoring,
            prescribedBy: req.user._id,
            prescribedDate: new Date(),
            status: 'Active'
        };

        medicalRecord.treatmentPlan.push(treatmentItem);

        // Add to audit trail
        medicalRecord.auditTrail.push({
            action: 'Treatment Plan Updated',
            performedBy: req.user._id,
            timestamp: new Date(),
            changes: `Added treatment: ${type} - ${description}`
        });

        await medicalRecord.save();

        res.status(200).json({
            success: true,
            message: 'Treatment plan updated successfully',
            data: medicalRecord
        });
    }),

    // Update clinical assessment
    updateClinicalAssessment: catchAsyncErrors(async (req, res, next) => {
        const { recordId } = req.params;
        const { assessment, impression, plan, riskFactors, prognosis } = req.body;

        const medicalRecord = await EnhancedMedicalRecord.findById(recordId);
        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        const previousAssessment = JSON.stringify(medicalRecord.clinicalAssessment);

        medicalRecord.clinicalAssessment = {
            assessment,
            impression,
            plan,
            riskFactors,
            prognosis,
            assessedBy: req.user._id,
            assessedDate: new Date()
        };

        // Add to audit trail
        medicalRecord.auditTrail.push({
            action: 'Clinical Assessment Updated',
            performedBy: req.user._id,
            timestamp: new Date(),
            changes: `Updated clinical assessment`
        });

        await medicalRecord.save();

        res.status(200).json({
            success: true,
            message: 'Clinical assessment updated successfully',
            data: medicalRecord
        });
    }),

    // Sign medical record electronically
    signMedicalRecord: catchAsyncErrors(async (req, res, next) => {
        const { recordId } = req.params;
        const { signatureType = 'Electronic', signatureReason } = req.body;

        const medicalRecord = await EnhancedMedicalRecord.findById(recordId);
        if (!medicalRecord) {
            return next(new ErrorHandler('Medical record not found', 404));
        }

        // Check if user is authorized to sign
        if (!['Doctor', 'Nurse Practitioner', 'Physician Assistant'].includes(req.user.role)) {
            return next(new ErrorHandler('Not authorized to sign medical records', 403));
        }

        const signature = {
            signedBy: req.user._id,
            signedDate: new Date(),
            signatureType,
            signatureReason,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        medicalRecord.electronicSignatures.push(signature);
        medicalRecord.status = 'Signed';

        // Add to audit trail
        medicalRecord.auditTrail.push({
            action: 'Record Signed',
            performedBy: req.user._id,
            timestamp: new Date(),
            changes: `Record electronically signed`
        });

        await medicalRecord.save();

        res.status(200).json({
            success: true,
            message: 'Medical record signed successfully',
            data: medicalRecord
        });
    }),

    // Get diagnosis statistics
    getDiagnosisStatistics: catchAsyncErrors(async (req, res, next) => {
        const { startDate, endDate, category } = req.query;

        let matchStage = {};

        if (startDate || endDate) {
            matchStage['diagnoses.diagnosedDate'] = {};
            if (startDate) matchStage['diagnoses.diagnosedDate'].$gte = new Date(startDate);
            if (endDate) matchStage['diagnoses.diagnosedDate'].$lte = new Date(endDate);
        }

        let pipeline = [
            { $match: matchStage },
            { $unwind: '$diagnoses' },
            {
                $lookup: {
                    from: 'icd10s',
                    localField: 'diagnoses.icd10Code',
                    foreignField: '_id',
                    as: 'icd10Info'
                }
            },
            { $unwind: '$icd10Info' }
        ];

        if (category) {
            pipeline.push({ $match: { 'icd10Info.category': category } });
        }

        pipeline.push(
            {
                $group: {
                    _id: {
                        code: '$icd10Info.code',
                        description: '$icd10Info.description',
                        category: '$icd10Info.category'
                    },
                    count: { $sum: 1 },
                    severity: { $push: '$diagnoses.severity' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        );

        const diagnosisStats = await EnhancedMedicalRecord.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: diagnosisStats
        });
    }),

    // Search medical records
    searchMedicalRecords: catchAsyncErrors(async (req, res, next) => {
        const {
            query,
            patientName,
            icd10Code,
            dateFrom,
            dateTo,
            status,
            limit = 20,
            page = 1
        } = req.query;

        let searchFilter = { isActive: true };

        if (query) {
            searchFilter.$or = [
                { chiefComplaint: { $regex: query, $options: 'i' } },
                { 'clinicalAssessment.assessment': { $regex: query, $options: 'i' } },
                { 'clinicalAssessment.impression': { $regex: query, $options: 'i' } }
            ];
        }

        if (status) {
            searchFilter.status = status;
        }

        if (dateFrom || dateTo) {
            searchFilter.createdAt = {};
            if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        let searchQuery = EnhancedMedicalRecord.find(searchFilter)
            .populate('patientId', 'firstName lastName dateOfBirth')
            .populate('primaryProviderId', 'firstName lastName')
            .populate('diagnoses.icd10Code', 'code description')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        if (patientName) {
            searchQuery = searchQuery.populate({
                path: 'patientId',
                match: {
                    $or: [
                        { firstName: { $regex: patientName, $options: 'i' } },
                        { lastName: { $regex: patientName, $options: 'i' } }
                    ]
                }
            });
        }

        const records = await searchQuery;
        const totalRecords = await EnhancedMedicalRecord.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            count: records.length,
            total: totalRecords,
            page: parseInt(page),
            totalPages: Math.ceil(totalRecords / limit),
            data: records
        });
    })
};
