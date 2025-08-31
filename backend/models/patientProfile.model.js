import mongoose from 'mongoose';

// Định nghĩa một cấu trúc chi tiết hơn cho một bản ghi trong tiền sử bệnh
const MedicalHistoryEntrySchema = new mongoose.Schema({
    condition: { type: String, required: true }, // Tên bệnh/tình trạng
    diagnosedDate: { type: Date },               // Ngày chẩn đoán
    treatment: { type: String },                  // Phương pháp điều trị
    notes: { type: String },                      // Ghi chú thêm
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Bác sĩ chẩn đoán
});

// Cấu trúc cho liên hệ khẩn cấp
const EmergencyContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    relationship: { type: String, required: true }, // Mối quan hệ (vợ, chồng, con,...)
    phone: { type: String, required: true },
});

const patientProfileSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bloodType: { type: String },
    allergies: [{ type: String }],

    // --- CÁC TRƯỜNG MỚI ---
    medicalHistory: [MedicalHistoryEntrySchema], // Dùng schema đã định nghĩa ở trên

    immunizations: [{
        vaccineName: String,
        dateReceived: Date
    }],

    familyHistory: [{
        condition: String,
        relation: String // e.g., 'Father', 'Mother'
    }],

    emergencyContact: EmergencyContactSchema,

}, { timestamps: true });

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;