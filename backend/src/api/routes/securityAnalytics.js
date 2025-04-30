const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const rbacMiddleware = require('../middleware/rbac');
const securityAnalyticsService = require('../../services/securityAnalyticsService');
const mlService = require('../../services/securityAnalytics/mlService');
const behavioralAnalytics = require('../../services/securityAnalytics/behavioralAnalytics');

/**
 * @route   GET /api/security-analytics/models
 * @desc    Get analytics models
 * @access  Authenticated + Admin
 */
router.get(
  '/models',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.manage_models'),
  async (req, res) => {
    try {
      const models = await mongoose.model('AnalyticsModel').find()
        .select('-modelStorage.path -modelStorage.checksum');
      
      res.json({
        success: true,
        models
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching analytics models: ${error.message}`
      });
    }
  }
);

/**
 * @route   POST /api/security-analytics/models/:id/train
 * @desc    Train an analytics model
 * @access  Authenticated + Admin
 */
router.post(
  '/models/:id/train',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.manage_models'),
  async (req, res) => {
    try {
      const model = await mongoose.model('AnalyticsModel').findById(req.params.id);
      
      if (!model) {
        return res.status(404).json({
          success: false,
          error: 'Analytics model not found'
        });
      }
      
      // Trigger model training using mlService
      const mlService = require('../../services/securityAnalytics/mlService');
      const result = await mlService.trainModel(model._id, req.body);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json({
        success: true,
        message: 'Model training started',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error training analytics model: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/security-analytics/user/:userId/behavior
 * @desc    Get behavioral analysis for a specific user
 * @access  Authenticated + Security Admin
 */
router.get(
  '/user/:userId/behavior',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.view'),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Get behavioral analysis for the user
      const analysis = await behavioralAnalytics.analyzeUserBehavior(userId);
      
      if (!analysis.success) {
        return res.status(404).json(analysis);
      }
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error analyzing user behavior: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/security-analytics/user-risk
 * @desc    Get risk scores for all users
 * @access  Authenticated + Security Admin
 */
router.get(
  '/user-risk',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.view'),
  async (req, res) => {
    try {
      const SecurityEvent = mongoose.model('SecurityEvent');
      
      // Get all user risk scores
      const userRiskScores = await SecurityEvent.aggregate([
        {
          $match: {
            'user.id': { $exists: true, $ne: null },
            timestamp: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
            }
          }
        },
        {
          $group: {
            _id: '$user.id',
            username: { $first: '$user.name' },
            eventCount: { $sum: 1 },
            anomalyCount: {
              $sum: {
                $cond: [
                  { $gte: ['$analysis.anomalyScore', 70] },
                  1,
                  0
                ]
              }
            },
            behavioralAnomalyCount: {
              $sum: {
                $cond: [
                  { $gte: ['$analysis.behavioralScore', 70] },
                  1,
                  0
                ]
              }
            },
            threatCount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'threat'] },
                  1,
                  0
                ]
              }
            },
            highestAnomaly: { $max: '$analysis.anomalyScore' },
            highestBehavioral: { $max: '$analysis.behavioralScore' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            username: 1,
            eventCount: 1,
            anomalyCount: 1,
            behavioralAnomalyCount: 1,
            threatCount: 1,
            highestAnomaly: 1,
            highestBehavioral: 1,
            lastActivity: 1,
            riskScore: {
              $add: [
                { $multiply: [{ $divide: ['$anomalyCount', { $max: ['$eventCount', 1] }] }, 40] },
                { $multiply: [{ $divide: ['$behavioralAnomalyCount', { $max: ['$eventCount', 1] }] }, 30] },
                { $multiply: [{ $divide: ['$threatCount', { $max: ['$eventCount', 1] }] }, 50] },
                { $divide: [{ $max: ['$highestAnomaly', 0] }, 2] },
                { $divide: [{ $max: ['$highestBehavioral', 0] }, 3] }
              ]
            }
          }
        },
        {
          $sort: { riskScore: -1 }
        }
      ]);
      
      res.json({
        success: true,
        userRiskScores
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching user risk scores: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/security-analytics/dashboard
 * @desc    Get analytics data for dashboard
 * @access  Authenticated + Admin
 */
router.get(
  '/dashboard',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.view'),
  async (req, res) => {
    try {
      const summary = await securityAnalyticsService.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching analytics summary: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/security-analytics/events
 * @desc    Get security events with optional filtering
 * @access  Authenticated + Admin
 */
router.get(
  '/events',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.view'),
  async (req, res) => {
    try {
      const result = await securityAnalyticsService.getSecurityEvents(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching security events: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/security-analytics/behavioral/baselines
 * @desc    Get behavioral baselines
 * @access  Authenticated + Admin
 */
router.get(
  '/behavioral/baselines',
  authMiddleware.verifyToken,
  rbacMiddleware.checkPermission('security.manage_models'),
  async (req, res) => {
    try {
      const SecurityEvent = mongoose.model('SecurityEvent');
      
      // Force baseline initialization if not done yet
      await behavioralAnalytics.initialize();
      
      const baseline = await SecurityEvent.aggregate([
        {
          $match: {
            'user.id': { $exists: true, $ne: null },
            timestamp: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: '$user.id',
            username: { $first: '$user.name' },
            totalEvents: { $sum: 1 },
            loginCount: {
              $sum: {
                $cond: [
                  { $eq: ['$eventType', 'login'] },
                  1,
                  0
                ]
              }
            },
            uniqueIPs: { $addToSet: '$network.srcIp' },
            uniqueLocations: { $addToSet: '$geo.country' },
            eventTypes: { $addToSet: '$eventType' },
            categories: { $addToSet: '$category' },
            hourlyActivity: {
              $push: { $hour: '$timestamp' }
            }
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            username: 1,
            totalEvents: 1,
            loginCount: 1,
            uniqueIPCount: { $size: '$uniqueIPs' },
            uniqueLocations: 1,
            eventTypes: 1,
            categories: 1,
            hourlyActivity: 1
          }
        },
        {
          $sort: { totalEvents: -1 }
        },
        {
          $limit: 100
        }
      ]);
      
      // Process hourly activity for each user
      const processedBaselines = baseline.map(user => {
        // Count events per hour
        const hourCounts = new Array(24).fill(0);
        for (const hour of user.hourlyActivity) {
          if (hour !== null && hour !== undefined) {
            hourCounts[hour]++;
          }
        }
        
        // Calculate active hours
        const totalHourlyEvents = hourCounts.reduce((sum, count) => sum + count, 0);
        const hourlyThreshold = totalHourlyEvents * 0.05; // 5% of total events
        const activeHours = hourCounts
          .map((count, hour) => ({ hour, count }))
          .filter(h => h.count > hourlyThreshold)
          .map(h => h.hour);
          
        return {
          ...user,
          hourlyActivity: hourCounts,
          activeHours
        };
      });
      
      res.json({
        success: true,
        baselines: processedBaselines
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching behavioral baselines: ${error.message}`
      });
    }
  }
);
module.exports = router;
