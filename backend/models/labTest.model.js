import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
    testCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    testName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology'],
        required: true
    },
    department: {
        type: String,
        default: 'Laboratory'
    },
    normalRange: {
        min: Number,
        max: Number,
        unit: String,
        textRange: String, // For complex ranges
        gender: {
            type: String,
            enum: ['All', 'Male', 'Female']
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    turnaroundTime: {
        type: Number, // in hours
        required: true,
        min: 1
    },
    specimen: {
        type: String,
        enum: ['Blood', 'Urine', 'Stool', 'Sputum', 'CSF', 'Other'],
        default: 'Blood'
    },
    instructions: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Indexes for performance
labTestSchema.index({ category: 1, isActive: 1 });
labTestSchema.index({ testName: 'text' });

export const LabTest = mongoose.model('LabTest', labTestSchema);
