import express from 'express';
import {
    createVitalSigns,
    getVitalSignsById,
    getPatientVitalSigns,
    updateVitalSigns,
    deleteVitalSigns,
    verifyVitalSigns,
    getVitalSignsTrends,
    getVitalSignsAlerts,
    acknowledgeAlert,
    getVitalSignsSummary
} from '../controller/vitalSigns.controller.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Create vital signs - Doctors and Nurses only
router.post('/',
    isAuthenticated,
    requireRole(['Doctor', 'Nurse']),
    createVitalSigns
);

// Get vital signs by ID - All authenticated users (with access control in controller)
router.get('/record/:id',
    isAuthenticated,
    getVitalSignsById
);

// Get vital signs for a patient - All authenticated users (with access control in controller)
router.get('/patient/:patientId',
    isAuthenticated,
    getPatientVitalSigns
);

// Update vital signs - Doctors, Nurses, and original recorder
router.put('/:id',
    isAuthenticated,
    requireRole(['Doctor', 'Nurse']),
    updateVitalSigns
);

// Delete vital signs - Admin and original recorder only
router.delete('/:id',
    isAuthenticated,
    deleteVitalSigns
);

// Verify vital signs - Medical staff only
router.patch('/:id/verify',
    isAuthenticated,
    requireRole(['Doctor', 'Nurse', 'Admin']),
    verifyVitalSigns
);

// Get vital signs trends - All authenticated users (with access control in controller)
router.get('/patient/:patientId/trends',
    isAuthenticated,
    getVitalSignsTrends
);

// Get vital signs summary/statistics - All authenticated users (with access control in controller)
router.get('/patient/:patientId/summary',
    isAuthenticated,
    getVitalSignsSummary
);

// Get alerts - Medical staff and patients (for own alerts)
router.get('/alerts',
    isAuthenticated,
    getVitalSignsAlerts
);

// Acknowledge alert - Medical staff only
router.patch('/:id/alerts/:alertId/acknowledge',
    isAuthenticated,
    requireRole(['Doctor', 'Nurse', 'Admin']),
    acknowledgeAlert
);

export default router;
