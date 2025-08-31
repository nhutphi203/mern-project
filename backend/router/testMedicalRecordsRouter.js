import express from 'express';

console.log('🚀 Creating minimal working medical records router...');

const router = express.Router();

// Simple working route without authentication first
router.get('/test-simple', async (req, res) => {
    try {
        console.log('🧪 Simple test route hit');

        // Import models
        const mongoose = await import('mongoose');
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');

        // Simple query
        const records = await EnhancedMedicalRecord.find({ isActive: true })
            .limit(5)
            .select('_id createdAt recordStatus');

        res.status(200).json({
            success: true,
            message: 'Simple test successful',
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error('❌ Simple test error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
            details: error.stack
        });
    }
});

// Minimal enhanced route without auth to test
router.get('/enhanced-no-auth', async (req, res) => {
    try {
        console.log('🧪 Enhanced no-auth route hit');

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Import models
        const { EnhancedMedicalRecord } = await import('../models/enhancedMedicalRecord.model.js');
        const { User } = await import('../models/userScheme.js');

        console.log('✅ Models imported');

        // Basic query
        const records = await EnhancedMedicalRecord.find({ isActive: true })
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        console.log(`✅ Found ${records.length} records`);

        const totalRecords = await EnhancedMedicalRecord.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
                hasNextPage: page < Math.ceil(totalRecords / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Enhanced no-auth error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
            details: error.stack
        });
    }
});

export default router;
