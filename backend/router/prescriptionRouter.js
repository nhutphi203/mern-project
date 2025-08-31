import express from 'express';
import {
    createPrescription,
    getPrescriptionsForRecord,
    getPrescriptionsForPatient,
    updatePrescription,
    deletePrescription
} from '../controller/prescriptionController.js';
import { isAuthenticated, isDoctor } from '../middlewares/auth.js';

const router = express.Router();

// CRUD Routes for Prescriptions

// Create a new prescription
router.post('/', isAuthenticated, isDoctor, createPrescription);

// Get all prescriptions for a specific medical record
router.get('/record/:recordId', isAuthenticated, getPrescriptionsForRecord);

// Get all prescriptions for a specific patient
router.get('/patient/:patientId', isAuthenticated, getPrescriptionsForPatient);

// Update a specific prescription by its ID
router.put('/:id', isAuthenticated, isDoctor, updatePrescription);

// Delete a specific prescription by its ID
router.delete('/:id', isAuthenticated, isDoctor, deletePrescription);

export default router;
