import express from 'express';
import { enhancedMedicalRecordController } from '../controller/enhancedMedicalRecordController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Get medical records summary for dashboard (role-based)
router.get('/summary', isAuthenticated, async (req, res, next) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        // Role-based filtering
        if (user.role === 'Patient') {
            filter.patientId = user._id;
        } else if (user.role === 'Doctor') {
            filter.doctorId = user._id;
        }

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        // Get recent records
        const recentRecords = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get statistics
        const totalRecords = await EnhancedMedicalRecord.countDocuments(filter);
        const activeCases = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: { $in: ['In Progress', 'Draft'] }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: 'Finalized',
            updatedAt: { $gte: today }
        });

        const pendingReview = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: 'Completed'
        });

        const createdToday = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            createdAt: { $gte: today }
        });

        const updatedToday = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            updatedAt: { $gte: today },
            createdAt: { $lt: today }
        });

        // Transform to match frontend interface
        const summaryData = recentRecords.map(record => ({
            _id: record._id,
            patientName: `${record.patientId?.firstName || ''} ${record.patientId?.lastName || ''}`.trim(),
            patientId: record.patientId?._id,
            diagnosis: record.diagnoses?.[0]?.icd10Description || 'No diagnosis recorded',
            icd10Code: record.diagnoses?.[0]?.icd10Code || '',
            lastUpdated: record.updatedAt,
            status: record.recordStatus === 'Finalized' ? 'Resolved' :
                record.recordStatus === 'In Progress' ? 'Under Treatment' : 'Active',
            doctor: `${record.doctorId?.firstName || ''} ${record.doctorId?.lastName || ''}`.trim(),
            priority: record.clinicalAssessment?.severity || 'Medium',
            chiefComplaint: record.clinicalAssessment?.chiefComplaint || ''
        }));

        const stats = {
            totalRecords,
            activeCases,
            resolvedToday,
            pendingReview,
            recentActivity: {
                created: createdToday,
                updated: updatedToday,
                reviewed: pendingReview
            }
        };

        res.status(200).json({
            success: true,
            data: summaryData,
            stats
        });
    } catch (error) {
        next(error);
    }
});

