/**
 * 🔄 WORKFLOW MIDDLEWARE
 * Role-based Workflow Permission and Validation Middleware
 * @description Middleware for validating workflow permissions and transitions
 * @author Senior Backend Engineer
 * @updated 2024-12-28
 */

import { catchAsyncErrors } from './catchAsyncErrors.js';
import ErrorHandler from './errorMiddleware.js';
import EnhancedMedicalRecord from '../models/enhancedMedicalRecord.model.js';
import workflowService from '../services/workflowService.js';
import { 
    canPerformWorkflowAction,
    isValidWorkflowTransition,
    WORKFLOW_ACTIONS,
    WORKFLOW_STEPS
} from '../config/rolesConfig.js';

/**
 * 🔒 WORKFLOW PERMISSION MIDDLEWARE
 * Validates if user can perform workflow action
 */
export const validateWorkflowPermission = (requiredAction = null) => {
    return catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const { action, targetStep } = req.body;
        const user = req.user;

        if (!user) {
            return next(new ErrorHandler("Authentication required for workflow operations", 401));
        }

        try {
            // Get medical record
            const record = await EnhancedMedicalRecord.findById(id);
            if (!record) {
                return next(new ErrorHandler("Medical record not found", 404));
            }

            // Check if user is assigned to this record
            const isAssigned = record.accessControl.assignedTo.some(
                assignment => assignment.user.toString() === user._id.toString()
            );

            const isOwner = record.accessControl.currentOwner && 
                record.accessControl.currentOwner.toString() === user._id.toString();

            // Admin and owners can perform any action
            if (user.role === 'admin' || isOwner) {
                req.workflowContext = {
                    record,
                    canProceed: true,
                    reason: user.role === 'admin' ? 'admin_override' : 'owner_permission'
                };
                return next();
            }

            // Check if user is assigned
            if (!isAssigned) {
                return next(new ErrorHandler("You are not assigned to this medical record", 403));
            }

            // Validate specific action if provided
            const actionToCheck = requiredAction || action;
            if (actionToCheck) {
                const canPerformAction = record.canUserPerformAction(user._id, user.role, actionToCheck);
                if (!canPerformAction) {
                    return next(new ErrorHandler(`You do not have permission to perform '${actionToCheck}' action`, 403));
                }
            }

            // Validate workflow transition if target step provided
            if (targetStep) {
                const canTransition = workflowService.canUserTransitionStep(record, user, targetStep, actionToCheck);
                if (!canTransition) {
                    return next(new ErrorHandler(`Invalid workflow transition from ${record.workflowStatus.currentStep} to ${targetStep}`, 400));
                }
            }

            req.workflowContext = {
                record,
                canProceed: true,
                reason: 'assigned_user'
            };

            next();

        } catch (error) {
            console.error('❌ [WorkflowMiddleware] Permission validation failed:', error);
            return next(new ErrorHandler(error.message || "Workflow permission validation failed", 500));
        }
    });
};

/**
 * 🔄 WORKFLOW STEP VALIDATION MIDDLEWARE
 * Validates workflow step transitions
 */
export const validateWorkflowTransition = catchAsyncErrors(async (req, res, next) => {
    const { action, targetStep } = req.body;
    const record = req.workflowContext?.record;

    if (!record) {
        return next(new ErrorHandler("Medical record context not found", 400));
    }

    if (!action || !targetStep) {
        return next(new ErrorHandler("Action and target step are required for workflow transition", 400));
    }

    try {
        const currentStep = record.workflowStatus.currentStep;
        const workflowType = record.workflowStatus.workflowType;

        // Check if transition is valid
        const isValid = isValidWorkflowTransition('medical_record', currentStep, targetStep, action);
        if (!isValid) {
            return next(new ErrorHandler(`Invalid workflow transition: ${currentStep} -> ${targetStep} via ${action}`, 400));
        }

        // Check if target step is in next steps
        const nextSteps = record.workflowStatus.nextSteps;
        const validNextStep = nextSteps.find(step => 
            step.step === targetStep && 
            step.allowedRoles.includes(req.user.role)
        );

        if (!validNextStep && req.user.role !== 'admin') {
            return next(new ErrorHandler(`Target step '${targetStep}' is not available for your role`, 403));
        }

        // Validate business rules
        const businessRuleValidation = await validateBusinessRules(record, targetStep, action, req.user);
        if (!businessRuleValidation.valid) {
            return next(new ErrorHandler(businessRuleValidation.message, 400));
        }

        req.workflowContext.transition = {
            from: currentStep,
            to: targetStep,
            action: action,
            valid: true
        };

        next();

    } catch (error) {
        console.error('❌ [WorkflowMiddleware] Transition validation failed:', error);
        return next(new ErrorHandler(error.message || "Workflow transition validation failed", 500));
    }
});

/**
 * 📊 WORKFLOW LOGGING MIDDLEWARE
 * Logs workflow activities for audit trail
 */
