/**
 * Advanced Threat Analytics Service
 * Provides machine learning and statistical analysis for threat detection
 */
const logger = require('../../utils/logger');
const integrations = require('../../config/integrations');

class AdvancedThreatAnalyticsService {
  constructor() {
    this.models = {};
    this.thresholds = {
      loginAnomaly: 0.75,
      networkAnomaly: 0.8,
      dataExfiltration: 0.85
    };
    this.initialized = false;
  }

  /**
   * Initialize the analytics service
   * @returns {Promise<boolean>} - Initialization status
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Load models
      await this.loadModels();
      this.initialized = true;
      logger.info('Advanced Threat Analytics Service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Advanced Threat Analytics Service:', error.message);
      return false;
    }
  }

  /**
   * Load machine learning models
   * @returns {Promise<void>}
   */
  async loadModels() {
    // In a production environment, this would load actual ML models
    // For now, we'll use simplified statistical analysis
    this.models = {
      loginBehavior: {
        type: 'statistical',
        features: ['time', 'location', 'device', 'userAgent', 'ipAddress'],
        weights: {
          time: 0.3,
          location: 0.25,
          device: 0.15,
          userAgent: 0.15,
          ipAddress: 0.15
        }
      },
      networkTraffic: {
        type: 'statistical',
        features: ['volume', 'destinations', 'protocols', 'timePeriod', 'frequency'],
        weights: {
          volume: 0.25,
          destinations: 0.25,
          protocols: 0.2,
          timePeriod: 0.15,
          frequency: 0.15
        }
      },
      dataExfiltration: {
        type: 'statistical',
        features: ['dataSize', 'destination', 'timeOfDay', 'frequency', 'fileTypes'],
        weights: {
          dataSize: 0.3,
          destination: 0.25,
          timeOfDay: 0.15,
          frequency: 0.15,
          fileTypes: 0.15
        }
      }
    };
    
    logger.info('Loaded analytics models');
  }

  /**
   * Analyze login behavior for anomalies
   * @param {Object} loginData - Login event data
   * @param {Object} userProfile - User profile with baseline behavior
   * @returns {Object} - Analysis results
   */
  analyzeLoginBehavior(loginData, userProfile) {
    if (!this.initialized) {
      throw new Error('Advanced Threat Analytics Service not initialized');
    }
    
    // Extract login features
    const features = {
      time: this.extractTimeFeature(loginData.timestamp, userProfile.loginTimes),
      location: this.extractLocationFeature(loginData.location, userProfile.locations),
      device: this.extractDeviceFeature(loginData.device, userProfile.devices),
      userAgent: this.extractUserAgentFeature(loginData.userAgent, userProfile.userAgents),
      ipAddress: this.extractIPFeature(loginData.ipAddress, userProfile.ipAddresses)
    };
    
    // Calculate anomaly score
    const model = this.models.loginBehavior;
    let anomalyScore = 0;
    
    for (const [feature, value] of Object.entries(features)) {
      anomalyScore += value * model.weights[feature];
    }
    
    // Determine if anomalous
    const isAnomalous = anomalyScore >= this.thresholds.loginAnomaly;
    
    return {
      isAnomalous,
      anomalyScore,
      featureScores: features,
      timestamp: new Date(),
      eventType: 'login',
      userId: loginData.userId,
      details: {
        loginId: loginData.id,
        ipAddress: loginData.ipAddress,
        location: loginData.location,
        device: loginData.device,
        userAgent: loginData.userAgent
      }
    };
  }

  /**
   * Analyze network traffic for anomalies
   * @param {Object} networkData - Network traffic data
   * @param {Object} baselineProfile - Baseline network profile
   * @returns {Object} - Analysis results
   */
  analyzeNetworkTraffic(networkData, baselineProfile) {
    if (!this.initialized) {
      throw new Error('Advanced Threat Analytics Service not initialized');
    }
    
    // Extract network features
    const features = {
      volume: this.extractVolumeFeature(networkData.volume, baselineProfile.volumes),
      destinations: this.extractDestinationsFeature(networkData.destinations, baselineProfile.destinations),
      protocols: this.extractProtocolsFeature(networkData.protocols, baselineProfile.protocols),
      timePeriod: this.extractTimePeriodFeature(networkData.timestamp, baselineProfile.timePeriods),
      frequency: this.extractFrequencyFeature(networkData.frequency, baselineProfile.frequencies)
    };
    
    // Calculate anomaly score
    const model = this.models.networkTraffic;
    let anomalyScore = 0;
    
    for (const [feature, value] of Object.entries(features)) {
      anomalyScore += value * model.weights[feature];
    }
    
    // Determine if anomalous
    const isAnomalous = anomalyScore >= this.thresholds.networkAnomaly;
    
    return {
      isAnomalous,
      anomalyScore,
      featureScores: features,
      timestamp: new Date(),
      eventType: 'network',
      sourceId: networkData.sourceId,
      details: {
        volume: networkData.volume,
        destinations: networkData.destinations,
        protocols: networkData.protocols,
        timePeriod: new Date(networkData.timestamp)
      }
    };
  }

