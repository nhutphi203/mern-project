// ICD-10 Routes
import express from 'express';
import { icd10Controller } from '../controller/icd10Controller.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Search ICD-10 codes - accessible to all authenticated users
router.get('/search',
    isAuthenticatedUser,
    icd10Controller.searchDiagnoses
);

// Get ICD-10 code details
router.get('/:id',
    isAuthenticatedUser,
    icd10Controller.getDiagnosisDetails
);

// Get codes by category
router.get('/category/:category',
    isAuthenticatedUser,
    icd10Controller.getCodesByCategory
);

// Get frequently used codes
router.get('/frequent/codes',
    isAuthenticatedUser,
    icd10Controller.getFrequentlyUsedCodes
);

// Admin and Doctor routes
router.use(isAuthenticatedUser, authorizeRoles('Admin', 'Doctor'));

// Create new ICD-10 code (Admin only)
router.post('/',
    authorizeRoles('Admin'),
    icd10Controller.createDiagnosis
);

// Update ICD-10 code (Admin only)
router.put('/:id',
    authorizeRoles('Admin'),
    icd10Controller.updateDiagnosis
);

// Get usage statistics
router.get('/statistics/usage',
    icd10Controller.getUsageStatistics
);

// Get category statistics
router.get('/statistics/categories',
    icd10Controller.getCategoryStatistics
);

export default router;
