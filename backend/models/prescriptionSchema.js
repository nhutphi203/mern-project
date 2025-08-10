import mongoose from "mongoose";

// Schema con cho từng loại thuốc
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
        type: String,
    }
}, { _id: false });

// Schema chính cho đơn thuốc
const prescriptionSchema = new mongoose.Schema({
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: [true, "A prescription must be linked to a medical record."],
        index: true,
    },
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
    medications: {
        type: [medicationSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'A prescription must contain at least one medication.']
    },
    // Chữ ký số của bác sĩ
    digitalSignature: {
        type: String,
        required: [true, "Digital signature is required before saving."],
    },
    // Ngày ký
    dateSigned: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'Cancelled', 'Completed'],
        default: 'Active',
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
