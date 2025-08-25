// ICD-10 Routes
import express from 'express';
import { icd10Controller } from '../controller/icd10Controller.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Search ICD-10 codes - accessible to all authenticated users
router.get('/search',
    isAuthenticated,
    icd10Controller.searchCodes
);

// Get ICD-10 code details
router.get('/:id',
    isAuthenticated,
    icd10Controller.getCodeDetails
);

// Get codes by category
router.get('/category/:category',
    isAuthenticated,
    icd10Controller.getByCategory
);

// Get frequently used codes
router.get('/frequent/codes',
    isAuthenticated,
    icd10Controller.getPopularCodes
);

// Admin and Doctor routes
router.use(isAuthenticated, requireRole(['Admin', 'Doctor']));

// Create new ICD-10 code (Admin only)
router.post('/',
    requireRole(['Admin']),
    icd10Controller.createCode
);

// Update ICD-10 code (Admin only)
router.put('/:id',
    requireRole(['Admin']),
    icd10Controller.updateCode
);

// Get usage statistics
router.get('/statistics/usage',
    icd10Controller.getStatistics
);

// Get category statistics
router.get('/statistics/categories',
    icd10Controller.getCategories
);

export default router;