  /**
   * Analyze data transfer patterns for potential exfiltration
   * @param {Object} transferData - Data transfer event
   * @param {Object} baselineProfile - Baseline data transfer profile
   * @returns {Object} - Analysis results
   */
  analyzeDataTransfer(transferData, baselineProfile) {
    if (!this.initialized) {
      throw new Error('Advanced Threat Analytics Service not initialized');
    }
    
    // Extract data transfer features
    const features = {
      dataSize: this.extractDataSizeFeature(transferData.size, baselineProfile.sizes),
      destination: this.extractTransferDestinationFeature(transferData.destination, baselineProfile.destinations),
      timeOfDay: this.extractTimeOfDayFeature(transferData.timestamp, baselineProfile.times),
      frequency: this.extractTransferFrequencyFeature(transferData.userId, baselineProfile.frequencies),
      fileTypes: this.extractFileTypesFeature(transferData.fileTypes, baselineProfile.fileTypes)
    };
    
    // Calculate anomaly score
    const model = this.models.dataExfiltration;
    let anomalyScore = 0;
    
    for (const [feature, value] of Object.entries(features)) {
      anomalyScore += value * model.weights[feature];
    }
    
    // Determine if anomalous
    const isAnomalous = anomalyScore >= this.thresholds.dataExfiltration;
    
    return {
      isAnomalous,
      anomalyScore,
      featureScores: features,
      timestamp: new Date(),
      eventType: 'data_transfer',
      userId: transferData.userId,
      details: {
        size: transferData.size,
        destination: transferData.destination,
        fileTypes: transferData.fileTypes,
        timestamp: new Date(transferData.timestamp)
      }
    };
  }

  /**
   * Correlate multiple analysis results to identify complex threats
   * @param {Array} analysisResults - Multiple analysis results
   * @returns {Object} - Correlated threat assessment
   */
  correlateThreatIndicators(analysisResults) {
    if (!this.initialized) {
      throw new Error('Advanced Threat Analytics Service not initialized');
    }
    
    if (!analysisResults || analysisResults.length === 0) {
      return {
        isThreat: false,
        threatScore: 0,
        confidence: 0
      };
    }
    
    // Count anomalous results
    const anomalousResults = analysisResults.filter(result => result.isAnomalous);
    const anomalyPercentage = anomalousResults.length / analysisResults.length;
    
    // Calculate average anomaly score
    const averageScore = analysisResults.reduce((acc, result) => acc + result.anomalyScore, 0) / analysisResults.length;
    
    // Calculate threat score based on anomaly percentage and average score
    const threatScore = (anomalyPercentage * 0.6) + (averageScore * 0.4);
    
    // Calculate confidence based on number of results
    const confidence = Math.min(0.5 + (analysisResults.length * 0.05), 0.95);
    
    // Determine if this is a threat
    const isThreat = threatScore >= 0.7;
    
    // Determine threat type
    let threatType = 'Unknown';
    if (isThreat) {
      const eventTypes = analysisResults.map(result => result.eventType);
      
      if (eventTypes.includes('login') && eventTypes.includes('data_transfer')) {
        threatType = 'Potential Account Compromise and Data Exfiltration';
      } else if (eventTypes.includes('login')) {
        threatType = 'Potential Account Compromise';
      } else if (eventTypes.includes('data_transfer')) {
        threatType = 'Potential Data Exfiltration';
      } else if (eventTypes.includes('network')) {
        threatType = 'Suspicious Network Activity';
      }
    }
    
    return {
      isThreat,
      threatScore,
      confidence,
      threatType,
      anomalousResultsCount: anomalousResults.length,
      totalResultsCount: analysisResults.length,
      timestamp: new Date(),
      details: {
        analysisResults
      }
    };
  }

  // Feature extraction helper methods
  
  extractTimeFeature(timestamp, baseline) {
    // Simplified time analysis
    const loginTime = new Date(timestamp).getHours();
    
    // If we have no baseline, use moderate anomaly score
    if (!baseline || baseline.length === 0) {
      return 0.5;
    }
    
    // Calculate how often the user logs in at this hour
    const frequency = baseline.filter(time => {
      const hour = new Date(time).getHours();
      return Math.abs(hour - loginTime) <= 1; // Within 1 hour window
    }).length / baseline.length;
    
    // Inverse the frequency to get anomaly score (rare times are more anomalous)
    return Math.max(0, 1 - frequency);
  }
  
  extractLocationFeature(location, baseline) {
    if (!baseline || baseline.length === 0 || !location) {
      return 0.5;
    }
    
    // Check if this location has been seen before
    const knownLocation = baseline.some(loc => loc === location);
    
    // If known location, low anomaly score, else high
    return knownLocation ? 0.1 : 0.9;
  }
  
