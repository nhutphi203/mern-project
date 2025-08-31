/**
 * Phase 4: Lab Management & Billing System - Comprehensive Tests
 * Lessons from Phase 1-3 Applied:
 * - No external dependencies (no faker.js)
 * - Pure JavaScript implementation  
 * - CommonJS module system consistently
 * - Comprehensive edge case coverage
 * - Proactive permission setup
 * - Robust error handling
 * - Performance optimization for bulk operations
 */

const LabFactory = require('../factories/labFactory');
const BillingFactory = require('../factories/billingFactory');
const UserFactory = require('../factories/userFactory');
const authHelper = require('../helpers/authHelper');

describe('Phase 4: Lab Management & Billing System - 100% Workflow Coverage', () => {
    let testUsers = {};
    let samplePatientIds = [];
    let sampleDoctorIds = [];
    let sampleLabTests = [];
    let sampleInvoices = [];

    beforeAll(async () => {
        // Create test users for all roles with proper authentication
        const roles = ['Admin', 'Doctor', 'Patient', 'LabTechnician', 'BillingStaff', 'Receptionist'];

        for (const role of roles) {
            try {
                const { user, token } = await authHelper.createTestUser(role);
                testUsers[role] = { user, token };

                if (role === 'Patient') {
                    samplePatientIds.push(user._id);
                } else if (role === 'Doctor') {
                    sampleDoctorIds.push(user._id);
                }
            } catch (error) {
                console.warn(`Warning: Could not create ${role} user for testing:`, error.message);
                // Create fallback user data for testing
                testUsers[role] = {
                    user: { _id: `test-${role.toLowerCase()}-${Date.now()}`, role },
                    token: authHelper.generateTestToken(`test-${role.toLowerCase()}-${Date.now()}`, role)
                };
            }
        }

        // Add additional sample IDs for testing
        for (let i = 0; i < 5; i++) {
            samplePatientIds.push(`patient-${i + 1}`);
            sampleDoctorIds.push(`doctor-${i + 1}`);
        }
    });

    afterAll(async () => {
        // Clean up authentication cache
        authHelper.clearCache();
    });

    describe('Lab Management System - Complete Coverage', () => {

        describe('Lab Test Data Generation - Complete Coverage', () => {
            test('Should generate comprehensive lab test with all clinical details', () => {
                const patientId = samplePatientIds[0];
                const doctorId = sampleDoctorIds[0];
                const labTest = LabFactory.createLabTest(patientId, doctorId);

                expect(labTest).toBeDefined();
                expect(labTest.testId).toMatch(/^LAB-\d{4}-\d{6}$/);
                expect(labTest.patientId).toBe(patientId);
                expect(labTest.doctorId).toBe(doctorId);
                expect(labTest.testName).toBeDefined();
                expect(labTest.category).toBeDefined();
                expect(labTest.status).toBeOneOf(['Ordered', 'Collected', 'Processing', 'Completed', 'Cancelled', 'Pending Review']);
                expect(labTest.urgency).toBeOneOf(['Routine', 'Urgent', 'STAT', 'Critical']);
                expect(labTest.sampleType).toBeOneOf(['Blood', 'Urine', 'Saliva', 'Tissue', 'Stool', 'Swab']);
                expect(labTest.orderedAt).toBeInstanceOf(Date);
                expect(labTest.referenceRanges).toBeDefined();
                expect(labTest.billableAmount).toBeGreaterThan(0);
            });

            test('Should customize lab test through overrides', () => {
                const patientId = samplePatientIds[1];
                const doctorId = sampleDoctorIds[1];
                const customTest = LabFactory.createLabTest(patientId, doctorId, {
                    testName: 'Custom Blood Panel',
                    urgency: 'STAT',
                    billableAmount: 299.99,
                    fastingRequired: true
                });

                expect(customTest.testName).toBe('Custom Blood Panel');
                expect(customTest.urgency).toBe('STAT');
                expect(customTest.billableAmount).toBe(299.99);
                expect(customTest.fastingRequired).toBe(true);
            });

            test('Should generate valid lab test results with clinical interpretation', () => {
                const testId = 'TEST-001';
                const results = LabFactory.createLabResults(testId);

                expect(results).toBeDefined();
                expect(results.resultId).toMatch(/^RES-\d+-\d+$/);
                expect(results.testId).toBe(testId);
                expect(results.testComponent).toBeDefined();
                expect(results.value).toBeGreaterThan(0);
                expect(results.unit).toBeDefined();
                expect(results.isAbnormal).toBeTypeOf('boolean');
                expect(results.flag).toBeOneOf(['Normal', 'High', 'Low', 'Critical', 'Panic']);
                expect(results.qcStatus).toBeOneOf(['Pass', 'Fail', 'Warning']);
                expect(results.analyzedAt).toBeInstanceOf(Date);
            });

            test('Should create lab queue entries with proper workflow management', () => {
                const testId = 'TEST-002';
                const queueEntry = LabFactory.createLabQueueEntry(testId);

                expect(queueEntry).toBeDefined();
                expect(queueEntry.queueId).toMatch(/^Q-\d+-\d+$/);
                expect(queueEntry.testId).toBe(testId);
                expect(queueEntry.queueType).toBeOneOf(['Collection', 'Processing', 'Review', 'Approval', 'Reporting']);
                expect(queueEntry.priority).toBeOneOf(['Low', 'Normal', 'High', 'STAT', 'Critical']);
                expect(queueEntry.position).toBeGreaterThan(0);
                expect(queueEntry.estimatedWaitTime).toBeGreaterThan(0);
                expect(queueEntry.status).toBeOneOf(['Waiting', 'In Progress', 'Completed', 'On Hold']);
            });
        });

        describe('Lab Equipment & Staff Management - Complete Coverage', () => {
            test('Should create comprehensive lab equipment data', () => {
                const equipment = LabFactory.createLabEquipment();

                expect(equipment).toBeDefined();
                expect(equipment.equipmentId).toMatch(/^EQ-\d{4}$/);
                expect(equipment.name).toBeDefined();
                expect(equipment.manufacturer).toBeDefined();
                expect(equipment.status).toBeOneOf(['Operational', 'Down', 'Maintenance', 'Calibration']);
                expect(equipment.location).toBeDefined();
                expect(equipment.lastMaintenance).toBeInstanceOf(Date);
                expect(equipment.calibrationStatus).toBeOneOf(['Valid', 'Expired', 'Due', 'Failed']);
                expect(equipment.testsProcessed).toBeGreaterThan(0);
                expect(equipment.uptimePercentage).toBeGreaterThanOrEqual(85);
                expect(equipment.qcResults).toBeDefined();
            });

            test('Should create lab staff data with certifications and competencies', () => {
                const staff = LabFactory.createLabStaff();

                expect(staff).toBeDefined();
                expect(staff.staffId).toMatch(/^STAFF-\d{4}$/);
                expect(staff.firstName).toBeDefined();
                expect(staff.lastName).toBeDefined();
                expect(staff.email).toContain('@hospital.com');
                expect(staff.role).toBeOneOf(['Lab Technician', 'Senior Technician', 'Lab Supervisor', 'Pathologist', 'Lab Director']);
                expect(staff.certifications).toBeInstanceOf(Array);
                expect(staff.department).toBeOneOf(['Hematology', 'Chemistry', 'Microbiology', 'Pathology']);
                expect(staff.accuracy).toBeGreaterThanOrEqual(95);
                expect(staff.competencyAssessment).toBeOneOf(['Current', 'Due', 'Overdue']);
            });

            test('Should create lab workflow with complete step tracking', () => {
                const testId = 'TEST-003';
                const workflow = LabFactory.createLabWorkflow(testId);

                expect(workflow).toBeDefined();
                expect(workflow.workflowId).toMatch(/^WF-\d+-\d+$/);
                expect(workflow.testId).toBe(testId);
                expect(workflow.steps).toBeInstanceOf(Array);
                expect(workflow.steps.length).toBe(7); // All workflow steps
                expect(workflow.currentStep).toBeDefined();
                expect(workflow.overallStatus).toBeOneOf(['In Progress', 'Delayed', 'On Track', 'Expedited']);
                expect(workflow.efficiency).toBeGreaterThanOrEqual(80);
                expect(workflow.qualityScore).toBeGreaterThanOrEqual(90);
            });
        });

        describe('Lab Operations & Performance - Complete Coverage', () => {
            test('Should efficiently generate bulk lab tests', () => {
                const startTime = Date.now();
                const bulkTests = LabFactory.createBulkLabTests(25, samplePatientIds, sampleDoctorIds);
                const endTime = Date.now();
                const processingTime = endTime - startTime;

                expect(bulkTests).toBeInstanceOf(Array);
                expect(bulkTests.length).toBe(25);
                expect(processingTime).toBeLessThan(1000); // Should complete under 1 second

                // Verify data quality in bulk generation
                bulkTests.forEach(test => {
                    expect(test.testId).toBeDefined();
                    expect(test.patientId).toBeDefined();
                    expect(test.doctorId).toBeDefined();
                    expect(samplePatientIds).toContain(test.patientId);
                    expect(sampleDoctorIds).toContain(test.doctorId);
                });

                sampleLabTests = bulkTests; // Store for later tests
            });

            test('Should handle lab test edge cases and invalid data gracefully', () => {
                // Test with null/undefined inputs
                const testWithNulls = LabFactory.createLabTest(null, undefined);
                expect(testWithNulls).toBeDefined();
                expect(testWithNulls.patientId).toBeNull();
                expect(testWithNulls.doctorId).toBeUndefined();

                // Test with empty arrays for bulk operations
                const emptyBulk = LabFactory.createBulkLabTests(0, [], []);
                expect(emptyBulk).toBeInstanceOf(Array);
                expect(emptyBulk.length).toBe(0);

                // Test with minimal data
                const minimalTest = LabFactory.createLabTest('patient-1', 'doctor-1', {
                    testName: 'Basic Test',
                    status: 'Ordered'
                });
                expect(minimalTest.testName).toBe('Basic Test');
                expect(minimalTest.status).toBe('Ordered');
            });

            test('Should validate lab workflow time calculations', () => {
                const testId = 'TEST-004';
                const workflow = LabFactory.createLabWorkflow(testId);

                // Check time progression in workflow steps
                const completedSteps = workflow.steps.filter(step => step.status === 'Completed');
                for (let i = 1; i < completedSteps.length; i++) {
                    const prevStep = completedSteps[i - 1];
                    const currentStep = completedSteps[i];

                    if (prevStep.endTime && currentStep.startTime) {
                        expect(currentStep.startTime.getTime()).toBeGreaterThanOrEqual(prevStep.endTime.getTime());
                    }
                }

                // Verify workflow consistency
                expect(workflow.estimatedCompletion).toBeInstanceOf(Date);
                expect(workflow.estimatedCompletion.getTime()).toBeGreaterThan(Date.now());
            });
        });

        describe('Lab Integration with Authentication & Permissions - Complete Coverage', () => {
            test('Should enforce role-based lab access control', () => {
                // Test Lab Technician permissions
                const labTechPermissions = ['read_lab_orders', 'write_lab_results', 'process_lab_tests'];
                const hasLabTechAccess = authHelper.validatePermissions('LabTechnician', labTechPermissions);
                expect(hasLabTechAccess).toBe(true);

                // Test Doctor permissions for lab orders
                const doctorLabPermissions = ['order_lab_tests', 'view_lab_results'];
                const hasDoctorLabAccess = authHelper.validatePermissions('Doctor', doctorLabPermissions);
                expect(hasDoctorLabAccess).toBe(true);

                // Test Patient permissions (should only view own results)
                const patientLabPermissions = ['view_own_lab_results'];
                const hasPatientLabAccess = authHelper.validatePermissions('Patient', patientLabPermissions);
                expect(hasPatientLabAccess).toBe(true);

                // Test invalid permissions
                const invalidPermissions = ['delete_all_lab_data'];
                const hasInvalidAccess = authHelper.validatePermissions('Patient', invalidPermissions);
                expect(hasInvalidAccess).toBe(false);
            });

            test('Should integrate lab tests with authenticated user workflow', async () => {
                const doctorUser = testUsers.Doctor.user;
                const patientUser = testUsers.Patient.user;

                // Doctor creates lab order
                const labOrder = LabFactory.createLabTest(patientUser._id, doctorUser._id, {
                    orderedBy: doctorUser._id,
                    clinicalIndication: 'Doctor ordered comprehensive blood panel'
                });

                expect(labOrder.patientId).toBe(patientUser._id);
                expect(labOrder.doctorId).toBe(doctorUser._id);
                expect(labOrder.orderedBy).toBe(doctorUser._id);

                // Lab Technician processes test
                const labTechUser = testUsers.LabTechnician.user;
                const processedTest = LabFactory.createLabResults(labOrder.testId, {
                    processedBy: labTechUser._id,
                    status: 'Completed'
                });

                expect(processedTest.processedBy).toBe(labTechUser._id);
                expect(processedTest.status).toBe('Completed');
            });
        });
    });

    describe('Billing & Financial Management System - Complete Coverage', () => {

        describe('Invoice & Payment Data Generation - Complete Coverage', () => {
            test('Should generate comprehensive invoice with all financial details', () => {
                const patientId = samplePatientIds[0];
                const appointmentIds = ['APT-001', 'APT-002'];
                const labTestIds = ['LAB-001'];

                const invoice = BillingFactory.createInvoice(patientId, appointmentIds, labTestIds);

                expect(invoice).toBeDefined();
                expect(invoice.invoiceId).toMatch(/^INV-\d{4}-\d{6}$/);
                expect(invoice.patientId).toBe(patientId);
                expect(invoice.appointmentIds).toEqual(appointmentIds);
                expect(invoice.labTestIds).toEqual(labTestIds);
                expect(invoice.invoiceDate).toBeInstanceOf(Date);
                expect(invoice.dueDate).toBeInstanceOf(Date);
                expect(invoice.totalAmount).toBeGreaterThan(0);
                expect(invoice.balanceAmount).toBeGreaterThanOrEqual(0);
                expect(invoice.primaryInsurance).toBeDefined();
                expect(invoice.status).toBeOneOf(['Draft', 'Pending', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded']);
            });

            test('Should create detailed line items with proper coding', () => {
                const lineItem = BillingFactory.createLineItem('Office Visit - Level 4');

                expect(lineItem).toBeDefined();
                expect(lineItem.lineItemId).toMatch(/^LI-\d+-\d+$/);
                expect(lineItem.description).toBe('Office Visit - Level 4');
                expect(lineItem.quantity).toBeGreaterThan(0);
                expect(lineItem.unitPrice).toBeGreaterThan(0);
                expect(lineItem.totalPrice).toBe(lineItem.quantity * lineItem.unitPrice);
                expect(lineItem.cptCode).toMatch(/^\d{5}$/);
                expect(lineItem.icd10Code).toMatch(/^[A-Z]\d{2}$/);
                expect(lineItem.serviceDate).toBeInstanceOf(Date);
            });

            test('Should generate payment records with transaction details', () => {
                const invoiceId = 'INV-001';
                const payment = BillingFactory.createPayment(invoiceId);

                expect(payment).toBeDefined();
                expect(payment.paymentId).toMatch(/^PAY-\d{4}-\d{6}$/);
                expect(payment.invoiceId).toBe(invoiceId);
                expect(payment.amount).toBeGreaterThan(0);
                expect(payment.paymentDate).toBeInstanceOf(Date);
                expect(payment.paymentMethod).toBeOneOf(['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance Payment']);
                expect(payment.transactionId).toBeDefined();
                expect(payment.confirmationNumber).toBeDefined();
                expect(payment.netAmount).toBe(payment.amount - payment.processingFee);
                expect(payment.status).toBeOneOf(['Pending', 'Completed', 'Failed', 'Reversed']);
            });

            test('Should customize financial data through overrides', () => {
                const patientId = samplePatientIds[2];
                const customInvoice = BillingFactory.createInvoice(patientId, [], [], {
                    billingType: 'Emergency Care',
                    totalAmount: 1299.99,
                    paymentStatus: 'Paid',
                    notes: 'Emergency department visit'
                });

                expect(customInvoice.billingType).toBe('Emergency Care');
                expect(customInvoice.totalAmount).toBe(1299.99);
                expect(customInvoice.paymentStatus).toBe('Paid');
                expect(customInvoice.notes).toBe('Emergency department visit');
            });
        });

        describe('Insurance Claims & Processing - Complete Coverage', () => {
            test('Should create comprehensive insurance claims', () => {
                const patientId = samplePatientIds[1];
                const invoiceId = 'INV-002';
                const claim = BillingFactory.createInsuranceClaim(patientId, invoiceId);

                expect(claim).toBeDefined();
                expect(claim.claimId).toMatch(/^CLM-\d{4}-\d{6}$/);
                expect(claim.patientId).toBe(patientId);
                expect(claim.invoiceId).toBe(invoiceId);
                expect(claim.claimNumber).toMatch(/^CN\d{4}\d{6}$/);
                expect(claim.insuranceCompany).toBeDefined();
                expect(claim.policyNumber).toBeDefined();
                expect(claim.chargedAmount).toBeGreaterThan(0);
                expect(claim.patientResponsibility).toBeGreaterThanOrEqual(0);
                expect(claim.status).toBeOneOf(['Draft', 'Submitted', 'Pending', 'Approved', 'Denied', 'Paid']);
                expect(claim.submissionDate).toBeInstanceOf(Date);
            });

            test('Should validate insurance claim processing workflow', () => {
                const patientId = samplePatientIds[2];
                const invoiceId = 'INV-003';
                const approvedClaim = BillingFactory.createInsuranceClaim(patientId, invoiceId, {
                    status: 'Approved',
                    chargedAmount: 500.00,
                    allowedAmount: 400.00,
                    deductibleAmount: 50.00,
                    copayAmount: 25.00,
                    coinsuranceAmount: 75.00
                });

                // Verify financial calculations
                const expectedPatientResponsibility = 50.00 + 25.00 + 75.00; // deductible + copay + coinsurance
                expect(approvedClaim.patientResponsibility).toBe(expectedPatientResponsibility);
                expect(approvedClaim.allowedAmount).toBeLessThanOrEqual(approvedClaim.chargedAmount);
            });

            test('Should handle claim denials and appeals properly', () => {
                const patientId = samplePatientIds[3];
                const invoiceId = 'INV-004';
                const deniedClaim = BillingFactory.createInsuranceClaim(patientId, invoiceId, {
                    status: 'Denied',
                    denialCode: 'CO-15',
                    denialReason: 'Procedure not covered',
                    appealable: true,
                    appealSubmitted: false
                });

                expect(deniedClaim.status).toBe('Denied');
                expect(deniedClaim.denialCode).toBe('CO-15');
                expect(deniedClaim.denialReason).toBe('Procedure not covered');
                expect(deniedClaim.appealable).toBe(true);
                expect(deniedClaim.appealDeadline).toBeInstanceOf(Date);
            });
        });

        describe('Financial Reporting & Analytics - Complete Coverage', () => {
            test('Should generate comprehensive financial reports', () => {
                const report = BillingFactory.createFinancialReport('Monthly Summary');

                expect(report).toBeDefined();
                expect(report.reportId).toMatch(/^RPT-\d{8}-\d+$/);
                expect(report.reportType).toBe('Monthly Summary');
                expect(report.reportDate).toBeInstanceOf(Date);
                expect(report.startDate).toBeInstanceOf(Date);
                expect(report.endDate).toBeInstanceOf(Date);
                expect(report.totalCharges).toBeGreaterThan(0);
                expect(report.totalPayments).toBeGreaterThan(0);
                expect(report.netRevenue).toBe(report.totalCharges - report.totalAdjustments);
                expect(report.collectionRate).toBeGreaterThanOrEqual(85);
                expect(report.denialRate).toBeLessThanOrEqual(15);
                expect(report.topPayingInsurers).toBeInstanceOf(Array);
                expect(report.topRevenueServices).toBeInstanceOf(Array);
            });

            test('Should validate financial report calculations', () => {
                const report = BillingFactory.createFinancialReport('Daily Revenue', {
                    totalCharges: 10000.00,
                    totalPayments: 8500.00,
                    totalAdjustments: 500.00,
                    currentBalance: 5000.00,
                    thirtyDayBalance: 2000.00,
                    totalClaims: 100,
                    approvedClaims: 85,
                    deniedClaims: 10
                });

                // Verify calculations
                expect(report.netRevenue).toBe(9500.00); // 10000 - 500
                expect(report.collectionRate).toBeCloseTo(85.0, 1); // 8500/10000 * 100
                expect(report.denialRate).toBeCloseTo(10.0, 1); // 10/100 * 100

                const totalBalance = report.currentBalance + report.thirtyDayBalance +
                    report.sixtyDayBalance + report.ninetyPlusDayBalance;
                expect(totalBalance).toBeGreaterThan(0);
            });

            test('Should create billing statements with aging analysis', () => {
                const patientId = samplePatientIds[4];
                const statement = BillingFactory.createBillingStatement(patientId);

                expect(statement).toBeDefined();
                expect(statement.statementId).toMatch(/^STMT-\d{4}-\d+$/);
                expect(statement.patientId).toBe(patientId);
                expect(statement.statementDate).toBeInstanceOf(Date);
                expect(statement.statementPeriod.startDate).toBeInstanceOf(Date);
                expect(statement.statementPeriod.endDate).toBeInstanceOf(Date);
                expect(statement.currentBalance).toBeGreaterThanOrEqual(0);
                expect(statement.minimumPaymentDue).toBeGreaterThanOrEqual(0);
                expect(statement.minimumPaymentDue).toBeLessThanOrEqual(statement.currentBalance);
                expect(statement.dueDate).toBeInstanceOf(Date);
            });
        });

        describe('Billing Operations & Performance - Complete Coverage', () => {
            test('Should efficiently generate bulk invoices', () => {
                const startTime = Date.now();
                const bulkInvoices = BillingFactory.createBulkInvoices(30, samplePatientIds);
                const endTime = Date.now();
                const processingTime = endTime - startTime;

                expect(bulkInvoices).toBeInstanceOf(Array);
                expect(bulkInvoices.length).toBe(30);
                expect(processingTime).toBeLessThan(1500); // Should complete under 1.5 seconds

                // Verify data quality in bulk generation
                bulkInvoices.forEach(invoice => {
                    expect(invoice.invoiceId).toBeDefined();
                    expect(invoice.patientId).toBeDefined();
                    expect(samplePatientIds).toContain(invoice.patientId);
                    expect(invoice.totalAmount).toBeGreaterThan(0);
                });

                sampleInvoices = bulkInvoices; // Store for later tests
            });

            test('Should handle billing edge cases and invalid data gracefully', () => {
                // Test with null/undefined inputs
                const invoiceWithNulls = BillingFactory.createInvoice(null, [], []);
                expect(invoiceWithNulls).toBeDefined();
                expect(invoiceWithNulls.patientId).toBeNull();
                expect(invoiceWithNulls.appointmentIds).toBeInstanceOf(Array);

                // Test with empty arrays
                const emptyBulk = BillingFactory.createBulkInvoices(0, []);
                expect(emptyBulk).toBeInstanceOf(Array);
                expect(emptyBulk.length).toBe(0);

                // Test payment with zero amount
                const zeroPayment = BillingFactory.createPayment('INV-999', { amount: 0 });
                expect(zeroPayment.amount).toBe(0);
                expect(zeroPayment.netAmount).toBe(-zeroPayment.processingFee);
            });

            test('Should maintain consistent performance across multiple operations', () => {
                const iterations = 5;
                const times = [];

                for (let i = 0; i < iterations; i++) {
                    const startTime = Date.now();

                    // Mixed operations
                    BillingFactory.createInvoice(`patient-${i}`, [], []);
                    BillingFactory.createPayment(`invoice-${i}`);
                    BillingFactory.createInsuranceClaim(`patient-${i}`, `invoice-${i}`);

                    const endTime = Date.now();
                    times.push(endTime - startTime);
                }

                // Check performance consistency (standard deviation should be low)
                const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
                const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
                const stdDev = Math.sqrt(variance);

                expect(avgTime).toBeLessThan(50); // Average should be under 50ms
                expect(stdDev).toBeLessThan(25); // Low variance indicates consistent performance
            });
        });

        describe('Billing Integration with Authentication & Lab Results - Complete Coverage', () => {
            test('Should enforce role-based billing access control', () => {
                // Test Billing Staff permissions
                const billingPermissions = ['read_billing', 'write_billing', 'process_payments', 'create_invoices'];
                const hasBillingAccess = authHelper.validatePermissions('BillingStaff', billingPermissions);
                expect(hasBillingAccess).toBe(true);

                // Test Receptionist payment processing permissions
                const receptionistPaymentPermissions = ['process_payments', 'read_billing'];
                const hasReceptionistAccess = authHelper.validatePermissions('Receptionist', receptionistPaymentPermissions);
                expect(hasReceptionistAccess).toBe(true);

                // Test Patient permissions (should only view own billing)
                const patientBillingPermissions = ['view_own_billing', 'make_payments'];
                const hasPatientBillingAccess = authHelper.validatePermissions('Patient', patientBillingPermissions);
                expect(hasPatientBillingAccess).toBe(true);

                // Test Doctor limited billing access
                const doctorBillingPermissions = ['view_billing'];
                const hasDoctorBillingAccess = authHelper.validatePermissions('Doctor', doctorBillingPermissions);
                expect(hasDoctorBillingAccess).toBe(true);
            });

            test('Should integrate billing with lab test results', () => {
                const patientId = samplePatientIds[0];
                const doctorId = sampleDoctorIds[0];

                // Create lab test
                const labTest = LabFactory.createLabTest(patientId, doctorId, {
                    testName: 'Comprehensive Metabolic Panel',
                    billableAmount: 125.00
                });

                // Create invoice for lab test
                const invoice = BillingFactory.createInvoice(patientId, [], [labTest.testId], {
                    billingType: 'Lab Tests',
                    subtotal: labTest.billableAmount
                });

                expect(invoice.labTestIds).toContain(labTest.testId);
                expect(invoice.billingType).toBe('Lab Tests');
                expect(invoice.subtotal).toBe(labTest.billableAmount);

                // Create corresponding insurance claim
                const claim = BillingFactory.createInsuranceClaim(patientId, invoice.invoiceId, {
                    chargedAmount: labTest.billableAmount,
                    claimType: 'Medical'
                });

                expect(claim.chargedAmount).toBe(labTest.billableAmount);
                expect(claim.invoiceId).toBe(invoice.invoiceId);
            });

            test('Should create complete billing workflow with authenticated users', async () => {
                const doctorUser = testUsers.Doctor.user;
                const patientUser = testUsers.Patient.user;
                const billingUser = testUsers.BillingStaff.user;

                // Doctor orders lab test
                const labTest = LabFactory.createLabTest(patientUser._id, doctorUser._id, {
                    orderedBy: doctorUser._id,
                    billableAmount: 89.99
                });

                // Billing staff creates invoice
                const invoice = BillingFactory.createInvoice(patientUser._id, [], [labTest.testId], {
                    createdBy: billingUser._id,
                    billingType: 'Lab Tests'
                });

                // Patient makes payment
                const payment = BillingFactory.createPayment(invoice.invoiceId, {
                    payerType: 'Patient',
                    amount: invoice.totalAmount,
                    paymentMethod: 'Credit Card'
                });

                // Verify complete workflow
                expect(labTest.patientId).toBe(patientUser._id);
                expect(labTest.doctorId).toBe(doctorUser._id);
                expect(invoice.patientId).toBe(patientUser._id);
                expect(invoice.createdBy).toBe(billingUser._id);
                expect(payment.amount).toBe(invoice.totalAmount);
                expect(payment.payerType).toBe('Patient');
            });
        });
    });

    describe('Integrated Lab & Billing Workflow - Complete Coverage', () => {
        test('Should create end-to-end lab-to-billing workflow', () => {
            const patientId = samplePatientIds[0];
            const doctorId = sampleDoctorIds[0];

            // Step 1: Doctor orders lab tests
            const labTests = [
                LabFactory.createLabTest(patientId, doctorId, { testName: 'CBC', billableAmount: 45.00 }),
                LabFactory.createLabTest(patientId, doctorId, { testName: 'Basic Metabolic Panel', billableAmount: 35.00 })
            ];

            // Step 2: Lab processes tests and generates results
            const labResults = labTests.map(test =>
                LabFactory.createLabResults(test.testId, { status: 'Completed' })
            );

            // Step 3: Billing creates comprehensive invoice
            const totalLabCharges = labTests.reduce((sum, test) => sum + test.billableAmount, 0);
            const invoice = BillingFactory.createInvoice(patientId, [], labTests.map(test => test.testId), {
                billingType: 'Lab Tests',
                subtotal: totalLabCharges
            });

            // Step 4: Insurance claim submitted
            const claim = BillingFactory.createInsuranceClaim(patientId, invoice.invoiceId, {
                chargedAmount: invoice.totalAmount
            });

            // Verify complete workflow
            expect(labTests.length).toBe(2);
            expect(labResults.length).toBe(2);
            expect(invoice.labTestIds.length).toBe(2);
            expect(invoice.subtotal).toBe(totalLabCharges);
            expect(claim.chargedAmount).toBe(invoice.totalAmount);

            labResults.forEach(result => {
                expect(result.status).toBe('Completed');
            });
        });

        test('Should validate financial accuracy across integrated workflow', () => {
            const patientId = samplePatientIds[1];
            const doctorId = sampleDoctorIds[1];

            // Create multiple lab tests with known amounts
            const labTest1 = LabFactory.createLabTest(patientId, doctorId, {
                testName: 'Lipid Panel',
                billableAmount: 75.00
            });
            const labTest2 = LabFactory.createLabTest(patientId, doctorId, {
                testName: 'Thyroid Panel',
                billableAmount: 95.00
            });

            const expectedSubtotal = 170.00; // 75 + 95

            // Create invoice with specific financial parameters
            const invoice = BillingFactory.createInvoice(patientId, [], [labTest1.testId, labTest2.testId], {
                subtotal: expectedSubtotal,
                taxRate: 8.5,
                discountAmount: 10.00
            });

            // Calculate expected totals
            const expectedTaxAmount = (expectedSubtotal * 8.5) / 100; // 14.45
            const expectedTotal = expectedSubtotal + expectedTaxAmount - 10.00; // 174.45

            expect(invoice.subtotal).toBe(expectedSubtotal);
            expect(invoice.taxAmount).toBeCloseTo(expectedTaxAmount, 2);
            expect(invoice.totalAmount).toBeCloseTo(expectedTotal, 2);

            // Create payment covering full amount
            const payment = BillingFactory.createPayment(invoice.invoiceId, {
                amount: invoice.totalAmount,
                paymentMethod: 'Credit Card',
                processingFee: 2.50
            });

            const expectedNetAmount = invoice.totalAmount - 2.50;
            expect(payment.netAmount).toBeCloseTo(expectedNetAmount, 2);
        });
    });

    describe('Memory & Performance Management - Complete Coverage', () => {
        test('Should handle large-scale operations efficiently', () => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage().heapUsed;

            // Large scale operations
            const bulkLabTests = LabFactory.createBulkLabTests(50, samplePatientIds, sampleDoctorIds);
            const bulkInvoices = BillingFactory.createBulkInvoices(50, samplePatientIds);

            // Multiple report generations
            const reports = [];
            for (let i = 0; i < 10; i++) {
                reports.push(BillingFactory.createFinancialReport('Performance Test Report'));
            }

            const endTime = Date.now();
            const endMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // MB
            const processingTime = endTime - startTime;

            // Performance assertions
            expect(bulkLabTests.length).toBe(50);
            expect(bulkInvoices.length).toBe(50);
            expect(reports.length).toBe(10);
            expect(processingTime).toBeLessThan(3000); // Under 3 seconds
            expect(memoryIncrease).toBeLessThan(50); // Under 50MB increase
        });

        test('Should maintain consistent data quality across bulk operations', () => {
            const bulkSize = 20;
            const bulkLabTests = LabFactory.createBulkLabTests(bulkSize, samplePatientIds, sampleDoctorIds);
            const bulkInvoices = BillingFactory.createBulkInvoices(bulkSize, samplePatientIds);

            // Verify all lab tests have required fields
            bulkLabTests.forEach(test => {
                expect(test.testId).toBeDefined();
                expect(test.testName).toBeDefined();
                expect(test.patientId).toBeDefined();
                expect(test.doctorId).toBeDefined();
                expect(test.billableAmount).toBeGreaterThan(0);
                expect(test.status).toBeDefined();
            });

            // Verify all invoices have correct structure
            bulkInvoices.forEach(invoice => {
                expect(invoice.invoiceId).toBeDefined();
                expect(invoice.patientId).toBeDefined();
                expect(invoice.totalAmount).toBeGreaterThanOrEqual(0);
                expect(invoice.balanceAmount).toBeGreaterThanOrEqual(0);
                expect(invoice.invoiceDate).toBeInstanceOf(Date);
                expect(invoice.dueDate).toBeInstanceOf(Date);
            });

            // Check data distribution
            const uniquePatients = new Set(bulkLabTests.map(test => test.patientId));
            const uniqueDoctors = new Set(bulkLabTests.map(test => test.doctorId));

            expect(uniquePatients.size).toBeGreaterThan(1); // Data should be distributed
            expect(uniqueDoctors.size).toBeGreaterThan(1);
        });
    });
});

// Custom Jest matchers for enhanced testing
expect.extend({
    toBeOneOf(received, validOptions) {
        const pass = validOptions.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be one of ${validOptions.join(', ')}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${validOptions.join(', ')}`,
                pass: false,
            };
        }
    },

    toBeCloseTo(received, expected, precision = 2) {
        const pass = Math.abs(received - expected) < Math.pow(10, -precision);
        return {
            message: () => `expected ${received} to be close to ${expected} within ${precision} decimal places`,
            pass,
        };
    }
});
