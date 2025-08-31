import { VitalSigns } from '../models/vitalSigns.model.js';
import { User } from '../models/userScheme.js';
import { Encounter } from '../models/encounter.model.js';
import { Appointment } from '../models/appointmentSchema.js';
import mongoose from 'mongoose';

// Create new vital signs record
export const createVitalSigns = async (req, res) => {
    try {
        const {
            patientId,
            encounterId,
            appointmentId,
            bloodPressure,
            heartRate,
            temperature,
            respiratoryRate,
            oxygenSaturation,
            painScale,
            height,
            weight,
            glucose,
            location,
            method,
            notes
        } = req.body;

        // Validate patient exists
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'Patient') {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Validate encounter if provided
        if (encounterId) {
            const encounter = await Encounter.findById(encounterId);
            if (!encounter) {
                return res.status(404).json({
                    success: false,
                    message: 'Encounter not found'
                });
            }
        }

        // Validate appointment if provided
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }
        }

        const vitalSigns = new VitalSigns({
            patientId,
            encounterId,
            appointmentId,
            bloodPressure,
            heartRate,
            temperature,
            respiratoryRate,
            oxygenSaturation,
            painScale,
            height,
            weight,
            glucose,
            location,
            method,
            notes,
            measuredBy: req.user._id
        });

        // Auto-calculate BMI if height and weight are provided
        if (height && weight) {
            const heightInM = height / 100; // Convert cm to meters
            const bmiValue = weight / (heightInM * heightInM);

            let category = 'Normal';
            if (bmiValue < 18.5) category = 'Underweight';
            else if (bmiValue >= 25 && bmiValue < 30) category = 'Overweight';
            else if (bmiValue >= 30) category = 'Obese';

            vitalSigns.bmi = {
                value: parseFloat(bmiValue.toFixed(1)),
                category: category,
                calculatedAt: new Date()
            };
        }

        await vitalSigns.save();

        // Populate references for response
        await vitalSigns.populate([
            { path: 'patientId', select: 'firstName lastName patientId' },
            { path: 'measuredBy', select: 'firstName lastName role' },
            { path: 'encounterId', select: 'encounterNumber type' },
            { path: 'appointmentId', select: 'appointmentNumber' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Vital signs recorded successfully',
            data: vitalSigns
        });

    } catch (error) {
        console.error('Create vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording vital signs',
            error: error.message
        });
    }
};

// Get vital signs by ID
export const getVitalSignsById = async (req, res) => {
    try {
        const { id } = req.params;

        const vitalSigns = await VitalSigns.findById(id)
            .populate('patientId', 'firstName lastName patientId dateOfBirth gender')
            .populate('measuredBy', 'firstName lastName role')
            .populate('encounterId', 'encounterNumber type status')
            .populate('appointmentId', 'appointmentNumber date')
            .populate('verifiedBy', 'firstName lastName role');

        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: 'Vital signs record not found'
            });
        }

        // Check access permissions
        const userRole = req.user.role;
        const isPatientOwner = req.user._id.equals(vitalSigns.patientId._id);

        if (userRole === 'Patient' && !isPatientOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view own vital signs'
            });
        }

        res.json({
            success: true,
            data: vitalSigns
        });

    } catch (error) {
        console.error('Get vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving vital signs',
            error: error.message
        });
    }
};

// Get vital signs for a patient
export const getPatientVitalSigns = async (req, res) => {
    try {
        const { patientId } = req.params;
        const {
            page = 1,
            limit = 20,
            sortBy = 'measuredAt',
            sortOrder = 'desc',
            startDate,
            endDate,
            parameter,
            location,
            verified
        } = req.query;

        // Check access permissions
        const userRole = req.user.role;
        const isPatientOwner = req.user._id.toString() === patientId;

        if (userRole === 'Patient' && !isPatientOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view own vital signs'
            });
        }

        // Build filter
        const filter = { patientId: new mongoose.Types.ObjectId(patientId) };

        if (startDate || endDate) {
            filter.measuredAt = {};
            if (startDate) filter.measuredAt.$gte = new Date(startDate);
            if (endDate) filter.measuredAt.$lte = new Date(endDate);
        }

        if (location) filter.location = location;
        if (verified !== undefined) filter.verified = verified === 'true';

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get total count
        const totalRecords = await VitalSigns.countDocuments(filter);

        // Get vital signs
        let query = VitalSigns.find(filter)
            .populate('measuredBy', 'firstName lastName role')
            .populate('encounterId', 'encounterNumber type')
            .populate('appointmentId', 'appointmentNumber')
            .populate('verifiedBy', 'firstName lastName role')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const vitalSigns = await query;

        res.json({
            success: true,
            data: {
                vitalSigns,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalRecords / parseInt(limit)),
                    totalRecords,
                    hasNext: skip + vitalSigns.length < totalRecords,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get patient vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving patient vital signs',
            error: error.message
        });
    }
};

