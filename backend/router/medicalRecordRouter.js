import express from 'express';
import {
    createMedicalRecord,
    getMedicalRecordByAppointment,
    updateMedicalRecord,
    getPatientMedicalHistory,
    getMedicalRecordById,
    // Import các hàm controller mới cho media
    getMediaRecordsByAppointment,
    uploadMediaRecord,
    deleteMediaRecord,
} from '../controller/medicalRecordController.js';
import { isAuthenticated, isDoctor, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// --- Các route cho Medical Record (dữ liệu lâm sàng) ---
router.post('/', isAuthenticated, isDoctor, createMedicalRecord);
router.get('/appointment/:appointmentId', isAuthenticated, getMedicalRecordByAppointment);
router.get('/patient/:patientId/history', isAuthenticated, getPatientMedicalHistory);
router.get('/:id', isAuthenticated, getMedicalRecordById);
router.put('/:id', isAuthenticated, isDoctor, updateMedicalRecord);


// --- CÁC ROUTE MỚI CHO MEDIA FILES ---
// GET: Lấy tất cả media files của một cuộc hẹn
router.post('/', isAuthenticated, requireRole(['Doctor']), createMedicalRecord);
router.get('/appointment/:appointmentId', isAuthenticated, getMedicalRecordByAppointment);
router.get('/patient/:patientId/history', isAuthenticated, getPatientMedicalHistory);
router.get('/:id', isAuthenticated, getMedicalRecordById);
router.put('/:id', isAuthenticated, requireRole(['Doctor']), updateMedicalRecord);

// --- CÁC ROUTE CHO MEDIA FILES ---
router.get('/media/:appointmentId', isAuthenticated, getMediaRecordsByAppointment);
router.post('/media/upload', isAuthenticated, requireRole(['Doctor']), uploadMediaRecord);
router.delete('/media/:id', isAuthenticated, requireRole(['Doctor']), deleteMediaRecord);

// DELETE: Xóa một file media theo ID của nó
router.delete('/media/:id', isAuthenticated, isDoctor, deleteMediaRecord);


export default router;
