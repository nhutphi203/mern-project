import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Consultation', 'Laboratory', 'Radiology', 'Pharmacy', 'Procedure', 'Room'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    serviceCode: {
        type: String, // CPT/ICD codes
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    taxPercent: {
        type: Number,
        default: 0,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    netAmount: {
        type: Number,
        required: true
    }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['Cash', 'Card', 'Insurance', 'Transfer', 'Check'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionId: String,
    cardLast4: String,
    insuranceClaimId: String,
    paidAt: {
        type: Date,
        default: Date.now
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: String
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    encounterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encounter',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    // Billing details
    items: [invoiceItemSchema],

    // Financial summary
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    totalDiscount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalTax: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    // Insurance information
    insurance: {
        provider: String,
        policyNumber: String,
        groupNumber: String,
        coveragePercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        coverageAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        deductible: {
            type: Number,
            default: 0,
            min: 0
        },
        patientResponsibility: {
            type: Number,
            required: true,
            min: 0
        },
        claimSubmitted: {
            type: Boolean,
            default: false
        },
        claimNumber: String,
        claimStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Denied', 'Partial'],
            default: 'Pending'
        }
    },

    // Payment tracking
    payments: [paymentSchema],
    totalPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    balance: {
        type: Number,
        default: 0
    },

    // Invoice status and dates
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Cancelled'],
        default: 'Draft'
    },
    sentAt: Date,
    dueDate: Date,
    paidAt: Date,

    // Additional fields
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Generate invoice number automatically
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.models.Invoice.countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV${year}${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate balance
    this.balance = this.totalAmount - this.totalPaid;

    // Update status based on payment
    if (this.totalPaid === 0) {
        this.status = this.status === 'Draft' ? 'Draft' : 'Sent';
    } else if (this.totalPaid >= this.totalAmount) {
        this.status = 'Paid';
        this.paidAt = new Date();
    } else {
        this.status = 'Partial';
    }

    next();
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);