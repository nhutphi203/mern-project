import express from 'express';
import { billingController, insuranceController } from '../controller/billingController.js';
import { isAuthenticated, requireEndpointAccess } from '../middlewares/auth.js';
import createRBACRouter from '../middlewares/rbacRouter.js';

// 🚀 PRODUCTION: Create RBAC-enforced router for Billing System
const router = createRBACRouter('billing', {
    requireAuth: true,
    logAccess: true,
    validateIds: true
});

// 🔒 SECURE: Invoice management routes with strict RBAC
router.securePost('/invoices', 'create-invoices', billingController.createInvoice);

router.secureGet('/invoices', 'invoices', billingController.getAllInvoices);

router.secureGet('/invoices/:id', 'invoice-details', billingController.getInvoiceById);

router.securePost('/invoices/:id/payments', 'process-payments', billingController.processPayment);

router.securePost('/invoices/:id/insurance/submit', 'submit-insurance', billingController.submitInsuranceClaim);

router.securePatch('/invoices/:id/insurance/status', 'update-insurance-status', billingController.updateInsuranceClaimStatus);

// 🔒 SECURE: Reporting routes with strict RBAC
router.secureGet('/reports/billing', 'reports', billingController.getBillingReport);

router.secureGet('/patients/:patientId/billing-history', 'billing-history', billingController.getPatientBillingHistory);

// 🔒 SECURE: Insurance management routes with strict RBAC
router.securePost('/insurance/providers', 'create-insurance-providers', insuranceController.createInsuranceProvider);

router.secureGet('/insurance/providers', 'insurance-providers', insuranceController.getAllInsuranceProviders);

router.securePost('/patients/:patientId/insurance', 'add-patient-insurance', insuranceController.addPatientInsurance);

router.secureGet('/patients/:patientId/insurance', 'patient-insurance', insuranceController.getPatientInsurance);

export default router;