import mongoose from 'mongoose';

const insuranceProviderSchema = new mongoose.Schema({
    providerName: {
        type: String,
        required: true,
        unique: true
    },
    providerCode: {
        type: String,
        required: true,
        unique: true
    },
    contactInfo: {
        phone: String,
        email: String,
        website: String,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        }
    },
    contractDetails: {
        contractNumber: String,
        effectiveDate: Date,
        expirationDate: Date,
        reimbursementRate: {
            type: Number,
            min: 0,
            max: 100,
            default: 80
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const InsuranceProvider = mongoose.model('InsuranceProvider', insuranceProviderSchema);
