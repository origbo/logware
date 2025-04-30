/**
 * Automated Response Service
 * Handles automated responses to security incidents and anomalies
 */
const crypto = require('crypto');
const logger = require('../utils/logger');
const mlAnomalyDetectionService = require('./mlAnomalyDetectionService');

class AutomatedResponseService {
  constructor() {
    this.responseRules = [
      {
        id: 'rule-001',
        name: 'Critical Anomaly Auto-Response',
        description: 'Automatically respond to critical severity anomalies',
        conditions: {
          anomalySeverity: ['critical'],
          anomalyTypes: ['*']
        },
        actions: ['lockAccount', 'notifyAdmin', 'createIncident'],
        enabled: true
      },
      {
        id: 'rule-002',
        name: 'Unusual Login Location Response',
        description: 'Respond to unusual login locations',
        conditions: {
          anomalySeverity: ['high', 'critical'],
          anomalyTypes: ['unusual_location']
        },
        actions: ['requireMFA', 'notifyUser', 'createIncident'],
        enabled: true
      },
      {
        id: 'rule-003',
        name: 'Data Exfiltration Response',
        description: 'Respond to potential data exfiltration',
        conditions: {
          anomalySeverity: ['medium', 'high', 'critical'],
          anomalyTypes: ['data_exfiltration']
        },
        actions: ['blockIP', 'createIncident', 'notifyAdmin'],
        enabled: true
      },
      {
        id: 'rule-004',
        name: 'Brute Force Login Response',
        description: 'Respond to excessive failed login attempts',
        conditions: {
          anomalySeverity: ['medium', 'high'],
          anomalyTypes: ['excessive_failed_attempts']
        },
        actions: ['tempLockAccount', 'notifyUser'],
        enabled: true
      },
      {
        id: 'rule-005',
        name: 'Privilege Escalation Response',
        description: 'Respond to privilege escalation attempts',
        conditions: {
          anomalySeverity: ['high', 'critical'],
          anomalyTypes: ['privilege_escalation']
        },
        actions: ['revokePrivileges', 'createIncident', 'notifyAdmin'],
        enabled: true
      }
    ];
    
    this.executedResponses = [];
    logger.info('Automated Response Service initialized');
  }
  
  /**
   * Process an anomaly and trigger responses based on rules
   * @param {Object} anomaly - The detected anomaly
   * @returns {Array} - Executed response actions
   */
  processAnomaly(anomaly) {
    logger.info(`Processing anomaly for automated response: ${anomaly.id}`);
    
    const matchingRules = this._findMatchingRules(anomaly);
    
    if (matchingRules.length === 0) {
      logger.info(`No matching rules found for anomaly: ${anomaly.id}`);
      return [];
    }
    
    const executedActions = [];
    
    // Execute actions for each matching rule
    for (const rule of matchingRules) {
      logger.info(`Executing rule ${rule.name} for anomaly ${anomaly.id}`);
      
      for (const actionType of rule.actions) {
        const actionResult = this._executeAction(actionType, anomaly, rule);
        executedActions.push(actionResult);
        
        // Record executed response
        this.executedResponses.push({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          anomalyId: anomaly.id,
          ruleId: rule.id,
          ruleName: rule.name,
          actionType: actionType,
          actionResult: actionResult,
          status: 'completed'
        });
      }
    }
    
    return executedActions;
  }
  
  /**
   * Get list of all response rules
   * @returns {Array} - List of response rules
   */
  getRules() {
    return this.responseRules;
  }
  
  /**
   * Get rule by ID
   * @param {String} ruleId - Rule ID
   * @returns {Object} - Rule object
   */
  getRuleById(ruleId) {
    return this.responseRules.find(rule => rule.id === ruleId);
  }
  
  /**
   * Update an existing rule
   * @param {String} ruleId - Rule ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} - Updated rule
   */
  updateRule(ruleId, updates) {
    const ruleIndex = this.responseRules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }
    
    const updatedRule = { 
      ...this.responseRules[ruleIndex],
      ...updates
    };
    
    this.responseRules[ruleIndex] = updatedRule;
    logger.info(`Updated rule: ${updatedRule.name}`);
    
