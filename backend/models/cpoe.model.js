// CPOE (Computerized Provider Order Entry) Model
import mongoose from 'mongoose';

// Order Item Schema for different types of orders
const orderItemSchema = new mongoose.Schema({
    orderType: {
        type: String,
        required: true,
        enum: [
            'Medication',     // Thuốc
            'Laboratory',     // Xét nghiệm
            'Radiology',      // Chẩn đoán hình ảnh
            'Procedure',      // Thủ thuật
            'Nursing',        // Chăm sóc điều dưỡng
            'Therapy',        // Vật lý trị liệu
            'Diet',          // Chế độ ăn
            'Activity',      // Hoạt động
            'Monitoring'     // Theo dõi
        ]
    },

    // Reference to specific items based on type
    itemReference: {
        medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
        labTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
        procedureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Procedure' },
        // Add more references as needed
    },

    // Order details
    itemName: {
        type: String,
        required: true
    },
    itemCode: String,

    // Medication-specific fields
    medication: {
        dosage: String,
        frequency: String,
        route: {
            type: String,
            enum: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Other']
        },
        duration: String,
        quantity: Number,
        refills: Number,
        substitutionAllowed: Boolean
    },

    // Lab/Radiology specific fields
    diagnostic: {
        urgency: {
            type: String,
            enum: ['Routine', 'Urgent', 'STAT', 'ASAP'],
            default: 'Routine'
        },
        fastingRequired: Boolean,
        contrast: Boolean,
        specialInstructions: String
    },

    // Procedure specific fields
    procedure: {
        location: String,
        anesthesia: String,
        specialEquipment: [String],
        estimatedDuration: Number, // in minutes
    },

    // Nursing/Diet/Activity orders
    care: {
        frequency: String,
        duration: String,
        specialInstructions: String
    },

    // Common fields
    instructions: String,
    indication: String, // Lý do chỉ định
    precautions: [String],
    contraindications: [String],

    // Status tracking
    status: {
        type: String,
        enum: ['Draft', 'Ordered', 'In Progress', 'Completed', 'Cancelled', 'Discontinued'],
        default: 'Draft'
    },

    // Priority
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Critical'],
        default: 'Normal'
    },

    // Scheduling
    scheduledDate: Date,
    scheduledTime: String,

    // Cost information
    estimatedCost: {
        type: Number,
        min: 0
    },

    // Clinical decision support alerts
    alerts: [{
        type: {
            type: String,
            enum: ['Drug Interaction', 'Allergy', 'Duplicate', 'Dosage', 'Lab Value', 'Clinical']
        },
        severity: {
            type: String,
            enum: ['Info', 'Warning', 'Critical']
        },
        message: String,
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: Date
    }]
}, { _id: true, timestamps: true });

// Main CPOE Schema
const cpoeSchema = new mongoose.Schema({
    // Patient and provider information
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    encounterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encounter',
        required: true
    },
    orderingProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Order set information
    orderSetName: String, // e.g., "Post-Op Orders", "Admission Orders"
    orderSetTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderTemplate'
    },

    // All order items
    orderItems: [orderItemSchema],

    // Overall order status
    overallStatus: {
        type: String,
        enum: ['Draft', 'Submitted', 'In Progress', 'Completed', 'Partially Completed', 'Cancelled'],
        default: 'Draft'
    },

    // Clinical context
    clinicalIndication: String,
    primaryDiagnosis: {
        icd10Code: String,
        description: String
    },

    // Timing
    orderDate: {
        type: Date,
        default: Date.now
    },
    startDate: Date,
    endDate: Date,

    // Verification and approval
    verificationRequired: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,

    // Communication
    communicationMethod: {
        type: String,
        enum: ['Electronic', 'Verbal', 'Phone', 'Written'],
        default: 'Electronic'
    },

    // Notes and comments
    providerNotes: String,
    pharmacyNotes: String,
    nursingNotes: String,

    // Cost summary
    totalEstimatedCost: {
        type: Number,
        min: 0,
        default: 0
    },

    // Quality metrics
    qualityMetrics: {
        decisionSupportAlertsTriggered: Number,
        alertsOverridden: Number,
        timeToComplete: Number, // minutes from order to completion
        errorsCorrected: Number
    }
}, {
    timestamps: true,
    collection: 'cpoe_orders'
});

// Indexes
cpoeSchema.index({ patientId: 1, orderDate: -1 });
cpoeSchema.index({ encounterId: 1 });
cpoeSchema.index({ orderingProviderId: 1, orderDate: -1 });
cpoeSchema.index({ overallStatus: 1 });
cpoeSchema.index({ 'orderItems.status': 1 });
cpoeSchema.index({ 'orderItems.orderType': 1 });

// Virtual for active orders
cpoeSchema.virtual('activeOrderItems').get(function () {
    return this.orderItems.filter(item =>
        ['Ordered', 'In Progress'].includes(item.status)
    );
});

// Methods
cpoeSchema.methods.calculateTotalCost = function () {
    this.totalEstimatedCost = this.orderItems.reduce((total, item) => {
        return total + (item.estimatedCost || 0);
    }, 0);
    return this.totalEstimatedCost;
};

cpoeSchema.methods.addAlert = function (orderItemId, alertData) {
    const orderItem = this.orderItems.id(orderItemId);
    if (orderItem) {
        orderItem.alerts.push(alertData);
        this.qualityMetrics.decisionSupportAlertsTriggered += 1;
    }
    return this.save();
};

cpoeSchema.methods.acknowledgeAlert = function (orderItemId, alertId, userId) {
    const orderItem = this.orderItems.id(orderItemId);
    if (orderItem) {
        const alert = orderItem.alerts.id(alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedBy = userId;
            alert.acknowledgedAt = new Date();
            if (alert.severity === 'Critical') {
                this.qualityMetrics.alertsOverridden += 1;
            }
        }
    }
    return this.save();
};

cpoeSchema.methods.updateOrderStatus = function (orderItemId, newStatus) {
    const orderItem = this.orderItems.id(orderItemId);
    if (orderItem) {
        orderItem.status = newStatus;

        // Update overall status based on individual items
        const statuses = this.orderItems.map(item => item.status);
        if (statuses.every(status => status === 'Completed')) {
            this.overallStatus = 'Completed';
        } else if (statuses.some(status => status === 'Completed')) {
            this.overallStatus = 'Partially Completed';
        } else if (statuses.some(status => ['Ordered', 'In Progress'].includes(status))) {
            this.overallStatus = 'In Progress';
        }
    }
    return this.save();
};

// Static methods
cpoeSchema.statics.getActiveOrdersForPatient = async function (patientId) {
    return await this.find({
        patientId,
        overallStatus: { $in: ['Submitted', 'In Progress', 'Partially Completed'] }
    })
        .populate('orderingProviderId', 'firstName lastName')
        .populate('encounterId', 'checkInTime status')
        .sort({ orderDate: -1 });
};

cpoeSchema.statics.getPendingOrders = async function () {
    return await this.find({
        'orderItems.status': 'Ordered'
    })
        .populate('patientId', 'firstName lastName')
        .populate('orderingProviderId', 'firstName lastName')
        .sort({ orderDate: 1 });
};

export const CPOE = mongoose.model('CPOE', cpoeSchema);
