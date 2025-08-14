import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { LabTest } from './labTest.model.js';
import { LabOrder } from './labOrder.model.js';
import { LabResult } from './labResult.model.js';

export const labController = {
    // Get all available lab tests
    getAllTests: catchAsyncErrors(async (req, res, next) => {
        const { category, search } = req.query;

        let filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        const tests = await LabTest.find(filter).sort({ category: 1, testName: 1 });

        res.status(200).json({
            success: true,
            count: tests.length,
            tests
        });
    }),

    // Create new lab order (Doctor only)
    createLabOrder: catchAsyncErrors(async (req, res, next) => {
        const { encounterId, patientId, tests, clinicalInfo } = req.body;
        const doctorId = req.user._id;

        if (!tests || tests.length === 0) {
            return next(new ErrorHandler('At least one test must be selected', 400));
        }

        // Validate test IDs and calculate total amount
        const testIds = tests.map(t => t.testId);
        const testDetails = await LabTest.find({
            _id: { $in: testIds },
            isActive: true
        });

        if (testDetails.length !== testIds.length) {
            return next(new ErrorHandler('Some tests are invalid or inactive', 400));
        }

        const totalAmount = testDetails.reduce((sum, test) => {
            const testOrder = tests.find(t => t.testId.toString() === test._id.toString());
            return sum + test.price;
        }, 0);

        const labOrder = await LabOrder.create({
            encounterId,
            patientId,
            doctorId,
            tests: tests.map(test => ({
                testId: test.testId,
                priority: test.priority || 'Routine',
                instructions: test.instructions || ''
            })),
            clinicalInfo,
            totalAmount
        });

        // Populate the created order
        await labOrder.populate([
            { path: 'patientId', select: 'firstName lastName' },
            { path: 'doctorId', select: 'firstName lastName' },
            { path: 'tests.testId' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Lab order created successfully',
            order: labOrder
        });
    }),

    // Get lab queue for technicians
    getLabQueue: catchAsyncErrors(async (req, res, next) => {
        const { status = 'Pending', priority, category } = req.query;

        let matchStage = { status };

        if (priority) {
            matchStage['tests.priority'] = priority;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, dob: 1, gender: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, doctorDepartment: 1 } }]
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $lookup: {
                    from: 'labtests',
                    localField: 'tests.testId',
                    foreignField: '_id',
                    as: 'testDetails'
                }
            },
            {
                $unwind: '$testDetails'
            }
        ];

        if (category) {
            pipeline.push({
                $match: { 'testDetails.category': category }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$_id',
                    orderId: { $first: '$orderId' },
                    patient: { $first: { $arrayElemAt: ['$patient', 0] } },
                    doctor: { $first: { $arrayElemAt: ['$doctor', 0] } },
                    orderedAt: { $first: '$orderedAt' },
                    status: { $first: '$status' },
                    clinicalInfo: { $first: '$clinicalInfo' },
                    tests: {
                        $push: {
                            _id: '$tests._id',
                            testId: '$tests.testId',
                            testName: '$testDetails.testName',
                            category: '$testDetails.category',
                            priority: '$tests.priority',
                            status: '$tests.status',
                            specimen: '$testDetails.specimen',
                            turnaroundTime: '$testDetails.turnaroundTime'
                        }
                    }
                }
            },
            {
                $sort: {
                    'tests.priority': 1, // STAT first, then Urgent, then Routine
                    orderedAt: 1
                }
            }
        );

        const orders = await LabOrder.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    }),

    // Update test status (specimen collection, etc.)
    updateTestStatus: catchAsyncErrors(async (req, res, next) => {
        const { orderId, testId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['Ordered', 'Collected', 'InProgress', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return next(new ErrorHandler('Invalid status', 400));
        }

        const order = await LabOrder.findOne({
            _id: orderId,
            'tests.testId': testId
        });

        if (!order) {
            return next(new ErrorHandler('Order or test not found', 404));
        }

        // Update specific test status
        const updateQuery = {
            _id: orderId,
            'tests.testId': testId
        };

        const updateData = {
            'tests.$.status': status
        };

        if (status === 'Collected') {
            updateData['tests.$.collectedAt'] = new Date();
        } else if (status === 'Completed') {
            updateData['tests.$.completedAt'] = new Date();
        }

        await LabOrder.updateOne(updateQuery, { $set: updateData });

        // Check if all tests are completed to update order status
        const updatedOrder = await LabOrder.findById(orderId);
        const allCompleted = updatedOrder.tests.every(test =>
            ['Completed', 'Cancelled'].includes(test.status)
        );

        if (allCompleted) {
            updatedOrder.status = 'Completed';
            updatedOrder.completedAt = new Date();
            await updatedOrder.save();
        }

        res.status(200).json({
            success: true,
            message: 'Test status updated successfully'
        });
    }),

    // Enter lab results (Technician only)
    enterLabResult: catchAsyncErrors(async (req, res, next) => {
        const {
            orderId,
            testId,
            result,
            interpretation,
            comments,
            methodology,
            instrument
        } = req.body;

        const technicianId = req.user._id;

        // Validate that the order and test exist
        const order = await LabOrder.findOne({
            _id: orderId,
            'tests.testId': testId
        }).populate('patientId tests.testId');

        if (!order) {
            return next(new ErrorHandler('Order or test not found', 404));
        }

        const testDetails = order.tests.find(t => t.testId._id.toString() === testId);
        if (testDetails.status !== 'InProgress' && testDetails.status !== 'Collected') {
            return next(new ErrorHandler('Test is not ready for result entry', 400));
        }

        // Determine if result is abnormal based on normal range
        const testInfo = testDetails.testId;
        let isAbnormal = false;
        let flag = 'Normal';

        if (testInfo.normalRange && typeof result.value === 'number') {
            if (testInfo.normalRange.min && result.value < testInfo.normalRange.min) {
                isAbnormal = true;
                flag = 'Low';
            } else if (testInfo.normalRange.max && result.value > testInfo.normalRange.max) {
                isAbnormal = true;
                flag = 'High';
            }
        }

        const labResult = await LabResult.create({
            orderId,
            testId,
            patientId: order.patientId._id,
            technicianId,
            result: {
                ...result,
                isAbnormal,
                flag
            },
            referenceRange: testInfo.normalRange ?
                `${testInfo.normalRange.min || ''}-${testInfo.normalRange.max || ''} ${testInfo.normalRange.unit || ''}` :
                testInfo.normalRange?.textRange || 'See reference',
            interpretation,
            comments,
            methodology,
            instrument
        });

        // Update test status to completed
        await LabOrder.updateOne(
            { _id: orderId, 'tests.testId': testId },
            {
                $set: {
                    'tests.$.status': 'Completed',
                    'tests.$.completedAt': new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Lab result entered successfully',
            result: labResult
        });
    }),

    // Get lab results for a patient or order
    getLabResults: catchAsyncErrors(async (req, res, next) => {
        const { patientId, orderId } = req.query;

        if (!patientId && !orderId) {
            return next(new ErrorHandler('Patient ID or Order ID is required', 400));
        }

        let filter = {};
        if (orderId) filter.orderId = orderId;
        if (patientId) filter.patientId = patientId;

        const results = await LabResult.find(filter)
            .populate('testId', 'testName category normalRange')
            .populate('technicianId', 'firstName lastName')
            .populate('verifiedBy', 'firstName lastName')
            .populate({
                path: 'orderId',
                select: 'orderId orderedAt',
                populate: {
                    path: 'doctorId',
                    select: 'firstName lastName'
                }
            })
            .sort({ performedAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });
    }),

    // Generate lab report (PDF/formatted view)
    generateLabReport: catchAsyncErrors(async (req, res, next) => {
        const { orderId } = req.params;

        const order = await LabOrder.findById(orderId)
            .populate('patientId', 'firstName lastName dob gender phone')
            .populate('doctorId', 'firstName lastName doctorDepartment')
            .populate('tests.testId');

        if (!order) {
            return next(new ErrorHandler('Lab order not found', 404));
        }

        const results = await LabResult.find({ orderId })
            .populate('testId')
            .populate('technicianId', 'firstName lastName')
            .populate('verifiedBy', 'firstName lastName');

        const report = {
            order: {
                orderId: order.orderId,
                orderedAt: order.orderedAt,
                completedAt: order.completedAt,
                status: order.status
            },
            patient: order.patientId,
            doctor: order.doctorId,
            clinicalInfo: order.clinicalInfo,
            tests: order.tests.map(test => {
                const result = results.find(r => r.testId._id.toString() === test.testId._id.toString());
                return {
                    testName: test.testId.testName,
                    category: test.testId.category,
                    status: test.status,
                    result: result || null,
                    normalRange: test.testId.normalRange
                };
            })
        };

        res.status(200).json({
            success: true,
            report
        });
    }),

    // Get lab statistics
    getLabStats: catchAsyncErrors(async (req, res, next) => {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.orderedAt = {};
            if (startDate) matchStage.orderedAt.$gte = new Date(startDate);
            if (endDate) matchStage.orderedAt.$lte = new Date(endDate);
        }

        const stats = await LabOrder.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        const categoryStats = await LabOrder.aggregate([
            { $match: matchStage },
            { $unwind: '$tests' },
            {
                $lookup: {
                    from: 'labtests',
                    localField: 'tests.testId',
                    foreignField: '_id',
                    as: 'testInfo'
                }
            },
            { $unwind: '$testInfo' },
            {
                $group: {
                    _id: '$testInfo.category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || {},
            categoryStats
        });
    })
};
