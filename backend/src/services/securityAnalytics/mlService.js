/**
 * ML Service for Security Analytics
 * Provides machine learning capabilities for anomaly detection and prediction
 */
/**
 * ML Service - Mock Implementation
 * Simplified implementation for demo purposes
 */
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Import models
const SecurityEvent = mongoose.model('SecurityEvent');
const AnalyticsModel = mongoose.model('AnalyticsModel');

class MLService {
  constructor() {
    this.modelCache = new Map();
    this.modelDir = path.join(__dirname, '../../../ml_models');
    
    // Ensure model directory exists
    if (!fs.existsSync(this.modelDir)) {
      fs.mkdirSync(this.modelDir, { recursive: true });
    }
  }

  /**
   * Initialize ML models from database
   */
  async initializeModels() {
    try {
      const models = await AnalyticsModel.find({ status: 'active' });
      
      logger.info(`Initializing ${models.length} ML models`);
      
      for (const model of models) {
        await this.loadModel(model._id);
      }
      
      logger.info('ML models initialized successfully');
    } catch (error) {
      logger.error(`Error initializing ML models: ${error.message}`);
    }
  }

  /**
   * Load a model into memory (or from disk cache)
   * @param {string} modelId - Model ID to load
   * @returns {Object} - Loaded model or null if error
   */
  async loadModel(modelId) {
    try {
      // Check if model is already in memory
      if (this.modelCache.has(modelId)) {
        return this.modelCache.get(modelId);
      }
      
      // Get model metadata from database
      const modelData = await AnalyticsModel.findById(modelId);
      
      if (!modelData) {
        logger.error(`Model ${modelId} not found in database`);
        return null;
      }
      
      // Check if model file exists
      const modelPath = modelData.modelStorage?.path || path.join(this.modelDir, `${modelId}.json`);
      
      if (!fs.existsSync(modelPath)) {
        logger.error(`Model file not found at ${modelPath}`);
        return null;
      }
      
      // Load model (this is a simplified version - in production
      // this would use proper ML libraries like TensorFlow.js or similar)
      const modelConfig = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      
      // Create model interface based on type
      const modelInterface = {
        id: modelId,
        type: modelData.type,
        config: modelConfig,
        metadata: modelData,
        predict: async (features) => {
          // This is a placeholder - in a real implementation,
          // we would use the loaded model to make predictions
          return this.predictWithModel(modelConfig, features);
        }
      };
      
      // Cache the model
      this.modelCache.set(modelId, modelInterface);
      
      logger.info(`Model ${modelId} (${modelData.name}) loaded successfully`);
      
      return modelInterface;
    } catch (error) {
      logger.error(`Error loading model ${modelId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Placeholder for model prediction - would be replaced with actual ML logic
   * @param {Object} modelConfig - Model configuration
   * @param {Object} features - Features to predict on
   * @returns {Object} - Prediction results
   */
  async predictWithModel(modelConfig, features) {
    // This is a simplified representation of how predictions would work
    // In a real implementation, this would use TensorFlow.js or a similar library
    
    try {
      const result = { score: 0, reasons: [] };
      
      // Simple example for authentication anomaly detection
      if (modelConfig.type === 'auth_anomaly' && features.auth) {
        // Time-based detection
        const hour = new Date(features.timestamp).getHours();
        if (hour < 6 || hour > 22) {
          result.score += 35;
          result.reasons.push('Unusual access time');
        }
        
        // Location-based detection
        if (features.auth.location && modelConfig.knownLocations) {
          const knownLocation = modelConfig.knownLocations.some(loc => 
            features.auth.location.country === loc.country &&
            features.auth.location.city === loc.city
          );
          
          if (!knownLocation) {
            result.score += 40;
            result.reasons.push('Login from unusual location');
          }
        }
        
        // Failed attempts pattern
        if (features.auth.failedAttempts > 2) {
          result.score += 25 * (features.auth.failedAttempts - 1);
          result.reasons.push(`Multiple failed login attempts (${features.auth.failedAttempts})`);
        }
      }
      
      // Network traffic anomaly detection
      if (modelConfig.type === 'network_anomaly' && features.network) {
        // Volume-based detection
        if (features.network.dataVolume > modelConfig.thresholds?.dataVolume || 10000) {
          result.score += 30;
          result.reasons.push('Unusual data transfer volume');
        }
        
        // Connection count detection
        if (features.network.connectionCount > modelConfig.thresholds?.connectionCount || 100) {
          result.score += 25;
          result.reasons.push('High number of connections');
        }
        
        // Port scanning detection
        if (features.network.uniquePorts > 15) {
          result.score += 50;
          result.reasons.push('Possible port scanning detected');
        }
      }
      
      // Data access anomaly detection
      if (modelConfig.type === 'data_access_anomaly' && features.dataAccess) {
        // Unusual access to sensitive data
        if (features.dataAccess.sensitiveDataAccess && 
            !modelConfig.authorizedUsers?.includes(features.user?.id)) {
          result.score += 60;
          result.reasons.push('Unauthorized access to sensitive data');
        }
        
        // Volume of data access
        if (features.dataAccess.recordsAccessed > 
            (modelConfig.thresholds?.recordsAccessed || 100)) {
          result.score += 25;
          result.reasons.push('Unusual volume of records accessed');
        }
        
        // Access outside normal patterns
        if (features.dataAccess.abnormalPatternScore > 0.7) {
          result.score += 30;
          result.reasons.push('Access pattern deviates from normal behavior');
        }
      }
      
      // Cap the score at 100
      result.score = Math.min(result.score, 100);
      
      return result;
    } catch (error) {
      logger.error(`Error making prediction: ${error.message}`);
      return { 
        score: 0, 
        error: error.message,
        reasons: ['Error in prediction process'] 
      };
    }
  }

  /**
   * Train a new model or update an existing one
   * @param {string} modelId - Model ID to train/update
   * @param {Object} options - Training options
   * @returns {Object} - Training result
   */
  async trainModel(modelId, options = {}) {
    try {
      const model = await AnalyticsModel.findById(modelId);
      
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }
      
      // Update model status
      model.status = 'training';
      model.lastTrainingStarted = new Date();
      await model.save();
      
      logger.info(`Starting training for model ${modelId} (${model.name})`);
      
      // Fetch training data based on model type
      const trainingData = await this.getTrainingData(model.type, options);
      
      logger.info(`Got ${trainingData.length} training samples for model ${modelId}`);
      
      // In a real implementation, we would use a proper ML library
      // and train the model using the training data
      // For this simulation, we'll create a simple model config
      
      const modelConfig = {
        type: model.type,
        version: model.version + 1,
        trainedAt: new Date(),
        features: model.features,
        // Simple thresholds based on training data statistics
        thresholds: this.calculateThresholds(trainingData, model.type)
      };
      
      // Save model to disk
      const modelPath = path.join(this.modelDir, `${modelId}.json`);
      fs.writeFileSync(modelPath, JSON.stringify(modelConfig, null, 2));
      
      // Update model in database
      model.status = 'active';
      model.version = modelConfig.version;
      model.lastTrainingCompleted = new Date();
      model.modelStorage = {
        path: modelPath,
        format: 'json',
        size: fs.statSync(modelPath).size
      };
      await model.save();
      
      // Reload model to cache
      await this.loadModel(modelId);
      
      logger.info(`Model ${modelId} trained successfully`);
      
      return {
        success: true,
        modelId,
        version: model.version,
        trainedAt: model.lastTrainingCompleted
      };
    } catch (error) {
      logger.error(`Error training model ${modelId}: ${error.message}`);
      
      // Update model status to error
      try {
        await AnalyticsModel.findByIdAndUpdate(modelId, {
          status: 'error',
          lastError: error.message
        });
      } catch (updateError) {
        logger.error(`Failed to update model status: ${updateError.message}`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate thresholds for anomaly detection based on training data
   * @param {Array} trainingData - Training data samples
   * @param {string} modelType - Type of model
   * @returns {Object} - Calculated thresholds
   */
  calculateThresholds(trainingData, modelType) {
    // This is a simplified implementation
    // In a real system, this would involve statistical analysis
    
    const thresholds = {};
    
    switch (modelType) {
      case 'auth_anomaly':
        // Calculate login time distribution
        const loginHours = trainingData.map(d => new Date(d.timestamp).getHours());
        thresholds.workHoursStart = this.percentile(loginHours, 5);
        thresholds.workHoursEnd = this.percentile(loginHours, 95);
        
        // Known locations
        thresholds.knownLocations = this.extractUniqueLocations(trainingData);
        break;
        
      case 'network_anomaly':
        // Calculate traffic thresholds
        const dataVolumes = trainingData.map(d => d.network?.dataVolume || 0);
        thresholds.dataVolume = this.percentile(dataVolumes, 95);
        
        const connectionCounts = trainingData.map(d => d.network?.connectionCount || 0);
        thresholds.connectionCount = this.percentile(connectionCounts, 95);
        break;
        
      case 'data_access_anomaly':
        // Calculate data access thresholds
        const recordsAccessed = trainingData.map(d => d.dataAccess?.recordsAccessed || 0);
        thresholds.recordsAccessed = this.percentile(recordsAccessed, 95);
        
        // Authorized users
        thresholds.authorizedUsers = [...new Set(trainingData
          .filter(d => d.dataAccess?.sensitiveDataAccess)
          .map(d => d.user?.id)
          .filter(Boolean))];
        break;
    }
    
    return thresholds;
  }

  /**
   * Calculate percentile of an array of numbers
   * @param {Array} array - Array of numbers
   * @param {number} percentile - Percentile to calculate (0-100)
   * @returns {number} - Calculated percentile value
   */
  percentile(array, percentile) {
    if (array.length === 0) return 0;
    
    array = array.filter(a => a !== undefined && a !== null).sort((a, b) => a - b);
    if (array.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * array.length) - 1;
    return array[Math.max(0, Math.min(index, array.length - 1))];
  }

  /**
   * Extract unique locations from training data
   * @param {Array} trainingData - Training data samples
   * @returns {Array} - Unique locations
   */
  extractUniqueLocations(trainingData) {
    const locations = new Set();
    
    trainingData.forEach(data => {
      if (data.auth?.location) {
        const locationKey = `${data.auth.location.country}-${data.auth.location.city}`;
        locations.add(locationKey);
      }
    });
    
    return [...locations].map(loc => {
      const [country, city] = loc.split('-');
      return { country, city };
    });
  }

  /**
   * Get training data for a specific model type
   * @param {string} modelType - Type of model to get data for
   * @param {Object} options - Options for data retrieval
   * @returns {Array} - Training data
   */
  async getTrainingData(modelType, options = {}) {
    const query = { status: 'normal' };
    let projection = {};
    
    // Set timeframe - default to last 30 days
    const startDate = options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    query.timestamp = { $gte: startDate };
    
    // Configure query based on model type
    switch (modelType) {
      case 'auth_anomaly':
        query.category = 'authentication';
        projection = { timestamp: 1, 'auth': 1, 'user': 1 };
        break;
        
      case 'network_anomaly':
        query.category = 'network';
        projection = { timestamp: 1, 'network': 1, 'host': 1 };
        break;
        
      case 'data_access_anomaly':
        query.category = 'data_access';
        projection = { timestamp: 1, 'dataAccess': 1, 'user': 1 };
        break;
    }
    
    // Limit to normal events for training
    return await SecurityEvent.find(query)
      .select(projection)
      .limit(options.limit || 10000)
      .lean();
  }

  /**
   * Analyze an event using the appropriate ML models
   * @param {Object} event - Security event to analyze
   * @returns {Object} - Analysis results
   */
  async analyzeEvent(event) {
    try {
      // Determine which models to use based on event category
      const modelTypes = [];
      
      switch (event.category) {
        case 'authentication':
          modelTypes.push('auth_anomaly');
          break;
        case 'network':
          modelTypes.push('network_anomaly');
          break;
        case 'data_access':
          modelTypes.push('data_access_anomaly');
          break;
        default:
          modelTypes.push('general_anomaly');
          break;
      }
      
      // Find active models of the required types
      const models = await AnalyticsModel.find({
        type: { $in: modelTypes },
        status: 'active'
      });
      
      if (models.length === 0) {
        logger.warn(`No active models found for event category: ${event.category}`);
        return {
          anomalyScore: 0,
          confidence: 0,
          models: [],
          reasons: ['No suitable models available for analysis']
        };
      }
      
      // Apply each model and collect results
      const modelResults = [];
      
      for (const model of models) {
        // Load model if not already cached
        const modelInterface = await this.loadModel(model._id);
        
        if (!modelInterface) {
          logger.warn(`Failed to load model ${model._id}`);
          continue;
        }
        
        // Extract features for the model
        const features = this.extractFeatures(event, model.type);
        
        // Get prediction
        const prediction = await modelInterface.predict(features);
        
        modelResults.push({
          modelId: model._id,
          modelName: model.name,
          modelType: model.type,
          score: prediction.score,
          reasons: prediction.reasons || []
        });
      }
      
      // Aggregate results from all models
      const aggregatedScore = this.aggregateScores(modelResults);
      const allReasons = modelResults
        .flatMap(result => result.reasons)
        .filter(Boolean);
      
      // Prepare final analysis result
      const analysis = {
        anomalyScore: Math.round(aggregatedScore),
        confidence: modelResults.length > 0 ? 
          (modelResults.reduce((sum, r) => sum + (r.confidence || 0.7), 0) / modelResults.length) : 0,
        models: modelResults.map(r => ({ 
          id: r.modelId, 
          name: r.modelName,
          score: r.score 
        })),
        reasons: [...new Set(allReasons)]
      };
      
      // Determine event status based on anomaly score
      if (analysis.anomalyScore >= 80) {
        event.status = 'threat';
      } else if (analysis.anomalyScore >= 60) {
        event.status = 'suspicious';
      } else {
        event.status = 'normal';
      }
      
      // Update event with analysis results
      event.analysis = analysis;
      
      if (event._id) {
        await SecurityEvent.findByIdAndUpdate(event._id, {
          status: event.status,
          analysis: analysis
        });
      }
      
      return analysis;
    } catch (error) {
      logger.error(`Error analyzing event: ${error.message}`);
      
      return {
        anomalyScore: 0,
        confidence: 0,
        error: error.message,
        reasons: ['Error during analysis']
      };
    }
  }

  /**
   * Extract features from event for a specific model type
   * @param {Object} event - Security event
   * @param {string} modelType - Type of model
   * @returns {Object} - Extracted features
   */
  extractFeatures(event, modelType) {
    // Base features common to all model types
    const features = {
      timestamp: event.timestamp,
      category: event.category,
      source: event.source,
      user: event.user,
      host: event.host
    };
    
    // Add type-specific features
    switch (modelType) {
      case 'auth_anomaly':
        features.auth = event.auth || {};
        break;
        
      case 'network_anomaly':
        features.network = event.network || {};
        break;
        
      case 'data_access_anomaly':
        features.dataAccess = event.dataAccess || {};
        break;
    }
    
    return features;
  }

  /**
   * Aggregate scores from multiple models
   * @param {Array} modelResults - Results from multiple models
   * @returns {number} - Aggregated score
   */
  aggregateScores(modelResults) {
    if (modelResults.length === 0) {
      return 0;
    }
    
    // Calculate weighted average based on confidence
    const totalWeight = modelResults.reduce((sum, result) => sum + (result.confidence || 1), 0);
    
    if (totalWeight === 0) {
      return 0;
    }
    
    const weightedSum = modelResults.reduce((sum, result) => {
      return sum + (result.score * (result.confidence || 1));
    }, 0);
    
    return weightedSum / totalWeight;
  }
  
  /**
   * Create default ML models for new installations
   */
  async createDefaultModels() {
    try {
      const existingCount = await AnalyticsModel.countDocuments();
      
      if (existingCount > 0) {
        logger.info('Default models not created - models already exist');
        return;
      }
      
      logger.info('Creating default ML models');
      
      const defaultModels = [
        {
          name: 'Authentication Anomaly Detector',
          description: 'Detects unusual authentication patterns',
          type: 'auth_anomaly',
          version: 1,
          status: 'active',
          features: ['timestamp', 'location', 'device', 'failedAttempts'],
          createdBy: 'system',
          updatedBy: 'system'
        },
        {
          name: 'Network Traffic Analyzer',
          description: 'Identifies unusual network traffic patterns',
          type: 'network_anomaly',
          version: 1,
          status: 'active',
          features: ['timestamp', 'dataVolume', 'connectionCount', 'uniquePorts'],
          createdBy: 'system',
          updatedBy: 'system'
        },
        {
          name: 'Data Access Monitor',
          description: 'Monitors for unusual data access patterns',
          type: 'data_access_anomaly',
          version: 1,
          status: 'active',
          features: ['timestamp', 'recordsAccessed', 'sensitiveDataAccess'],
          createdBy: 'system',
          updatedBy: 'system'
        }
      ];
      
      for (const modelData of defaultModels) {
        const model = await AnalyticsModel.create(modelData);
        
        // Create a simple initial model file
        const modelConfig = {
          type: model.type,
          version: model.version,
          trainedAt: new Date(),
          features: model.features,
          thresholds: this.getDefaultThresholds(model.type)
        };
        
        const modelPath = path.join(this.modelDir, `${model._id}.json`);
        fs.writeFileSync(modelPath, JSON.stringify(modelConfig, null, 2));
        
        // Update model with storage info
        model.modelStorage = {
          path: modelPath,
          format: 'json',
          size: fs.statSync(modelPath).size
        };
        await model.save();
        
        logger.info(`Created default model: ${model.name}`);
      }
      
      logger.info('Default ML models created successfully');
    } catch (error) {
      logger.error(`Error creating default ML models: ${error.message}`);
    }
  }
  
  /**
   * Get default thresholds for a model type
   * @param {string} modelType - Type of model
   * @returns {Object} - Default thresholds
   */
  getDefaultThresholds(modelType) {
    switch (modelType) {
      case 'auth_anomaly':
        return {
          workHoursStart: 8,
          workHoursEnd: 18,
          maxFailedAttempts: 3,
          knownLocations: []
        };
        
      case 'network_anomaly':
        return {
          dataVolume: 10000,
          connectionCount: 100,
          portScanThreshold: 15
        };
        
      case 'data_access_anomaly':
        return {
          recordsAccessed: 100,
          sensitiveDataThreshold: 10,
          authorizedUsers: []
        };
        
      default:
        return {};
    }
  }
}

module.exports = new MLService();
