import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        unique: true,
        required: false // Will be auto-generated
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder',
        required: true
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
    results: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabResult'
    }],
    summary: {
        totalTests: {
            type: Number,
            default: 0
        },
        completedTests: {
            type: Number,
            default: 0
        },
        abnormalResults: {
            type: Number,
            default: 0
        },
        criticalResults: {
            type: Number,
            default: 0
        }
    },
    clinicalSummary: String,
    finalDiagnosis: String,
    recommendations: String,
    status: {
        type: String,
        enum: ['Draft', 'Preliminary', 'Final', 'Reviewed', 'Amended'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reportedAt: {
        type: Date,
        default: Date.now
    },
    testResults: [{
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabTest'
        },
        resultId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabResult'
        },
        summary: String
    }],
    abnormalFindings: [{
        testName: String,
        finding: String,
        significance: String
    }],
    interpretation: String,
    clinicalCorrelation: String
}, { timestamps: true });

// Generate reportId automatically
labReportSchema.pre('save', async function (next) {
    if (this.isNew && !this.reportId) {
        const count = await mongoose.models.LabReport.countDocuments();
        this.reportId = `RPT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Method to calculate summary from results
labReportSchema.methods.calculateSummary = async function () {
    await this.populate('results');

    if (this.results && this.results.length > 0) {
        this.summary.totalTests = this.results.length;
        this.summary.completedTests = this.results.filter(r => r.status === 'Completed').length;
        this.summary.abnormalResults = this.results.filter(r =>
            r.result && (r.result.flag === 'Abnormal' || r.result.flag === 'High' || r.result.flag === 'Low')
        ).length;
        this.summary.criticalResults = this.results.filter(r =>
            r.result && r.result.flag === 'Critical'
        ).length;
    }

    return this.save();
};

export const LabReport = mongoose.model('LabReport', labReportSchema);
