import express from 'express';
import {
    deleteAppointment,
    getAllAppointments,
    postAppointment,
    updateAppointmentStatus,
    getMyAppointments,
    getDoctorAppointments
} from '../controller/appointmentController.js';
import { isAdminAuthenticated, isPatientAuthenticated } from '../middlewares/auth.js'

const router = express.Router();

// Bệnh nhân đặt lịch hẹn mới
router.post("/post", isPatientAuthenticated, postAppointment);

// Bệnh nhân xem lịch hẹn của chính mình
router.get("/my-appointments", isPatientAuthenticated, getMyAppointments);

// Admin xem tất cả lịch hẹn
router.get("/getall", isAdminAuthenticated, getAllAppointments);

// Admin cập nhật trạng thái lịch hẹn
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);

// Admin xóa lịch hẹn
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

// Bác sĩ xem lịch hẹn được gán cho mình (cần thêm middleware cho Doctor)
// router.get("/doctor-appointments", isDoctorAuthenticated, getDoctorAppointments);

export default router;