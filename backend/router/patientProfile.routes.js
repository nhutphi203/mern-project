// File: backend/router/patientProfile.routes.js
import express from 'express';
import {
    getPatientProfile,
    createOrUpdatePatientProfile
} from '../controller/patientProfile.controller.js';

// Import middleware xác thực của bạn. 
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET: Lấy thông tin profile của một patient
// Cho phép Patient xem profile của mình, Doctor và Admin xem tất cả
router.get("/:patientId", isAuthenticated, requireRole(['Patient', 'Doctor', 'Admin']), getPatientProfile);

// POST: Tạo hoặc cập nhật patient profile
// Chỉ Admin và Doctor mới có quyền tạo/cập nhật patient profile
router.post("/", isAuthenticated, requireRole(['Admin', 'Doctor']), createOrUpdatePatientProfile);

export default router;