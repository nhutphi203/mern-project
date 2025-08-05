// server/models/prescription.model.js
import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // Liều lượng (e.g., "500mg")
    frequency: { type: String, required: true }, // Tần suất (e.g., "2 times/day")
    duration: { type: String, required: true }, // Thời gian (e.g., "7 days")
});

const prescriptionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    medications: [medicationSchema],
    notes: { type: String }, // Ghi chú thêm
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;