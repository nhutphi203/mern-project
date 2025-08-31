import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { InsuranceClaim } from '../models/billing/insuranceClaim.model.js';
import { PatientInsurance } from '../models/billing/patientInsurance.model.js';
import { InsuranceProvider } from '../models/billing/insuranceProvider.model.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';

// Create a new insurance claim
export const createInsuranceClaim = catchAsyncErrors(async (req, res, next) => {
    const {
        patientId,
        patientInsuranceId,
        medicalRecordId,
        invoiceId,
        serviceDate,
        diagnosisCodes,
        procedureCodes,
        totalClaimAmount,
        priorAuthorization,
        notes
    } = req.body;

    // Validate patient insurance exists and is active
    const patientInsurance = await PatientInsurance.findById(patientInsuranceId)
        .populate('insuranceProviderId');

    if (!patientInsurance || !patientInsurance.isActive) {
        return next(new ErrorHandler('Invalid or inactive patient insurance', 400));
    }

    // Create new claim
    const claim = new InsuranceClaim({
        patientId,
        patientInsuranceId,
        medicalRecordId,
        invoiceId,
        providerId: req.user._id,
        serviceDate,
        diagnosisCodes,
        procedureCodes,
        totalClaimAmount,
        priorAuthorization,
        notes,
        submittedBy: req.user._id
    });

    // Calculate patient responsibility
    claim.calculatePatientResponsibility(patientInsurance.insuranceProviderId);

    await claim.save();

    // Populate the claim for response
    const populatedClaim = await InsuranceClaim.findById(claim._id)
        .populate('patientId', 'firstName lastName email')
        .populate('patientInsuranceId')
        .populate('providerId', 'firstName lastName specialization')
        .populate('submittedBy', 'firstName lastName role');

    res.status(201).json({
        success: true,
        message: 'Insurance claim created successfully',
        data: populatedClaim
    });
});

// Get all insurance claims with filtering and pagination
export const getInsuranceClaims = catchAsyncErrors(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        status,
        patientId,
        patientName,
        claimNumber,
        dateFrom,
        dateTo,
        sortBy = 'submissionDate',
        sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (claimNumber) filter.claimNumber = new RegExp(claimNumber, 'i');

    if (dateFrom || dateTo) {
        filter.serviceDate = {};
        if (dateFrom) filter.serviceDate.$gte = new Date(dateFrom);
        if (dateTo) filter.serviceDate.$lte = new Date(dateTo);
    }

    // Role-based filtering
    if (req.user.role === 'Doctor') {
        filter.providerId = req.user._id;
    } else if (req.user.role === 'Patient') {
        filter.patientId = req.user._id;
    }

    // Build aggregation pipeline
    const pipeline = [
        { $match: filter },
        {
            $lookup: {
                from: 'users',
                localField: 'patientId',
                foreignField: '_id',
                as: 'patient'
            }
        },
        { $unwind: '$patient' },
        {
            $lookup: {
                from: 'patientinsurances',
                localField: 'patientInsuranceId',
                foreignField: '_id',
                as: 'insurance'
            }
        },
        { $unwind: '$insurance' },
        {
            $lookup: {
                from: 'insuranceproviders',
                localField: 'insurance.insuranceProviderId',
                foreignField: '_id',
                as: 'insuranceProvider'
            }
        },
        { $unwind: '$insuranceProvider' }
    ];

    // Add patient name filter if provided
    if (patientName) {
        pipeline.push({
            $match: {
                $or: [
                    { 'patient.firstName': new RegExp(patientName, 'i') },
                    { 'patient.lastName': new RegExp(patientName, 'i') },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$patient.firstName', ' ', '$patient.lastName'] },
                                regex: patientName,
                                options: 'i'
                            }
                        }
                    }
                ]
            }
        });
    }

    // Add sorting
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortObj });

    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [claims, totalCount] = await Promise.all([
        InsuranceClaim.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]),
        InsuranceClaim.aggregate([
            ...pipeline,
            { $count: 'total' }
        ])
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
        success: true,
        count: claims.length,
        totalRecords: total,
        page: parseInt(page),
        totalPages,
        data: claims
    });
});

