/**
 * Security Analytics - Anomaly Detection
 * Detects unusual patterns in security events using ML and statistical analysis
 */
/**
 * Anomaly Detection Service - Mock Implementation
 * Simplified version for the demonstration
 */
const mongoose = require('../../utils/mockModels');
const logger = require('../../utils/logger');
const SecurityEvent = mongoose.model('SecurityEvent');
const notificationService = require('../notificationService');
const incidentResponseService = require('../incidentResponseService');
const mlService = require('./mlService');
const behavioralAnalytics = require('./behavioralAnalytics');

class AnomalyDetection {
  constructor() {
    // Track initialization state
    this.initialized = false;
  }

  /**
   * Initialize anomaly detection models
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Create default models if needed
      await mlService.createDefaultModels();
      
      // Initialize ML models
      await mlService.initializeModels();
      
      // Initialize behavioral analytics
      await behavioralAnalytics.initialize();
      
      this.initialized = true;
      logger.info('Anomaly detection module initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize anomaly detection module: ${error.message}`);
    }
  }

  /**
   * Analyze an event for anomalies
   * @param {Object} event - Security event to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeEvent(event) {
    try {
      // Ensure module is initialized
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Analyzing event ${event._id || 'new'} for anomalies`);
      
      // First try ML-based analysis
      let analysis = await this.performMlAnalysis(event);
      
      // Fall back to heuristic analysis if ML failed or returned low confidence
      if (!analysis || analysis.confidence < 0.3) {
        logger.debug('ML analysis failed or has low confidence, using heuristic analysis');
        analysis = await this.performHeuristicAnalysis(event);
      } else {
        logger.debug(`ML analysis succeeded with score ${analysis.anomalyScore}`);
      }
      
      // Enhance with behavioral analytics
      const behavioralResults = await this.performBehavioralAnalysis(event);
      if (behavioralResults) {
        // Incorporate behavioral insights
        analysis.behavioralScore = behavioralResults.behavioralScore;
        analysis.behavioralReasons = behavioralResults.reasons;
        
        // Adjust the overall anomaly score if behavioral analysis detected significant anomalies
        if (behavioralResults.behavioralScore > 60 && analysis.anomalyScore < behavioralResults.behavioralScore) {
          // Calculate weighted score with higher emphasis on behavioral score when it's high
          const weight = behavioralResults.behavioralScore > 80 ? 0.6 : 0.4;
          analysis.anomalyScore = Math.round(analysis.anomalyScore * (1 - weight) + behavioralResults.behavioralScore * weight);
          
          // Add behavioral reasons to the main reasons list
          analysis.reasons = [...analysis.reasons, ...behavioralResults.reasons.map(r => `Behavioral: ${r}`)];
          logger.debug(`Anomaly score adjusted to ${analysis.anomalyScore} based on behavioral analysis`);
        }
      }
      
      // Add analysis timestamp
      analysis.analyzedAt = new Date();
      
      // Determine event status based on anomaly score
      if (analysis.anomalyScore >= 80) {
        event.status = 'threat';
      } else if (analysis.anomalyScore >= 60) {
        event.status = 'suspicious';
      } else {
        event.status = 'normal';
      }
      
      // Update event with analysis results if it's already saved
      if (event._id) {
        await SecurityEvent.findByIdAndUpdate(event._id, {
          status: event.status,
          analysis
        });
      } else {
        event.analysis = analysis;
      }
      
      // Take action based on anomaly score
      await this.takeAction(event, analysis);
      
      return {
        success: true,
        eventId: event._id,
        analysis
      };
    } catch (error) {
      logger.error(`Error analyzing event for anomalies: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Perform ML-based analysis of an event
   * @param {Object} event - Security event
   * @returns {Promise<Object>} Analysis results
   */
  async performMlAnalysis(event) {
    try {
      // Analyze event using ML Service
      return await mlService.analyzeEvent(event);
    } catch (error) {
      logger.error(`Error in ML analysis: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Perform behavioral analysis of an event
   * @param {Object} event - Security event
   * @returns {Promise<Object>} Behavioral analysis results
   */
  async performBehavioralAnalysis(event) {
    try {
      // Skip behavioral analysis for events without user information
      if (!event.user || !event.user.id) {
        return null;
      }
      
      // Analyze event using behavioral analytics
      return await behavioralAnalytics.analyzeEvent(event);
    } catch (error) {
      logger.error(`Error in behavioral analysis: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Perform heuristic (rule-based) analysis of an event
   * @param {Object} event - Security event
   * @returns {Promise<Object>} Analysis results
   */
  async performHeuristicAnalysis(event) {
    try {
      // Calculate anomaly score based on various factors
      const anomalyScore = await this.calculateHeuristicScore(event);
      
      // Get anomaly reasons
      const reasons = await this.getAnomalyReasons(event, anomalyScore);
      
      return {
        anomalyScore,
        reasons,
        confidence: 0.5, // Medium confidence for heuristic analysis
        models: [{ id: 'heuristic', name: 'Heuristic Analysis', score: anomalyScore }]
      };
    } catch (error) {
      logger.error(`Error in heuristic analysis: ${error.message}`);
      return {
        anomalyScore: 0,
        reasons: [`Error during analysis: ${error.message}`],
        confidence: 0.1,
        models: [{ id: 'heuristic', name: 'Heuristic Analysis (Error)', score: 0 }]
      };
    }
  }
  
  /**
   * Calculate anomaly score using heuristic rules
   * @param {Object} event - Security event
   * @returns {Promise<number>} Anomaly score (0-100)
   */
  async calculateHeuristicScore(event) {
    // This is a rule-based implementation that serves as a fallback
    // when ML models aren't available or applicable
    let score = 0;
    
    // Basic factors
    
    // Factor 1: Event severity
    if (event.severity === 'critical') {
      score += 40;
    } else if (event.severity === 'high') {
      score += 30;
    } else if (event.severity === 'medium') {
      score += 15;
    } else if (event.severity === 'low') {
      score += 5;
    }
    
    // Factor 2: Time of day
    const hour = new Date(event.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      // Outside normal business hours
      score += 15;
    }
    
    // Factor 3: Repeated events
    if (event.user && event.user.id) {
      // Check for repeated events from the same user
      const userEventCount = await SecurityEvent.countDocuments({
        'user.id': event.user.id,
        timestamp: {
          $gte: new Date(Date.now() - (60 * 60 * 1000)) // Last hour
        }
      });
      
      if (userEventCount > 10) {
        score += 20;
      }
    }
    
    // Factor 4: Category-specific checks
    switch (event.category) {
      case 'authentication':
        // Check for failed login attempts
        if (event.auth && event.auth.success === false) {
          score += 15;
          
          // Multiple failed attempts
          if (event.auth.failedAttempts && event.auth.failedAttempts > 3) {
            score += 25;
          }
        }
        break;
        
      case 'network':
        // Check for unusual ports or protocols
        if (event.network) {
          if (event.network.destinationPort && 
              [22, 23, 3389, 445, 1433, 3306, 5432].includes(event.network.destinationPort)) {
            // Common targeted ports
            score += 15;
          }
          
          // Large data transfers
          if (event.network.bytes && event.network.bytes > 10000000) {
            score += 20;
          }
        }
        break;
        
      case 'malware':
        // Malware events are always highly suspicious
        score += 50;
        break;
        
      case 'access':
        // Check for access to sensitive resources
        if (event.access && event.access.resource && 
            event.access.resource.sensitivity === 'high') {
          score += 25;
        }
        break;
        
      case 'data_access':
        // Check for unusual data access patterns
        if (event.dataAccess) {
          if (event.dataAccess.recordsAccessed && event.dataAccess.recordsAccessed > 100) {
            score += 20;
          }
          
          if (event.dataAccess.sensitiveDataAccess) {
            score += 30;
          }
        }
        break;
    }
    
    // Cap the score at 100
    return Math.min(score, 100);
  }
  
  /**
   * Get reasons for anomaly score from heuristic analysis
   * @param {Object} event - Security event
   * @param {number} score - Anomaly score
   * @returns {Promise<Array<string>>} Reasons for the anomaly score
   */
  async getAnomalyReasons(event, score) {
    const reasons = [];
    
    // Check each factor and add corresponding reason
    
    // Severity
    if (event.severity === 'critical' || event.severity === 'high') {
      reasons.push(`High severity event: ${event.severity}`);
    }
    
    // Time of day
    const hour = new Date(event.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      reasons.push(`Event occurred outside normal hours (${hour}:00)`);
    }
    
    // Category-specific reasons
    switch (event.category) {
      case 'authentication':
        if (event.auth && event.auth.success === false) {
          reasons.push('Failed authentication attempt');
          
          if (event.auth.failedAttempts && event.auth.failedAttempts > 3) {
            reasons.push(`Multiple failed authentication attempts: ${event.auth.failedAttempts}`);
          }
        }
        break;
        
      case 'network':
        if (event.network) {
          if (event.network.destinationPort && 
              [22, 23, 3389, 445, 1433, 3306, 5432].includes(event.network.destinationPort)) {
            reasons.push(`Connection to sensitive port: ${event.network.destinationPort}`);
          }
          
          if (event.network.bytes && event.network.bytes > 10000000) {
            reasons.push(`Large data transfer: ${(event.network.bytes / 1000000).toFixed(2)} MB`);
          }
        }
        break;
        
      case 'malware':
        reasons.push('Malware detection event');
        break;
        
      case 'access':
        if (event.access && event.access.resource && 
            event.access.resource.sensitivity === 'high') {
          reasons.push('Access to highly sensitive resource');
        }
        break;
        
      case 'data_access':
        if (event.dataAccess) {
          if (event.dataAccess.recordsAccessed && event.dataAccess.recordsAccessed > 100) {
            reasons.push(`High volume of records accessed: ${event.dataAccess.recordsAccessed}`);
          }
          
          if (event.dataAccess.sensitiveDataAccess) {
            reasons.push('Access to sensitive data detected');
          }
        }
        break;
    }
    
    // Check for pattern detection
    const isPartOfPattern = await this.checkForPatterns(event);
    if (isPartOfPattern) {
      reasons.push('Part of a suspected attack pattern');
    }
    
    return reasons;
  }
  
  /**
   * Check if event is part of a known attack pattern
   * @param {Object} event - Security event
   * @returns {Promise<boolean>} True if part of a pattern
   */
  async checkForPatterns(event) {
    try {
      // This would involve more complex pattern matching
      // For now, we'll implement a simplified version
      
      // Example: Check for potential brute force attack
      if (event.category === 'authentication' && 
          event.auth && event.auth.success === false) {
        
        // Look for multiple failed auth attempts from same source
        const recentAttempts = await SecurityEvent.countDocuments({
          category: 'authentication',
          'auth.success': false,
          'network.srcIp': event.network?.srcIp,
          timestamp: { 
            $gte: new Date(Date.now() - 1 * 60 * 60 * 1000) // Last hour
          }
        });
        
        // If more than 10 failed attempts in an hour, consider it part of a pattern
        return recentAttempts >= 10;
      }
      
      return false;
    } catch (error) {
      logger.error(`Error checking for patterns: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Take action based on anomaly detection results
   * @param {Object} event - Security event
   * @param {Object} analysis - Analysis results
   */
  async takeAction(event, analysis) {
    try {
      const anomalyScore = analysis.anomalyScore;
      const hasBehavioralAlert = analysis.behavioralScore && analysis.behavioralScore >= 70;
      
      // For high anomaly scores, create an incident
      if (anomalyScore >= 80) {
        // Prepare behavioral details if available
        let behavioralDetails = '';
        if (analysis.behavioralScore) {
          behavioralDetails = `\n\nBehavioral Analysis Score: ${analysis.behavioralScore}\n` +
                         `Behavioral Reasons: ${analysis.behavioralReasons?.join('\n') || 'None'}\n`;
        }
        
        // Create a security incident
        await incidentResponseService.createIncident({
          title: `High anomaly detected: ${event.eventType || event.category}${hasBehavioralAlert ? ' (Behavioral)' : ''}`,
          description: `Security event with anomaly score ${anomalyScore} detected.\n\n` +
                       `Reasons: ${analysis.reasons?.join('\n') || 'Unknown'}` + 
                       behavioralDetails +
                       `\n\nEvent details: ${JSON.stringify(event, null, 2)}`,
          type: hasBehavioralAlert ? 'abnormal_behavior' : 'suspicious_activity',
          severity: anomalyScore >= 90 ? 'critical' : 'high',
          source: 'automated',
          affectedSystems: event.host?.hostname ? [event.host.hostname] : [],
          affectedUsers: event.user?.id ? [event.user.id] : []
        });
        
        // Send immediate notification
        await notificationService.notifyAdmins({
          title: `Critical Security Anomaly Detected${hasBehavioralAlert ? ' - Unusual User Behavior' : ''}`,
          message: `A security event with anomaly score ${anomalyScore} was detected. ` +
                  `${hasBehavioralAlert ? 'Unusual user behavior detected. ' : ''}` +
                  `Review the incident for details.`,
          severity: 'critical'
        });
      } 
      // For medium anomaly scores, send notification only
      else if (anomalyScore >= 60) {
        await notificationService.notifyAdmins({
          title: `Security Anomaly Detected${hasBehavioralAlert ? ' - Behavior Change' : ''}`,
          message: `A security event with anomaly score ${anomalyScore} was detected. ` +
                  `${hasBehavioralAlert ? `Behavioral analysis score: ${analysis.behavioralScore}. ` : ''}` +
                  `Top reasons: ${(analysis.reasons || []).slice(0, 3).join(', ')}`,
          severity: 'high'
        });
      }
      
      // For high behavioral scores but lower overall scores, still notify
      else if (analysis.behavioralScore && analysis.behavioralScore >= 75 && anomalyScore < 60) {
        await notificationService.notifyAdmins({
          title: 'Unusual User Behavior Detected',
          message: `User ${event.user?.name || event.user?.id || 'Unknown'} is exhibiting unusual behavior ` +
                  `(score: ${analysis.behavioralScore}). ` +
                  `Reasons: ${(analysis.behavioralReasons || []).slice(0, 2).join(', ')}`,
          severity: 'medium'
        });
      }
    } catch (error) {
      logger.error(`Error taking action on anomaly: ${error.message}`);
    }
  }
  
  /**
   * Analyze a batch of events
   * @param {Array} events - Array of security events
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeBatch(events) {
    try {
      // Ensure module is initialized
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Batch analyzing ${events.length} events`);
      
      const results = [];
      let processedCount = 0;
      
      // Process events in smaller batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        // Process each event in the batch
        const batchPromises = batch.map(event => this.analyzeEvent(event));
        const batchResults = await Promise.all(batchPromises);
        
        results.push(...batchResults);
        
        processedCount += batch.length;
        logger.debug(`Processed ${processedCount}/${events.length} events`);
      }
      
      return {
        success: true,
        processed: processedCount,
        results
      };
    } catch (error) {
      logger.error(`Error batch analyzing events: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AnomalyDetection();