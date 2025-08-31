import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { LabTest } from '../models/labTest.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';
import { LabReport } from '../models/labReport.model.js';
import { labService } from '../services/labService.js';
import mongoose from 'mongoose';

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

        // Validate required fields
        if (!patientId) {
            return next(new ErrorHandler('Patient ID is required', 400));
        }

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

        // Create lab order data
        const orderData = {
            patientId,
            doctorId,
            tests: tests.map(test => ({
                testId: test.testId,
                priority: test.priority || 'Routine',
                instructions: test.instructions || ''
            })),
            clinicalInfo,
            totalAmount
        };

        // Add encounterId only if provided
        if (encounterId) {
            orderData.encounterId = encounterId;
        }

        const labOrder = await LabOrder.create(orderData);

        // Auto-create lab results for this order
        await labService.createLabResultsFromOrder(labOrder._id);

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
        // FIX: Use 'Pending' as default to match LabOrder model's order-level status
        const { status = 'Pending', priority, category } = req.query;

        // FIX: Build proper match stage based on status type
        let matchStage = {};

        // If filtering by test-level statuses, filter on tests.status
        if (['Ordered', 'Collected'].includes(status)) {
            matchStage['tests.status'] = status;
        } else {
            // For order-level statuses, filter on main status
            matchStage.status = status;
        }

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
                $addFields: {
                    tests: {
                        $map: {
                            input: '$tests',
                            as: 'test',
                            in: {
                                _id: '$$test._id',
                                testId: '$$test.testId',
                                priority: '$$test.priority',
                                status: '$$test.status',
                                instructions: '$$test.instructions'
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'labtests',
                    let: { testIds: '$tests.testId' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$testIds'] } } },
                        { $project: { testName: 1, category: 1, specimen: 1, turnaroundTime: 1 } }
                    ],
                    as: 'testDetails'
                }
            },
            {
                $addFields: {
                    tests: {
                        $map: {
                            input: '$tests',
                            as: 'test',
                            in: {
                                $mergeObjects: [
                                    '$$test',
                                    {
                                        $let: {
                                            vars: {
                                                testDetail: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$testDetails',
                                                                cond: { $eq: ['$$this._id', '$$test.testId'] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: {
                                                testName: { $ifNull: ['$$testDetail.testName', 'Unknown Test'] },
                                                category: { $ifNull: ['$$testDetail.category', 'Unknown'] },
                                                specimen: { $ifNull: ['$$testDetail.specimen', 'Unknown'] },
                                                turnaroundTime: { $ifNull: ['$$testDetail.turnaroundTime', 'Unknown'] }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    orderNumber: 1,
                    patientId: { $arrayElemAt: ['$patient', 0] },
                    doctorId: { $arrayElemAt: ['$doctor', 0] },
                    orderedAt: 1,
                    status: 1,
                    clinicalInfo: 1,
                    totalAmount: 1,
                    tests: 1
                }
            }
        ];

        if (category) {
            pipeline.push({
                $match: { 'tests.category': category }
            });
        }

        pipeline.push({
            $sort: {
                'tests.priority': 1, // STAT first, then Urgent, then Routine
                orderedAt: 1
            }
        });

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

        // Update lab queue and potentially create/update report
        await labService.updateLabQueue(orderId);

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

        // Update lab queue and create/update report if needed
        await labService.updateLabQueue(orderId);

        res.status(201).json({
            success: true,
            message: 'Lab result entered successfully',
            result: labResult
        });
    }),

    // Get lab results with proper population and filtering
    getLabResults: catchAsyncErrors(async (req, res, next) => {
        try {
            const { patientId, orderId, status } = req.query;
            const limit = parseInt(req.query.limit) || 100;
            const page = parseInt(req.query.page) || 1;

            let filter = {};

            // Add filters based on parameters
            if (patientId && patientId !== 'all') {
                filter.patientId = patientId;
            }
            if (orderId) filter.orderId = orderId;
            if (status) filter.status = status;

            // Calculate pagination
            const limitValue = Math.min(limit, 500);
            const skipValue = Math.max(0, (page - 1) * limitValue);

            // Query with proper population
            const results = await LabResult.find(filter)
                .populate({
                    path: 'testId',
                    select: 'testName category normalRange specimen'
                })
                .populate({
                    path: 'patientId',
                    select: 'firstName lastName dob gender'
                })
                .populate({
                    path: 'technicianId',
                    select: 'firstName lastName'
                })
                .populate({
                    path: 'verifiedBy',
                    select: 'firstName lastName'
                })
                .populate({
                    path: 'orderId',
                    select: 'orderId orderedAt completedAt',
                    populate: {
                        path: 'doctorId',
                        select: 'firstName lastName'
                    }
                })
                .sort({ performedAt: -1 })
                .skip(skipValue)
                .limit(limitValue);

            // Get total count for pagination
            const totalCount = await LabResult.countDocuments(filter);

            res.status(200).json({
                success: true,
                count: results.length,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limitValue),
                results
            });
        } catch (error) {
            console.error('Error fetching lab results:', error);
            return next(new ErrorHandler('Failed to fetch lab results', 500));
        }
    }),

    // Get lab reports
    getLabReports: catchAsyncErrors(async (req, res, next) => {
        try {
            const { patientId, status, startDate, endDate } = req.query;
            const limit = parseInt(req.query.limit) || 50;
            const page = parseInt(req.query.page) || 1;

            let filter = {};

            if (patientId && patientId !== 'all') {
                filter.patientId = patientId;
            }
            if (status) filter.status = status;

            if (startDate || endDate) {
                filter.reportDate = {};
                if (startDate) filter.reportDate.$gte = new Date(startDate);
                if (endDate) filter.reportDate.$lte = new Date(endDate);
            }

            const limitValue = Math.min(limit, 200);
            const skipValue = Math.max(0, (page - 1) * limitValue);

            const reports = await LabReport.find(filter)
                .populate({
                    path: 'patientId',
                    select: 'firstName lastName dob gender'
                })
                .populate({
                    path: 'labOrderId',
                    select: 'orderId orderedAt totalAmount',
                    populate: {
                        path: 'doctorId',
                        select: 'firstName lastName doctorDepartment'
                    }
                })
                .populate({
                    path: 'createdBy',
                    select: 'firstName lastName'
                })
                .populate({
                    path: 'reviewedBy',
                    select: 'firstName lastName'
                })
                .populate({
                    path: 'testResults.testId',
                    select: 'testName category'
                })
                .populate({
                    path: 'testResults.resultId'
                })
                .sort({ reportDate: -1 })
                .skip(skipValue)
                .limit(limitValue);

            const totalCount = await LabReport.countDocuments(filter);

            res.status(200).json({
                success: true,
                count: reports.length,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limitValue),
                reports
            });
        } catch (error) {
            console.error('Error fetching lab reports:', error);
            return next(new ErrorHandler('Failed to fetch lab reports', 500));
        }
    }),

    // Create lab report
    createLabReport: catchAsyncErrors(async (req, res, next) => {
        const {
            patientId,
            labOrderId,
            summary,
            finalDiagnosis,
            recommendations,
            interpretation,
            clinicalCorrelation
        } = req.body;

        const createdBy = req.user._id;

        // Validate that the order exists
        const order = await LabOrder.findById(labOrderId)
            .populate('tests.testId');

        if (!order) {
            return next(new ErrorHandler('Lab order not found', 404));
        }

        // Get all results for this order
        const results = await LabResult.find({ orderId: labOrderId })
            .populate('testId');

        // Build test results array
        const testResults = results.map(result => ({
            testId: result.testId._id,
            resultId: result._id,
            summary: `${result.testId.testName}: ${result.result.value} ${result.result.unit || ''} (${result.result.flag})`
        }));

        // Find abnormal findings
        const abnormalFindings = results
            .filter(result => result.result.isAbnormal)
            .map(result => ({
                testName: result.testId.testName,
                finding: `${result.result.value} ${result.result.unit || ''}`,
                significance: result.interpretation || 'See clinical correlation'
            }));

        const reportData = {
            patientId,
            labOrderId,
            summary,
            finalDiagnosis,
            recommendations,
            createdBy,
            testResults,
            abnormalFindings,
            interpretation,
            clinicalCorrelation,
            status: 'Completed'
        };

        const report = await LabReport.create(reportData);

        await report.populate([
            { path: 'patientId', select: 'firstName lastName' },
            { path: 'labOrderId', select: 'orderId' },
            { path: 'createdBy', select: 'firstName lastName' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Lab report created successfully',
            report
        });
    }),

    // Generate lab report (PDF/formatted view)
    generateLabReport: catchAsyncErrors(async (req, res, next) => {
        const { orderId } = req.params;

        try {
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order ID format',
                    code: 'INVALID_ID'
                });
            }

            const order = await LabOrder.findById(orderId)
                .populate('patientId', 'firstName lastName dob gender phone')
                .populate('doctorId', 'firstName lastName doctorDepartment')
                .populate('tests.testId');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Lab order not found',
                    code: 'NOT_FOUND'
                });
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
        } catch (error) {
            console.error('Error generating lab report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate lab report',
                code: 'REPORT_ERROR'
            });
        }
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
