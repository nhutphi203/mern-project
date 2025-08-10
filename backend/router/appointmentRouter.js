import express from 'express';
import {
    deleteAppointment,
    getAllAppointments,
    postAppointment,
    updateAppointmentStatus,
    getMyAppointments, // Import controller mới
} from '../controller/appointmentController.js';
import {
    isAuthenticated, // Import middleware chung
    isAdminAuthenticated,
    isPatientAuthenticated,
} from '../middlewares/auth.js'

const router = express.Router();

// Định nghĩa các route
router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

// === ROUTE MỚI CHO BỆNH NHÂN VÀ BÁC SĨ ===
// Route này cho phép cả Patient và Doctor truy cập
router.get("/my-appointments", isAuthenticated, getMyAppointments);

export default router;
