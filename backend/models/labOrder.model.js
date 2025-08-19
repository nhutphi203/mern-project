import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: false, // Don't require it since we generate it automatically
        unique: true
    },
    encounterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encounter',
        required: false // Make it optional
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tests: [{
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabTest',
            required: true
        },
        priority: {
            type: String,
            enum: ['Routine', 'Urgent', 'STAT'],
            default: 'Routine'
        },
        instructions: String,
        status: {
            type: String,
            enum: ['Ordered', 'Collected', 'InProgress', 'Completed', 'Cancelled'],
            default: 'Ordered'
        },
        collectedAt: Date,
        completedAt: Date
    }],
    clinicalInfo: {
        type: String,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    orderedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    notes: String
}, { timestamps: true });

// Generate orderId automatically
labOrderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.models.LabOrder.countDocuments();
        this.orderId = `LAB${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

export const LabOrder = mongoose.model('LabOrder', labOrderSchema);