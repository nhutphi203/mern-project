/**
 * 🔧 RESPONSE UTILITIES
 * Standardized API Response Helpers
 * @description Utility functions for consistent API responses
 * @author Senior Backend Engineer
 * @updated 2024-12-28
 */

/**
 * 📤 CREATE SUCCESS RESPONSE
 * Generate standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @returns {Object} JSON response
 */
export const createSuccessResponse = (res, statusCode, data) => {
    const response = {
        success: true,
        statusCode: statusCode,
        timestamp: new Date().toISOString(),
        ...data
    };

    return res.status(statusCode).json(response);
};

/**
 * ❌ CREATE ERROR RESPONSE
 * Generate standardized error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Error response object
 */
export const createErrorResponse = (message, code = 'GENERAL_ERROR', details = null) => {
    const response = {
        success: false,
        error: {
            message,
            code,
            timestamp: new Date().toISOString()
        }
    };

    if (details) {
        response.error.details = details;
    }

    return response;
};

/**
 * 📋 CREATE PAGINATED RESPONSE
 * Generate paginated response with metadata
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Object} JSON response
 */
export const createPaginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
    const response = {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        message,
        data,
        pagination: {
            currentPage: pagination.currentPage || 1,
            totalPages: pagination.totalPages || 1,
            totalItems: pagination.totalItems || data.length,
            itemsPerPage: pagination.itemsPerPage || data.length,
            hasNext: pagination.hasNext || false,
            hasPrev: pagination.hasPrev || false
        }
    };

    return res.status(200).json(response);
};

/**
 * 📊 CREATE ANALYTICS RESPONSE
 * Generate response with analytics data
 * @param {Object} res - Express response object
 * @param {Object} analytics - Analytics data
 * @param {string} message - Success message
 * @returns {Object} JSON response
 */
export const createAnalyticsResponse = (res, analytics, message = 'Analytics data retrieved successfully') => {
    const response = {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        message,
        analytics,
        generatedAt: new Date().toISOString()
    };

    return res.status(200).json(response);
};

/**
 * 🔄 CREATE WORKFLOW RESPONSE
 * Generate response for workflow operations
 * @param {Object} res - Express response object
 * @param {Object} workflowData - Workflow data
 * @param {string} message - Success message
 * @returns {Object} JSON response
 */
export const createWorkflowResponse = (res, workflowData, message = 'Workflow operation completed successfully') => {
    const response = {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        message,
        workflow: workflowData,
        processedAt: new Date().toISOString()
    };

    return res.status(200).json(response);
};

export default {
    createSuccessResponse,
    createErrorResponse,
    createPaginatedResponse,
    createAnalyticsResponse,
    createWorkflowResponse
};
