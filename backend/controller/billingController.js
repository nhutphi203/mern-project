import mongoose from 'mongoose'; // FIX: Add missing mongoose import
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { Invoice } from '../models/billing/invoice.model.js';
import { PatientInsurance } from '../models/billing/patientInsurance.model.js';
import { InsuranceProvider } from '../models/billing/insuranceProvider.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { Prescription } from '../models/prescriptionSchema.js';
import { ServiceCatalog } from '../models/serviceCatalog.model.js'; // ADD: Service pricing lookup

export const billingController = {
    // Create invoice from encounter
    createInvoice: catchAsyncErrors(async (req, res, next) => {
        const {
            encounterId,
            patientId,
            appointmentId,
            consultationFee,
            labOrders = [],
            prescriptions = [],
            procedures = [],
            additionalItems = []
        } = req.body;

        const createdBy = req.user._id;

        // Get patient insurance info
        const patientInsurance = await PatientInsurance.findOne({
            patientId,
            isPrimary: true,
            isActive: true
        }).populate('insuranceProviderId');

        let items = [];
        let subtotal = 0;

        // Add consultation fee
        if (consultationFee) {
            // FIX: Lookup consultation price from service catalog instead of hardcoding
            const consultationService = await ServiceCatalog.findOne({
                department: 'Consultation',
                isActive: true
            });

            const unitPrice = consultationService ? consultationService.price : consultationFee;

            items.push({
                type: 'Consultation',
                description: consultationService ? consultationService.name : 'Medical Consultation',
                serviceCode: consultationService ? consultationService.serviceId : '99213',
                quantity: 1,
                unitPrice: unitPrice,
                totalPrice: unitPrice,
                netAmount: unitPrice
            });
            subtotal += unitPrice;
        }

        // Add lab orders
        for (const labOrderId of labOrders) {
            const labOrder = await LabOrder.findById(labOrderId).populate('tests.testId');
            if (labOrder) {
                for (const test of labOrder.tests) {
                    const item = {
                        type: 'Laboratory',
                        description: test.testId.testName,
                        serviceCode: test.testId.testCode,
                        quantity: 1,
                        unitPrice: test.testId.price,
                        totalPrice: test.testId.price,
                        netAmount: test.testId.price
                    };
                    items.push(item);
                    subtotal += test.testId.price;
                }
            }
        }

        // Add prescriptions (if pharmacy is integrated)
        for (const prescriptionId of prescriptions) {
            const prescription = await Prescription.findById(prescriptionId);
            if (prescription) {
                for (const medication of prescription.medications) {
                    // FIX: Lookup medication price from service catalog
                    const medicationService = await ServiceCatalog.findOne({
                        department: 'Pharmacy',
                        name: { $regex: new RegExp(medication.name, 'i') },
                        isActive: true
                    });

                    const unitPrice = medicationService ? medicationService.price : 25; // Fallback price

                    const item = {
                        type: 'Pharmacy',
                        description: `${medication.name} - ${medication.dosage}`,
                        serviceCode: medicationService ? medicationService.serviceId : 'PHARM001',
                        quantity: parseInt(medication.quantity) || 1,
                        unitPrice: unitPrice,
                        totalPrice: (parseInt(medication.quantity) || 1) * unitPrice,
                        netAmount: (parseInt(medication.quantity) || 1) * unitPrice
                    };
                    items.push(item);
                    subtotal += item.totalPrice;
                }
            }
        }

        // Add additional procedures
        for (const procedure of procedures) {
            items.push({
                type: 'Procedure',
                description: procedure.description,
                serviceCode: procedure.code,
                quantity: procedure.quantity || 1,
                unitPrice: procedure.unitPrice,
                totalPrice: procedure.quantity * procedure.unitPrice,
                netAmount: procedure.quantity * procedure.unitPrice
            });
            subtotal += procedure.quantity * procedure.unitPrice;
        }

        // Add any additional items
        for (const item of additionalItems) {
            items.push({
                type: item.type,
                description: item.description,
                serviceCode: item.serviceCode,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                netAmount: item.quantity * item.unitPrice
            });
            subtotal += item.quantity * item.unitPrice;
        }

        // Calculate insurance coverage
        let insurance = {};
        let patientResponsibility = subtotal;

        if (patientInsurance) {
            const coveragePercent = patientInsurance.insuranceProviderId.contractDetails?.reimbursementRate || 80;
            const coverageAmount = subtotal * (coveragePercent / 100);

            insurance = {
                provider: patientInsurance.insuranceProviderId.providerName,
                policyNumber: patientInsurance.policyNumber,
                groupNumber: patientInsurance.groupNumber,
                coveragePercent,
                coverageAmount,
                deductible: patientInsurance.deductibleAmount,
                patientResponsibility: subtotal - coverageAmount + patientInsurance.deductibleAmount
            };

            patientResponsibility = insurance.patientResponsibility;
        }

        // Create invoice
        const invoice = await Invoice.create({
            patientId,
            encounterId,
            appointmentId,
            items,
            subtotal,
            totalAmount: subtotal,
            insurance,
            createdBy,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

        await invoice.populate([
            { path: 'patientId', select: 'firstName lastName email phone' },
            { path: 'createdBy', select: 'firstName lastName' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice
        });
    }),

    // Get all invoices with filtering
    getAllInvoices: catchAsyncErrors(async (req, res, next) => {
        const {
            status,
            patientId,
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = req.query;

        let filter = {};

        if (status) filter.status = status;
        if (patientId) filter.patientId = patientId;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const invoices = await Invoice.find(filter)
            .populate('patientId', 'firstName lastName email phone')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: invoices.length,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            invoices
        });
    }),

    // Get invoice by ID
    getInvoiceById: catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;

        const invoice = await Invoice.findById(id)
            .populate('patientId', 'firstName lastName email phone dob gender')
            .populate('appointmentId', 'appointment_date department')
            .populate('encounterId')
            .populate('createdBy', 'firstName lastName')
            .populate('payments.processedBy', 'firstName lastName');

        if (!invoice) {
            return next(new ErrorHandler('Invoice not found', 404));
        }

        res.status(200).json({
            success: true,
            invoice
        });
    }),

    // Process payment
    processPayment: catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const {
            method,
            amount,
            transactionId,
            cardLast4,
            notes
        } = req.body;

        const processedBy = req.user._id;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return next(new ErrorHandler('Invoice not found', 404));
        }

        if (amount <= 0) {
            return next(new ErrorHandler('Payment amount must be greater than zero', 400));
        }

        if (invoice.totalPaid + amount > invoice.totalAmount) {
            return next(new ErrorHandler('Payment amount exceeds invoice balance', 400));
        }

        // Add payment record
        const payment = {
            method,
            amount,
            transactionId,
            cardLast4,
            processedBy,
            notes,
            paidAt: new Date()
        };

        invoice.payments.push(payment);
        invoice.totalPaid += amount;

        // Update status based on payment
        if (invoice.totalPaid >= invoice.totalAmount) {
            invoice.status = 'Paid';
            invoice.paidAt = new Date();
        } else {
            invoice.status = 'Partial';
        }

        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            invoice: {
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                totalPaid: invoice.totalPaid,
                balance: invoice.balance,
                status: invoice.status
            }
        });
    }),

    // Submit insurance claim
    submitInsuranceClaim: catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const { claimNumber } = req.body;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return next(new ErrorHandler('Invoice not found', 404));
        }

        if (!invoice.insurance?.provider) {
            return next(new ErrorHandler('No insurance information found for this invoice', 400));
        }

        if (invoice.insurance.claimSubmitted) {
            return next(new ErrorHandler('Insurance claim already submitted', 400));
        }

        // Update insurance claim status
        invoice.insurance.claimSubmitted = true;
        invoice.insurance.claimNumber = claimNumber;
        invoice.insurance.claimStatus = 'Pending';

        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Insurance claim submitted successfully',
            claimNumber
        });
    }),

    // Update insurance claim status
    updateInsuranceClaimStatus: catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const { claimStatus, approvedAmount, denialReason } = req.body;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return next(new ErrorHandler('Invoice not found', 404));
        }

        invoice.insurance.claimStatus = claimStatus;

        if (claimStatus === 'Approved' && approvedAmount) {
            // Process insurance payment
            const insurancePayment = {
                method: 'Insurance',
                amount: approvedAmount,
                processedBy: req.user._id,
                insuranceClaimId: invoice.insurance.claimNumber,
                paidAt: new Date()
            };

            invoice.payments.push(insurancePayment);
            invoice.totalPaid += approvedAmount;

            // Recalculate patient responsibility
            const remainingBalance = invoice.totalAmount - invoice.totalPaid;
            invoice.insurance.patientResponsibility = Math.max(0, remainingBalance);
        }

        if (claimStatus === 'Denied' && denialReason) {
            invoice.insurance.denialReason = denialReason;
        }

        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Insurance claim status updated successfully',
            invoice
        });
    }),

    // Generate billing report
    getBillingReport: catchAsyncErrors(async (req, res, next) => {
        const { startDate, endDate, reportType = 'summary' } = req.query;

        let matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }

        if (reportType === 'summary') {
            const summary = await Invoice.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalInvoices: { $sum: 1 },
                        totalBilled: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalOutstanding: { $sum: '$balance' },
                        paidInvoices: {
                            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
                        },
                        partialInvoices: {
                            $sum: { $cond: [{ $eq: ['$status', 'Partial'] }, 1, 0] }
                        },
                        unpaidInvoices: {
                            $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] }
                        },
                        overdueInvoices: {
                            $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const serviceBreakdown = await Invoice.aggregate([
                { $match: matchStage },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.type',
                        count: { $sum: 1 },
                        totalRevenue: { $sum: '$items.netAmount' }
                    }
                },
                { $sort: { totalRevenue: -1 } }
            ]);

            res.status(200).json({
                success: true,
                reportType: 'summary',
                period: { startDate, endDate },
                summary: summary[0] || {},
                serviceBreakdown
            });

        } else if (reportType === 'detailed') {
            const detailedReport = await Invoice.find(matchStage)
                .populate('patientId', 'firstName lastName')
                .select('invoiceNumber patientId totalAmount totalPaid balance status createdAt')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                reportType: 'detailed',
                period: { startDate, endDate },
                invoices: detailedReport
            });
        }
    }),

    // Get patient billing history
    getPatientBillingHistory: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;

        // FIX: Security - Patients can only see their own billing history
        if (req.user.role === 'Patient' && req.user._id.toString() !== patientId) {
            return next(new ErrorHandler('Access denied. You can only view your own billing history.', 403));
        }

        const billingHistory = await Invoice.find({ patientId })
            .populate('appointmentId', 'appointment_date department')
            .select('invoiceNumber totalAmount totalPaid balance status createdAt dueDate')
            .sort({ createdAt: -1 });

        const summary = await Invoice.aggregate([
            { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
            {
                $group: {
                    _id: null,
                    totalBilled: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$totalPaid' },
                    currentBalance: { $sum: '$balance' },
                    invoiceCount: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            patientId,
            summary: summary[0] || {},
            billingHistory
        });
    })
};

