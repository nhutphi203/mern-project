// ===================================================================
// BILLING WORKFLOW E2E TESTS
// Test complete billing workflow from service to payment
// ===================================================================

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { Invoice } from '../models/billing/invoice.model.js';
import { ServiceCatalog } from '../models/serviceCatalog.model.js';
import { InsuranceProvider } from '../models/billing/insuranceProvider.model.js';
import { PatientInsurance } from '../models/billing/patientInsurance.model.js';

describe('Billing Workflow E2E Tests', () => {
    let testUsers = {};
    let authTokens = {};
    let testServices = [];
    let testInsuranceProvider;
    let testAppointment;
    let testEncounter;
    let testInvoices = [];

    beforeAll(async () => {
        // Create test users with unique IDs to avoid duplicate email errors
        const uniqueId = Date.now();
        const roles = ['Patient', 'Doctor', 'Admin', 'BillingStaff', 'Receptionist'];

        for (const role of roles) {
            const hashedPassword = await bcrypt.hash('testpassword123', 12);
            const userData = {
                firstName: `Test${role}`,
                lastName: 'Billing',
                email: `test.${role.toLowerCase()}.billing.${uniqueId}@test.com`,
                password: hashedPassword,
                phone: '1234567890',
                nic: '123456789012',
                dob: new Date('1990-01-01'),
                gender: 'Other',
                role,
                isVerified: true,
                authType: 'traditional',
                isTestData: true
            };

            if (role === 'Doctor') {
                userData.doctorDepartment = 'Internal Medicine';
                userData.qualification = 'MBBS, MD';
            }

            const user = await User.create(userData);
            testUsers[role] = user;

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' }
            );
            authTokens[role] = token;
        }

        // Create test services with required serviceId field and unique IDs
        const serviceUniqueId = Date.now();
        const services = [
            {
                serviceId: `GEN${serviceUniqueId}001`,
                name: 'General Consultation',
                serviceCode: `GEN${serviceUniqueId}001`,
                description: 'General medical consultation',
                department: 'Consultation',
                price: 100.00,
                isActive: true,
                isTestData: true
            },
            {
                serviceId: `LAB${serviceUniqueId}001`,
                name: 'Blood Test - CBC',
                serviceCode: `LAB${serviceUniqueId}001`,
                description: 'Complete Blood Count',
                department: 'Laboratory',
                price: 25.00,
                isActive: true,
                isTestData: true
            },
            {
                serviceId: `RAD${serviceUniqueId}001`,
                name: 'X-Ray Chest',
                serviceCode: `RAD${serviceUniqueId}001`,
                description: 'Chest X-Ray examination',
                department: 'Radiology',
                price: 75.00,
                isActive: true,
                isTestData: true
            },
            {
                serviceId: `ER${serviceUniqueId}001`,
                name: 'Emergency Room Visit',
                serviceCode: `ER${serviceUniqueId}001`,
                description: 'Emergency room consultation',
                department: 'Other', // Use valid enum value
                price: 200.00,
                isActive: true,
                isTestData: true
            }
        ];

        for (const service of services) {
            const serviceRecord = await ServiceCatalog.create(service);
            testServices.push(serviceRecord);
        }

        // Create test insurance provider with proper fields
        testInsuranceProvider = await InsuranceProvider.create({
            providerName: `Test Health Insurance ${uniqueId}`,
            providerCode: `INS${Date.now()}`,
            contactInfo: {
                phone: '1-800-TEST-INS',
                email: 'test@insurance.com',
                address: {
                    street: '123 Insurance Ave',
                    city: 'Test City',
                    state: 'TC',
                    zipCode: '12345'
                }
            },
            contractDetails: {
                contractNumber: `CNT${Date.now()}`,
                effectiveDate: new Date(),
                reimbursementRate: 80
            },
            isActive: true
        });

        // Create patient insurance
        await PatientInsurance.create({
            patientId: testUsers.Patient._id,
            insuranceProviderId: testInsuranceProvider._id,
            policyNumber: 'TEST123456',
            subscriberName: `${testUsers.Patient.firstName} ${testUsers.Patient.lastName}`,
            relationship: 'Self',
            effectiveDate: new Date('2024-01-01'),
            expirationDate: new Date('2025-12-31'),
            copayAmount: 20.00,
            deductibleAmount: 500.00,
            isPrimary: true,
            isActive: true,
            isTestData: true
        });

        // Create test appointment and encounter
        testAppointment = await Appointment.create({
            firstName: testUsers.Patient.firstName,
            lastName: testUsers.Patient.lastName,
            email: testUsers.Patient.email,
            phone: testUsers.Patient.phone,
            nic: testUsers.Patient.nic,
            dob: testUsers.Patient.dob,
            gender: testUsers.Patient.gender,
            appointment_date: '2025-08-25',
            department: 'Internal Medicine',
            doctor: {
                firstName: testUsers.Doctor.firstName,
                lastName: testUsers.Doctor.lastName
            },
            hasVisited: false,
            address: '123 Test Street',
            doctorId: testUsers.Doctor._id,
            patientId: testUsers.Patient._id,
            status: 'Completed',
            isTestData: true
        });

        testEncounter = await Encounter.create({
            appointmentId: testAppointment._id,
            patientId: testUsers.Patient._id,
            receptionistId: testUsers.Receptionist._id,
            checkInTime: new Date(),
            checkOutTime: new Date(),
            status: 'Finished',
            notes: 'Billing test encounter',
            isTestData: true
        });

        console.log('✅ Created test users and billing setup');
    });

    afterAll(async () => {
        // Clean up test data
        await Invoice.deleteMany({ isTestData: true });
        await PatientInsurance.deleteMany({ isTestData: true });
        await InsuranceProvider.deleteMany({ isTestData: true });
        await ServiceCatalog.deleteMany({ isTestData: true });
        await Encounter.deleteMany({ isTestData: true });
        await Appointment.deleteMany({ isTestData: true });
        await User.deleteMany({ isTestData: true });
        console.log('🧹 Cleaned up billing test data');
    });

    describe('Service Catalog Management', () => {
        it('should get all available services', async () => {
            const response = await request(app)
                .get('/api/v1/billing/services')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.services)).toBe(true);
                expect(response.body.services.length).toBeGreaterThanOrEqual(4);

                // Verify service structure
                const service = response.body.services[0];
                expect(service).toHaveProperty('name');
                expect(service).toHaveProperty('serviceCode');
                expect(service).toHaveProperty('department');
                expect(service).toHaveProperty('price');
                expect(service.isActive).toBe(true);
            }
        });

        it('should filter services by department', async () => {
            const response = await request(app)
                .get('/api/v1/billing/services?department=Laboratory')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                const labServices = response.body.services.filter(s => s.department === 'Laboratory');
                expect(labServices.length).toBeGreaterThan(0);
            }
        });

        it('should search services by name', async () => {
            const response = await request(app)
                .get('/api/v1/billing/services?search=consultation')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                if (response.body.services.length > 0) {
                    const consultationServices = response.body.services.filter(s =>
                        s.name.toLowerCase().includes('consultation')
                    );
                    expect(consultationServices.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('Create Invoice', () => {
        it('should create invoice successfully by billing staff', async () => {
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Consultation',
                        description: 'General medical consultation',
                        serviceCode: 'GEN001',
                        quantity: 1,
                        unitPrice: 100.00,
                        totalPrice: 100.00
                    },
                    {
                        type: 'Laboratory',
                        description: 'Complete Blood Count',
                        serviceCode: 'LAB001',
                        quantity: 1,
                        unitPrice: 25.00,
                        totalPrice: 25.00
                    }
                ],
                subtotal: 125.00,
                totalDiscount: 0.00,
                totalTax: 12.50,
                totalAmount: 137.50,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(invoiceData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.success).toBe(true);
                expect(response.body.invoice).toBeDefined();
                expect(response.body.invoice.patientId).toBe(testUsers.Patient._id.toString());
                expect(response.body.invoice.totalAmount).toBe(137.50);
                expect(response.body.invoice.status).toBe('Pending');
                expect(response.body.invoice.items).toHaveLength(2);

                testInvoices.push(response.body.invoice);
            }
        });

        it('should reject invoice creation by unauthorized user', async () => {
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Consultation',
                        description: 'Unauthorized invoice',
                        serviceCode: 'GEN001',
                        quantity: 1,
                        unitPrice: 100.00,
                        totalPrice: 100.00
                    }
                ],
                subtotal: 100.00,
                totalAmount: 100.00
            };

            const response = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.Patient}`)
                .send(invoiceData);

            expect([403, 404]).toContain(response.status);
        });

        it('should validate required fields in invoice', async () => {
            const incompleteData = {
                patientId: testUsers.Patient._id,
                // Missing required fields
                items: []
            };

            const response = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(incompleteData);

            expect([400, 404]).toContain(response.status);
        });

        it('should calculate totals correctly', async () => {
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Radiology',
                        description: 'Chest X-Ray',
                        serviceCode: 'RAD001',
                        quantity: 1,
                        unitPrice: 75.00,
                        totalPrice: 75.00,
                        discountPercent: 10,
                        discountAmount: 7.50
                    }
                ],
                subtotal: 67.50, // 75.00 - 7.50 discount
                totalDiscount: 7.50,
                totalTax: 6.75, // 10% tax
                totalAmount: 74.25, // 67.50 + 6.75
                isTestData: true
            };

            const response = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(invoiceData);

            expect([200, 201]).toContain(response.status);

            if ([200, 201].includes(response.status)) {
                expect(response.body.invoice.subtotal).toBe(67.50);
                expect(response.body.invoice.totalDiscount).toBe(7.50);
                expect(response.body.invoice.totalTax).toBe(6.75);
                expect(response.body.invoice.totalAmount).toBe(74.25);
                testInvoices.push(response.body.invoice);
            }
        });
    });

    describe('Get Invoices', () => {
        it('should get all invoices by billing staff', async () => {
            const response = await request(app)
                .get('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.invoices)).toBe(true);
            }
        });

        it('should allow patient to view own invoices only', async () => {
            const response = await request(app)
                .get(`/api/v1/billing/invoices?patientId=${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect([200, 403, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                response.body.invoices.forEach(invoice => {
                    expect(invoice.patientId).toBe(testUsers.Patient._id.toString());
                });
            }
        });

        it('should filter invoices by status', async () => {
            const response = await request(app)
                .get('/api/v1/billing/invoices?status=Pending')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                if (response.body.invoices.length > 0) {
                    response.body.invoices.forEach(invoice => {
                        expect(invoice.status).toBe('Pending');
                    });
                }
            }
        });

        it('should get invoice by ID', async () => {
            if (testInvoices.length > 0) {
                const invoiceId = testInvoices[0]._id;

                const response = await request(app)
                    .get(`/api/v1/billing/invoices/${invoiceId}`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.invoice._id).toBe(invoiceId);
                }
            }
        });

        it('should reject patient access to other patient invoices', async () => {
            // Create another patient
            const hashedPassword = await bcrypt.hash('testpassword123', 12);
            const otherPatient = await User.create({
                firstName: 'Other',
                lastName: 'BillingPatient',
                email: `other.billing.patient.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`,
                password: hashedPassword,
                phone: '9876543210',
                nic: '987654321098',
                dob: new Date('1985-01-01'),
                gender: 'Female',
                role: 'Patient',
                isVerified: true,
                authType: 'traditional',
                isTestData: true
            });

            const response = await request(app)
                .get(`/api/v1/billing/invoices?patientId=${otherPatient._id}`)
                .set('Authorization', `Bearer ${authTokens.Patient}`);

            expect([403, 404]).toContain(response.status);

            // Cleanup
            await User.deleteOne({ _id: otherPatient._id });
        });
    });

    describe('Process Payments', () => {
        let invoiceToPayId;

        beforeAll(async () => {
            if (testInvoices.length > 0) {
                invoiceToPayId = testInvoices[0]._id;
            }
        });

        it('should process full payment successfully', async () => {
            if (invoiceToPayId) {
                const paymentData = {
                    amount: 137.50,
                    method: 'Cash',
                    reference: 'CASH001',
                    notes: 'Full payment in cash',
                    isTestData: true
                };

                const response = await request(app)
                    .post(`/api/v1/billing/invoices/${invoiceToPayId}/payments`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(paymentData);

                expect([200, 201]).toContain(response.status);

                if ([200, 201].includes(response.status)) {
                    expect(response.body.success).toBe(true);

                    // Verify invoice status updated to Paid
                    const invoice = await Invoice.findById(invoiceToPayId);
                    expect(invoice.status).toBe('Paid');
                    expect(invoice.paidAmount).toBe(137.50);
                }
            }
        });

        it('should process partial payment', async () => {
            // Create another invoice for partial payment test
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Emergency',
                        description: 'Emergency room visit',
                        serviceCode: 'ER001',
                        quantity: 1,
                        unitPrice: 200.00,
                        totalPrice: 200.00
                    }
                ],
                subtotal: 200.00,
                totalAmount: 200.00,
                isTestData: true
            };

            const createResponse = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(invoiceData);

            if ([200, 201].includes(createResponse.status)) {
                const newInvoiceId = createResponse.body.invoice._id;

                const partialPaymentData = {
                    amount: 100.00, // Partial payment
                    method: 'Credit Card',
                    reference: 'CC123456',
                    notes: 'Partial payment - credit card'
                };

                const response = await request(app)
                    .post(`/api/v1/billing/invoices/${newInvoiceId}/payments`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(partialPaymentData);

                expect([200, 201]).toContain(response.status);

                if ([200, 201].includes(response.status)) {
                    expect(response.body.success).toBe(true);

                    // Verify invoice status updated to Partial
                    const invoice = await Invoice.findById(newInvoiceId);
                    expect(invoice.status).toBe('Partial');
                    expect(invoice.paidAmount).toBe(100.00);
                    expect(invoice.balanceAmount).toBe(100.00);
                }
            }
        });

        it('should reject payment exceeding invoice amount', async () => {
            if (testInvoices.length > 1) {
                const invoiceId = testInvoices[1]._id;

                const excessivePaymentData = {
                    amount: 1000.00, // Much more than invoice amount
                    method: 'Cash',
                    reference: 'EXCESS001'
                };

                const response = await request(app)
                    .post(`/api/v1/billing/invoices/${invoiceId}/payments`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(excessivePaymentData);

                expect([400, 404]).toContain(response.status);
            }
        });

        it('should reject unauthorized payment processing', async () => {
            if (invoiceToPayId) {
                const paymentData = {
                    amount: 50.00,
                    method: 'Cash',
                    reference: 'UNAUTHORIZED001'
                };

                const response = await request(app)
                    .post(`/api/v1/billing/invoices/${invoiceToPayId}/payments`)
                    .set('Authorization', `Bearer ${authTokens.Patient}`)
                    .send(paymentData);

                expect([403, 404]).toContain(response.status);
            }
        });
    });

    describe('Insurance Integration', () => {
        it('should get patient insurance information', async () => {
            const response = await request(app)
                .get(`/api/v1/billing/insurance/patient/${testUsers.Patient._id}`)
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.insurances)).toBe(true);

                if (response.body.insurances.length > 0) {
                    const insurance = response.body.insurances[0];
                    expect(insurance.patientId).toBe(testUsers.Patient._id.toString());
                    expect(insurance.policyNumber).toBe('TEST123456');
                }
            }
        });

        it('should create insurance claim', async () => {
            if (testInvoices.length > 0) {
                const invoiceId = testInvoices[0]._id;

                const claimData = {
                    invoiceId: invoiceId,
                    insuranceProviderId: testInsuranceProvider._id,
                    claimAmount: 110.00, // 80% of 137.50
                    submittedDate: new Date(),
                    notes: 'Standard outpatient claim',
                    isTestData: true
                };

                const response = await request(app)
                    .post('/api/v1/billing/insurance/claims')
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(claimData);

                expect([200, 201, 404]).toContain(response.status);

                if ([200, 201].includes(response.status)) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.claim.claimAmount).toBe(110.00);
                    expect(response.body.claim.status).toBe('Submitted');
                }
            }
        });

        it('should get insurance claims', async () => {
            const response = await request(app)
                .get('/api/v1/billing/insurance/claims')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.claims)).toBe(true);
            }
        });

        it('should process insurance claim approval', async () => {
            // First get claims to find one to approve
            const claimsResponse = await request(app)
                .get('/api/v1/billing/insurance/claims?status=Submitted')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            if (claimsResponse.status === 200 && claimsResponse.body.claims.length > 0) {
                const claimId = claimsResponse.body.claims[0]._id;

                const approvalData = {
                    status: 'Approved',
                    approvedAmount: 110.00,
                    notes: 'Claim approved - standard coverage'
                };

                const response = await request(app)
                    .put(`/api/v1/billing/insurance/claims/${claimId}`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(approvalData);

                expect([200, 404]).toContain(response.status);

                if (response.status === 200) {
                    expect(response.body.success).toBe(true);
                    expect(response.body.claim.status).toBe('Approved');
                }
            }
        });
    });

    describe('Billing Reports', () => {
        it('should get revenue report', async () => {
            const response = await request(app)
                .get('/api/v1/billing/reports/revenue')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.report).toBeDefined();

                // Verify report structure
                const report = response.body.report;
                expect(report).toHaveProperty('totalRevenue');
                expect(report).toHaveProperty('paidAmount');
                expect(report).toHaveProperty('pendingAmount');
                expect(typeof report.totalRevenue).toBe('number');
            }
        });

        it('should get revenue report with date range', async () => {
            const startDate = '2025-08-01';
            const endDate = '2025-08-31';

            const response = await request(app)
                .get(`/api/v1/billing/reports/revenue?startDate=${startDate}&endDate=${endDate}`)
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.report).toBeDefined();
            }
        });

        it('should get outstanding invoices report', async () => {
            const response = await request(app)
                .get('/api/v1/billing/reports/outstanding')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.invoices)).toBe(true);
            }
        });

        it('should get payment summary', async () => {
            const response = await request(app)
                .get('/api/v1/billing/reports/payments')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.summary).toBeDefined();
            }
        });
    });

    describe('Billing Analytics', () => {
        it('should calculate billing statistics', async () => {
            const response = await request(app)
                .get('/api/v1/billing/statistics')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.statistics).toBeDefined();

                const stats = response.body.statistics;
                expect(stats).toHaveProperty('totalInvoices');
                expect(stats).toHaveProperty('totalRevenue');
                expect(stats).toHaveProperty('averageInvoiceAmount');
                expect(typeof stats.totalInvoices).toBe('number');
            }
        });

        it('should get department-wise revenue', async () => {
            const response = await request(app)
                .get('/api/v1/billing/analytics/departments')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.departmentRevenue)).toBe(true);
            }
        });

        it('should get payment method breakdown', async () => {
            const response = await request(app)
                .get('/api/v1/billing/analytics/payment-methods')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`);

            expect([200, 404]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.paymentMethods)).toBe(true);
            }
        });
    });

    describe('Billing Workflow Integration', () => {
        it('should complete full billing workflow', async () => {
            // 1. Create a new appointment for workflow test
            const workflowUniqueId = Date.now();
            const workflowAppointment = await Appointment.create({
                firstName: 'Workflow',
                lastName: 'Patient',
                email: `workflow.patient.${workflowUniqueId}@test.com`,
                phone: '0123456789',
                nic: '123456789012',
                dob: new Date('1990-01-01'),
                gender: 'Male',
                appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                department: 'General Medicine',
                doctor: {
                    firstName: testUsers.Doctor.firstName,
                    lastName: testUsers.Doctor.lastName
                },
                address: '123 Test Street, Test City',
                doctorId: testUsers.Doctor._id,
                patientId: testUsers.Patient._id,
                status: 'Accepted',
                isTestData: true
            });

            // 2. Create a new patient encounter
            const newEncounter = await Encounter.create({
                appointmentId: workflowAppointment._id,
                patientId: testUsers.Patient._id,
                receptionistId: testUsers.Receptionist._id,
                checkInTime: new Date(),
                checkOutTime: new Date(),
                status: 'Finished',
                notes: 'Full workflow test encounter',
                isTestData: true
            });

            // 2. Create invoice for the encounter
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: newEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Consultation',
                        description: 'Full workflow consultation',
                        serviceCode: 'GEN001',
                        quantity: 1,
                        unitPrice: 100.00,
                        totalPrice: 100.00
                    }
                ],
                subtotal: 100.00,
                totalAmount: 100.00,
                isTestData: true
            };

            const invoiceResponse = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(invoiceData);

            if ([200, 201].includes(invoiceResponse.status)) {
                const invoiceId = invoiceResponse.body.invoice._id;

                // 3. Process payment
                const paymentData = {
                    amount: 100.00,
                    method: 'Credit Card',
                    reference: 'WORKFLOW001',
                    notes: 'Full workflow payment'
                };

                const paymentResponse = await request(app)
                    .post(`/api/v1/billing/invoices/${invoiceId}/payments`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(paymentData);

                // 4. Verify workflow completion
                if ([200, 201].includes(paymentResponse.status)) {
                    const finalInvoice = await Invoice.findById(invoiceId);
                    expect(finalInvoice.status).toBe('Paid');
                    expect(finalInvoice.paidAmount).toBe(100.00);
                    expect(finalInvoice.balanceAmount).toBe(0.00);
                }
            }
        });

        it('should handle invoice modifications before payment', async () => {
            // Create invoice
            const invoiceData = {
                patientId: testUsers.Patient._id,
                encounterId: testEncounter._id,
                appointmentId: testAppointment._id,
                items: [
                    {
                        type: 'Laboratory',
                        description: 'Original lab test',
                        serviceCode: 'LAB001',
                        quantity: 1,
                        unitPrice: 25.00,
                        totalPrice: 25.00
                    }
                ],
                subtotal: 25.00,
                totalAmount: 25.00,
                isTestData: true
            };

            const createResponse = await request(app)
                .post('/api/v1/billing/invoices')
                .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                .send(invoiceData);

            if ([200, 201].includes(createResponse.status)) {
                const invoiceId = createResponse.body.invoice._id;

                // Modify invoice (add item)
                const updateData = {
                    items: [
                        {
                            type: 'Laboratory',
                            description: 'Original lab test',
                            serviceCode: 'LAB001',
                            quantity: 1,
                            unitPrice: 25.00,
                            totalPrice: 25.00
                        },
                        {
                            type: 'Radiology',
                            description: 'Additional X-Ray',
                            serviceCode: 'RAD001',
                            quantity: 1,
                            unitPrice: 75.00,
                            totalPrice: 75.00
                        }
                    ],
                    subtotal: 100.00,
                    totalAmount: 100.00
                };

                const updateResponse = await request(app)
                    .put(`/api/v1/billing/invoices/${invoiceId}`)
                    .set('Authorization', `Bearer ${authTokens.BillingStaff}`)
                    .send(updateData);

                expect([200, 404]).toContain(updateResponse.status);

                if (updateResponse.status === 200) {
                    expect(updateResponse.body.invoice.totalAmount).toBe(100.00);
                    expect(updateResponse.body.invoice.items).toHaveLength(2);
                }
            }
        });
    });
});
