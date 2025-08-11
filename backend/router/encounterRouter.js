import express from 'express';
import { encounterController } from '../controller/encounterController.js';
import { isAuthenticated, isDoctorAuthenticated } from '../middlewares/auth.js';

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

export default encounterRouter;