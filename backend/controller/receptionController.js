// File: controllers/receptionController.js

import mongoose from 'mongoose';
import { Appointment } from '../models/appointmentSchema.js'; // Đảm bảo tên model và đường dẫn chính xác
import { Encounter } from '../models/encounter.model.js';
import ErrorHandler from "../middlewares/errorMiddleware.js"; // Sử dụng ErrorHandler của bạn

export const receptionController = {
    /**
     * @desc Check-in một bệnh nhân dựa trên ID lịch hẹn
     * @route POST /api/v1/reception/check-in/:appointmentId
     * @access Receptionist, Admin
     */
    checkIn: (async (req, res, next) => {
        // --- ĐÃ BỎ PHẦN TRANSACTION ---
        try {
            const { appointmentId } = req.params;
            const receptionistId = req.user._id;

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment.doctorId) {
                return next(new ErrorHandler("Data integrity error: Appointment is missing doctor information.", 500));
            }
            if (!appointment) {
                return next(new ErrorHandler('Appointment not found.', 404));
            }
            if (appointment.status !== 'Accepted') {
                return next(new ErrorHandler(`Cannot check-in. Status is '${appointment.status}'.`, 400));
            }
            if (!appointment.doctorId) {
                console.error("CRITICAL ERROR: Appointment document is missing the 'doctorId' field.");
                return next(new ErrorHandler("Data integrity error: Doctor information is missing from the appointment.", 500));
            }

            // Kiểm tra xem đã check-in chưa
            const existingEncounter = await Encounter.findOne({ appointmentId });
            if (existingEncounter) {
                return next(new ErrorHandler('This appointment has already been checked in.', 409));
            }

            // Cập nhật trạng thái Appointment
            appointment.status = 'Checked-in';
            await appointment.save();

            // Tạo Encounter mới
            const newEncounter = new Encounter({
                appointmentId: appointment._id,
                patientId: appointment.patientId,
                // ✅ Đảm bảo truyền đúng doctorId từ appointment
                doctorId: appointment.doctorId,
                receptionistId: receptionistId,
            });
            await newEncounter.save();

            res.status(201).json({
                success: true,
                message: 'Patient checked-in successfully.',
                data: newEncounter,
            });

        } catch (error) {
            console.error("Check-in failed:", error);
            return next(new ErrorHandler("An internal error occurred during check-in.", 500));
        }
    }),

    getEncounterDetails: async (req, res, next) => {
        try {
            const { id } = req.params;
            const encounter = await Encounter.findById(id)
                .populate('patientId', 'firstName lastName email phone') // Lấy thêm thông tin bệnh nhân
                .populate('appointmentId', 'appointment_date department'); // Lấy thêm thông tin lịch hẹn

            if (!encounter) {
                return next(new ErrorHandler('Encounter not found', 404));
            }

            res.status(200).json({ success: true, data: encounter });

        } catch (error) {
            next(error);
        }
    }
};