  extractDeviceFeature(device, baseline) {
    if (!baseline || baseline.length === 0 || !device) {
      return 0.5;
    }
    
    // Check if this device has been seen before
    const knownDevice = baseline.some(d => d === device);
    
    // If known device, low anomaly score, else high
    return knownDevice ? 0.2 : 0.8;
  }
  
  extractUserAgentFeature(userAgent, baseline) {
    if (!baseline || baseline.length === 0 || !userAgent) {
      return 0.5;
    }
    
    // Check if this user agent has been seen before
    const knownUserAgent = baseline.some(ua => ua === userAgent);
    
    // If known user agent, low anomaly score, else medium-high
    return knownUserAgent ? 0.2 : 0.7;
  }
  
  extractIPFeature(ipAddress, baseline) {
    if (!baseline || baseline.length === 0 || !ipAddress) {
      return 0.5;
    }
    
    // Check if this IP address has been seen before
    const knownIP = baseline.some(ip => ip === ipAddress);
    
    // If known IP, low anomaly score, else high
    return knownIP ? 0.2 : 0.9;
  }
  
  extractVolumeFeature(volume, baseline) {
    if (!baseline || baseline.length === 0 || volume === undefined) {
      return 0.5;
    }
    
    // Calculate average and standard deviation
    const avg = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
    const stdDev = Math.sqrt(
      baseline.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / baseline.length
    );
    
    // Calculate z-score
    const zScore = Math.abs((volume - avg) / (stdDev || 1));
    
    // Convert z-score to anomaly score (0-1)
    return Math.min(zScore / 3, 1);
  }
  
  extractDestinationsFeature(destinations, baseline) {
    if (!baseline || !destinations || destinations.length === 0) {
      return 0.5;
    }
    
    // Calculate percentage of unknown destinations
    const unknownCount = destinations.filter(
      dest => !baseline.includes(dest)
    ).length;
    
    return unknownCount / destinations.length;
  }
  
  extractProtocolsFeature(protocols, baseline) {
    if (!baseline || !protocols || protocols.length === 0) {
      return 0.5;
    }
    
    // Calculate percentage of unusual protocols
    const unusualCount = protocols.filter(
      protocol => !baseline.includes(protocol)
    ).length;
    
    return unusualCount / protocols.length;
  }
  
  extractTimePeriodFeature(timestamp, baseline) {
    // Similar to extractTimeFeature but for network activity
    return this.extractTimeFeature(timestamp, baseline);
  }
  
  extractFrequencyFeature(frequency, baseline) {
    if (!baseline || baseline.length === 0 || frequency === undefined) {
      return 0.5;
    }
    
    // Calculate anomaly based on how much this frequency deviates from baseline
    const avg = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
    const ratio = frequency / avg;
    
    // If frequency is much higher than average, it's anomalous
    if (ratio > 2) {
      return Math.min((ratio - 2) / 8, 1); // Cap at 10x frequency
    }
    
    return 0.2; // Low anomaly for normal or below-normal frequency
  }
  
  extractDataSizeFeature(size, baseline) {
    if (!baseline || baseline.length === 0 || size === undefined) {
      return 0.5;
    }
    
    // Similar to volume feature but for data transfers
    return this.extractVolumeFeature(size, baseline);
  }
  
  extractTransferDestinationFeature(destination, baseline) {
    if (!baseline || !destination) {
      return 0.5;
    }
    
    // Check if destination is known
    const knownDestination = baseline.includes(destination);
    
    return knownDestination ? 0.2 : 0.9;
  }
  
  extractTimeOfDayFeature(timestamp, baseline) {
    // Similar to time feature for login
    return this.extractTimeFeature(timestamp, baseline);
  }
  
  extractTransferFrequencyFeature(userId, baseline) {
    if (!baseline || !baseline[userId]) {
      return 0.5;
    }
    
    // Count recent transfers (last hour)
    const now = Date.now();
    const recentTransfers = baseline[userId].filter(
      time => now - time < 3600000 // Within last hour
    ).length;
    
    // More than 5 transfers in an hour is increasingly suspicious
    if (recentTransfers > 5) {
      return Math.min((recentTransfers - 5) / 15, 1); // Cap at 20 transfers
    }
    
    return 0.2; // Low anomaly for normal frequency
  }
  
  extractFileTypesFeature(fileTypes, baseline) {
    if (!baseline || !fileTypes || fileTypes.length === 0) {
      return 0.5;
    }
    
    // Calculate percentage of unusual file types
    const unusualCount = fileTypes.filter(
      type => !baseline.includes(type)
    ).length;
    
    return unusualCount / fileTypes.length;
  }
}

module.exports = new AdvancedThreatAnalyticsService();
