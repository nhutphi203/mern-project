import express from 'express';
import {
    deleteAppointment,
    getAllAppointments,
    postAppointment,
    updateAppointmentStatus,
    getMyAppointments, // Import controller mới
    getAppointmentById, // Add this
    getAppointmentStats,
    filterAppointments
} from '../controller/appointmentController.js';
import {
    isAuthenticated, // Import middleware chung
    requireRole,     // Use requireRole instead of specific role middlewares
} from '../middlewares/auth.js'

const router = express.Router();

// Định nghĩa các route
router.post("/post", isAuthenticated, requireRole(['Patient']), postAppointment);
router.get("/getall", isAuthenticated, requireRole(['Admin']), getAllAppointments);
router.put("/update/:id", isAuthenticated, requireRole(['Admin']), updateAppointmentStatus);
router.delete("/delete/:id", isAuthenticated, requireRole(['Admin']), deleteAppointment);
router.get("/stats", isAuthenticated, requireRole(['Admin']), getAppointmentStats);
// === ROUTE MỚI CHO BỆNH NHÂN VÀ BÁC SĨ ===
// Route này cho phép cả Patient và Doctor truy cập
router.get("/my-appointments", isAuthenticated, getMyAppointments);
router.get("/filter",
    isAuthenticated,
    requireRole(['Admin', 'Doctor']),
    filterAppointments
);
router.get("/:id", isAuthenticated, getAppointmentById);
export default router;
