import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';
import { LabReport } from '../models/labReport.model.js';
import { LabTest } from '../models/labTest.model.js';

export const labService = {
    // Auto-create lab results when order is created
    createLabResultsFromOrder: async (orderId) => {
        try {
            const order = await LabOrder.findById(orderId)
                .populate('tests.testId');

            if (!order) {
                throw new Error('Lab order not found');
            }

            // Create lab results for each test in the order
            const labResults = [];
            for (const test of order.tests) {
                const existingResult = await LabResult.findOne({
                    orderId: order._id,
                    testId: test.testId._id
                });

                // Only create if result doesn't exist
                if (!existingResult) {
                    const labResult = await LabResult.create({
                        orderId: order._id,
                        testId: test.testId._id,
                        patientId: order.patientId,
                        technicianId: order.doctorId, // Temporarily use doctor, will be updated by technician
                        result: {
                            value: null, // Will be filled by technician
                            unit: test.testId.unit || '',
                            flag: 'Normal'
                        },
                        referenceRange: test.testId.normalRange ?
                            `${test.testId.normalRange.min || ''}-${test.testId.normalRange.max || ''} ${test.testId.normalRange.unit || ''}` :
                            test.testId.normalRange?.textRange || 'See reference',
                        status: 'Pending'
                    });
                    labResults.push(labResult);
                }
            }

            return labResults;
        } catch (error) {
            console.error('Error creating lab results from order:', error);
            throw error;
        }
    },

    // Auto-create/update lab report when all results are completed
    createOrUpdateLabReport: async (orderId) => {
        try {
            const order = await LabOrder.findById(orderId)
                .populate('patientId doctorId tests.testId');

            if (!order) {
                throw new Error('Lab order not found');
            }

            // Get all lab results for this order
            const labResults = await LabResult.find({ orderId })
                .populate('testId');

            // Check if all results are completed
            const completedResults = labResults.filter(r => r.status === 'Completed');

            if (completedResults.length === 0) {
                return null; // No completed results yet
            }

            // Check if report already exists
            let report = await LabReport.findOne({ orderId });

            // Calculate summary
            const summary = {
                totalTests: labResults.length,
                completedTests: completedResults.length,
                abnormalResults: completedResults.filter(r =>
                    r.result && (r.result.flag === 'Abnormal' || r.result.flag === 'High' || r.result.flag === 'Low')
                ).length,
                criticalResults: completedResults.filter(r =>
                    r.result && r.result.flag === 'Critical'
                ).length
            };

            // Prepare test results for report
            const testResults = completedResults.map(result => ({
                testId: result.testId._id,
                resultId: result._id,
                summary: `${result.testId.testName}: ${result.result.value || 'Pending'} ${result.result.unit || ''} (${result.result.flag})`
            }));

            // Find abnormal findings
            const abnormalFindings = completedResults
                .filter(result => result.result.isAbnormal || result.result.flag !== 'Normal')
                .map(result => ({
                    testName: result.testId.testName,
                    finding: `${result.result.value} ${result.result.unit || ''}`,
                    significance: result.interpretation || 'See clinical correlation'
                }));

            // Generate clinical summary
            const clinicalSummary = this.generateClinicalSummary(completedResults);

            if (report) {
                // Update existing report
                report.results = completedResults.map(r => r._id);
                report.summary = summary;
                report.testResults = testResults;
                report.abnormalFindings = abnormalFindings;
                report.clinicalSummary = clinicalSummary;

                if (summary.completedTests === summary.totalTests) {
                    report.status = 'Final';
                } else {
                    report.status = 'Preliminary';
                }

                await report.save();
            } else {
                // Create new report
                report = await LabReport.create({
                    orderId,
                    patientId: order.patientId._id,
                    doctorId: order.doctorId._id,
                    results: completedResults.map(r => r._id),
                    summary,
                    testResults,
                    abnormalFindings,
                    clinicalSummary,
                    status: summary.completedTests === summary.totalTests ? 'Final' : 'Preliminary',
                    createdBy: order.doctorId._id
                });
            }

            return report;
        } catch (error) {
            console.error('Error creating/updating lab report:', error);
            throw error;
        }
    },

    // Generate clinical summary from results
    generateClinicalSummary: (results) => {
        const normalResults = results.filter(r => r.result.flag === 'Normal');
        const abnormalResults = results.filter(r => r.result.flag !== 'Normal');

        let summary = `Laboratory Results Summary:\n\n`;

        if (normalResults.length > 0) {
            summary += `Normal Results (${normalResults.length}):\n`;
            normalResults.forEach(r => {
                summary += `- ${r.testId.testName}: ${r.result.value} ${r.result.unit || ''}\n`;
            });
            summary += '\n';
        }

        if (abnormalResults.length > 0) {
            summary += `Abnormal Results (${abnormalResults.length}):\n`;
            abnormalResults.forEach(r => {
                summary += `- ${r.testId.testName}: ${r.result.value} ${r.result.unit || ''} (${r.result.flag})\n`;
                if (r.interpretation) {
                    summary += `  Interpretation: ${r.interpretation}\n`;
                }
            });
            summary += '\n';
        }

        if (abnormalResults.length === 0) {
            summary += 'All test results are within normal limits.\n';
        }

        summary += '\nPlease correlate with clinical findings.';

        return summary;
    },

    // Update lab queue when order status changes
    updateLabQueue: async (orderId) => {
        try {
            const order = await LabOrder.findById(orderId);
            if (!order) return;

            // Check if all tests are completed
            const allTestsCompleted = order.tests.every(test =>
                ['Completed', 'Cancelled'].includes(test.status)
            );

            if (allTestsCompleted && order.status !== 'Completed') {
                order.status = 'Completed';
                order.completedAt = new Date();
                await order.save();

                // Auto-create/update lab report
                await this.createOrUpdateLabReport(orderId);
            }

            return order;
        } catch (error) {
            console.error('Error updating lab queue:', error);
            throw error;
        }
    }
};
