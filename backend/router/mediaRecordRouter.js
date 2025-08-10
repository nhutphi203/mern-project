import express from 'express';
import {
    getMediaRecords,
    uploadMediaRecord,
    deleteMediaRecord,
} from '../controller/medicalRecordController.js';
import { isAuthenticated, isDoctor } from '../middlewares/auth.js';

const router = express.Router();

// @route   GET /api/v1/medicalrecords
// @desc    Get media records for an appointment
// @access  Private (Doctor or Patient)
router.get('/', isAuthenticated, getMediaRecords);

// @route   POST /api/v1/medicalrecords
// @desc    Upload new media record
// @access  Private (Doctor only)
router.post('/', isAuthenticated, isDoctor, uploadMediaRecord);

// @route   DELETE /api/v1/medicalrecords/:id
// @desc    Delete media record
// @access  Private (Doctor who uploaded it or Admin)
router.delete('/:id', isAuthenticated, deleteMediaRecord);

export default router;