export const logWorkflowActivity = catchAsyncErrors(async (req, res, next) => {
    const record = req.workflowContext?.record;
    const transition = req.workflowContext?.transition;
    const user = req.user;

    if (record && transition) {
        try {
            // Log to workflow service or audit system
            console.log(`📊 [WorkflowAudit] User ${user.email} (${user.role}) performed ${transition.action}: ${transition.from} -> ${transition.to} on record ${record._id}`);
            
            // Add to access log
            record.accessLog.push({
                userId: user._id,
                action: 'Workflow Transition',
                timestamp: new Date(),
                ipAddress: req.ip
            });

            // Could also send to external audit system here
            // await auditService.logWorkflowAction(user, record, transition);

        } catch (error) {
            console.error('❌ [WorkflowMiddleware] Failed to log workflow activity:', error);
            // Don't block the request for logging failures
        }
    }

    next();
});

/**
 * 🔍 WORKFLOW BLOCKER CHECK MIDDLEWARE
 * Checks for workflow blockers before allowing transitions
 */
export const checkWorkflowBlockers = catchAsyncErrors(async (req, res, next) => {
    const record = req.workflowContext?.record;

    if (!record) {
        return next();
    }

    try {
        // Check for unresolved blockers
        const activeBlockers = record.workflowStatus.blockers.filter(blocker => !blocker.resolvedAt);
        
        if (activeBlockers.length > 0 && req.user.role !== 'admin') {
            const blockerDescriptions = activeBlockers.map(b => `${b.type}: ${b.reason}`).join(', ');
            return next(new ErrorHandler(`Workflow is blocked: ${blockerDescriptions}`, 423)); // 423 Locked
        }

        // Check for deadline violations
        const now = new Date();
        if (record.workflowStatus.estimatedCompletionTime && 
            record.workflowStatus.estimatedCompletionTime < now &&
            record.workflowStatus.currentStep !== 'finalized') {
            
            console.warn(`⚠️ [WorkflowMiddleware] Medical record ${record._id} is overdue`);
            
            // Add warning to response but don't block
            req.workflowContext.warnings = req.workflowContext.warnings || [];
            req.workflowContext.warnings.push({
                type: 'overdue',
                message: 'This medical record is past its estimated completion time',
                estimatedTime: record.workflowStatus.estimatedCompletionTime,
                currentTime: now
            });
        }

        next();

    } catch (error) {
        console.error('❌ [WorkflowMiddleware] Failed to check workflow blockers:', error);
        return next(new ErrorHandler("Failed to validate workflow status", 500));
    }
});

/**
 * 🔧 HELPER FUNCTIONS
 */

/**
 * Validate business rules for workflow transitions
 */
async function validateBusinessRules(record, targetStep, action, user) {
    try {
        switch (targetStep) {
            case 'doctor_review':
                // Must have patient data and chief complaint
                if (!record.chiefComplaint?.description) {
                    return {
                        valid: false,
                        message: 'Chief complaint is required before doctor review'
                    };
                }
                break;

            case 'nurse_verify':
                // Must have doctor's assessment
                if (!record.assessment?.clinicalImpression) {
                    return {
                        valid: false,
                        message: 'Doctor assessment is required before nurse verification'
                    };
                }
                break;

            case 'billing_review':
                // Must have treatment plan with procedures or medications
                if (!record.treatmentPlan?.medications?.length && !record.treatmentPlan?.procedures?.length) {
                    return {
                        valid: false,
                        message: 'Treatment plan with medications or procedures is required for billing'
                    };
                }
                break;

            case 'insurance_process':
                // Must have ICD-10 codes for insurance
                if (!record.assessment?.icd10Codes?.length) {
                    return {
                        valid: false,
                        message: 'ICD-10 diagnostic codes are required for insurance processing'
                    };
                }
                break;

            case 'finalized':
                // Must have electronic signature
                if (!record.electronicSignature?.signedBy) {
                    return {
                        valid: false,
                        message: 'Electronic signature is required before finalization'
                    };
                }
                break;
        }

        return { valid: true };

    } catch (error) {
        console.error('❌ [WorkflowMiddleware] Business rule validation failed:', error);
        return {
            valid: false,
            message: 'Business rule validation failed'
        };
    }
}

/**
 * 📋 WORKFLOW CONTEXT MIDDLEWARE
 * Adds workflow context to request for easier access
 */
export const addWorkflowContext = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    
    if (id) {
        try {
            const record = await EnhancedMedicalRecord.findById(id).populate('accessControl.assignedTo.user', 'firstName lastName role');
            if (record) {
                req.workflowContext = {
                    record,
                    currentStep: record.workflowStatus.currentStep,
                    workflowType: record.workflowStatus.workflowType,
                    assignedUsers: record.accessControl.assignedTo,
                    permissions: record.accessControl.permissions
                };
            }
        } catch (error) {
            console.error('❌ [WorkflowMiddleware] Failed to add workflow context:', error);
            // Don't block request for context failures
        }
    }
    
    next();
});

export default {
    validateWorkflowPermission,
    validateWorkflowTransition,
    logWorkflowActivity,
    checkWorkflowBlockers,
    addWorkflowContext
};
