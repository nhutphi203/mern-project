// File: routers/serviceCatalogRouter.js

import express from 'express';
import { serviceCatalogController } from '../controller/serviceCatalogController.js';
import { isAuthenticated, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public route for everyone to see services
router.get('/', serviceCatalogController.list);
router.get('/:id', isAuthenticated, serviceCatalogController.getById);

// Admin-only routes for managing services
router.post(
    '/',
    isAuthenticated,
    requireRole(['Admin']),
    serviceCatalogController.create
);

router.put(
    '/:id',
    isAuthenticated,
    requireRole(['Admin']),
    serviceCatalogController.update
);

export default router;