// Get medical record statistics
router.get('/statistics', isAuthenticated, async (req, res, next) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        if (user.role === 'Patient') {
            filter.patientId = user._id;
        } else if (user.role === 'Doctor') {
            filter.doctorId = user._id;
        }

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const totalRecords = await EnhancedMedicalRecord.countDocuments(filter);
        const activeCases = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: { $in: ['In Progress', 'Draft'] }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: 'Finalized',
            updatedAt: { $gte: today }
        });

        const pendingReview = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            recordStatus: 'Completed'
        });

        const createdToday = await EnhancedMedicalRecord.countDocuments({
            ...filter,
            createdAt: { $gte: today }
        });

        const stats = {
            totalRecords,
            activeCases,
            resolvedToday,
            pendingReview,
            recentActivity: {
                created: createdToday,
                updated: 0,
                reviewed: pendingReview
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

// Get all medical records with pagination and filtering (role-based)
router.get('/enhanced', isAuthenticated, async (req, res, next) => {
    try {
        const user = req.user;
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

        let filter = { isActive: true };

        // Role-based filtering
        if (user.role === 'Patient') {
            filter.patientId = user._id;
        } else if (user.role === 'Doctor') {
            filter.doctorId = user._id;
        }

        // Apply additional filters
        if (status) filter.recordStatus = status;
        if (patientId && user.role !== 'Patient') filter.patientId = patientId;
        if (doctorId && user.role === 'Admin') filter.doctorId = doctorId;

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        const skip = (page - 1) * limit;

        const records = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')

            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalRecords = await EnhancedMedicalRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);

        // Transform data to match frontend interface
        const transformedRecords = records.map(record => ({
            _id: record._id,
            patientId: {
                _id: record.patientId?._id,
                firstName: record.patientId?.firstName,
                lastName: record.patientId?.lastName,
                email: record.patientId?.email,
                phone: record.patientId?.phone,
                dateOfBirth: record.patientId?.dateOfBirth,
                gender: record.patientId?.gender,
                address: record.patientId?.address
            },
            doctorId: {
                _id: record.doctorId?._id,
                firstName: record.doctorId?.firstName,
                lastName: record.doctorId?.lastName,
                specialization: record.doctorId?.specialization,
                licenseNumber: record.doctorId?.licenseNumber
            },
            encounterId: record.encounterId ? {
                _id: record.encounterId._id,
                type: record.encounterId.type,
                status: record.encounterId.status,
                scheduledDateTime: record.encounterId.scheduledDateTime
            } : undefined,
            chiefComplaint: record.clinicalAssessment?.chiefComplaint || '',
            historyOfPresentIllness: record.clinicalAssessment?.historyOfPresentIllness || '',
            pastMedicalHistory: [],
            medications: [],
            allergies: [],
            socialHistory: {},
            familyHistory: [],
            vitalSigns: record.clinicalAssessment?.physicalExam?.vitalSigns || {},
            physicalExamination: {
                general: record.clinicalAssessment?.physicalExam?.generalAppearance,
                heent: `${record.clinicalAssessment?.physicalExam?.head || ''} ${record.clinicalAssessment?.physicalExam?.eyes || ''}`.trim(),
                cardiovascular: record.clinicalAssessment?.physicalExam?.heart,
                respiratory: record.clinicalAssessment?.physicalExam?.chest,
                abdomen: record.clinicalAssessment?.physicalExam?.abdomen,
                neurological: record.clinicalAssessment?.physicalExam?.neurological,
                musculoskeletal: record.clinicalAssessment?.physicalExam?.extremities,
                skin: record.clinicalAssessment?.physicalExam?.skin
            },
            assessment: record.clinicalAssessment?.clinicalImpression || '',
            diagnosis: {
                primary: record.diagnoses?.[0] ? {
                    code: record.diagnoses[0].icd10Code,
                    description: record.diagnoses[0].icd10Description,
                    icd10Code: record.diagnoses[0].icd10Code
                } : { code: '', description: '', icd10Code: '' },
                secondary: record.diagnoses?.slice(1).map(d => ({
                    code: d.icd10Code,
                    description: d.icd10Description,
                    icd10Code: d.icd10Code
                })) || []
            },
            plan: {
                medications: record.treatmentPlans?.filter(t => t.planType === 'Medication').map(t => ({
                    name: t.planName,
                    dosage: t.dosage,
                    frequency: t.frequency,
                    duration: t.duration,
                    instructions: t.instructions
                })) || [],
                procedures: record.treatmentPlans?.filter(t => t.planType === 'Procedure').map(t => ({
                    name: t.planName,
                    description: t.description,
                    scheduledDate: t.startDate
                })) || [],
                followUp: record.followUpPlan?.nextAppointment ? {
                    date: record.followUpPlan.nextAppointment,
                    provider: `${record.doctorId?.firstName || ''} ${record.doctorId?.lastName || ''}`.trim(),
                    notes: record.followUpPlan.followUpInstructions
                } : undefined,
                patientEducation: record.followUpPlan?.warningSignsToWatch || [],
                dietaryRecommendations: [],
                activityRestrictions: []
            },
            labOrders: [],
            progressNotes: record.progressNotes?.map(note => ({
                date: note.createdAt,
                provider: note.authorRole,
                note: note.content,
                type: note.noteType
            })) || [],
            status: record.recordStatus === 'Finalized' ? 'Completed' :
                record.recordStatus === 'In Progress' ? 'Active' : 'Active',
            priority: record.clinicalAssessment?.severity || 'Routine',
            isConfidential: false,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            version: record.currentVersion || 1
        }));

        const pagination = {
            currentPage: parseInt(page),
            totalPages,
            totalRecords,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            data: transformedRecords,
            pagination
        });
    } catch (error) {
        next(error);
    }
});

// Get medical record by ID
router.get('/enhanced/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        let filter = { _id: id, isActive: true };

        // Role-based access control
        if (user.role === 'Patient') {
            filter.patientId = user._id;
        }

        const record = await EnhancedMedicalRecord.findOne(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            ;

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Transform to frontend format (same as above)
        const transformedRecord = {
            _id: record._id,
            patientId: {
                _id: record.patientId?._id,
                firstName: record.patientId?.firstName,
                lastName: record.patientId?.lastName,
                email: record.patientId?.email,
                phone: record.patientId?.phone,
                dateOfBirth: record.patientId?.dateOfBirth,
                gender: record.patientId?.gender,
                address: record.patientId?.address
            },
            doctorId: {
                _id: record.doctorId?._id,
                firstName: record.doctorId?.firstName,
                lastName: record.doctorId?.lastName,
                specialization: record.doctorId?.specialization,
                licenseNumber: record.doctorId?.licenseNumber
            },
            // ... rest of transformation same as above
            status: record.recordStatus === 'Finalized' ? 'Completed' : 'Active',
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };

        res.status(200).json({
            success: true,
            data: transformedRecord
        });
    } catch (error) {
        next(error);
    }
});

// Get medical record by appointment ID (SUPPORT APPOINTMENTID)
router.get('/enhanced/appointment/:appointmentId', isAuthenticated, async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const user = req.user;

        console.log('🔍 Finding medical record by appointmentId:', appointmentId);

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        let filter = { appointmentId, isActive: true };

        // Role-based access control
        if (user.role === 'Patient') {
            filter.patientId = user._id;
        } else if (user.role === 'Doctor') {
            filter.doctorId = user._id;
        }

        const record = await EnhancedMedicalRecord.findOne(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .populate('appointmentId', 'appointment_date status department')
            .populate('encounterId', 'type status scheduledDateTime');

        if (!record) {
            console.log('❌ No medical record found for appointment:', appointmentId);
            return res.status(404).json({
                success: false,
                message: 'Medical record not found for this appointment'
            });
        }

        console.log('✅ Medical record found:', record._id);

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('❌ Error finding medical record by appointment:', error);
        next(error);
    }
});

