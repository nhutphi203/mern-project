import express from 'express';
import { encounterController, getRecentEncounters, getEncounterById } from '../controller/encounterController.js';
import { isAdminAuthenticated, isAuthenticated, isDoctorAuthenticated, isDoctorOrAdminAuthenticated } from '../middlewares/auth.js';

// Đổi tên thành encounterRouter cho nhất quán
const encounterRouter = express.Router();

// Chỉ bác sĩ đã đăng nhập mới xem được hàng chờ của mình
encounterRouter.get(
    '/doctor-queue',
    isDoctorAuthenticated,
    encounterController.getDoctorQueue
);

// Bất kỳ ai đăng nhập cũng có thể xem chi tiết một lượt khám (nếu cần)
encounterRouter.get(
    '/:id',
    isAuthenticated,
    encounterController.getEncounterDetails
);

encounterRouter.get('/',
    isAuthenticated,
    isDoctorOrAdminAuthenticated, // SỬ DỤNG MIDDLEWARE MỚI
    getRecentEncounters
);

encounterRouter.get('/:id',
    isAuthenticated,
    isAdminAuthenticated, isDoctorAuthenticated,
    encounterController.getEncounterDetails
);
export default encounterRouter;