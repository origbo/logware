/**
 * Machine Learning Anomaly Detection Service
 * Simulates ML-based anomaly detection for security analytics
 */
const crypto = require('crypto');
const logger = require('../utils/logger');

class MLAnomalyDetectionService {
  constructor() {
    this.modelTypes = {
      USER_BEHAVIOR: 'user_behavior',
      NETWORK_TRAFFIC: 'network_traffic',
      RESOURCE_ACCESS: 'resource_access',
      AUTH_EVENTS: 'auth_events'
    };
    
    this.anomalyTypes = {
      UNUSUAL_LOGIN_TIME: 'unusual_login_time',
      UNUSUAL_LOCATION: 'unusual_location',
      EXCESSIVE_FAILED_ATTEMPTS: 'excessive_failed_attempts',
      DATA_EXFILTRATION: 'data_exfiltration',
      PRIVILEGE_ESCALATION: 'privilege_escalation',
      UNUSUAL_PROCESS: 'unusual_process',
      LATERAL_MOVEMENT: 'lateral_movement'
    };
    
    // Initialize baseline data (would be loaded from persistent storage in production)
    this.userBaselines = new Map();
    this.networkBaselines = new Map();
    this.recentAnomalies = [];
    
    logger.info('ML Anomaly Detection Service initialized');
  }
  
  /**
   * Detect anomalies in user login behavior
   * @param {Object} loginEvent - User login event data
   * @returns {Array} - Detected anomalies, if any
   */
  detectLoginAnomalies(loginEvent) {
    const anomalies = [];
    const userId = loginEvent.userId;
    
    // Get or create user baseline
    if (!this.userBaselines.has(userId)) {
      this.userBaselines.set(userId, this._createInitialUserBaseline(loginEvent));
      return anomalies; // No anomalies for first login
    }
    
    const baseline = this.userBaselines.get(userId);
    
    // Check time anomaly (simple rule-based check for demo)
    if (this._isUnusualLoginTime(loginEvent.timestamp, baseline.loginTimes)) {
      const anomaly = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: userId,
        username: loginEvent.username,
        type: this.anomalyTypes.UNUSUAL_LOGIN_TIME,
        severity: 'medium',
        confidence: 0.78,
        details: {
          expected: this._formatTimeRanges(baseline.loginTimes),
          actual: new Date(loginEvent.timestamp).toLocaleTimeString(),
          location: loginEvent.location
        }
      };
      
      anomalies.push(anomaly);
      this.recentAnomalies.push(anomaly);
    }
    
    // Check location anomaly
    if (this._isUnusualLocation(loginEvent.location, baseline.locations)) {
      const anomaly = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: userId,
        username: loginEvent.username,
        type: this.anomalyTypes.UNUSUAL_LOCATION,
        severity: 'high',
        confidence: 0.85,
        details: {
          expected: baseline.locations.join(', '),
          actual: loginEvent.location,
          ipAddress: loginEvent.ipAddress
        }
      };
      
