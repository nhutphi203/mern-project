// File: router/receptionRouter.js

import express from 'express';
import { receptionController } from '../controller/receptionController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js'; // Giả sử authMiddleware ở đây

const receptionRouter = express.Router();

// Route cho lễ tân thực hiện check-in
receptionRouter.post(
    '/check-in/:appointmentId',
    isAuthenticated,
    requireRole(['Receptionist', 'Admin']), // Chỉ Lễ tân hoặc Admin được check-in
    receptionController.checkIn
);



export { receptionRouter };