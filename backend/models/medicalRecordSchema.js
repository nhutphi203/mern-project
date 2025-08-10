import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    // ID của bệnh nhân, liên kết đến collection 'users'
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến model User
        required: true,
    },
    // ID của bác sĩ, liên kết đến collection 'users'
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến model User
        required: true,
    },
    // ID của lịch hẹn, liên kết đến collection 'appointments'
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment', // Tham chiếu đến model Appointment
        required: true,
    },
    // Chuẩn đoán của bác sĩ
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required."],
    },
    // Triệu chứng bệnh nhân khai báo
    symptoms: {
        type: String,
        required: [true, "Symptoms are required."],
    },
    // Kế hoạch điều trị
    treatmentPlan: {
        type: String,
        required: [true, "Treatment plan is required."],
    },
    // Ghi chú thêm của bác sĩ (không bắt buộc)
    notes: {
        type: String,
    },
    // Ngày tạo hồ sơ, tự động được gán
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);