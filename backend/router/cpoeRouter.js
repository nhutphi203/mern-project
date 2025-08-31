// CPOE Routes
import express from 'express';
import { cpoeController } from '../controller/cpoeController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create new CPOE order - Doctors and authorized personnel only
router.post('/',
    requireRole(['Doctor']),
    cpoeController.createOrder
);

// Get orders for a specific patient
router.get('/patient/:patientId',
    cpoeController.getPatientOrders
);

// Get active orders for a patient
router.get('/patient/:patientId/active',
    cpoeController.getActivePatientOrders
);

// Get pending orders (for pharmacy, lab, nursing departments)
router.get('/pending',
    cpoeController.getPendingOrders
);

// Get CPOE statistics
router.get('/statistics',
    requireRole(['Admin', 'Doctor']),
    cpoeController.getStatistics
);

// Get specific order details
router.get('/:orderId',
    cpoeController.getOrderDetails
);

// Update order item status (for pharmacy, lab, nursing staff)
router.patch('/:orderId/items/:orderItemId/status',
    requireRole(['Doctor', 'Pharmacist', 'Lab Technician']),
    cpoeController.updateOrderItemStatus
);

// Add clinical decision support alert
router.post('/:orderId/items/:orderItemId/alerts',
    requireRole(['Doctor', 'Pharmacist', 'Admin']),
    cpoeController.addAlert
);

// Acknowledge alert
router.patch('/:orderId/items/:orderItemId/alerts/:alertId/acknowledge',
    cpoeController.acknowledgeAlert
);

// Cancel order - Only ordering provider or authorized personnel
router.patch('/:orderId/cancel',
    requireRole(['Doctor', 'Admin']),
    cpoeController.cancelOrder
);

export default router;
