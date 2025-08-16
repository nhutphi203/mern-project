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
    isAdminAuthenticated,
    isPatientAuthenticated,
    isDoctorAuthenticated,
} from '../middlewares/auth.js'

const router = express.Router();

// Định nghĩa các route
router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.get("/stats", isAdminAuthenticated, getAppointmentStats);
// === ROUTE MỚI CHO BỆNH NHÂN VÀ BÁC SĨ ===
// Route này cho phép cả Patient và Doctor truy cập
router.get("/my-appointments", isAuthenticated, getMyAppointments);
router.get("/filter",
    isAuthenticated,
    isAdminAuthenticated, isDoctorAuthenticated,
    filterAppointments
);
router.get("/:id", isAuthenticated, getAppointmentById);
export default router;
