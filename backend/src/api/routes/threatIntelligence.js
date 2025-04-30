/**
 * Threat Intelligence API Routes
 * Handles management of threat intelligence sources and indicators
 */
const express = require('express');
const router = express.Router();
const threatIntelligenceService = require('../../services/threatIntelligenceService');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const mongoose = require('mongoose');

// Load models
const ThreatSource = mongoose.model('ThreatSource');
const ThreatIndicator = mongoose.model('ThreatIndicator');

/**
 * @route   GET /api/threat-intelligence/sources
 * @desc    Get all configured threat intelligence sources
 * @access  Authenticated + Permission
 */
router.get(
  '/sources',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      const sources = await ThreatSource.find().select('-connection.authentication.password -connection.authentication.apiKey -connection.authentication.oauthClientSecret');
      
      res.json({
        success: true,
        sources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching threat sources: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/threat-intelligence/sources
 * @desc    Create a new threat intelligence source
 * @access  Authenticated + Permission
 */
router.post(
  '/sources',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      // Add user ID as creator
      const sourceData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const source = await ThreatSource.create(sourceData);
      
      // Schedule sync for the new source
      threatIntelligenceService.scheduleSourceSync(source);
      
      // Mask sensitive data in response
      const response = source.toObject();
      if (response.connection?.authentication) {
        if (response.connection.authentication.password) {
          response.connection.authentication.password = '********';
        }
        if (response.connection.authentication.apiKey) {
          response.connection.authentication.apiKey = '********';
        }
        if (response.connection.authentication.oauthClientSecret) {
          response.connection.authentication.oauthClientSecret = '********';
        }
      }
      
      res.status(201).json({
        success: true,
        source: response
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error creating threat source: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/threat-intelligence/sources/:id
 * @desc    Get a specific threat intelligence source
 * @access  Authenticated + Permission
 */
router.get(
  '/sources/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      const source = await ThreatSource.findById(req.params.id)
        .select('-connection.authentication.password -connection.authentication.apiKey -connection.authentication.oauthClientSecret');
      
      if (!source) {
        return res.status(404).json({
          success: false,
          error: 'Threat source not found'
        });
      }
      
      res.json({
        success: true,
        source
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching threat source: ${error.message}`
      });
    }
  }
);

/**
 * @route   PUT /api/threat-intelligence/sources/:id
 * @desc    Update a threat intelligence source
 * @access  Authenticated + Permission
 */
router.put(
  '/sources/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      const source = await ThreatSource.findById(req.params.id);
      
      if (!source) {
        return res.status(404).json({
          success: false,
          error: 'Threat source not found'
        });
      }
      
      // Update source fields (excluding sensitive fields if not provided)
      const updateData = { ...req.body };
      
      // Handle authentication data carefully - don't overwrite with empty values
      if (updateData.connection?.authentication) {
        if (!updateData.connection.authentication.password) {
          delete updateData.connection.authentication.password;
        }
        if (!updateData.connection.authentication.apiKey) {
          delete updateData.connection.authentication.apiKey;
        }
        if (!updateData.connection.authentication.oauthClientSecret) {
          delete updateData.connection.authentication.oauthClientSecret;
        }
      }
      
      // Update the source
      const updatedSource = await ThreatSource.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-connection.authentication.password -connection.authentication.apiKey -connection.authentication.oauthClientSecret');
      
      // Reschedule sync if needed
      if (updatedSource.status === 'active') {
        threatIntelligenceService.scheduleSourceSync(updatedSource);
      } else if (threatIntelligenceService.scheduledJobs[updatedSource._id]) {
        threatIntelligenceService.scheduledJobs[updatedSource._id].stop();
        delete threatIntelligenceService.scheduledJobs[updatedSource._id];
      }
      
      res.json({
        success: true,
        source: updatedSource
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error updating threat source: ${error.message}`
      });
    }
  }
);

/**
 * @route   DELETE /api/threat-intelligence/sources/:id
 * @desc    Delete a threat intelligence source
 * @access  Authenticated + Permission
 */
router.delete(
  '/sources/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      const source = await ThreatSource.findById(req.params.id);
      
      if (!source) {
        return res.status(404).json({
          success: false,
          error: 'Threat source not found'
        });
      }
      
      // Stop any scheduled jobs
      if (threatIntelligenceService.scheduledJobs[source._id]) {
        threatIntelligenceService.scheduledJobs[source._id].stop();
        delete threatIntelligenceService.scheduledJobs[source._id];
      }
      
      // Delete the source
      await ThreatSource.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Threat source deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error deleting threat source: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/threat-intelligence/sources/:id/sync
 * @desc    Manually trigger sync for a threat source
 * @access  Authenticated + Permission
 */
router.post(
  '/sources/:id/sync',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      const source = await ThreatSource.findById(req.params.id);
      
      if (!source) {
        return res.status(404).json({
          success: false,
          error: 'Threat source not found'
        });
      }
      
      if (source.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Cannot sync inactive source'
        });
      }
      
      // Trigger sync asynchronously
      res.json({
        success: true,
        message: 'Sync started in the background'
      });
      
      // Now run the sync
      await threatIntelligenceService.syncSource(req.params.id);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error triggering sync: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/threat-intelligence/indicators
 * @desc    Search for threat indicators
 * @access  Authenticated + Permission
 */
router.get(
  '/indicators',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      // Extract search parameters from query
      const {
        value,
        type,
        severity,
        threatCategory,
        source,
        status,
        minConfidence,
        sortBy,
        sortDirection,
        tags,
        page = 1,
        limit = 50
      } = req.query;
      
      // Build search criteria
      const criteria = {
        value,
        type,
        severity,
        threatCategory,
        source,
        status: status || 'active',
        minConfidence: minConfidence ? parseInt(minConfidence) : undefined,
        sortBy,
        sortDirection,
        tags: tags ? tags.split(',') : undefined,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      
      // Search for indicators
      const result = await threatIntelligenceService.searchIndicators(criteria);
      
      res.json({
        success: true,
        indicators: result.indicators,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error searching indicators: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/threat-intelligence/indicators/:id
 * @desc    Get a specific threat indicator
 * @access  Authenticated + Permission
 */
router.get(
  '/indicators/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      const indicator = await ThreatIndicator.findById(req.params.id);
      
      if (!indicator) {
        return res.status(404).json({
          success: false,
          error: 'Threat indicator not found'
        });
      }
      
      res.json({
        success: true,
        indicator
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching indicator: ${error.message}`
      });
    }
  }
);

/**
 * @route   PUT /api/threat-intelligence/indicators/:id
 * @desc    Update a threat indicator
 * @access  Authenticated + Permission
 */
router.put(
  '/indicators/:id',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      const { status, severity, confidenceScore, tags, notes } = req.body;
      
      // Only allow updating specific fields
      const updateData = {};
      if (status) updateData.status = status;
      if (severity) updateData.severity = severity;
      if (confidenceScore) updateData.confidenceScore = confidenceScore;
      if (tags) updateData.tags = tags;
      if (notes) updateData.notes = notes;
      
      const indicator = await ThreatIndicator.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!indicator) {
        return res.status(404).json({
          success: false,
          error: 'Threat indicator not found'
        });
      }
      
      res.json({
        success: true,
        indicator
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error updating indicator: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/threat-intelligence/indicators
 * @desc    Create a manual threat indicator
 * @access  Authenticated + Permission
 */
router.post(
  '/indicators',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.manage'),
  async (req, res) => {
    try {
      // Set source to manual
      const indicatorData = {
        ...req.body,
        source: {
          name: 'manual',
          reference: `Added by ${req.user.name || req.user.id}`
        }
      };
      
      // Check for required fields
      if (!indicatorData.value || !indicatorData.type) {
        return res.status(400).json({
          success: false,
          error: 'Indicator value and type are required'
        });
      }
      
      // Check for existing indicator
      const existingIndicator = await ThreatIndicator.findOne({
        value: indicatorData.value,
        type: indicatorData.type
      });
      
      if (existingIndicator) {
        return res.status(400).json({
          success: false,
          error: 'Indicator already exists',
          indicator: existingIndicator
        });
      }
      
      // Create the indicator
      const indicator = await ThreatIndicator.create(indicatorData);
      
      res.status(201).json({
        success: true,
        indicator
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error creating indicator: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/threat-intelligence/check
 * @desc    Check values against threat intelligence
 * @access  Authenticated + Permission
 */
router.post(
  '/check',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      const { indicators } = req.body;
      
      if (!indicators || !Array.isArray(indicators)) {
        return res.status(400).json({
          success: false,
          error: 'Indicators array is required'
        });
      }
      
      // Validate indicator format
      for (const indicator of indicators) {
        if (!indicator.value || !indicator.type) {
          return res.status(400).json({
            success: false,
            error: 'Each indicator must have value and type properties'
          });
        }
      }
      
      // Check indicators
      const results = await threatIntelligenceService.batchCheckIndicators(indicators);
      
      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error checking indicators: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/threat-intelligence/correlate
 * @desc    Correlate events with threat intelligence
 * @access  Authenticated + Permission
 */
router.post(
  '/correlate',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      const { events } = req.body;
      
      if (!events || !Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          error: 'Events array is required'
        });
      }
      
      // Correlate events
      const result = await threatIntelligenceService.correlateEvents(events);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error correlating events: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/threat-intelligence/stats
 * @desc    Get threat intelligence statistics
 * @access  Authenticated + Permission
 */
router.get(
  '/stats',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('threat_intel.view'),
  async (req, res) => {
    try {
      // Get indicator counts by various categories
      const totalCount = await ThreatIndicator.countDocuments();
      
      const activeCount = await ThreatIndicator.countDocuments({ status: 'active' });
      
      const bySource = await ThreatIndicator.aggregate([
        { $group: { _id: '$source.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      const byType = await ThreatIndicator.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const bySeverity = await ThreatIndicator.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]);
      
      const byCategory = await ThreatIndicator.aggregate([
        { $group: { _id: '$threat.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Get sources stats
      const sourcesCount = await ThreatSource.countDocuments();
      const activeSourcesCount = await ThreatSource.countDocuments({ status: 'active' });
      
      res.json({
        success: true,
        stats: {
          indicators: {
            total: totalCount,
            active: activeCount,
            bySource,
            byType,
            bySeverity,
            byCategory
          },
          sources: {
            total: sourcesCount,
            active: activeSourcesCount
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error getting threat intelligence stats: ${error.message}`
      });
    }
  }
);

module.exports = router;
