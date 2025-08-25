/**
 * 🔄 WORKFLOW GUARD MIDDLEWARE
 * Enhanced Role-based Workflow System Security
 * @description Validates workflow transitions and role permissions
 * @author Senior Backend Engineer
 * @updated 2024-12-28
 */

import { 
    canPerformWorkflowAction, 
    isValidWorkflowTransition,
    getWorkflow,
    WORKFLOW_ACTIONS,
    WORKFLOW_STEPS 
} from '../config/rolesConfig.js';
import { createErrorResponse } from '../utils/response.js';

/**
 * 🛡️ WORKFLOW ACTION GUARD
 * Validates user permissions for workflow actions
 */
export const requireWorkflowPermission = (workflowName, actionType = null) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json(
                    createErrorResponse('🔒 Authentication required for workflow actions', 'UNAUTHORIZED')
                );
            }

            // Extract current workflow state from request or database
            const currentStep = req.body.currentStep || req.params.currentStep || req.query.currentStep;
            const action = actionType || req.body.action || req.params.action || req.query.action;

            if (!currentStep) {
                return res.status(400).json(
                    createErrorResponse('🔄 Workflow step required', 'MISSING_WORKFLOW_STEP')
                );
            }

            if (!action) {
                return res.status(400).json(
                    createErrorResponse('🔄 Workflow action required', 'MISSING_WORKFLOW_ACTION')
                );
            }

            // Validate workflow permissions
            const canPerform = canPerformWorkflowAction(user.role, workflowName, currentStep, action);
            
            if (!canPerform) {
                console.warn(`🚫 [WorkflowGuard] Access denied: ${user.role} cannot perform '${action}' in '${workflowName}/${currentStep}'`);
                return res.status(403).json(
                    createErrorResponse(
                        `🚫 Workflow Permission Denied: ${user.role} cannot perform '${action}' in step '${currentStep}'`,
                        'WORKFLOW_PERMISSION_DENIED',
                        {
                            workflow: workflowName,
                            currentStep,
                            action,
                            userRole: user.role
                        }
                    )
                );
            }

            console.log(`✅ [WorkflowGuard] Access granted: ${user.role} -> ${workflowName}/${currentStep}/${action}`);
            req.workflowContext = {
                workflow: workflowName,
                currentStep,
                action,
                userRole: user.role
            };

            next();
        } catch (error) {
            console.error('❌ [WorkflowGuard] Error:', error);
            return res.status(500).json(
                createErrorResponse('🔧 Workflow validation error', 'WORKFLOW_VALIDATION_ERROR')
            );
        }
    };
};

/**
 * 🔄 WORKFLOW TRANSITION GUARD
 * Validates workflow step transitions
 */
export const requireValidTransition = (workflowName) => {
    return async (req, res, next) => {
        try {
            const { currentStep, newStep, action } = req.body;

            if (!currentStep || !newStep || !action) {
                return res.status(400).json(
                    createErrorResponse('🔄 Workflow transition requires currentStep, newStep, and action', 'MISSING_TRANSITION_DATA')
                );
            }

            // Validate transition is allowed
            const isValid = isValidWorkflowTransition(workflowName, currentStep, newStep, action);
            
            if (!isValid) {
                console.warn(`🚫 [TransitionGuard] Invalid transition: ${workflowName}: ${currentStep} --[${action}]--> ${newStep}`);
                return res.status(400).json(
                    createErrorResponse(
                        `🚫 Invalid Workflow Transition: Cannot move from '${currentStep}' to '${newStep}' via '${action}'`,
                        'INVALID_WORKFLOW_TRANSITION',
                        {
                            workflow: workflowName,
                            fromStep: currentStep,
                            toStep: newStep,
                            action
                        }
                    )
                );
            }

            console.log(`✅ [TransitionGuard] Valid transition: ${workflowName}: ${currentStep} --[${action}]--> ${newStep}`);
            req.transitionContext = {
                workflow: workflowName,
                fromStep: currentStep,
                toStep: newStep,
                action
            };

            next();
        } catch (error) {
            console.error('❌ [TransitionGuard] Error:', error);
            return res.status(500).json(
                createErrorResponse('🔧 Workflow transition validation error', 'TRANSITION_VALIDATION_ERROR')
            );
        }
    };
};

/**
 * 🔍 WORKFLOW STATE VALIDATOR
 * Validates workflow state consistency
 */
export const validateWorkflowState = (workflowName) => {
    return async (req, res, next) => {
        try {
            const workflow = getWorkflow(workflowName);
            
            if (!workflow) {
                return res.status(400).json(
                    createErrorResponse(`🔄 Workflow '${workflowName}' not found`, 'WORKFLOW_NOT_FOUND')
                );
            }

            // Attach workflow definition to request
            req.workflowDefinition = workflow;
            
            console.log(`✅ [WorkflowValidator] Workflow '${workflowName}' validated`);
            next();
        } catch (error) {
            console.error('❌ [WorkflowValidator] Error:', error);
            return res.status(500).json(
                createErrorResponse('🔧 Workflow state validation error', 'WORKFLOW_STATE_ERROR')
            );
        }
    };
};

/**
 * 📋 WORKFLOW METADATA ENRICHER
 * Adds workflow metadata to request context
 */
export const enrichWorkflowContext = (workflowName) => {
    return async (req, res, next) => {
        try {
            const workflow = getWorkflow(workflowName);
            const user = req.user;

            if (workflow && user) {
                req.workflowMetadata = {
                    workflowName: workflow.name,
                    module: workflow.module,
                    userRole: user.role,
                    userName: user.name || user.username,
                    timestamp: new Date().toISOString(),
                    requestId: req.id || Math.random().toString(36).substr(2, 9)
                };
            }

            next();
        } catch (error) {
            console.error('❌ [WorkflowEnricher] Error:', error);
            next(); // Continue even if enrichment fails
        }
    };
};

/**
 * 🔄 COMBINED WORKFLOW GUARD
 * Complete workflow protection for endpoints
 */
export const workflowGuard = (workflowName, actionType = null) => {
    return [
        validateWorkflowState(workflowName),
        enrichWorkflowContext(workflowName),
        requireWorkflowPermission(workflowName, actionType)
    ];
};

/**
 * 🔄 COMBINED TRANSITION GUARD
 * Complete transition protection for endpoints
 */
export const transitionGuard = (workflowName) => {
    return [
        validateWorkflowState(workflowName),
        enrichWorkflowContext(workflowName),
        requireValidTransition(workflowName)
    ];
};

// Export specific guards for common workflows
export const medicalRecordWorkflowGuard = (actionType) => workflowGuard('medical_record_approval', actionType);
export const labReportWorkflowGuard = (actionType) => workflowGuard('lab_report_process', actionType);
export const billingWorkflowGuard = (actionType) => workflowGuard('billing_approval', actionType);

export const medicalRecordTransitionGuard = () => transitionGuard('medical_record_approval');
export const labReportTransitionGuard = () => transitionGuard('lab_report_process');
export const billingTransitionGuard = () => transitionGuard('billing_approval');

export default {
    requireWorkflowPermission,
    requireValidTransition,
    validateWorkflowState,
    enrichWorkflowContext,
    workflowGuard,
    transitionGuard,
    medicalRecordWorkflowGuard,
    labReportWorkflowGuard,
    billingWorkflowGuard,
    medicalRecordTransitionGuard,
    labReportTransitionGuard,
    billingTransitionGuard
};
