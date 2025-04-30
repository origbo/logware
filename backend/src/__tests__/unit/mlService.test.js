/**
 * ML Service Tests
 */
const mongoose = require('mongoose');
const mlService = require('../../services/securityAnalytics/mlService');
const anomalyDetection = require('../../services/securityAnalytics/anomalyDetection');
const SecurityEvent = mongoose.model('SecurityEvent');
const AnalyticsModel = mongoose.model('AnalyticsModel');

describe('ML Service', () => {
  beforeAll(async () => {
    // Create test models
    await mlService.createDefaultModels();
    await mlService.initializeModels();
  });

  afterAll(async () => {
    // Clean up test data
    await AnalyticsModel.deleteMany({ createdBy: 'system-test' });
  });

  describe('Model Management', () => {
    it('should create default models if none exist', async () => {
      const modelCount = await AnalyticsModel.countDocuments();
      expect(modelCount).toBeGreaterThan(0);
    });

    it('should be able to load a model by ID', async () => {
      const model = await AnalyticsModel.findOne({ type: 'auth_anomaly' });
      const loadedModel = await mlService.loadModel(model._id);
      expect(loadedModel).not.toBeNull();
      expect(loadedModel.id).toBe(model._id.toString());
    });
  });

  describe('Event Analysis', () => {
    it('should analyze an authentication event', async () => {
      const event = {
        category: 'authentication',
        timestamp: new Date(),
        severity: 'medium',
        source: 'test-source',
        eventType: 'login',
        auth: {
          success: false,
          failedAttempts: 5,
          method: 'password'
        },
        user: {
          id: 'user123',
          name: 'Test User'
        },
        host: {
          hostname: 'test-host'
        }
      };

      const result = await mlService.analyzeEvent(event);
      expect(result).toBeDefined();
      expect(result.anomalyScore).toBeGreaterThan(0);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should use anomaly detection to analyze events', async () => {
      const event = {
        category: 'network',
        timestamp: new Date(),
        severity: 'high',
        source: 'firewall',
        eventType: 'connection',
        network: {
          srcIp: '192.168.1.100',
          dstIp: '10.0.0.1',
          destinationPort: 3389,
          bytes: 15000000
        }
      };

      const result = await anomalyDetection.analyzeEvent(event);
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.anomalyScore).toBeGreaterThan(0);
    });
  });

  describe('Model Training', () => {
    it('should be able to train a model', async () => {
      // Create a new model for testing
      const modelData = {
        name: 'Test Model',
        description: 'Model for testing',
        type: 'network_anomaly',
        version: 1,
        status: 'active',
        features: ['dataVolume', 'connectionCount', 'uniquePorts'],
        createdBy: 'system-test',
        updatedBy: 'system-test'
      };

      const model = await AnalyticsModel.create(modelData);
      
      // Train the model
      const result = await mlService.trainModel(model._id, {
        limit: 10
      });

      expect(result.success).toBe(true);
      
      // Clean up
      await AnalyticsModel.findByIdAndDelete(model._id);
    });
  });
});