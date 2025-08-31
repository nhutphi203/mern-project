import mongoose from "mongoose";

// Schema cho một phiên bản của hồ sơ bệnh án
const medicalRecordVersionSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true,
    },
    diagnosis: {
        type: String,
        required: true,
    },
    symptoms: {
        type: String,
        required: true,
    },
    treatmentPlan: {
        type: String,
        required: true,
    },
    notes: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });


const medicalRecordSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    cloudinary_id: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, { timestamps: true });


// Middleware: Trước khi lưu một bản ghi được cập nhật, tạo một phiên bản mới
medicalRecordSchema.pre('findOneAndUpdate', async function (next) {
    // `this` ở đây là query
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!docToUpdate) {
        return next();
    }

    // Tạo một bản ghi phiên bản từ tài liệu hiện tại trước khi cập nhật
    const oldVersion = {
        version: docToUpdate.currentVersion,
        diagnosis: docToUpdate.diagnosis,
        symptoms: docToUpdate.symptoms,
        treatmentPlan: docToUpdate.treatmentPlan,
        notes: docToUpdate.notes,
        updatedBy: docToUpdate.doctorId, // Giả sử người cập nhật là bác sĩ quản lý
        updatedAt: docToUpdate.updatedAt,
    };

    // Lấy các cập nhật từ query
    const updates = this.getUpdate();

    // Thêm phiên bản cũ vào mảng versions
    updates.$push = updates.$push || {};
    updates.$push.versions = oldVersion;

    // Tăng số phiên bản hiện tại
    updates.$inc = updates.$inc || {};
    updates.$inc.currentVersion = 1;

    // Cập nhật trường updatedAt
    updates.updatedAt = new Date();

    next();
});


export const MedicalRecord = mongoose.model("LegacyMedicalRecord", medicalRecordSchema);