// Get patient's medical records (for patient role)
router.get('/my-records', isAuthenticated, requireRole(['Patient']), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, dateFrom, dateTo } = req.query;
        const patientId = req.user._id;

        let filter = { patientId, isActive: true };

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        const skip = (page - 1) * limit;

        const records = await EnhancedMedicalRecord.find(filter)
            .populate('doctorId', 'firstName lastName specialization')

            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalRecords = await EnhancedMedicalRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);

        const pagination = {
            currentPage: parseInt(page),
            totalPages,
            totalRecords,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            data: records,
            pagination
        });
    } catch (error) {
        next(error);
    }
});

// Create new medical record (Doctor only) - FIX APPOINTMENTID SUPPORT
router.post('/enhanced', isAuthenticated, requireRole(['Doctor']), async (req, res, next) => {
    try {
        console.log('📝 Creating new enhanced medical record...');
        console.log('Request body:', req.body);

        // Call the controller method
        await enhancedMedicalRecordController.createMedicalRecord(req, res, next);
    } catch (error) {
        console.error('❌ Error creating medical record:', error);
        next(error);
    }
});

// Update medical record (Doctor only)
router.put('/enhanced/:id', isAuthenticated, requireRole(['Doctor']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = req.user;

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const record = await EnhancedMedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Update fields
        if (updateData.chiefComplaint) {
            record.clinicalAssessment.chiefComplaint = updateData.chiefComplaint;
        }
        if (updateData.historyOfPresentIllness) {
            record.clinicalAssessment.historyOfPresentIllness = updateData.historyOfPresentIllness;
        }
        if (updateData.assessment) {
            record.clinicalAssessment.clinicalImpression = updateData.assessment;
        }

        record.lastModifiedBy = user._id;
        record.lastModifiedAt = new Date();

        await record.save();

        res.status(200).json({
            success: true,
            data: record,
            message: 'Medical record updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Delete medical record (Admin only)
router.delete('/enhanced/:id', isAuthenticated, requireRole(['Admin']), async (req, res, next) => {
    try {
        const { id } = req.params;

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const record = await EnhancedMedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Soft delete
        record.isActive = false;
        await record.save();

        res.status(200).json({
            success: true,
            message: 'Medical record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Search medical records
router.post('/search', isAuthenticated, async (req, res, next) => {
    try {
        const user = req.user;
        const {
            query,
            patientName,
            diagnosis,
            icd10Code,
            doctorName,
            dateFrom,
            dateTo,
            status,
            priority
        } = req.body;

        let filter = { isActive: true };

        // Role-based filtering
        if (user.role === 'Patient') {
            filter.patientId = user._id;
        } else if (user.role === 'Doctor') {
            filter.doctorId = user._id;
        }

        // Build search criteria
        if (query) {
            filter.$or = [
                { 'clinicalAssessment.chiefComplaint': { $regex: query, $options: 'i' } },
                { 'clinicalAssessment.clinicalImpression': { $regex: query, $options: 'i' } },
                { 'diagnoses.icd10Description': { $regex: query, $options: 'i' } }
            ];
        }

        if (diagnosis) {
            filter['diagnoses.icd10Description'] = { $regex: diagnosis, $options: 'i' };
        }

        if (icd10Code) {
            filter['diagnoses.icd10Code'] = icd10Code;
        }

        if (status) {
            filter.recordStatus = status;
        }

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        let searchQuery = EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .sort({ createdAt: -1 });

        // Filter by patient name if provided
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

        // Filter by doctor name if provided
        if (doctorName) {
            searchQuery = searchQuery.populate({
                path: 'primaryProviderId',
                match: {
                    $or: [
                        { firstName: { $regex: doctorName, $options: 'i' } },
                        { lastName: { $regex: doctorName, $options: 'i' } }
                    ]
                }
            });
        }

        const records = await searchQuery;
        const filteredRecords = records.filter(record =>
            record.patientId && record.primaryProviderId
        );

        res.status(200).json({
            success: true,
            data: filteredRecords,
            total: filteredRecords.length
        });
    } catch (error) {
        next(error);
    }
});

// Add progress note to medical record
router.post('/enhanced/:id/progress-note', isAuthenticated, requireRole(['Doctor', 'Nurse']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note, type } = req.body;
        const user = req.user;

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const record = await EnhancedMedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        await record.addProgressNote({
            noteType: type,
            content: note
        }, user._id, user.role);

        res.status(200).json({
            success: true,
            data: record,
            message: 'Progress note added successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Sign medical record (Doctor only)
router.post('/enhanced/:id/sign', isAuthenticated, requireRole(['Doctor']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        const record = await EnhancedMedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        await record.signRecord(user._id, req.ip);

        res.status(200).json({
            success: true,
            data: record,
            message: 'Medical record signed successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
