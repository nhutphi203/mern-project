import express from 'express';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Search route for medical records
router.get('/search', isAuthenticated, async (req, res, next) => {
    try {
        console.log('🔍 Search route hit - user:', req.user?.role);

        const user = req.user;
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            patientId,
            doctorId,
            dateFrom,
            dateTo,
            searchTerm
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

        // Search term filtering
        if (searchTerm) {
            filter.$or = [
                { 'clinicalAssessment.chiefComplaint': { $regex: searchTerm, $options: 'i' } },
                { 'clinicalAssessment.clinicalImpression': { $regex: searchTerm, $options: 'i' } },
                { 'diagnoses.icd10Description': { $regex: searchTerm, $options: 'i' } },
                { 'diagnoses.icd10Code': { $regex: searchTerm, $options: 'i' } }
            ];
        }

        console.log('✅ Importing models...');
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');
        console.log('✅ Models imported successfully');

        const skip = (page - 1) * limit;

        console.log('🔍 Executing search query with filter:', filter);
        const records = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        console.log(`✅ Search successful! Found ${records.length} records`);

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
            chiefComplaint: record.clinicalAssessment?.chiefComplaint || '',
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
            status: record.recordStatus === 'Finalized' ? 'Completed' :
                record.recordStatus === 'In Progress' ? 'Active' : 'Active',
            priority: record.clinicalAssessment?.severity || 'Routine',
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

        console.log('✅ Search response prepared successfully');

        res.status(200).json({
            success: true,
            data: transformedRecords,
            pagination
        });
    } catch (error) {
        console.error('❌ Search route error:', error.message);
        console.error('Stack:', error.stack);
        next(error);
    }
});

// Get all medical records with pagination and filtering (role-based)
router.get('/enhanced', isAuthenticated, async (req, res, next) => {
    try {
        console.log('🔍 Enhanced route hit - user:', req.user?.role);

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

        console.log('✅ Importing models...');
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');
        console.log('✅ Models imported successfully');

        const skip = (page - 1) * limit;

        console.log('🔍 Executing query with filter:', filter);
        const records = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName email phone dateOfBirth gender address')
            .populate('doctorId', 'firstName lastName specialization licenseNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        console.log(`✅ Query successful! Found ${records.length} records`);

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
            chiefComplaint: record.clinicalAssessment?.chiefComplaint || '',
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
            status: record.recordStatus === 'Finalized' ? 'Completed' :
                record.recordStatus === 'In Progress' ? 'Active' : 'Active',
            priority: record.clinicalAssessment?.severity || 'Routine',
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

        console.log('✅ Response prepared successfully');

        res.status(200).json({
            success: true,
            data: transformedRecords,
            pagination
        });
    } catch (error) {
        console.error('❌ Enhanced route error:', error.message);
        console.error('Stack:', error.stack);
        next(error);
    }
});

// Simple statistics route
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

        const stats = {
            totalRecords,
            activeCases,
            resolvedToday: 0,
            pendingReview: 0,
            recentActivity: {
                created: 0,
                updated: 0,
                reviewed: 0
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Statistics route error:', error.message);
        next(error);
    }
});

export default router;
