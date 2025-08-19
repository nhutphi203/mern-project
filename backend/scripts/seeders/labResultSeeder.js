import mongoose from 'mongoose';
import { LabResult } from '../../models/labResult.model.js';
import { LabTest } from '../../models/labTest.model.js';

export const seedLabResults = async (labOrders, users, labTests) => {
    try {
        if (!labOrders || !users || !labTests) {
            throw new Error('Lab orders, users, and lab tests data are required for seeding lab results');
        }

        // Clear existing lab results
        await LabResult.deleteMany({});

        const labResults = [];
        const { technicians, labSupervisors } = users;
        const allTechnicians = [...technicians, ...labSupervisors];

        // Create results for completed tests
        for (const order of labOrders) {
            for (const test of order.tests) {
                if (test.status === 'Completed') {
                    const technician = allTechnicians[Math.floor(Math.random() * allTechnicians.length)];
                    const testInfo = labTests.find(t => t._id.toString() === test.testId.toString());

                    if (testInfo) {
                        // Generate realistic result values
                        let value, isAbnormal = false, flag = 'Normal';

                        if (testInfo.normalRange && testInfo.normalRange.min !== null && testInfo.normalRange.max !== null) {
                            // 80% chance of normal result, 20% abnormal
                            if (Math.random() < 0.8) {
                                // Normal result
                                const min = testInfo.normalRange.min;
                                const max = testInfo.normalRange.max;
                                value = min + Math.random() * (max - min);
                            } else {
                                // Abnormal result
                                isAbnormal = true;
                                if (Math.random() < 0.5) {
                                    // Low value
                                    value = testInfo.normalRange.min * (0.3 + Math.random() * 0.6); // 30-90% of min
                                    flag = 'Low';
                                } else {
                                    // High value
                                    value = testInfo.normalRange.max * (1.1 + Math.random() * 0.8); // 110-190% of max
                                    flag = 'High';
                                }
                            }

                            // Round to appropriate decimal places
                            if (testInfo.normalRange.unit === 'mg/dL' || testInfo.normalRange.unit === 'mIU/L') {
                                value = Math.round(value * 10) / 10;
                            } else {
                                value = Math.round(value * 100) / 100;
                            }
                        } else {
                            // For tests without numeric ranges, use text results
                            const textResults = {
                                'Hematology': ['Normal morphology', 'Mild anemia', 'Normal differential', 'Increased neutrophils'],
                                'Chemistry': ['Normal', 'Elevated', 'Decreased', 'Within normal limits'],
                                'Microbiology': ['No growth', 'Light growth', 'Moderate growth', 'Heavy growth', 'Normal flora'],
                                'Immunology': ['Negative', 'Positive', 'Reactive', 'Non-reactive'],
                                'Pathology': ['Normal cytology', 'Atypical cells present', 'No malignant cells', 'Inflammatory changes'],
                                'Radiology': ['Normal study', 'Mild changes', 'No acute findings', 'Unremarkable']
                            };

                            const categoryResults = textResults[testInfo.category] || ['Normal', 'Abnormal'];
                            value = categoryResults[Math.floor(Math.random() * categoryResults.length)];

                            if (value.includes('Elevated') || value.includes('Positive') || value.includes('Atypical') || value.includes('Heavy growth')) {
                                isAbnormal = true;
                                flag = 'Abnormal';
                            }
                        }

                        // Generate reference range string
                        let referenceRange = testInfo.normalRange?.textRange || '';
                        if (!referenceRange && testInfo.normalRange?.min !== null && testInfo.normalRange?.max !== null) {
                            referenceRange = `${testInfo.normalRange.min}-${testInfo.normalRange.max} ${testInfo.normalRange.unit || ''}`;
                        }

                        const interpretations = {
                            'Normal': 'Result within normal limits',
                            'High': 'Result above normal range - clinical correlation recommended',
                            'Low': 'Result below normal range - clinical correlation recommended',
                            'Critical': 'Critical value - immediate clinical attention required',
                            'Abnormal': 'Abnormal result - clinical correlation recommended'
                        };

                        const methodologies = {
                            'Hematology': 'Automated cell counter with manual differential',
                            'Chemistry': 'Automated chemistry analyzer',
                            'Microbiology': 'Culture and sensitivity testing',
                            'Immunology': 'Enzyme immunoassay (EIA)',
                            'Pathology': 'Microscopic examination',
                            'Radiology': 'Digital imaging'
                        };

                        const instruments = {
                            'Hematology': 'Sysmex XN-1000',
                            'Chemistry': 'Beckman Coulter AU680',
                            'Microbiology': 'BD Phoenix M50',
                            'Immunology': 'Abbott Architect i2000SR',
                            'Pathology': 'Olympus BX46',
                            'Radiology': 'GE Revolution CT'
                        };

                        const labResult = {
                            orderId: order._id,
                            testId: test.testId,
                            patientId: order.patientId,
                            technicianId: technician._id,
                            result: {
                                value: value,
                                unit: testInfo.normalRange?.unit || '',
                                isAbnormal: isAbnormal,
                                flag: flag
                            },
                            referenceRange: referenceRange,
                            interpretation: interpretations[flag] || '',
                            comments: isAbnormal ? 'Recommend clinical correlation and possible repeat testing' : '',
                            performedAt: test.completedAt || new Date(),
                            verifiedBy: Math.random() > 0.3 ? technician._id : null, // 70% verified
                            verifiedAt: Math.random() > 0.3 ? test.completedAt : null,
                            status: Math.random() > 0.1 ? 'Completed' : 'Reviewed', // 90% completed, 10% reviewed
                            methodology: methodologies[testInfo.category] || 'Standard laboratory methodology',
                            instrument: instruments[testInfo.category] || 'Standard laboratory instrument'
                        };

                        labResults.push(labResult);
                    }
                }
            }
        }

        const createdLabResults = await LabResult.insertMany(labResults);
        console.log(`✅ Successfully seeded ${createdLabResults.length} lab results`);

        return createdLabResults;
    } catch (error) {
        console.error('❌ Error seeding lab results:', error);
        throw error;
    }
};