// ===== INSURANCE MANAGEMENT CONTROLLER =====

export const insuranceController = {
    // Create insurance provider
    createInsuranceProvider: catchAsyncErrors(async (req, res, next) => {
        const provider = await InsuranceProvider.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Insurance provider created successfully',
            provider
        });
    }),

    // Get all insurance providers
    getAllInsuranceProviders: catchAsyncErrors(async (req, res, next) => {
        const { isActive = true } = req.query;

        const providers = await InsuranceProvider.find({ isActive })
            .sort({ providerName: 1 });

        res.status(200).json({
            success: true,
            count: providers.length,
            providers
        });
    }),

    // Add insurance to patient
    addPatientInsurance: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;
        const insuranceData = { ...req.body, patientId };

        // If this is set as primary, make sure no other insurance is primary
        if (insuranceData.isPrimary) {
            await PatientInsurance.updateMany(
                { patientId, isActive: true },
                { isPrimary: false }
            );
        }

        const patientInsurance = await PatientInsurance.create(insuranceData);
        await patientInsurance.populate('insuranceProviderId');

        res.status(201).json({
            success: true,
            message: 'Patient insurance added successfully',
            insurance: patientInsurance
        });
    }),

    // Get patient insurance
    getPatientInsurance: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;

        const insurances = await PatientInsurance.find({
            patientId,
            isActive: true
        }).populate('insuranceProviderId');

        res.status(200).json({
            success: true,
            insurances
        });
    })
};
