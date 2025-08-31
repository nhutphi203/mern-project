/**
 * 🏥 ENHANCED MEDICAL RECORD CONTROLLER WITH WORKFLOW
 * Role-based Medical Records with Workflow State Management
 * @description Enhanced medical record controller integrated with workflow system
 * @author Senior Backend Engineer
 * @updated 2024-12-28
 */

import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import EnhancedMedicalRecord from '../models/enhancedMedicalRecord.model.js';
import { MedicalRecord } from '../models/medicalRecordSchema.js'; // Keep for legacy support
import { Appointment } from '../models/appointmentSchema.js';
import workflowService from '../services/workflowService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/response.js';
import { WORKFLOW_ACTIONS, WORKFLOW_STEPS } from '../config/rolesConfig.js';

// ===============================================
// 🏥 WORKFLOW-ENHANCED MEDICAL RECORD OPERATIONS
// ===============================================

/**
 * 🚀 CREATE ENHANCED MEDICAL RECORD WITH WORKFLOW
 * Creates enhanced medical record and initializes workflow
 */
export const createMedicalRecordWithWorkflow = catchAsyncErrors(async (req, res, next) => {
    const {
        patientId,
        doctorId,
        appointmentId,
        chiefComplaint,
        presentIllness,
        medicalHistory,
        workflowType = 'standard'
    } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !chiefComplaint) {
        return next(new ErrorHandler("Patient ID, Doctor ID, and Chief Complaint are required", 400));
    }

    try {
        // Create enhanced medical record
        const medicalRecord = new EnhancedMedicalRecord({
            patient: patientId,
            doctor: doctorId,
            appointment: appointmentId,
            chiefComplaint: {
                description: chiefComplaint,
                severity: req.body.complaintSeverity || 'moderate'
            },
            presentIllness: {
                description: presentIllness || ''
            },
            medicalHistory: medicalHistory || {
                conditions: []
            },
            recordStatus: 'Draft'
        });

        // Save medical record first
        await medicalRecord.save();

        // Initialize workflow
        const recordWithWorkflow = await workflowService.initializeMedicalRecordWorkflow(
            medicalRecord,
            req.user,
            workflowType
        );

        console.log(`🏥 [WorkflowController] Created medical record with workflow: ${recordWithWorkflow._id}`);

        return createSuccessResponse(res, 201, {
            message: "Medical record created successfully with workflow",
            medicalRecord: recordWithWorkflow,
            workflow: {
                currentStep: recordWithWorkflow.workflowStatus.currentStep,
                workflowType: recordWithWorkflow.workflowStatus.workflowType,
                nextSteps: recordWithWorkflow.workflowStatus.nextSteps
            }
        });

    } catch (error) {
        console.error('❌ [WorkflowController] Failed to create medical record:', error);
        return next(new ErrorHandler(error.message || "Failed to create medical record", 500));
    }
});

/**
 * 🔄 EXECUTE WORKFLOW ACTION ON MEDICAL RECORD
 */
export const executeMedicalRecordWorkflowAction = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { action, targetStep, comments } = req.body;

    if (!action || !targetStep) {
        return next(new ErrorHandler("Action and target step are required", 400));
    }

    try {
        const record = await EnhancedMedicalRecord.findById(id);
        if (!record) {
            return next(new ErrorHandler("Medical record not found", 404));
        }

        const updatedRecord = await workflowService.transitionMedicalRecord(
            id,
            targetStep,
            req.user,
            action,
            comments || ''
        );

        return createSuccessResponse(res, 200, {
            message: `Medical record workflow action '${action}' executed successfully`,
            medicalRecord: updatedRecord,
            workflow: {
                currentStep: updatedRecord.workflowStatus.currentStep,
                nextSteps: updatedRecord.workflowStatus.nextSteps
            }
        });

    } catch (error) {
        console.error('❌ [WorkflowController] Workflow action failed:', error);
        return next(new ErrorHandler(error.message || "Failed to execute workflow action", 500));
    }
});

/**
 * 📄 GET MEDICAL RECORD WITH WORKFLOW STATUS
 */
export const getMedicalRecordWithWorkflow = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    try {
        const record = await EnhancedMedicalRecord.findById(id)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email')
            .populate('appointment', 'appointmentDate status');

        if (!record) {
            return next(new ErrorHandler("Medical record not found", 404));
        }

        return createSuccessResponse(res, 200, {
            message: "Medical record retrieved successfully",
            medicalRecord: record,
            workflow: {
                currentStep: record.workflowStatus.currentStep,
                workflowType: record.workflowStatus.workflowType,
                nextSteps: record.workflowStatus.nextSteps
            }
        });

    } catch (error) {
        console.error('❌ [WorkflowController] Failed to get medical record:', error);
        return next(new ErrorHandler(error.message || "Failed to retrieve medical record", 500));
    }
});

/**
 * 📊 GET MEDICAL RECORD WORKFLOW DASHBOARD
 */
export const getMedicalRecordWorkflowDashboard = catchAsyncErrors(async (req, res, next) => {
    try {
        const dashboard = await workflowService.getMedicalRecordWorkflowDashboard(req.user);

        return createSuccessResponse(res, 200, {
            message: "Workflow dashboard retrieved successfully",
            dashboard
        });

    } catch (error) {
        console.error('❌ [WorkflowController] Failed to get workflow dashboard:', error);
        return next(new ErrorHandler(error.message || "Failed to retrieve workflow dashboard", 500));
    }
});

// Legacy compatibility exports
export const createMedicalRecord = createMedicalRecordWithWorkflow;
export const updateMedicalRecord = createMedicalRecordWithWorkflow; 
export const getMedicalRecordById = getMedicalRecordWithWorkflow;
export const getPatientMedicalHistory = getMedicalRecordWithWorkflow;

export default {
    createMedicalRecordWithWorkflow,
    executeMedicalRecordWorkflowAction,
    getMedicalRecordWithWorkflow,
    getMedicalRecordWorkflowDashboard,
    createMedicalRecord,
    updateMedicalRecord,
    getMedicalRecordById,
    getPatientMedicalHistory
};
