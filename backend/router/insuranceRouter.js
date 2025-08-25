import express from 'express';
import {
    createInsuranceClaim,
    getInsuranceClaims,
    getInsuranceClaimById,
    updateInsuranceClaim,
    updateClaimStatus,
    getInsuranceClaimsStatistics,
    submitClaim,
    deleteInsuranceClaim
} from '../controller/insuranceController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Insurance Claims Routes

// Create new insurance claim - Doctors only
router.post('/claims',
    requireRole(['Doctor', 'Admin']),
    createInsuranceClaim
);

// Get all insurance claims with filtering - Role-based access
router.get('/claims',
    requireRole(['Doctor', 'Admin', 'BillingStaff', 'Patient']),
    getInsuranceClaims
);

// Get insurance claims statistics - Administrative roles
router.get('/claims/statistics',
    requireRole(['Admin', 'BillingStaff']),
    getInsuranceClaimsStatistics
);

// Get single insurance claim by ID
router.get('/claims/:id',
    requireRole(['Doctor', 'Admin', 'BillingStaff', 'Patient']),
    getInsuranceClaimById
);

// Update insurance claim - Limited to providers and admin
router.put('/claims/:id',
    requireRole(['Doctor', 'Admin']),
    updateInsuranceClaim
);

// Submit claim to insurance - Providers and admin
router.patch('/claims/:id/submit',
    requireRole(['Doctor', 'Admin']),
    submitClaim
);

// Update claim status - Insurance staff and admin only
router.patch('/claims/:id/status',
    requireRole(['Admin', 'BillingStaff']),
    updateClaimStatus
);

// Delete/Cancel insurance claim
router.delete('/claims/:id',
    requireRole(['Doctor', 'Admin']),
    deleteInsuranceClaim
);

export default router;