// Update vital signs
export const updateVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find existing vital signs
        const vitalSigns = await VitalSigns.findById(id);
        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: 'Vital signs record not found'
            });
        }

        // Check permissions - only measured by user or admin can update
        if (!req.user._id.equals(vitalSigns.measuredBy) && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only update records you created'
            });
        }

        // Remove immutable fields
        delete updates._id;
        delete updates.patientId;
        delete updates.measuredBy;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Update the record
        Object.assign(vitalSigns, updates);
        await vitalSigns.save();

        // Populate for response
        await vitalSigns.populate([
            { path: 'patientId', select: 'firstName lastName patientId' },
            { path: 'measuredBy', select: 'firstName lastName role' },
            { path: 'encounterId', select: 'encounterNumber type' },
            { path: 'appointmentId', select: 'appointmentNumber' },
            { path: 'verifiedBy', select: 'firstName lastName role' }
        ]);

        res.json({
            success: true,
            message: 'Vital signs updated successfully',
            data: vitalSigns
        });

    } catch (error) {
        console.error('Update vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating vital signs',
            error: error.message
        });
    }
};

// Delete vital signs
export const deleteVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;

        const vitalSigns = await VitalSigns.findById(id);
        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: 'Vital signs record not found'
            });
        }

        // Check permissions - only admin or measured by user can delete
        if (!req.user._id.equals(vitalSigns.measuredBy) && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Insufficient permissions'
            });
        }

        await VitalSigns.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Vital signs record deleted successfully'
        });

    } catch (error) {
        console.error('Delete vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting vital signs',
            error: error.message
        });
    }
};

// Verify vital signs
export const verifyVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const { verified = true } = req.body;

        // Only doctors and nurses can verify
        if (!['Doctor', 'Nurse', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only medical staff can verify vital signs'
            });
        }

        const vitalSigns = await VitalSigns.findById(id);
        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: 'Vital signs record not found'
            });
        }

        vitalSigns.verified = verified;
        vitalSigns.verifiedBy = verified ? req.user._id : null;
        vitalSigns.verifiedAt = verified ? new Date() : null;

        await vitalSigns.save();

        await vitalSigns.populate([
            { path: 'patientId', select: 'firstName lastName patientId' },
            { path: 'measuredBy', select: 'firstName lastName role' },
            { path: 'verifiedBy', select: 'firstName lastName role' }
        ]);

        res.json({
            success: true,
            message: `Vital signs ${verified ? 'verified' : 'unverified'} successfully`,
            data: vitalSigns
        });

    } catch (error) {
        console.error('Verify vital signs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying vital signs',
            error: error.message
        });
    }
};

// Get vital signs trends
export const getVitalSignsTrends = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { parameter, days = 7 } = req.query;

        // Check access permissions
        const userRole = req.user.role;
        const isPatientOwner = req.user._id.toString() === patientId;

        if (userRole === 'Patient' && !isPatientOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view own vital signs trends'
            });
        }

        if (!parameter) {
            return res.status(400).json({
                success: false,
                message: 'Parameter is required for trends analysis'
            });
        }

        const trends = await VitalSigns.getTrends(patientId, parameter, parseInt(days));

        res.json({
            success: true,
            data: {
                parameter,
                days: parseInt(days),
                trends
            }
        });

    } catch (error) {
        console.error('Get trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving vital signs trends',
            error: error.message
        });
    }
};

