import express from 'express';
import { billingController, insuranceController } from '../controller/billingController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Invoice management routes
router.post('/invoices',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    billingController.createInvoice
);

router.get('/invoices',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff', 'Patient']),
    billingController.getAllInvoices
);

router.get('/invoices/:id',
    isAuthenticated,
    billingController.getInvoiceById
);

router.post('/invoices/:id/payments',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    billingController.processPayment
);

router.post('/invoices/:id/insurance/submit',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    billingController.submitInsuranceClaim
);

router.patch('/invoices/:id/insurance/status',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    billingController.updateInsuranceClaimStatus
);

// Reporting routes
router.get('/reports/billing',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    billingController.getBillingReport
);

router.get('/patients/:patientId/billing-history',
    isAuthenticated,
    billingController.getPatientBillingHistory
);

// Insurance management routes
router.post('/insurance/providers',
    isAuthenticated,
    requireRole(['Admin']),
    insuranceController.createInsuranceProvider
);

router.get('/insurance/providers',
    isAuthenticated,
    insuranceController.getAllInsuranceProviders
);

router.post('/patients/:patientId/insurance',
    isAuthenticated,
    requireRole(['Admin', 'BillingStaff']),
    insuranceController.addPatientInsurance
);

router.get('/patients/:patientId/insurance',
    isAuthenticated,
    insuranceController.getPatientInsurance
);

export default router;