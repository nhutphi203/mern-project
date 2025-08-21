import express from 'express';
import { enhancedMedicalRecordController } from '../controller/enhancedMedicalRecordController.js';

const router = express.Router();

// Test route without authentication to isolate the ObjectId error
router.get('/enhanced-test', async (req, res, next) => {
    try {
        console.log('🧪 Test route hit - checking for ObjectId cast error...');

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

        console.log('Query params:', { page, limit, status, priority });

        let filter = { isActive: true };

        // Apply additional filters  
        if (status) filter.recordStatus = status;
        if (patientId) filter.patientId = patientId;
        if (doctorId) filter.doctorId = doctorId;

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        console.log('Filter object:', filter);

        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        console.log('✅ Models imported successfully');

        const skip = (page - 1) * limit;

        console.log('Executing query...');
        const records = await EnhancedMedicalRecord.find(filter)
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName specialization')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        console.log(`✅ Query successful! Found ${records.length} records`);

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
            message: 'Test successful - no ObjectId cast error',
            data: records,
            pagination
        });

    } catch (error) {
        console.error('❌ Error in test route:', error.message);
        console.error('Stack:', error.stack);
        next(error);
    }
});

export default router;
