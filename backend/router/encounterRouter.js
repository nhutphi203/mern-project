import express from 'express';
import { encounterController, getRecentEncounters, getEncounterById } from '../controller/encounterController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

// Đổi tên thành encounterRouter cho nhất quán
const encounterRouter = express.Router();

// Chỉ bác sĩ đã đăng nhập mới xem được hàng chờ của mình
encounterRouter.get(
    '/doctor-queue',
    isAuthenticated,
    requireRole(['Doctor']),
    encounterController.getDoctorQueue
);

// ✅ Route này phải ĐẶT TRƯỚC route /:id để tránh conflict
encounterRouter.get('/',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']),
    getRecentEncounters
);

// ✅ Route để xem chi tiết encounter
encounterRouter.get(
    '/:id',
    isAuthenticated,
    encounterController.getEncounterDetails
);

export default encounterRouter;