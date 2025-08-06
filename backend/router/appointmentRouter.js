// backend/router/appointmentRouter.js
import express from 'express';
import {
    deleteAppointment,
    getAllAppointments,
    postAppointment,
    updateAppointmentStatus,
    getMyAppointments,
    getDoctorAppointments,
    getAppointmentsByFilter,
    getAppointmentStats
} from '../controller/appointmentController.js';
import {
    isAdminAuthenticated,
    isPatientAuthenticated,
    isDoctorAuthenticated
} from '../middlewares/auth.js'

const router = express.Router();

// Bệnh nhân đặt lịch hẹn mới
router.post("/post", isPatientAuthenticated, postAppointment);

// Bệnh nhân xem lịch hẹn của chính mình
router.get("/my-appointments", isPatientAuthenticated, getMyAppointments);

// Admin xem tất cả lịch hẹn
router.get("/getall", isAdminAuthenticated, getAllAppointments);

// Bác sĩ xem lịch hẹn được gán cho mình
router.get("/doctor-appointments", isDoctorAuthenticated, getDoctorAppointments);

// Admin/Doctor filter appointments (API mới)
router.get("/filter", isAdminAuthenticated, getAppointmentsByFilter);

// Admin xem thống kê (API mới)
router.get("/stats", isAdminAuthenticated, getAppointmentStats);

// Admin cập nhật trạng thái lịch hẹn
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);

// Admin xóa lịch hẹn
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;