// Get single insurance claim by ID
export const getInsuranceClaimById = catchAsyncErrors(async (req, res, next) => {
    const claim = await InsuranceClaim.findById(req.params.id)
        .populate('patientId', 'firstName lastName email phone dateOfBirth')
        .populate({
            path: 'patientInsuranceId',
            populate: {
                path: 'insuranceProviderId',
                model: 'InsuranceProvider'
            }
        })
        .populate('medicalRecordId')
        .populate('invoiceId')
        .populate('providerId', 'firstName lastName specialization')
        .populate('submittedBy', 'firstName lastName role')
        .populate('lastUpdatedBy', 'firstName lastName role')
        .populate('statusHistory.updatedBy', 'firstName lastName role');

    if (!claim) {
        return next(new ErrorHandler('Insurance claim not found', 404));
    }

    // Check access permissions
    if (req.user.role === 'Patient' && claim.patientId._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Access denied', 403));
    }

    if (req.user.role === 'Doctor' && claim.providerId._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Access denied', 403));
    }

    res.status(200).json({
        success: true,
        data: claim
    });
});

// Update insurance claim
export const updateInsuranceClaim = catchAsyncErrors(async (req, res, next) => {
    let claim = await InsuranceClaim.findById(req.params.id);

    if (!claim) {
        return next(new ErrorHandler('Insurance claim not found', 404));
    }

    // Check permissions
    if (req.user.role === 'Doctor' && claim.providerId.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Access denied', 403));
    }

    // Prevent updating if claim is already paid or closed
    if (['Paid', 'Closed'].includes(claim.status)) {
        return next(new ErrorHandler('Cannot update a paid or closed claim', 400));
    }

    const {
        diagnosisCodes,
        procedureCodes,
        totalClaimAmount,
        priorAuthorization,
        notes,
        status,
        statusReason
    } = req.body;

    // Update fields
    if (diagnosisCodes) claim.diagnosisCodes = diagnosisCodes;
    if (procedureCodes) claim.procedureCodes = procedureCodes;
    if (totalClaimAmount) claim.totalClaimAmount = totalClaimAmount;
    if (priorAuthorization) claim.priorAuthorization = priorAuthorization;
    if (notes) claim.notes = notes;

    // Update status if provided
    if (status && status !== claim.status) {
        await claim.updateStatus(status, statusReason, req.user._id, req.body.statusNotes);
    } else {
        claim.lastUpdatedBy = req.user._id;
        await claim.save();
    }

    // Populate and return updated claim
    const updatedClaim = await InsuranceClaim.findById(claim._id)
        .populate('patientId', 'firstName lastName email')
        .populate('patientInsuranceId')
        .populate('providerId', 'firstName lastName specialization')
        .populate('lastUpdatedBy', 'firstName lastName role');

    res.status(200).json({
        success: true,
        message: 'Insurance claim updated successfully',
        data: updatedClaim
    });
});

// Update claim status
export const updateClaimStatus = catchAsyncErrors(async (req, res, next) => {
    const { status, reason, notes, insuranceResponse } = req.body;

    const claim = await InsuranceClaim.findById(req.params.id);

    if (!claim) {
        return next(new ErrorHandler('Insurance claim not found', 404));
    }

    // Only insurance staff and admin can update status
    if (!['Admin', 'Insurance Staff'].includes(req.user.role)) {
        return next(new ErrorHandler('Access denied', 403));
    }

    // Update insurance response if provided
    if (insuranceResponse) {
        claim.insuranceResponse = {
            ...claim.insuranceResponse,
            ...insuranceResponse,
            responseDate: new Date()
        };

        // Update financial amounts based on insurance response
        if (insuranceResponse.approvedAmount) {
            claim.approvedAmount = insuranceResponse.approvedAmount;
        }
        if (insuranceResponse.paidAmount) {
            claim.paidAmount = insuranceResponse.paidAmount;
        }
    }

    await claim.updateStatus(status, reason, req.user._id, notes);

    const updatedClaim = await InsuranceClaim.findById(claim._id)
        .populate('patientId', 'firstName lastName email')
        .populate('lastUpdatedBy', 'firstName lastName role');

    res.status(200).json({
        success: true,
        message: 'Claim status updated successfully',
        data: updatedClaim
    });
});

