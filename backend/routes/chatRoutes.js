// backend/routes/chatRoutes.js - AI Assistant Routes

import express from 'express';
import { handlePublicChat, handleAuthenticatedChat } from '../controllers/chatController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

const router = express.Router();

/**
 * @route   POST /api/v1/chat/public
 * @desc    Handle public chat (no authentication required)
 * @access  Public
 */
router.post('/public', handlePublicChat);

/**
 * @route   POST /api/v1/chat/private
 * @desc    Handle authenticated chat (requires login)
 * @access  Private (All authenticated users)
 */
router.post('/private', isAuthenticated, handleAuthenticatedChat);

/**
 * @route   GET /api/v1/chat/status
 * @desc    Check chat service status
 * @access  Public
 */
router.get('/status', catchAsyncErrors(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hospital AI Assistant is online',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
}));

export default router;
