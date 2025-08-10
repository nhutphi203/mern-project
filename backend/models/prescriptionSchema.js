import mongoose from "mongoose";

// Đây là schema con, định nghĩa cấu trúc cho từng loại thuốc trong đơn
const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Medication name is required."],
    },
    dosage: {
        type: String,
        required: [true, "Dosage is required (e.g., '500mg')."],
    },
    frequency: {
        type: String,
        required: [true, "Frequency is required (e.g., '2 times/day')."],
    },
    duration: {
        type: String,
        required: [true, "Duration is required (e.g., '7 days')."],
    },
    notes: {
        type: String, // Ghi chú thêm cho từng loại thuốc (ví dụ: uống sau ăn)
    }
}, { _id: false }); // _id: false để không tạo _id riêng cho mỗi loại thuốc

// Đây là schema chính cho đơn thuốc
const prescriptionSchema = new mongoose.Schema({
    // Liên kết đến hồ sơ bệnh án cụ thể
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: [true, "A prescription must be linked to a medical record."],
        index: true,
    },
    // Sao chép ID để truy vấn nhanh và phân quyền dễ dàng
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Danh sách các loại thuốc được kê, sử dụng schema con ở trên
    medications: {
        type: [medicationSchema],
        // Đảm bảo đơn thuốc phải có ít nhất 1 loại thuốc
        validate: [v => Array.isArray(v) && v.length > 0, 'A prescription must contain at least one medication.']
    },
    // Chữ ký số của bác sĩ, sẽ được tích hợp sau
    digitalSignature: {
        type: String,
    },
    // Trạng thái của đơn thuốc
    status: {
        type: String,
        enum: ['New', 'Dispensed', 'Cancelled'], // Chỉ chấp nhận các giá trị này
        default: 'New',
    },
    dispensedDate: {
        type: Date, // Ngày cấp phát thuốc
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