// Get alerts
export const getVitalSignsAlerts = async (req, res) => {
    try {
        const {
            acknowledged = false,
            severity,
            page = 1,
            limit = 20,
            patientId
        } = req.query;

        // Build filter
        const filter = {};

        if (patientId) {
            // Check patient access
            const userRole = req.user.role;
            const isPatientOwner = req.user._id.toString() === patientId;

            if (userRole === 'Patient' && !isPatientOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Can only view own alerts'
                });
            }

            filter.patientId = new mongoose.Types.ObjectId(patientId);
        }

        // Add alert filters
        filter['alerts.acknowledged'] = acknowledged === 'true';
        if (severity) {
            filter['alerts.severity'] = severity;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const pipeline = [
            { $match: filter },
            { $unwind: '$alerts' },
            {
                $match: {
                    'alerts.acknowledged': acknowledged === 'true',
                    ...(severity && { 'alerts.severity': severity })
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'patientId',
                    foreignField: '_id',
                    as: 'patient',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, patientId: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'measuredBy',
                    foreignField: '_id',
                    as: 'measuredBy',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, role: 1 } }]
                }
            },
            {
                $project: {
                    alert: '$alerts',
                    patient: { $arrayElemAt: ['$patient', 0] },
                    measuredBy: { $arrayElemAt: ['$measuredBy', 0] },
                    measuredAt: 1,
                    location: 1
                }
            },
            { $sort: { 'alert.createdAt': -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ];

        const alerts = await VitalSigns.aggregate(pipeline);
        const totalAlerts = await VitalSigns.aggregate([
            { $match: filter },
            { $unwind: '$alerts' },
            {
                $match: {
                    'alerts.acknowledged': acknowledged === 'true',
                    ...(severity && { 'alerts.severity': severity })
                }
            },
            { $count: 'total' }
        ]);

        const total = totalAlerts[0]?.total || 0;

        res.json({
            success: true,
            data: {
                alerts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalRecords: total,
                    hasNext: skip + alerts.length < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving alerts',
            error: error.message
        });
    }
};

// Acknowledge alert
export const acknowledgeAlert = async (req, res) => {
    try {
        const { id, alertId } = req.params;

        const vitalSigns = await VitalSigns.findById(id);
        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: 'Vital signs record not found'
            });
        }

        await vitalSigns.acknowledgeAlert(alertId, req.user._id);

        res.json({
            success: true,
            message: 'Alert acknowledged successfully'
        });

    } catch (error) {
        console.error('Acknowledge alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Error acknowledging alert',
            error: error.message
        });
    }
};

// Get vital signs summary/statistics
export const getVitalSignsSummary = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { days = 30 } = req.query;

        // Check access permissions
        const userRole = req.user.role;
        const isPatientOwner = req.user._id.toString() === patientId;

        if (userRole === 'Patient' && !isPatientOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view own vital signs summary'
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const pipeline = [
            {
                $match: {
                    patientId: new mongoose.Types.ObjectId(patientId),
                    measuredAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgSystolic: { $avg: '$bloodPressure.systolic' },
                    avgDiastolic: { $avg: '$bloodPressure.diastolic' },
                    avgHeartRate: { $avg: '$heartRate.value' },
                    avgTemperature: { $avg: '$temperature.value' },
                    avgRespiratoryRate: { $avg: '$respiratoryRate.value' },
                    avgOxygenSaturation: { $avg: '$oxygenSaturation.value' },
                    lastBMI: { $last: '$bmi.value' },
                    lastBMICategory: { $last: '$bmi.category' },
                    criticalAlerts: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$alerts',
                                    cond: { $eq: ['$$this.severity', 'Critical'] }
                                }
                            }
                        }
                    },
                    highAlerts: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$alerts',
                                    cond: { $eq: ['$$this.severity', 'High'] }
                                }
                            }
                        }
                    },
                    firstRecord: { $first: '$measuredAt' },
                    lastRecord: { $last: '$measuredAt' }
                }
            }
        ];

        const summary = await VitalSigns.aggregate(pipeline);

        res.json({
            success: true,
            data: {
                period: `${days} days`,
                summary: summary[0] || {
                    totalRecords: 0,
                    message: 'No vital signs recorded in the specified period'
                }
            }
        });

    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving vital signs summary',
            error: error.message
        });
    }
};