    return updatedRule;
  }
  
  /**
   * Create a new rule
   * @param {Object} rule - New rule object
   * @returns {Object} - Created rule
   */
  createRule(rule) {
    const newRule = {
      id: rule.id || `rule-${crypto.randomUUID().substring(0, 8)}`,
      ...rule
    };
    
    this.responseRules.push(newRule);
    logger.info(`Created new rule: ${newRule.name}`);
    
    return newRule;
  }
  
  /**
   * Delete a rule
   * @param {String} ruleId - Rule ID
   * @returns {Boolean} - Success
   */
  deleteRule(ruleId) {
    const initialLength = this.responseRules.length;
    this.responseRules = this.responseRules.filter(rule => rule.id !== ruleId);
    
    const deleted = this.responseRules.length < initialLength;
    
    if (deleted) {
      logger.info(`Deleted rule: ${ruleId}`);
    } else {
      logger.warn(`Rule not found for deletion: ${ruleId}`);
    }
    
    return deleted;
  }
  
  /**
   * Get recent automated responses
   * @param {Number} limit - Maximum number of responses
   * @returns {Array} - Recent responses
   */
  getRecentResponses(limit = 20) {
    return this.executedResponses
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Generate mock responses for testing
   * @param {Number} count - Number of responses to generate
   * @returns {Array} - Generated responses
   */
  generateMockResponses(count = 10) {
    // Get mock anomalies
    const anomalies = mlAnomalyDetectionService.generateMockAnomalies(count);
    
    // Process each anomaly
    const responses = [];
    
    for (const anomaly of anomalies) {
      const matchingRules = this._findMatchingRules(anomaly);
      
      if (matchingRules.length > 0) {
        // Pick a random matching rule
        const rule = matchingRules[Math.floor(Math.random() * matchingRules.length)];
        
        // Pick a random action from the rule
        const actionType = rule.actions[Math.floor(Math.random() * rule.actions.length)];
        
        // Generate mock response
        responses.push({
          id: crypto.randomUUID(),
          timestamp: new Date(anomaly.timestamp + Math.floor(Math.random() * 10 * 60 * 1000)), // 0-10 minutes after anomaly
          anomalyId: anomaly.id,
          anomalyType: anomaly.type,
          anomalySeverity: anomaly.severity,
          username: anomaly.username,
          ruleId: rule.id,
          ruleName: rule.name,
          actionType: actionType,
          actionResult: this._getMockActionResult(actionType, anomaly),
          status: Math.random() > 0.1 ? 'completed' : 'failed' // 10% chance of failure
        });
      }
    }
    
    return responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  // Private helper methods
  
  /**
   * Find rules matching an anomaly
   * @param {Object} anomaly - The anomaly
   * @returns {Array} - Matching rules
   */
  _findMatchingRules(anomaly) {
    return this.responseRules.filter(rule => {
      // Skip disabled rules
      if (!rule.enabled) return false;
      
      // Check severity condition
      const severityMatch = rule.conditions.anomalySeverity.includes(anomaly.severity) ||
                           rule.conditions.anomalySeverity.includes('*');
      
      // Check type condition
      const typeMatch = rule.conditions.anomalyTypes.includes(anomaly.type) ||
                        rule.conditions.anomalyTypes.includes('*');
      
      return severityMatch && typeMatch;
    });
  }
  
  /**
   * Execute a response action
   * @param {String} actionType - Type of action
   * @param {Object} anomaly - The anomaly
   * @param {Object} rule - The triggered rule
   * @returns {Object} - Result of the action
   */
  _executeAction(actionType, anomaly, rule) {
    // In a real system, these would call actual APIs or services
    // For demo purposes, we'll just log the action and return a mock result
    
    logger.info(`Executing action ${actionType} for anomaly ${anomaly.id}`);
    
    const actionStartTime = new Date();
    const result = {
      actionType,
      success: Math.random() > 0.05, // 5% chance of failure
      timestamp: actionStartTime,
      duration: Math.floor(Math.random() * 1000) + 500, // 500-1500ms
      details: {}
    };
    
    switch (actionType) {
      case 'lockAccount':
        result.details = {
          message: `Locked account for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          lockDuration: 'permanent',
          unlockRequiresAdmin: true
        };
        break;
        
      case 'tempLockAccount':
        result.details = {
          message: `Temporarily locked account for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          lockDuration: '30 minutes',
          unlockRequiresAdmin: false
        };
        break;
        
      case 'notifyAdmin':
        result.details = {
          message: `Notified administrator of ${anomaly.severity} anomaly`,
          notificationChannel: 'email',
          recipients: ['security-admin@example.com'],
          alertLevel: anomaly.severity
        };
        break;
        
      case 'notifyUser':
        result.details = {
          message: `Notified user ${anomaly.username} of security issue`,
          userId: anomaly.userId,
          username: anomaly.username,
          notificationChannel: 'email',
          alertLevel: anomaly.severity
        };
        break;
        
      case 'createIncident':
        result.details = {
          message: `Created security incident for ${anomaly.severity} anomaly`,
          incidentId: `INC-${Math.floor(Math.random() * 10000)}`,
          severity: anomaly.severity,
          assignedTo: 'security-team',
          status: 'open'
        };
        break;
        
      case 'requireMFA':
        result.details = {
          message: `Enabled mandatory MFA for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          mfaMethod: 'app-based'
        };
        break;
        
      case 'blockIP':
        const ip = anomaly.details?.ipAddress || 
                  (anomaly.type === 'data_exfiltration' ? anomaly.details?.destination : '0.0.0.0');
        result.details = {
          message: `Blocked suspicious IP address ${ip}`,
          ipAddress: ip,
          blockDuration: '24 hours',
          blockLevel: 'firewall'
        };
        break;
        
      case 'revokePrivileges':
        result.details = {
          message: `Revoked elevated privileges for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          privileges: ['admin', 'superuser'],
          newRoles: ['basic_user']
        };
        break;
        
      default:
        result.details = {
          message: `Executed ${actionType} action`,
          status: 'completed'
        };
    }
    
    return result;
  }
  
  /**
   * Get mock action result for testing
   * @param {String} actionType - Type of action
   * @param {Object} anomaly - The anomaly
   * @returns {Object} - Mock result
   */
  _getMockActionResult(actionType, anomaly) {
    const actionStartTime = new Date(anomaly.timestamp);
    actionStartTime.setSeconds(actionStartTime.getSeconds() + Math.floor(Math.random() * 30));
    
    const result = {
      success: Math.random() > 0.05, // 5% chance of failure
      timestamp: actionStartTime,
      duration: Math.floor(Math.random() * 1000) + 500, // 500-1500ms
      details: {}
    };
    
    switch (actionType) {
      case 'lockAccount':
        result.details = {
          message: `Locked account for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          lockDuration: 'permanent',
          unlockRequiresAdmin: true
        };
        break;
        
      case 'tempLockAccount':
        result.details = {
          message: `Temporarily locked account for user ${anomaly.username}`,
          userId: anomaly.userId,
          username: anomaly.username,
          lockDuration: '30 minutes',
          unlockRequiresAdmin: false
        };
        break;
        
      case 'notifyAdmin':
        result.details = {
          message: `Notified administrator of ${anomaly.severity} anomaly`,
          notificationChannel: 'email',
          recipients: ['security-admin@example.com'],
          alertLevel: anomaly.severity
        };
        break;
        
      case 'notifyUser':
        result.details = {
          message: `Notified user ${anomaly.username} of security issue`,
          userId: anomaly.userId,
          username: anomaly.username,
          notificationChannel: 'email',
          alertLevel: anomaly.severity
        };
        break;
        
      case 'createIncident':
        result.details = {
          message: `Created security incident for ${anomaly.severity} anomaly`,
          incidentId: `INC-${Math.floor(Math.random() * 10000)}`,
          severity: anomaly.severity,
          assignedTo: 'security-team',
          status: 'open'
        };
        break;
        
      default:
        result.details = {
          message: `Executed ${actionType} action`,
          status: 'completed'
        };
    }
    
    return result;
  }
}

module.exports = new AutomatedResponseService();