      anomalies.push(anomaly);
      this.recentAnomalies.push(anomaly);
    }
    
    // Update user baseline with this login
    this._updateUserBaseline(userId, loginEvent);
    
    // Cap recent anomalies list size
    if (this.recentAnomalies.length > 100) {
      this.recentAnomalies = this.recentAnomalies.slice(-100);
    }
    
    return anomalies;
  }
  
  /**
   * Detect network traffic anomalies
   * @param {Object} trafficData - Network traffic data
   * @returns {Array} - Detected anomalies, if any
   */
  detectNetworkAnomalies(trafficData) {
    const anomalies = [];
    
    // Simulate ML detection logic
    if (trafficData.bytesOut > 500000000 && trafficData.destination.includes('external')) {
      const anomaly = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        sourceIp: trafficData.sourceIp,
        userId: trafficData.userId,
        type: this.anomalyTypes.DATA_EXFILTRATION,
        severity: 'critical',
        confidence: 0.92,
        details: {
          bytesTransferred: trafficData.bytesOut,
          destination: trafficData.destination,
          protocol: trafficData.protocol,
          duration: trafficData.duration
        }
      };
      
      anomalies.push(anomaly);
      this.recentAnomalies.push(anomaly);
    }
    
    return anomalies;
  }
  
  /**
   * Get recent anomalies
   * @param {Number} limit - Maximum number of anomalies to return
   * @returns {Array} - Recent anomalies
   */
  getRecentAnomalies(limit = 10) {
    return this.recentAnomalies
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Generate mock anomalies for demo purposes
   * @param {Number} count - Number of anomalies to generate
   * @returns {Array} - Generated anomalies
   */
  generateMockAnomalies(count = 10) {
    const anomalies = [];
    const users = ['john.doe', 'alice.smith', 'bob.jackson', 'admin', 'system'];
    const types = Object.values(this.anomalyTypes);
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      
      let details = {};
      
      switch (type) {
        case this.anomalyTypes.UNUSUAL_LOGIN_TIME:
          details = {
            expected: '9:00 AM - 5:00 PM',
            actual: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            location: ['New York', 'London', 'Tokyo'][Math.floor(Math.random() * 3)]
          };
          break;
        case this.anomalyTypes.UNUSUAL_LOCATION:
          details = {
            expected: 'New York, Washington',
            actual: ['Beijing', 'Moscow', 'Unknown'][Math.floor(Math.random() * 3)],
            ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
          };
          break;
        case this.anomalyTypes.DATA_EXFILTRATION:
          details = {
            bytesTransferred: Math.floor(Math.random() * 1000000000),
            destination: ['cloud-storage.com', 'unknown-server.net', 'suspicious-domain.org'][Math.floor(Math.random() * 3)],
            protocol: ['HTTP', 'FTP', 'HTTPS'][Math.floor(Math.random() * 3)],
            duration: `${Math.floor(Math.random() * 60)} minutes`
          };
          break;
        default:
          details = {
            source: 'ML Detection Engine',
            confidence: (Math.random() * 0.5 + 0.5).toFixed(2)
          };
      }
      
      // Generate random date within the last 24 hours
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
      
      anomalies.push({
        id: crypto.randomUUID(),
        timestamp: timestamp,
        userId: users[Math.floor(Math.random() * users.length)],
        username: users[Math.floor(Math.random() * users.length)],
        type: type,
        severity: severity,
        confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
        details: details
      });
    }
    
    return anomalies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  // Private helper methods
  _createInitialUserBaseline(loginEvent) {
    return {
      loginTimes: [{ hour: new Date(loginEvent.timestamp).getHours(), count: 1 }],
      locations: [loginEvent.location],
      devices: [loginEvent.deviceId || 'unknown'],
      lastUpdated: new Date()
    };
  }
  
  _updateUserBaseline(userId, loginEvent) {
    const baseline = this.userBaselines.get(userId);
    const loginHour = new Date(loginEvent.timestamp).getHours();
    
    // Update login times
    const existingTimeEntry = baseline.loginTimes.find(entry => entry.hour === loginHour);
    if (existingTimeEntry) {
      existingTimeEntry.count++;
    } else {
      baseline.loginTimes.push({ hour: loginHour, count: 1 });
    }
    
    // Update locations if new
    if (!baseline.locations.includes(loginEvent.location)) {
      baseline.locations.push(loginEvent.location);
    }
    
    // Update devices if new
    if (loginEvent.deviceId && !baseline.devices.includes(loginEvent.deviceId)) {
      baseline.devices.push(loginEvent.deviceId);
    }
    
    baseline.lastUpdated = new Date();
    this.userBaselines.set(userId, baseline);
  }
  
  _isUnusualLoginTime(timestamp, loginTimes) {
    const loginHour = new Date(timestamp).getHours();
    
    // Check if this hour has any previous logins
    const existingTimeEntry = loginTimes.find(entry => entry.hour === loginHour);
    if (!existingTimeEntry) {
      return true; // No previous logins at this hour
    }
    
    // If very few logins at this hour compared to other hours, consider unusual
    const totalLogins = loginTimes.reduce((total, entry) => total + entry.count, 0);
    const hourPercentage = existingTimeEntry.count / totalLogins;
    
    return hourPercentage < 0.1; // Less than 10% of logins at this hour
  }
  
  _isUnusualLocation(location, knownLocations) {
    return !knownLocations.includes(location);
  }
  
  _formatTimeRanges(loginTimes) {
    // For simplicity, just return the most common login times
    const sortedTimes = [...loginTimes].sort((a, b) => b.count - a.count);
    const topTimes = sortedTimes.slice(0, 2);
    
    return topTimes.map(entry => {
      const hourStart = entry.hour;
      const hourEnd = (entry.hour + 1) % 24;
      return `${hourStart}:00 - ${hourEnd}:00`;
    }).join(', ');
  }
}

module.exports = new MLAnomalyDetectionService();
