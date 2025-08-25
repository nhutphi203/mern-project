import express from 'express';
import { labController } from '../controller/labController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Get all available tests (accessible to doctors and lab staff)
router.get('/tests', isAuthenticated, labController.getAllTests);

// Create lab order (doctors only)
router.post('/orders',
    isAuthenticated,
    requireRole(['Doctor']),
    labController.createLabOrder
);

// Get lab queue (technicians, lab supervisors, and doctors)
router.get('/queue',
    isAuthenticated,
    requireRole(['Doctor', 'Technician', 'Admin']),
    labController.getLabQueue
);

// Update test status (technicians and lab supervisors)
router.patch('/orders/:orderId/tests/:testId/status',
    isAuthenticated,
    requireRole(['Technician', 'Admin']),
    labController.updateTestStatus
);

// Enter lab results (technicians only)
router.post('/results',
    isAuthenticated,
    requireRole(['Technician']),
    labController.enterLabResult
);

// Get lab results - doctors can view results for their patients  
router.get('/results',
    isAuthenticated,
    requireRole(['Doctor', 'Technician', 'Admin']),
    labController.getLabResults
);

// Generate lab report
router.get('/reports/:orderId',
    isAuthenticated,
    labController.generateLabReport
);

// Get lab statistics (admin and lab supervisors)
router.get('/stats',
    isAuthenticated,
    requireRole(['Admin', 'Technician']),
    labController.getLabStats
);

export default router;
