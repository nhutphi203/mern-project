// CPOE Controller
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { CPOE } from '../models/cpoe.model.js';
import { EnhancedMedicalRecord } from '../models/enhancedMedicalRecord.model.js';

export const cpoeController = {
    // Create new CPOE order
    createOrder: catchAsyncErrors(async (req, res, next) => {
        const {
            patientId,
            encounterId,
            orderItems,
            clinicalIndication,
            primaryDiagnosis,
            startDate,
            endDate,
            providerNotes
        } = req.body;

        const orderingProviderId = req.user._id;

        // Calculate total estimated cost
        const totalEstimatedCost = orderItems.reduce((total, item) => {
            return total + (item.estimatedCost || 0);
        }, 0);

        const cpoeOrder = await CPOE.create({
            patientId,
            encounterId,
            orderingProviderId,
            orderItems,
            clinicalIndication,
            primaryDiagnosis,
            startDate,
            endDate,
            providerNotes,
            totalEstimatedCost,
            overallStatus: 'Submitted',
            qualityMetrics: {
                decisionSupportAlertsTriggered: 0,
                alertsOverridden: 0,
                errorsCorrected: 0
            }
        });

        // Update medical record with CPOE reference
        await EnhancedMedicalRecord.findOneAndUpdate(
            { encounterId },
            { $push: { cpoeOrders: cpoeOrder._id } }
        );

        await cpoeOrder.populate([
            { path: 'patientId', select: 'firstName lastName' },
            { path: 'orderingProviderId', select: 'firstName lastName' }
        ]);

        res.status(201).json({
            success: true,
            message: 'CPOE order created successfully',
            data: cpoeOrder
        });
    }),

    // Get orders for a patient
    getPatientOrders: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;
        const { status, orderType, startDate, endDate } = req.query;

        let filter = { patientId };

        if (status) {
            filter.overallStatus = status;
        }

        if (orderType) {
            filter['orderItems.orderType'] = orderType;
        }

        if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) filter.orderDate.$gte = new Date(startDate);
            if (endDate) filter.orderDate.$lte = new Date(endDate);
        }

        const orders = await CPOE.find(filter)
            .populate('orderingProviderId', 'firstName lastName')
            .populate('encounterId', 'checkInTime status')
            .sort({ orderDate: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }),

    // Get active orders for patient
    getActivePatientOrders: catchAsyncErrors(async (req, res, next) => {
        const { patientId } = req.params;

        const activeOrders = await CPOE.getActiveOrdersForPatient(patientId);

        res.status(200).json({
            success: true,
            count: activeOrders.length,
            data: activeOrders
        });
    }),

    // Get pending orders (for pharmacy, lab, nursing)
    getPendingOrders: catchAsyncErrors(async (req, res, next) => {
        const { department, orderType } = req.query;

        let pipeline = [
            { $match: { 'orderItems.status': 'Ordered' } },
            { $unwind: '$orderItems' },
            { $match: { 'orderItems.status': 'Ordered' } }
        ];

        if (orderType) {
            pipeline.push({ $match: { 'orderItems.orderType': orderType } });
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderingProviderId',
                    foreignField: '_id',
                    as: 'provider'
                }
            },
            {
                $project: {
                    patientName: { $concat: [{ $arrayElemAt: ['$patient.firstName', 0] }, ' ', { $arrayElemAt: ['$patient.lastName', 0] }] },
                    providerName: { $concat: [{ $arrayElemAt: ['$provider.firstName', 0] }, ' ', { $arrayElemAt: ['$provider.lastName', 0] }] },
                    orderDate: 1,
                    orderItems: 1,
                    clinicalIndication: 1,
                    primaryDiagnosis: 1
                }
            },
            { $sort: { orderDate: 1 } }
        );

        const pendingOrders = await CPOE.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: pendingOrders.length,
            data: pendingOrders
        });
    }),

    // Update order item status
    updateOrderItemStatus: catchAsyncErrors(async (req, res, next) => {
        const { orderId, orderItemId } = req.params;
        const { status, notes } = req.body;

        const cpoeOrder = await CPOE.findById(orderId);
        if (!cpoeOrder) {
            return next(new ErrorHandler('CPOE order not found', 404));
        }

        await cpoeOrder.updateOrderStatus(orderItemId, status);

        // Add notes if provided
        if (notes) {
            const orderItem = cpoeOrder.orderItems.id(orderItemId);
            if (orderItem) {
                if (status === 'Completed') {
                    orderItem.instructions = `${orderItem.instructions || ''}\n\nCompletion Notes: ${notes}`;
                }
            }
            await cpoeOrder.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order item status updated successfully',
            data: cpoeOrder
        });
    }),

    // Add clinical decision support alert
    addAlert: catchAsyncErrors(async (req, res, next) => {
        const { orderId, orderItemId } = req.params;
        const { type, severity, message } = req.body;

        const cpoeOrder = await CPOE.findById(orderId);
        if (!cpoeOrder) {
            return next(new ErrorHandler('CPOE order not found', 404));
        }

        await cpoeOrder.addAlert(orderItemId, {
            type,
            severity,
            message
        });

        res.status(200).json({
            success: true,
            message: 'Alert added successfully',
            data: cpoeOrder
        });
    }),

    // Acknowledge alert
    acknowledgeAlert: catchAsyncErrors(async (req, res, next) => {
        const { orderId, orderItemId, alertId } = req.params;
        const userId = req.user._id;

        const cpoeOrder = await CPOE.findById(orderId);
        if (!cpoeOrder) {
            return next(new ErrorHandler('CPOE order not found', 404));
        }

        await cpoeOrder.acknowledgeAlert(orderItemId, alertId, userId);

        res.status(200).json({
            success: true,
            message: 'Alert acknowledged successfully',
            data: cpoeOrder
        });
    }),

    // Get order details
    getOrderDetails: catchAsyncErrors(async (req, res, next) => {
        const { orderId } = req.params;

        const order = await CPOE.findById(orderId)
            .populate('patientId', 'firstName lastName dateOfBirth')
            .populate('orderingProviderId', 'firstName lastName')
            .populate('encounterId', 'checkInTime status')
            .populate('verifiedBy', 'firstName lastName');

        if (!order) {
            return next(new ErrorHandler('CPOE order not found', 404));
        }

        res.status(200).json({
            success: true,
            data: order
        });
    }),

    // Cancel order
    cancelOrder: catchAsyncErrors(async (req, res, next) => {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await CPOE.findById(orderId);
        if (!order) {
            return next(new ErrorHandler('CPOE order not found', 404));
        }

        // Only ordering provider or authorized personnel can cancel
        if (order.orderingProviderId.toString() !== req.user._id.toString() &&
            !['Admin', 'Doctor'].includes(req.user.role)) {
            return next(new ErrorHandler('Not authorized to cancel this order', 403));
        }

        order.overallStatus = 'Cancelled';
        order.providerNotes = `${order.providerNotes || ''}\n\nCancelled: ${reason || 'No reason provided'}`;

        // Cancel all pending order items
        order.orderItems.forEach(item => {
            if (['Draft', 'Ordered', 'In Progress'].includes(item.status)) {
                item.status = 'Cancelled';
            }
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    }),

    // Get CPOE statistics
    getStatistics: catchAsyncErrors(async (req, res, next) => {
        const { startDate, endDate, providerId } = req.query;

        let matchStage = {};

        if (startDate || endDate) {
            matchStage.orderDate = {};
            if (startDate) matchStage.orderDate.$gte = new Date(startDate);
            if (endDate) matchStage.orderDate.$lte = new Date(endDate);
        }

        if (providerId) {
            matchStage.orderingProviderId = providerId;
        }

        const stats = await CPOE.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    completedOrders: { $sum: { $cond: [{ $eq: ['$overallStatus', 'Completed'] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ['$overallStatus', 'Cancelled'] }, 1, 0] } },
                    totalCost: { $sum: '$totalEstimatedCost' },
                    avgAlertsPerOrder: { $avg: '$qualityMetrics.decisionSupportAlertsTriggered' },
                    avgOverriddenAlerts: { $avg: '$qualityMetrics.alertsOverridden' }
                }
            }
        ]);

        const orderTypeStats = await CPOE.aggregate([
            { $match: matchStage },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.orderType',
                    count: { $sum: 1 },
                    avgCost: { $avg: '$orderItems.estimatedCost' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalOrders: 0,
                    completedOrders: 0,
                    cancelledOrders: 0,
                    totalCost: 0,
                    avgAlertsPerOrder: 0,
                    avgOverriddenAlerts: 0
                },
                orderTypeBreakdown: orderTypeStats
            }
        });
    })
};