// Get insurance claims statistics
export const getInsuranceClaimsStatistics = catchAsyncErrors(async (req, res, next) => {
    const { dateFrom, dateTo, providerId } = req.query;

    // Build filter
    const filter = {};
    if (dateFrom || dateTo) {
        filter.serviceDate = {};
        if (dateFrom) filter.serviceDate.$gte = new Date(dateFrom);
        if (dateTo) filter.serviceDate.$lte = new Date(dateTo);
    }

    if (providerId) filter.providerId = providerId;

    // Role-based filtering
    if (req.user.role === 'Doctor') {
        filter.providerId = req.user._id;
    }

    const [
        totalClaims,
        statusStats,
        financialStats,
        monthlyTrends,
        topDiagnoses,
        topProcedures
    ] = await Promise.all([
        // Total claims count
        InsuranceClaim.countDocuments(filter),

        // Status distribution
        InsuranceClaim.aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),

        // Financial statistics
        InsuranceClaim.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalClaimAmount: { $sum: '$totalClaimAmount' },
                    totalApproved: { $sum: '$approvedAmount' },
                    totalPaid: { $sum: '$paidAmount' },
                    avgClaimAmount: { $avg: '$totalClaimAmount' },
                    avgProcessingTime: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$updatedAt', '$submissionDate'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            }
        ]),

        // Monthly trends
        InsuranceClaim.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        year: { $year: '$submissionDate' },
                        month: { $month: '$submissionDate' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalClaimAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]),

        // Top diagnosis codes
        InsuranceClaim.aggregate([
            { $match: filter },
            { $unwind: '$diagnosisCodes' },
            {
                $group: {
                    _id: '$diagnosisCodes.icd10Code',
                    description: { $first: '$diagnosisCodes.description' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),

        // Top procedure codes
        InsuranceClaim.aggregate([
            { $match: filter },
            { $unwind: '$procedureCodes' },
            {
                $group: {
                    _id: '$procedureCodes.cptCode',
                    description: { $first: '$procedureCodes.description' },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$procedureCodes.totalAmount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    ]);

    // Calculate approval rate
    const approvedClaims = statusStats.filter(s =>
        ['Approved', 'Partially Approved', 'Paid'].includes(s._id)
    ).reduce((sum, s) => sum + s.count, 0);

    const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;

    res.status(200).json({
        success: true,
        data: {
            totalClaims,
            approvalRate: Math.round(approvalRate),
            statusDistribution: statusStats,
            financialSummary: financialStats[0] || {
                totalClaimAmount: 0,
                totalApproved: 0,
                totalPaid: 0,
                avgClaimAmount: 0,
                avgProcessingTime: 0
            },
            monthlyTrends: monthlyTrends.map(trend => ({
                month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
                count: trend.count,
                totalAmount: trend.totalAmount
            })),
            topDiagnoses,
            topProcedures
        }
    });
});

// Submit claim to insurance
export const submitClaim = catchAsyncErrors(async (req, res, next) => {
    const claim = await InsuranceClaim.findById(req.params.id);

    if (!claim) {
        return next(new ErrorHandler('Insurance claim not found', 404));
    }

    if (claim.status !== 'Draft') {
        return next(new ErrorHandler('Only draft claims can be submitted', 400));
    }

    // Check permissions
    if (req.user.role === 'Doctor' && claim.providerId.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Access denied', 403));
    }

    await claim.updateStatus('Submitted', 'Claim submitted to insurance', req.user._id);

    res.status(200).json({
        success: true,
        message: 'Claim submitted successfully',
        data: claim
    });
});

// Delete insurance claim (soft delete)
export const deleteInsuranceClaim = catchAsyncErrors(async (req, res, next) => {
    const claim = await InsuranceClaim.findById(req.params.id);

    if (!claim) {
        return next(new ErrorHandler('Insurance claim not found', 404));
    }

    // Only allow deletion of draft claims
    if (claim.status !== 'Draft') {
        return next(new ErrorHandler('Only draft claims can be deleted', 400));
    }

    // Check permissions
    if (req.user.role !== 'Admin' && claim.providerId.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('Access denied', 403));
    }

    await claim.updateStatus('Cancelled', 'Claim cancelled by user', req.user._id);

    res.status(200).json({
        success: true,
        message: 'Insurance claim cancelled successfully'
    });
});
