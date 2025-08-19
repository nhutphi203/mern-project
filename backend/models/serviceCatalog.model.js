import mongoose from 'mongoose';

const serviceCatalogSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: { // Sẽ tương ứng với 'title' ở frontend
        type: String,
        required: true,
        trim: true,
    },
    // --- BEGIN CHANGE ---
    description: { // Thêm trường mô tả, tương ứng với 'text'
        type: String,
        required: false, // Không bắt buộc
        trim: true,
    },
    imageUrl: { // Thêm trường URL hình ảnh, tương ứng với 'img'
        type: String,
        required: false,
        trim: true,
    },
    // --- END CHANGE ---
    department: {
        type: String,
        required: true,
        enum: ['Laboratory', 'Radiology', 'Consultation', 'Pharmacy', 'Dentistry', 'Other'],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

serviceCatalogSchema.index({ name: 'text' });
serviceCatalogSchema.index({ department: 1, isActive: 1 });

export const ServiceCatalog = mongoose.model('ServiceCatalog', serviceCatalogSchema);