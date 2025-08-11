// File: models/encounter.model.js

import mongoose from 'mongoose';

const encounterSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment', // Tham chiếu đến model Lịch hẹn của bạn
        required: true,
        unique: true, // Mỗi lịch hẹn chỉ được check-in một lần
        index: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến bệnh nhân
        required: true,
    },
    receptionistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến nhân viên tiếp đón đã check-in
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now,
    },
    checkOutTime: {
        type: Date,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // ✅ Tối ưu hóa: Thêm index để tìm kiếm nhanh hơn
    },
    receptionistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now,
        index: true, // ✅ Tối ưu hóa: Thêm index
    },
    status: {
        type: String,
        enum: ['InProgress', 'Finished', 'Cancelled'],
        default: 'InProgress',
        index: true, // ✅ Tối ưu hóa: Thêm index
    },
    // Mảng này sẽ được dùng ở Giai đoạn 2 để chứa các y lệnh
    serviceOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceOrder',
    }],
    notes: { // Ghi chú của lễ tân (nếu có)
        type: String,
        trim: true,
    }
}, { timestamps: true });

export const Encounter = mongoose.model('Encounter', encounterSchema);