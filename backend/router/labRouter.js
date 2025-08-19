import express from 'express';
import { labController } from '../controller/labController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Get all available tests (accessible to doctors and lab staff)
router.get('/tests', isAuthenticated, labController.getAllTests);

// Create lab order (doctors and admins can create orders)
router.post('/orders',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']), // FIX: Allow Admin to create lab orders for testing
    labController.createLabOrder
);

// Get lab queue (technicians and lab supervisors)
router.get('/queue',
    isAuthenticated,
    requireRole(['Technician', 'Admin']),
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

// Get lab results - temporarily remove authentication for development
router.get('/results',
    // isAuthenticated, // Commented out for development testing
    labController.getLabResults
);

// Get lab reports
router.get('/reports',
    isAuthenticated,
    labController.getLabReports
);

// Create lab report
router.post('/reports',
    isAuthenticated,
    requireRole(['Doctor', 'Technician', 'Admin']),
    labController.createLabReport
);

// Generate lab report (legacy endpoint)
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

// TEST ENDPOINT: Get lab results without authentication (for development only)
router.get('/test/results',
    labController.getLabResults
);

export default router;