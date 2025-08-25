/**
 * 🔄 WORKFLOW SERVICE
 * Enterprise-Grade Role-based Workflow Orchestration
 * @description Core workflow state management and orchestration service
 * @author Senior Backend Engineer
 * @updated 2024-12-28
 */

import { 
    getWorkflow,
    canPerformWorkflowAction,
    isValidWorkflowTransition,
    getNextWorkflowSteps,
    getWorkflowInitialStep,
    isTerminalStep,
    WORKFLOW_ACTIONS,
    WORKFLOW_STEPS
} from '../config/rolesConfig.js';

// Import Enhanced Medical Record Model
import EnhancedMedicalRecord from '../models/enhancedMedicalRecord.model.js';

/**
 * 🔄 WORKFLOW ORCHESTRATION SERVICE
 * Manages workflow state transitions and business logic
 */
class WorkflowService {
    constructor() {
        this.workflowHistory = new Map(); // In-memory workflow history (use Redis in production)
        this.activeWorkflows = new Map(); // Track active workflow instances
    }

    /**
     * 🚀 Initialize new workflow instance
     * @param {string} workflowName - Name of workflow to initialize
     * @param {Object} entityData - Entity data (medical record, lab report, etc.)
     * @param {Object} user - User initiating workflow
     * @returns {Object} New workflow instance
     */
    async initializeWorkflow(workflowName, entityData, user) {
        try {
            const workflow = getWorkflow(workflowName);
            if (!workflow) {
                throw new Error(`❌ Workflow '${workflowName}' not found`);
            }

            const initialStep = getWorkflowInitialStep(workflowName);
            const workflowInstance = {
                instanceId: this.generateInstanceId(),
                workflowName,
                entityType: workflow.module,
                entityId: entityData.id || entityData._id,
                currentStep: initialStep,
                status: 'active',
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                history: [{
                    step: initialStep,
                    action: 'initialize',
                    performedBy: user.id,
                    performedAt: new Date().toISOString(),
                    metadata: {
                        userName: user.name || user.username,
                        userRole: user.role
                    }
                }],
                metadata: {
                    entityData: {
                        id: entityData.id || entityData._id,
                        title: entityData.title || entityData.name || 'Untitled',
                        type: entityData.type || workflow.module
                    },
                    workflow: {
                        name: workflow.name,
                        module: workflow.module
                    }
                }
            };

            // Store in active workflows
            this.activeWorkflows.set(workflowInstance.instanceId, workflowInstance);
            
            console.log(`🚀 [WorkflowService] Initialized workflow: ${workflowName} -> ${workflowInstance.instanceId}`);
            return workflowInstance;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to initialize workflow '${workflowName}':`, error);
            throw error;
        }
    }

    /**
     * 🔄 Execute workflow action
     * @param {string} instanceId - Workflow instance ID
     * @param {string} action - Action to perform
     * @param {Object} user - User performing action
     * @param {Object} actionData - Additional action data
     * @returns {Object} Updated workflow instance
     */
    async executeAction(instanceId, action, user, actionData = {}) {
        try {
            const instance = this.activeWorkflows.get(instanceId);
            if (!instance) {
                throw new Error(`❌ Workflow instance '${instanceId}' not found`);
            }

            const workflow = getWorkflow(instance.workflowName);
            const currentStep = instance.currentStep;

            // Validate user can perform action
            const canPerform = canPerformWorkflowAction(user.role, instance.workflowName, currentStep, action);
            if (!canPerform) {
                throw new Error(`🚫 User '${user.role}' cannot perform '${action}' in step '${currentStep}'`);
            }

            // Determine next step based on action
            const nextStep = this.determineNextStep(instance.workflowName, currentStep, action, actionData);
            
            // Validate transition
            const isValidTransition = isValidWorkflowTransition(instance.workflowName, currentStep, nextStep, action);
            if (!isValidTransition) {
                throw new Error(`❌ Invalid transition: ${currentStep} --[${action}]--> ${nextStep}`);
            }

            // Update workflow instance
            const historyEntry = {
                step: nextStep,
                action,
                performedBy: user.id,
                performedAt: new Date().toISOString(),
                metadata: {
                    userName: user.name || user.username,
                    userRole: user.role,
                    previousStep: currentStep,
                    actionData: actionData
                }
            };

            instance.currentStep = nextStep;
            instance.history.push(historyEntry);
            instance.updatedAt = new Date().toISOString();

            // Check if workflow is completed
            if (isTerminalStep(instance.workflowName, nextStep)) {
                instance.status = 'completed';
                instance.completedAt = new Date().toISOString();
                console.log(`🏁 [WorkflowService] Workflow completed: ${instanceId} -> ${nextStep}`);
            }

            console.log(`🔄 [WorkflowService] Action executed: ${instanceId} -> ${currentStep} --[${action}]--> ${nextStep}`);
            return instance;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to execute action '${action}' on '${instanceId}':`, error);
            throw error;
        }
    }

    /**
     * 🔍 Get workflow instance
     * @param {string} instanceId - Workflow instance ID
     * @returns {Object|null} Workflow instance or null
     */
    async getWorkflowInstance(instanceId) {
        return this.activeWorkflows.get(instanceId) || null;
    }

    /**
     * 🔍 Get workflow instance by entity
     * @param {string} entityId - Entity ID
     * @param {string} workflowName - Workflow name
     * @returns {Object|null} Workflow instance or null
     */
    async getWorkflowByEntity(entityId, workflowName) {
        for (const [instanceId, instance] of this.activeWorkflows) {
            if (instance.entityId === entityId && instance.workflowName === workflowName) {
                return instance;
            }
        }
        return null;
    }

    /**
     * 📋 Get available actions for user in workflow
     * @param {string} instanceId - Workflow instance ID
     * @param {Object} user - User object
     * @returns {Array} Available actions
     */
    async getAvailableActions(instanceId, user) {
        try {
            const instance = this.activeWorkflows.get(instanceId);
            if (!instance) {
                return [];
            }

            const workflow = getWorkflow(instance.workflowName);
            const currentStepDef = workflow.steps[instance.currentStep];
            
            if (!currentStepDef) {
                return [];
            }

            // Filter actions by user role
            const availableActions = currentStepDef.allowedActions.filter(action => 
                canPerformWorkflowAction(user.role, instance.workflowName, instance.currentStep, action)
            );

            return availableActions.map(action => ({
                action,
                name: this.getActionDisplayName(action),
                description: this.getActionDescription(action),
                nextSteps: getNextWorkflowSteps(instance.workflowName, instance.currentStep, action)
            }));
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to get available actions for '${instanceId}':`, error);
            return [];
        }
    }

    /**
     * 📊 Get workflow status summary
     * @param {string} instanceId - Workflow instance ID
     * @returns {Object} Status summary
     */
    async getWorkflowStatus(instanceId) {
        try {
            const instance = this.activeWorkflows.get(instanceId);
            if (!instance) {
                return null;
            }

            const workflow = getWorkflow(instance.workflowName);
            const currentStepDef = workflow.steps[instance.currentStep];

            return {
                instanceId: instance.instanceId,
                workflowName: instance.workflowName,
                entityId: instance.entityId,
                currentStep: {
                    name: instance.currentStep,
                    displayName: currentStepDef?.name || instance.currentStep,
                    description: currentStepDef?.description || '',
                    isTerminal: isTerminalStep(instance.workflowName, instance.currentStep)
                },
                status: instance.status,
                createdAt: instance.createdAt,
                updatedAt: instance.updatedAt,
                completedAt: instance.completedAt,
                historyCount: instance.history.length,
                metadata: instance.metadata
            };
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to get status for '${instanceId}':`, error);
            return null;
        }
    }

    /**
     * 📈 Get workflow statistics
     * @param {string} workflowName - Workflow name (optional)
     * @returns {Object} Workflow statistics
     */
    async getWorkflowStatistics(workflowName = null) {
        try {
            let instances = Array.from(this.activeWorkflows.values());
            
            if (workflowName) {
                instances = instances.filter(instance => instance.workflowName === workflowName);
            }

            const stats = {
                total: instances.length,
                active: instances.filter(i => i.status === 'active').length,
                completed: instances.filter(i => i.status === 'completed').length,
                byStep: {},
                byWorkflow: {}
            };

            instances.forEach(instance => {
                // By step
                if (!stats.byStep[instance.currentStep]) {
                    stats.byStep[instance.currentStep] = 0;
                }
                stats.byStep[instance.currentStep]++;

                // By workflow
                if (!stats.byWorkflow[instance.workflowName]) {
                    stats.byWorkflow[instance.workflowName] = 0;
                }
                stats.byWorkflow[instance.workflowName]++;
            });

            return stats;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to get statistics:`, error);
            return { total: 0, active: 0, completed: 0, byStep: {}, byWorkflow: {} };
        }
    }

    /**
     * 🔧 HELPER METHODS
     */

    /**
     * 🏥 MEDICAL RECORD WORKFLOW INTEGRATION
     */

    /**
     * Initialize medical record workflow
     * @param {Object} medicalRecord - Enhanced Medical Record
     * @param {Object} user - User object
     * @param {string} workflowType - Type of workflow (standard, emergency, etc.)
     * @returns {Object} Updated medical record with workflow
     */
    async initializeMedicalRecordWorkflow(medicalRecord, user, workflowType = 'standard') {
        try {
            // Set workflow properties
            medicalRecord.workflowStatus.workflowType = workflowType;
            medicalRecord.workflowStatus.currentStep = 'draft';
            medicalRecord.workflowStatus.priority = this.determinePriority(workflowType, medicalRecord);
            
            // Set access control
            medicalRecord.accessControl.currentOwner = user._id;
            medicalRecord.accessControl.assignedTo.push({
                user: user._id,
                role: user.role,
                assignedAt: new Date()
            });

            // Set role-based permissions based on workflow type
            const permissions = this.getMedicalRecordPermissions(workflowType);
            medicalRecord.accessControl.permissions = permissions;

            // Initialize first step in history
            medicalRecord.workflowStatus.stepHistory.push({
                step: 'draft',
                previousStep: null,
                performedBy: user._id,
                action: 'create',
                comments: `Medical record created with ${workflowType} workflow`
            });

            // Update next steps
            medicalRecord.updateNextSteps();

            await medicalRecord.save();
            
            console.log(`🏥 [WorkflowService] Medical record workflow initialized: ${medicalRecord._id} (${workflowType})`);
            return medicalRecord;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to initialize medical record workflow:`, error);
            throw error;
        }
    }

    /**
     * Transition medical record workflow step
     * @param {string} recordId - Medical record ID
     * @param {string} newStep - Target step
     * @param {Object} user - User performing transition
     * @param {string} action - Action being performed
     * @param {string} comments - Optional comments
     * @returns {Object} Updated medical record
     */
    async transitionMedicalRecord(recordId, newStep, user, action = 'advance', comments = '') {
        try {
            const medicalRecord = await EnhancedMedicalRecord.findById(recordId);
            if (!medicalRecord) {
                throw new Error(`❌ Medical record not found: ${recordId}`);
            }

            const currentStep = medicalRecord.workflowStatus.currentStep;
            const userRole = user.role;

            // Check if user can perform this transition
            if (!this.canUserTransitionStep(medicalRecord, user, newStep, action)) {
                throw new Error(`🚫 User ${userRole} cannot transition from ${currentStep} to ${newStep}`);
            }

            // Perform the transition
            await medicalRecord.transitionTo(newStep, user._id, action, comments);

            // Update assignments if needed
            await this.updateAssignments(medicalRecord, newStep, user);

            // Set estimated completion time
            if (!medicalRecord.workflowStatus.estimatedCompletionTime) {
                medicalRecord.workflowStatus.estimatedCompletionTime = this.calculateEstimatedCompletion(newStep);
                await medicalRecord.save();
            }

            console.log(`🔄 [WorkflowService] Medical record transitioned: ${recordId} -> ${currentStep} to ${newStep}`);
            return medicalRecord;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to transition medical record:`, error);
            throw error;
        }
    }

    /**
     * Get medical records by workflow step for user
     * @param {string} step - Workflow step
     * @param {Object} user - User object
     * @returns {Array} Medical records
     */
    async getMedicalRecordsByStep(step, user) {
        try {
            const userRole = user.role;
            
            // Get records based on user role and step
            const query = {
                'workflowStatus.currentStep': step,
                $or: [
                    { 'accessControl.assignedTo.user': user._id },
                    { 'accessControl.permissions.canRead': userRole },
                    { 'accessControl.currentOwner': user._id }
                ]
            };

            const records = await EnhancedMedicalRecord.find(query)
                .populate('patient', 'name email phone')
                .populate('doctor', 'name email specialization')
                .populate('accessControl.currentOwner', 'name email role')
                .populate('accessControl.assignedTo.user', 'name email role')
                .sort({ 'workflowStatus.priority': -1, createdAt: -1 });

            console.log(`📋 [WorkflowService] Found ${records.length} medical records in step '${step}' for user ${userRole}`);
            return records;
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to get medical records by step:`, error);
            return [];
        }
    }

    /**
     * Get workflow dashboard data for user
     * @param {Object} user - User object
     * @returns {Object} Dashboard data
     */
    async getMedicalRecordWorkflowDashboard(user) {
        try {
            const userRole = user.role;
            
            // Get counts by step
            const stepCounts = await EnhancedMedicalRecord.aggregate([
                {
                    $match: {
                        $or: [
                            { 'accessControl.assignedTo.user': user._id },
                            { 'accessControl.permissions.canRead': userRole },
                            { 'accessControl.currentOwner': user._id }
                        ]
                    }
                },
                {
                    $group: {
                        _id: '$workflowStatus.currentStep',
                        count: { $sum: 1 },
                        highPriority: {
                            $sum: {
                                $cond: [
                                    { $in: ['$workflowStatus.priority', ['high', 'urgent']] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            // Get pending tasks (assigned to user)
            const pendingTasks = await EnhancedMedicalRecord.find({
                'accessControl.assignedTo.user': user._id,
                'workflowStatus.currentStep': { $ne: 'finalized' }
            })
            .populate('patient', 'name')
            .select('patient workflowStatus createdAt')
            .sort({ 'workflowStatus.priority': -1, createdAt: 1 })
            .limit(10);

            // Get overdue items
            const overdue = await EnhancedMedicalRecord.find({
                'accessControl.assignedTo.user': user._id,
                'workflowStatus.estimatedCompletionTime': { $lt: new Date() },
                'workflowStatus.currentStep': { $ne: 'finalized' }
            }).countDocuments();

            console.log(`📊 [WorkflowService] Generated dashboard for user ${userRole}: ${stepCounts.length} step groups`);
            
            return {
                stepCounts: stepCounts.reduce((acc, item) => {
                    acc[item._id] = {
                        total: item.count,
                        highPriority: item.highPriority
                    };
                    return acc;
                }, {}),
                pendingTasks,
                overdue,
                summary: {
                    totalAssigned: pendingTasks.length,
                    totalOverdue: overdue,
                    canReview: this.getRoleSteps(userRole)
                }
            };
        } catch (error) {
            console.error(`❌ [WorkflowService] Failed to generate dashboard:`, error);
            return { stepCounts: {}, pendingTasks: [], overdue: 0, summary: {} };
        }
    }

    /**
     * PRIVATE HELPER METHODS FOR MEDICAL RECORDS
     */

    /**
     * Determine priority based on workflow type and record data
     */
    determinePriority(workflowType, medicalRecord) {
        switch (workflowType) {
            case 'emergency':
                return 'urgent';
            case 'complex_case':
                return 'high';
            case 'insurance_required':
                return 'medium';
            default:
                return 'medium';
        }
    }

    /**
     * Get role-based permissions for medical record workflow
     */
    getMedicalRecordPermissions(workflowType) {
        const basePermissions = {
            canRead: ['doctor', 'nurse', 'admin'],
            canEdit: ['doctor', 'nurse'],
            canApprove: ['doctor', 'admin'],
            canReject: ['doctor', 'admin']
        };

        if (workflowType === 'insurance_required') {
            basePermissions.canRead.push('insurance_staff');
            basePermissions.canApprove.push('insurance_staff');
        }

        if (workflowType === 'emergency') {
            basePermissions.canEdit.push('admin');
        }

        return basePermissions;
    }

    /**
     * Check if user can transition to specific step
     */
    canUserTransitionStep(medicalRecord, user, newStep, action) {
        const currentStep = medicalRecord.workflowStatus.currentStep;
        const userRole = user.role;

        // Check if user is assigned to this record
        const isAssigned = medicalRecord.accessControl.assignedTo.some(
            assignment => assignment.user.toString() === user._id.toString()
        );

        if (!isAssigned && userRole !== 'admin') {
            return false;
        }

        // Check next steps for allowed roles
        const nextSteps = medicalRecord.workflowStatus.nextSteps;
        const validNextStep = nextSteps.find(step => 
            step.step === newStep && step.allowedRoles.includes(userRole)
        );

        return !!validNextStep;
    }

    /**
     * Update assignments based on workflow step
     */
    async updateAssignments(medicalRecord, newStep, currentUser) {
        // Define which roles should be assigned at each step
        const stepAssignments = {
            'doctor_review': ['doctor'],
            'nurse_verify': ['nurse'],
            'billing_review': ['billing_staff'],
            'insurance_process': ['insurance_staff']
        };

        const requiredRoles = stepAssignments[newStep];
        if (!requiredRoles) return;

        // Remove old assignments for this step
        medicalRecord.accessControl.assignedTo = medicalRecord.accessControl.assignedTo.filter(
            assignment => !requiredRoles.includes(assignment.role)
        );

        // Add new assignment if current user has required role
        if (requiredRoles.includes(currentUser.role)) {
            medicalRecord.accessControl.assignedTo.push({
                user: currentUser._id,
                role: currentUser.role,
                assignedAt: new Date()
            });
        }

        await medicalRecord.save();
    }

    /**
     * Calculate estimated completion time based on step
     */
    calculateEstimatedCompletion(step) {
        const stepDurations = {
            'draft': 24, // 24 hours
            'doctor_review': 48, // 48 hours
            'nurse_verify': 24, // 24 hours
            'billing_review': 72, // 72 hours
            'insurance_process': 120, // 5 days
            'finalized': 0
        };

        const hours = stepDurations[step] || 48;
        return new Date(Date.now() + (hours * 60 * 60 * 1000));
    }

    /**
     * Get steps that a role can work on
     */
    getRoleSteps(role) {
        const roleSteps = {
            'doctor': ['doctor_review'],
            'nurse': ['nurse_verify'],
            'billing_staff': ['billing_review'],
            'insurance_staff': ['insurance_process'],
            'admin': ['doctor_review', 'nurse_verify', 'billing_review', 'insurance_process']
        };

        return roleSteps[role] || [];
    }

    /**
     * Determine next step based on action and business logic
     */
    determineNextStep(workflowName, currentStep, action, actionData) {
        const nextSteps = getNextWorkflowSteps(workflowName, currentStep, action);
        
        if (nextSteps.length === 1) {
            return nextSteps[0];
        }

        // Business logic for multiple possible next steps
        switch (action) {
            case WORKFLOW_ACTIONS.REVIEW:
                return WORKFLOW_STEPS.UNDER_REVIEW;
            case WORKFLOW_ACTIONS.APPROVE:
                return WORKFLOW_STEPS.APPROVED;
            case WORKFLOW_ACTIONS.REJECT:
                return WORKFLOW_STEPS.REJECTED;
            case WORKFLOW_ACTIONS.SUBMIT:
                return WORKFLOW_STEPS.SUBMITTED;
            case WORKFLOW_ACTIONS.FINALIZE:
                return WORKFLOW_STEPS.FINALIZED;
            case WORKFLOW_ACTIONS.REVISE:
                return actionData.backToDraft ? WORKFLOW_STEPS.DRAFT : WORKFLOW_STEPS.REVISION_REQUIRED;
            case WORKFLOW_ACTIONS.ARCHIVE:
                return WORKFLOW_STEPS.ARCHIVED;
            case WORKFLOW_ACTIONS.CANCEL:
                return WORKFLOW_STEPS.CANCELLED;
            default:
                return nextSteps[0] || currentStep;
        }
    }

    /**
     * Generate unique workflow instance ID
     */
    generateInstanceId() {
        return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get display name for action
     */
    getActionDisplayName(action) {
        const actionNames = {
            [WORKFLOW_ACTIONS.SUBMIT]: 'Submit',
            [WORKFLOW_ACTIONS.REVIEW]: 'Review',
            [WORKFLOW_ACTIONS.APPROVE]: 'Approve',
            [WORKFLOW_ACTIONS.REJECT]: 'Reject',
            [WORKFLOW_ACTIONS.REVISE]: 'Revise',
            [WORKFLOW_ACTIONS.FINALIZE]: 'Finalize',
            [WORKFLOW_ACTIONS.ARCHIVE]: 'Archive',
            [WORKFLOW_ACTIONS.CANCEL]: 'Cancel'
        };
        return actionNames[action] || action;
    }

    /**
     * Get description for action
     */
    getActionDescription(action) {
        const actionDescriptions = {
            [WORKFLOW_ACTIONS.SUBMIT]: 'Submit for review or processing',
            [WORKFLOW_ACTIONS.REVIEW]: 'Begin review process',
            [WORKFLOW_ACTIONS.APPROVE]: 'Approve and move forward',
            [WORKFLOW_ACTIONS.REJECT]: 'Reject and require changes',
            [WORKFLOW_ACTIONS.REVISE]: 'Make revisions or corrections',
            [WORKFLOW_ACTIONS.FINALIZE]: 'Complete and finalize',
            [WORKFLOW_ACTIONS.ARCHIVE]: 'Archive for long-term storage',
            [WORKFLOW_ACTIONS.CANCEL]: 'Cancel and abandon'
        };
        return actionDescriptions[action] || 'Perform action';
    }
}

// Singleton instance
const workflowService = new WorkflowService();

export default workflowService;
export { WorkflowService };
