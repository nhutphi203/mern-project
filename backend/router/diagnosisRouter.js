// Diagnosis Router - Tích hợp với Medical Records
import express from 'express';
import { diagnosisController } from '../controller/diagnosisController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// ==========================================
// MEDICAL RECORD DIAGNOSIS ROUTES
// ==========================================

// Add diagnosis to medical record (Doctor only)
router.post('/medical-record/:medicalRecordId',
    isAuthenticated,
    requireRole(['Doctor']),
    diagnosisController.addDiagnosis
);

// Get all diagnoses for a medical record
router.get('/medical-record/:medicalRecordId',
    isAuthenticated,
    diagnosisController.getDiagnosesByRecord
);

// ==========================================
// PATIENT DIAGNOSIS ROUTES
// ==========================================

// Get patient's diagnosis history
router.get('/patient/:patientId',
    isAuthenticated,
    diagnosisController.getPatientDiagnoses
);

// ==========================================
// DIAGNOSIS MANAGEMENT ROUTES
// ==========================================

// Update diagnosis (Doctor who created it or Admin)
router.put('/:diagnosisId',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']),
    diagnosisController.updateDiagnosis
);

// Delete diagnosis (soft delete - Doctor who created it or Admin)
router.delete('/:diagnosisId',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']),
    diagnosisController.deleteDiagnosis
);

// ==========================================
// SEARCH & ANALYTICS ROUTES
// ==========================================

// Search diagnoses (Doctor, Nurse, Admin)
router.get('/search',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']),
    diagnosisController.searchDiagnoses
);

// Get diagnosis statistics (Doctor, Admin)
router.get('/statistics',
    isAuthenticated,
    requireRole(['Doctor', 'Admin']),
    diagnosisController.getDiagnosisStatistics
);

// ==========================================
// ICD-10 INTEGRATION ROUTES (Proxy to ICD-10 Controller)
// ==========================================

// Search ICD-10 codes for diagnosis selection
router.get('/icd10/search',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { icd10Controller } = await import('../controller/icd10Controller.js');
            await icd10Controller.searchCodes(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

// Get ICD-10 categories
router.get('/icd10/categories',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { icd10Controller } = await import('../controller/icd10Controller.js');
            await icd10Controller.getCategories(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

// Get frequently used ICD-10 codes
router.get('/icd10/frequent',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { icd10Controller } = await import('../controller/icd10Controller.js');
            await icd10Controller.getPopularCodes(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
