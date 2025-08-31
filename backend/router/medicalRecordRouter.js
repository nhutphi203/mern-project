// ✅ ISSUE 3 FIX: Clean up duplicate routes and organize properly
import express from 'express';
import {
    createMedicalRecord,
    getMedicalRecordByAppointment,
    updateMedicalRecord,
    getPatientMedicalHistory,
    getMedicalRecordById,
    getAllMedicalRecords,
    getRecordsSummary,
    getStatistics,
    // Import các hàm controller mới cho media
    getMediaRecordsByAppointment,
    uploadMediaRecord,
    deleteMediaRecord,
} from '../controller/medicalRecordController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// ===== NEW API ROUTES FOR REPORTS =====
router.get('/all', isAuthenticated, getAllMedicalRecords);
router.get('/summary-legacy', isAuthenticated, getRecordsSummary);
router.get('/statistics-legacy', isAuthenticated, getStatistics);

// ===== LEGACY MEDICAL RECORD ROUTES =====
router.post('/legacy', isAuthenticated, requireRole(['Doctor']), createMedicalRecord);
router.get('/legacy/appointment/:appointmentId', isAuthenticated, getMedicalRecordByAppointment);
router.get('/legacy/patient/:patientId/history', isAuthenticated, getPatientMedicalHistory);
router.get('/legacy/:id', isAuthenticated, getMedicalRecordById);
router.put('/legacy/:id', isAuthenticated, requireRole(['Doctor']), updateMedicalRecord);

// ===== MEDIA ROUTES =====
router.get('/media/:appointmentId', isAuthenticated, getMediaRecordsByAppointment);
router.post('/media/upload', isAuthenticated, requireRole(['Doctor']), uploadMediaRecord);
router.delete('/media/:id', isAuthenticated, requireRole(['Doctor']), deleteMediaRecord);

// ===== ENHANCED ROUTES (Import from fixedMedicalRecordsRouter) =====
import enhancedRouter from './fixedMedicalRecordsRouter.js';
router.use('/', enhancedRouter);

export default router;
