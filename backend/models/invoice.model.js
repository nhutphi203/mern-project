// server/models/invoice.model.js
import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
    description: { type: String, required: true }, // e.g., "Khám tổng quát", "Xét nghiệm máu"
    cost: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    items: [lineItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
    paymentDate: { type: Date },
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;