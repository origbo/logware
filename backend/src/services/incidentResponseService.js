/**
 * Incident Response Service
 * Provides automation for security incident response workflows
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');
const rbacService = require('./rbacService');
const reportingService = require('./reportingService');

// Define workflow types and their actions
const WORKFLOW_TYPES = {
  MALWARE_DETECTION: 'malware_detection',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_EXFILTRATION: 'data_exfiltration',
  NETWORK_INTRUSION: 'network_intrusion',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  COMPLIANCE_VIOLATION: 'compliance_violation'
};

// Define workflow status values
const WORKFLOW_STATUS = {
  CREATED: 'created',
  IN_PROGRESS: 'in_progress',
  AWAITING_APPROVAL: 'awaiting_approval',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled'
};

class IncidentResponseService {
  constructor() {
    this.Incident = mongoose.model('Incident');
    this.Workflow = mongoose.model('Workflow');
    this.WorkflowTemplate = mongoose.model('WorkflowTemplate');
    this.WorkflowExecution = mongoose.model('WorkflowExecution');
  }

  /**
   * Create a new incident
   * @param {Object} incidentData Incident details
   * @returns {Promise<Object>} Created incident
   */
  async createIncident(incidentData) {
    try {
      // Validate required fields
      if (!incidentData.title || !incidentData.type || !incidentData.severity) {
        return { 
          success: false, 
          error: 'Missing required incident fields' 
        };
      }

      // Create new incident record
      const incident = await this.Incident.create({
        title: incidentData.title,
        description: incidentData.description,
        type: incidentData.type,
        severity: incidentData.severity,
        source: incidentData.source,
        affectedSystems: incidentData.affectedSystems || [],
        status: 'open',
        createdBy: incidentData.userId || 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Trigger automatic workflows based on incident type and severity
      this.triggerAutomatedWorkflow(incident);

      // Notify relevant personnel
      await notificationService.notifyIncidentTeam({
        incidentId: incident._id,
        title: `New ${incidentData.severity} incident: ${incidentData.title}`,
        message: incidentData.description,
        severity: incidentData.severity
      });

      return { 
        success: true, 
        incident 
      };
    } catch (error) {
      logger.error(`Error creating incident: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Trigger appropriate automated workflow for an incident
   * @param {Object} incident Incident object
   */
  async triggerAutomatedWorkflow(incident) {
    try {
      // Find appropriate workflow template based on incident type
      const template = await this.WorkflowTemplate.findOne({
        incidentType: incident.type,
        isEnabled: true,
        // Find template that matches incident severity or is for all severities
        $or: [
          { applicableSeverity: incident.severity },
          { applicableSeverity: 'all' }
        ]
      }).sort({ priority: -1 }).limit(1);

      if (!template) {
        logger.warn(`No workflow template found for incident type ${incident.type} and severity ${incident.severity}`);
        return { 
          success: false, 
          error: 'No matching workflow template found' 
        };
      }

      // Create workflow execution record
      const execution = await this.WorkflowExecution.create({
        templateId: template._id,
        incidentId: incident._id,
        status: WORKFLOW_STATUS.CREATED,
        steps: template.steps.map(step => ({
          ...step,
          status: 'pending',
          output: null,
          startedAt: null,
          completedAt: null
        })),
        startedAt: new Date(),
        currentStepIndex: 0
      });

      // Start workflow execution
      await this.executeWorkflowStep(execution._id);

      return { 
        success: true, 
        workflowExecution: execution 
      };
    } catch (error) {
      logger.error(`Error triggering automated workflow: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Execute the current step in a workflow
   * @param {string} executionId Workflow execution ID
   */
  async executeWorkflowStep(executionId) {
    try {
      // Get current workflow execution
      const execution = await this.WorkflowExecution.findById(executionId);
      if (!execution) {
        throw new Error(`Workflow execution ${executionId} not found`);
      }

      // If workflow is already complete or failed, do nothing
      if (['completed', 'failed', 'canceled'].includes(execution.status)) {
        return;
      }

      // Update workflow status to in progress
      await this.WorkflowExecution.findByIdAndUpdate(executionId, {
        status: WORKFLOW_STATUS.IN_PROGRESS,
        'steps.0.status': 'in_progress',
        'steps.0.startedAt': new Date()
      });

      // Get current step
      const currentStep = execution.steps[execution.currentStepIndex];
      
      // Execute step based on type
      let stepResult;
      switch (currentStep.type) {
        case 'isolate_host':
          stepResult = await this.executeIsolateHostStep(execution, currentStep);
          break;
        case 'block_ip':
          stepResult = await this.executeBlockIpStep(execution, currentStep);
          break;
        case 'scan_system':
          stepResult = await this.executeScanSystemStep(execution, currentStep);
          break;
        case 'create_ticket':
          stepResult = await this.executeCreateTicketStep(execution, currentStep);
          break;
        case 'require_approval':
          stepResult = await this.executeRequireApprovalStep(execution, currentStep);
          return; // Stop execution until approval is received
        case 'generate_report':
          stepResult = await this.executeGenerateReportStep(execution, currentStep);
          break;
        default:
          stepResult = {
            success: false,
            error: `Unknown step type: ${currentStep.type}`
          };
      }

      // Update step status
      await this.updateStepStatus(execution._id, execution.currentStepIndex, stepResult);

      // If step was successful and more steps exist, continue workflow
      if (stepResult.success && execution.currentStepIndex < execution.steps.length - 1) {
        await this.moveToNextStep(execution._id);
      } 
      // If step failed or was the last step, finalize workflow
      else {
        await this.finalizeWorkflow(
          execution._id, 
          stepResult.success ? WORKFLOW_STATUS.COMPLETED : WORKFLOW_STATUS.FAILED
        );
      }

    } catch (error) {
      logger.error(`Error executing workflow step: ${error.message}`);
      // Mark the step as failed
      await this.WorkflowExecution.findByIdAndUpdate(
        executionId,
        {
          [`steps.${execution.currentStepIndex}.status`]: 'failed',
          [`steps.${execution.currentStepIndex}.output`]: error.message,
          [`steps.${execution.currentStepIndex}.completedAt`]: new Date(),
          status: WORKFLOW_STATUS.FAILED,
          completedAt: new Date()
        }
      );
    }
  }

  /**
   * Execute a step to isolate a host from the network
   */
  async executeIsolateHostStep(execution, step) {
    try {
      logger.info(`Isolating host ${step.parameters.hostname}`);
      
      // This would typically call a network control API or firewall service
      // For this example, we'll simulate the action
      const isolationResult = await this.simulateHostIsolation(step.parameters.hostname);
      
      return {
        success: true,
        output: `Host ${step.parameters.hostname} isolated successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to isolate host: ${error.message}`
      };
    }
  }

  /**
   * Execute a step to block an IP address
   */
  async executeBlockIpStep(execution, step) {
    try {
      logger.info(`Blocking IP ${step.parameters.ipAddress}`);
      
      // This would typically call a firewall or network security service
      // For this example, we'll simulate the action
      const blockResult = await this.simulateIpBlocking(step.parameters.ipAddress);
      
      return {
        success: true,
        output: `IP address ${step.parameters.ipAddress} blocked successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to block IP: ${error.message}`
      };
    }
  }

  /**
   * Execute a step to scan a system for vulnerabilities
   */
  async executeScanSystemStep(execution, step) {
    try {
      logger.info(`Scanning system ${step.parameters.target}`);
      
      // This would typically call our vulnerability scanning service
      // For this example, we'll simulate the action
      const scanResult = await this.simulateSystemScan(step.parameters.target);
      
      return {
        success: true,
        output: `System scan completed. Found ${scanResult.vulnerabilitiesFound} vulnerabilities.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to scan system: ${error.message}`
      };
    }
  }

  /**
   * Execute a step to create a ticket in external system
   */
  async executeCreateTicketStep(execution, step) {
    try {
      // Get incident details
      const incident = await this.Incident.findById(execution.incidentId);
      
      logger.info(`Creating ticket for incident ${incident._id}`);
      
      // This would typically call an external ticketing system API
      // For this example, we'll simulate the action
      const ticketResult = await this.simulateTicketCreation({
        title: `${step.parameters.ticketPrefix || 'Security Incident'}: ${incident.title}`,
        description: incident.description,
        severity: incident.severity,
        category: step.parameters.category || 'Security',
        assignee: step.parameters.assignee
      });
      
      return {
        success: true,
        output: `Ticket created successfully. Ticket ID: ${ticketResult.ticketId}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create ticket: ${error.message}`
      };
    }
  }

  /**
   * Execute a step that requires human approval before continuing
   */
  async executeRequireApprovalStep(execution, step) {
    try {
      // Update workflow status to awaiting approval
      await this.WorkflowExecution.findByIdAndUpdate(execution._id, {
        status: WORKFLOW_STATUS.AWAITING_APPROVAL,
        [`steps.${execution.currentStepIndex}.status`]: 'awaiting_approval',
      });
      
      // Notify approvers
      await notificationService.notifyUsers({
        userIds: step.parameters.approvers,
        title: 'Workflow Approval Required',
        message: `Incident workflow requires your approval: ${step.parameters.approvalMessage || 'Please review and approve to continue.'}`,
        severity: 'high',
        actionUrl: `/incidents/workflow/${execution._id}/approve`,
        actionText: 'Review & Approve'
      });
      
      return {
        success: true,
        output: `Approval request sent to ${step.parameters.approvers.length} users`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to request approval: ${error.message}`
      };
    }
  }

  /**
   * Execute a step to generate a report about the incident
   */
  async executeGenerateReportStep(execution, step) {
    try {
      // Get incident details
      const incident = await this.Incident.findById(execution.incidentId);
      
      logger.info(`Generating report for incident ${incident._id}`);
      
      // Use our reporting service to generate a report
      const reportResult = await reportingService.generateReport({
        type: 'incident',
        format: step.parameters.format || 'pdf',
        data: {
          incident,
          workflowExecution: execution
        },
        title: `Incident Report: ${incident.title}`,
        subtitle: `${incident.type} - ${incident.severity} severity`
      });
      
      return {
        success: true,
        output: `Report generated successfully. URL: ${reportResult.reportUrl}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate report: ${error.message}`
      };
    }
  }

  /**
   * Update the status of a workflow step
   */
  async updateStepStatus(executionId, stepIndex, stepResult) {
    const updateData = {
      [`steps.${stepIndex}.status`]: stepResult.success ? 'completed' : 'failed',
      [`steps.${stepIndex}.output`]: stepResult.success ? stepResult.output : stepResult.error,
      [`steps.${stepIndex}.completedAt`]: new Date()
    };
    
    await this.WorkflowExecution.findByIdAndUpdate(executionId, updateData);
  }

  /**
   * Move to the next step in a workflow
   */
  async moveToNextStep(executionId) {
    const execution = await this.WorkflowExecution.findById(executionId);
    const nextStepIndex = execution.currentStepIndex + 1;
    
    await this.WorkflowExecution.findByIdAndUpdate(executionId, {
      currentStepIndex: nextStepIndex,
      [`steps.${nextStepIndex}.status`]: 'in_progress',
      [`steps.${nextStepIndex}.startedAt`]: new Date()
    });
    
    // Execute the next step
    await this.executeWorkflowStep(executionId);
  }

  /**
   * Finalize a workflow with the given status
   */
  async finalizeWorkflow(executionId, status) {
    await this.WorkflowExecution.findByIdAndUpdate(executionId, {
      status: status,
      completedAt: new Date()
    });
    
    // Get execution details with populated references
    const execution = await this.WorkflowExecution.findById(executionId)
      .populate('incidentId')
      .populate('templateId');
    
    // Notify team about workflow completion
    await notificationService.notifyIncidentTeam({
      incidentId: execution.incidentId._id,
      title: `Workflow ${status === WORKFLOW_STATUS.COMPLETED ? 'completed' : 'failed'}: ${execution.templateId.name}`,
      message: `Incident response workflow has ${status === WORKFLOW_STATUS.COMPLETED ? 'completed successfully' : 'failed'}`,
      severity: 'medium'
    });
    
    return { success: true };
  }

  /**
   * Process an approval decision for a workflow
   */
  async processApproval(executionId, userId, isApproved, comments) {
    try {
      const execution = await this.WorkflowExecution.findById(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }
      
      if (execution.status !== WORKFLOW_STATUS.AWAITING_APPROVAL) {
        throw new Error('Workflow is not awaiting approval');
      }
      
      // Verify user has permission to approve
      const currentStep = execution.steps[execution.currentStepIndex];
      const hasPermission = await rbacService.hasPermission(userId, 'workflow.approve');
      const isApprover = currentStep.parameters.approvers.includes(userId);
      
      if (!hasPermission && !isApprover) {
        throw new Error('User does not have permission to approve this workflow');
      }
      
      // Record the approval decision
      await this.WorkflowExecution.findByIdAndUpdate(executionId, {
        [`steps.${execution.currentStepIndex}.approvalData`]: {
          approvedBy: userId,
          approved: isApproved,
          comments: comments,
          timestamp: new Date()
        }
      });
      
      if (isApproved) {
        // Mark step as completed and continue workflow
        await this.updateStepStatus(executionId, execution.currentStepIndex, {
          success: true,
          output: `Approved by user ${userId}`
        });
        
        // Move to next step if this wasn't the last one
        if (execution.currentStepIndex < execution.steps.length - 1) {
          await this.moveToNextStep(executionId);
        } else {
          await this.finalizeWorkflow(executionId, WORKFLOW_STATUS.COMPLETED);
        }
      } else {
        // If not approved, mark workflow as canceled
        await this.updateStepStatus(executionId, execution.currentStepIndex, {
          success: false,
          error: `Rejected by user ${userId}: ${comments || 'No comments provided'}`
        });
        
        await this.finalizeWorkflow(executionId, WORKFLOW_STATUS.CANCELED);
      }
      
      return { success: true };
    } catch (error) {
      logger.error(`Error processing approval: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get available workflow templates
   */
  async getWorkflowTemplates(filters = {}) {
    try {
      const query = { isEnabled: true };
      
      if (filters.incidentType) {
        query.incidentType = filters.incidentType;
      }
      
      if (filters.severity) {
        query.$or = [
          { applicableSeverity: filters.severity },
          { applicableSeverity: 'all' }
        ];
      }
      
      const templates = await this.WorkflowTemplate.find(query);
      return { 
        success: true, 
        templates 
      };
    } catch (error) {
      logger.error(`Error fetching workflow templates: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get workflow executions for an incident
   */
  async getWorkflowExecutions(incidentId) {
    try {
      const executions = await this.WorkflowExecution.find({ incidentId })
        .populate('templateId')
        .sort({ startedAt: -1 });
      
      return { 
        success: true, 
        executions 
      };
    } catch (error) {
      logger.error(`Error fetching workflow executions: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Simulation methods for demonstration purposes
  
  async simulateHostIsolation(hostname) {
    // Simulates isolating a host from the network
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, hostname });
      }, 2000);
    });
  }
  
  async simulateIpBlocking(ipAddress) {
    // Simulates blocking an IP address
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, ipAddress });
      }, 1500);
    });
  }
  
  async simulateSystemScan(target) {
    // Simulates scanning a system for vulnerabilities
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          target,
          vulnerabilitiesFound: Math.floor(Math.random() * 10),
          scanDuration: Math.floor(Math.random() * 120) + 30
        });
      }, 3000);
    });
  }
  
  async simulateTicketCreation(ticketData) {
    // Simulates creating a ticket in an external system
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          ticketId: `TICKET-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date()
        });
      }, 1000);
    });
  }
}

module.exports = new IncidentResponseService();
