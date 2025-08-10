import express from 'express';
import {
    createPrescription,
    getPrescriptionsForRecord,
    getPrescriptionsForPatient,
} from '../controller/prescriptionController.js';
import { isAuthenticated, isDoctor } from '../middlewares/auth.js';

const router = express.Router();

// @route   POST /api/v1/prescriptions
// @desc    Doctor creates a new prescription
// @access  Private (Doctor)
router.post('/', isAuthenticated, isDoctor, createPrescription);

// @route   GET /api/v1/prescriptions/record/:recordId
// @desc    Get all prescriptions for a medical record
// @access  Private (Authenticated users, with checks inside controller)
router.get('/record/:recordId', isAuthenticated, getPrescriptionsForRecord);

// @route   GET /api/v1/prescriptions/patient/:patientId
// @desc    Get all prescriptions for a patient
// @access  Private (Authenticated users, with checks inside controller)
router.get('/patient/:patientId', isAuthenticated, getPrescriptionsForPatient);

export default router;
