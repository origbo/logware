/**
 * Incident Response API Routes
 * Provides endpoints for managing security incidents and response workflows
 */
const express = require('express');
const router = express.Router();
const incidentResponseService = require('../../services/incidentResponseService');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');

/**
 * @route   POST /api/incidents
 * @desc    Create a new security incident
 * @access  Authenticated
 */
router.post(
  '/',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.create'),
  async (req, res) => {
    try {
      // Add user ID to incident data
      const incidentData = {
        ...req.body,
        userId: req.user.id
      };

      const result = await incidentResponseService.createIncident(incidentData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.status(201).json({
        success: true,
        incident: result.incident
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to create incident: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/incidents
 * @desc    Get list of incidents with filters
 * @access  Authenticated
 */
router.get(
  '/',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.view'),
  async (req, res) => {
    try {
      // Extract filter parameters
      const { status, severity, type, dateFrom, dateTo, limit = 20, page = 1 } = req.query;
      
      // Build query object
      const query = {};
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (type) query.type = type;
      
      // Date range filtering
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }
      
      // Pagination setup
      const skip = (page - 1) * limit;
      
      // Get incidents from database using Mongoose model directly
      const incidents = await incidentResponseService.Incident
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
        
      // Get total count for pagination
      const total = await incidentResponseService.Incident.countDocuments(query);
      
      res.json({
        success: true,
        incidents,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch incidents: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/incidents/:id
 * @desc    Get incident details by ID
 * @access  Authenticated
 */
router.get(
  '/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.view'),
  async (req, res) => {
    try {
      const incident = await incidentResponseService.Incident
        .findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('affectedUsers', 'name email')
        .populate('relatedIncidents');
        
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }
      
      res.json({
        success: true,
        incident
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch incident: ${error.message}`
      });
    }
  }
);

/**
 * @route   PUT /api/incidents/:id
 * @desc    Update incident status and details
 * @access  Authenticated + Permission
 */
router.put(
  '/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.update'),
  async (req, res) => {
    try {
      const { status, assignedTo, resolution, addTimeline, tags } = req.body;
      
      // Get current incident
      const incident = await incidentResponseService.Incident.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }
      
      // Update basic properties
      if (status) incident.status = status;
      if (assignedTo) incident.assignedTo = assignedTo;
      if (tags) incident.tags = tags;
      
      // Update resolution if provided
      if (resolution) {
        incident.resolution = {
          ...resolution,
          date: new Date()
        };
      }
      
      // Add timeline event if provided
      if (addTimeline) {
        incident.timeline.push({
          event: addTimeline.event,
          timestamp: addTimeline.timestamp || new Date(),
          user: req.user.id,
          details: addTimeline.details
        });
      }
      
      // Save changes
      await incident.save();
      
      res.json({
        success: true,
        incident
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to update incident: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/incidents/:id/workflows
 * @desc    Get workflow executions for an incident
 * @access  Authenticated
 */
router.get(
  '/:id/workflows',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.view'),
  async (req, res) => {
    try {
      const result = await incidentResponseService.getWorkflowExecutions(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      res.json({
        success: true,
        workflows: result.executions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch workflows: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/incidents/:id/workflows
 * @desc    Start a new workflow for an incident
 * @access  Authenticated + Permission
 */
router.post(
  '/:id/workflows',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('incidents.manage_workflows'),
  async (req, res) => {
    try {
      const { templateId } = req.body;
      
      if (!templateId) {
        return res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
      }
      
      // Check if incident exists
      const incident = await incidentResponseService.Incident.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }
      
      // Get template
      const template = await incidentResponseService.WorkflowTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Workflow template not found'
        });
      }
      
      // Create workflow execution
      const execution = await incidentResponseService.WorkflowExecution.create({
        templateId,
        incidentId: req.params.id,
        status: 'created',
        steps: template.steps.map(step => ({
          ...step.toObject(),
          status: 'pending'
        })),
        startedAt: new Date(),
        currentStepIndex: 0,
        executedBy: 'user',
        initiatedBy: req.user.id
      });
      
      // Start workflow execution
      await incidentResponseService.executeWorkflowStep(execution._id);
      
      res.status(201).json({
        success: true,
        workflow: execution
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to start workflow: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/workflow-templates
 * @desc    Get available workflow templates
 * @access  Authenticated
 */
router.get(
  '/workflow-templates',
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const result = await incidentResponseService.getWorkflowTemplates(req.query);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      res.json({
        success: true,
        templates: result.templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch workflow templates: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/workflow-templates
 * @desc    Create a new workflow template
 * @access  Authenticated + Admin
 */
router.post(
  '/workflow-templates',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('admin.workflow_templates'),
  async (req, res) => {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      // Create the template
      const template = await incidentResponseService.WorkflowTemplate.create(templateData);
      
      res.status(201).json({
        success: true,
        template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to create workflow template: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/workflows/:id/approve
 * @desc    Approve or reject a workflow waiting for approval
 * @access  Authenticated + Permission
 */
router.post(
  '/workflows/:id/approve',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('workflows.approve'),
  async (req, res) => {
    try {
      const { approved, comments } = req.body;
      
      if (approved === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Approval decision is required'
        });
      }
      
      const result = await incidentResponseService.processApproval(
        req.params.id,
        req.user.id,
        approved,
        comments
      );
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      res.json({
        success: true,
        message: `Workflow ${approved ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to process approval: ${error.message}`
      });
    }
  }
);

module.exports = router;
