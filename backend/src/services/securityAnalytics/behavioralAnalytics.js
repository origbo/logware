/**
 * Behavioral Analytics Module
 * Analyzes user and system behavior patterns to detect anomalies
 */
/**
 * Behavioral Analytics Module - Mock Implementation
 * Simplified implementation for demo purposes
 */
const mongoose = require('../../utils/mockModels');
const logger = require('../../utils/logger');

// Import models
const SecurityEvent = mongoose.model('SecurityEvent');
const UserProfile = mongoose.model('User');

class BehavioralAnalytics {
  constructor() {
    this.initialized = false;
    this.userProfiles = new Map();
    this.baselineData = new Map();
  }

  /**
   * Initialize the behavioral analytics service
   */
  async initialize() {
    try {
      logger.info('Initializing behavioral analytics module');
      
      // Load baseline data for common user activities
      await this.initializeBaselines();
      
      this.initialized = true;
      logger.info('Behavioral analytics module initialized successfully');
      return { success: true };
    } catch (error) {
      logger.error(`Error initializing behavioral analytics: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize baseline data for behavior analysis
   */
  async initializeBaselines() {
    try {
      // Get baseline data from events
      const baselineResults = await SecurityEvent.aggregate([
        {
          $match: {
            timestamp: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            },
            'user.id': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$user.id',
            totalEvents: { $sum: 1 },
            // Authentication patterns
            loginCount: {
              $sum: {
                $cond: [
                  { $eq: ['$eventType', 'login'] },
                  1,
                  0
                ]
              }
            },
            failedLoginCount: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$eventType', 'login'] },
                      { $eq: ['$auth.success', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            // Access patterns by hour
            accessByHour: {
              $push: {
                $hour: '$timestamp'
              }
            },
            // IP addresses used
            ipAddresses: {
              $addToSet: '$network.srcIp'
            },
            // Resources accessed
            resourcesAccessed: {
              $addToSet: '$resource.id'
            },
            // Geolocation data if available
            locations: {
              $addToSet: '$geo.country'
            }
          }
        }
      ]);
      
      // Process and store baseline data
      for (const baseline of baselineResults) {
        const userId = baseline._id;
        
        // Calculate hourly access patterns
        const hourCounts = new Array(24).fill(0);
        for (const hour of baseline.accessByHour) {
          if (hour !== null && hour !== undefined) {
            hourCounts[hour]++;
          }
        }
        
        // Calculate active hours (hours with significant activity)
        const totalHourlyEvents = hourCounts.reduce((sum, count) => sum + count, 0);
        const hourlyThreshold = totalHourlyEvents * 0.05; // 5% of total events
        const activeHours = hourCounts
          .map((count, hour) => ({ hour, count }))
          .filter(h => h.count > hourlyThreshold)
          .map(h => h.hour);
        
        // Store processed baseline
        this.baselineData.set(userId, {
          totalEvents: baseline.totalEvents,
          loginCount: baseline.loginCount,
          failedLoginCount: baseline.failedLoginCount,
          failedLoginRatio: baseline.loginCount > 0 
            ? baseline.failedLoginCount / baseline.loginCount 
            : 0,
          hourlyPattern: hourCounts,
          activeHours,
          knownIpAddresses: baseline.ipAddresses || [],
          knownResources: baseline.resourcesAccessed || [],
          knownLocations: baseline.locations || []
        });
      }
      
      logger.info(`Loaded baseline behavior data for ${baselineResults.length} users`);
    } catch (error) {
      logger.error(`Error initializing behavioral baselines: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze an event for behavioral anomalies
   * @param {Object} event - The security event to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeEvent(event) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Skip events without user info
      if (!event.user || !event.user.id) {
        return {
          behavioralScore: 0,
          reasons: []
        };
      }
      
      const userId = event.user.id;
      const baseline = this.baselineData.get(userId);
      
      // If no baseline exists for this user, we can't perform behavioral analysis
      if (!baseline) {
        return {
          behavioralScore: 50, // Neutral score for unknown users
          reasons: ['No behavioral baseline exists for this user']
        };
      }
      
      // Initialize score and reasons
      let score = 0;
      const reasons = [];
      
      // Check for time-based anomalies
      const eventHour = new Date(event.timestamp).getHours();
      if (!baseline.activeHours.includes(eventHour)) {
        score += 30;
        reasons.push(`Activity at unusual hour (${eventHour}:00)`);
      }
      
      // Check for location anomalies
      if (event.geo && event.geo.country && 
          baseline.knownLocations.length > 0 && 
          !baseline.knownLocations.includes(event.geo.country)) {
        score += 40;
        reasons.push(`Access from unusual country: ${event.geo.country}`);
      }
      
      // Check for IP address anomalies
      if (event.network && event.network.srcIp && 
          baseline.knownIpAddresses.length > 0 && 
          !baseline.knownIpAddresses.includes(event.network.srcIp)) {
        score += 25;
        reasons.push(`Access from new IP address: ${event.network.srcIp}`);
      }
      
      // Check for resource access anomalies
      if (event.resource && event.resource.id && 
          baseline.knownResources.length > 0 && 
          !baseline.knownResources.includes(event.resource.id)) {
        score += 20;
        reasons.push(`Access to unusual resource: ${event.resource.id}`);
      }
      
      // Check for authentication anomalies
      if (event.eventType === 'login' && event.auth) {
        if (event.auth.method && event.auth.method !== 'password') {
          // Less common auth methods may be suspicious
          score += 15;
          reasons.push(`Unusual authentication method: ${event.auth.method}`);
        }
        
        if (event.auth.failedAttempts && event.auth.failedAttempts > 2) {
          const failRatioThreshold = baseline.failedLoginRatio * 2 + 0.1;
          const currentFailRatio = event.auth.failedAttempts / (event.auth.failedAttempts + 1);
          
          if (currentFailRatio > failRatioThreshold) {
            score += 35;
            reasons.push(`Unusually high number of failed attempts: ${event.auth.failedAttempts}`);
          }
        }
      }
      
      // Volume anomalies (many events in short time)
      const recentEvents = await this.getRecentUserEvents(userId);
      const hourlyRate = recentEvents.length;
      const normalHourlyRate = baseline.totalEvents / (30 * 24); // Average over month
      
      if (hourlyRate > normalHourlyRate * 3) {
        score += 25;
        reasons.push(`Unusual activity volume: ${hourlyRate} events in the last hour (normal: ~${normalHourlyRate.toFixed(1)})`);
      }
      
      // Cap the score at 100
      score = Math.min(score, 100);
      
      return {
        behavioralScore: score,
        reasons
      };
    } catch (error) {
      logger.error(`Error in behavioral analysis: ${error.message}`);
      return {
        behavioralScore: 0,
        reasons: [`Error in analysis: ${error.message}`],
        error: true
      };
    }
  }

  /**
   * Get recent events for a specific user
   * @param {string} userId - User ID to query
   * @returns {Promise<Array>} Recent events
   */
  async getRecentUserEvents(userId) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return await SecurityEvent.find({
        'user.id': userId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 });
    } catch (error) {
      logger.error(`Error fetching recent user events: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze a user's behavior over time
   * @param {string} userId - User ID to analyze
   * @returns {Promise<Object>} User behavior analysis
   */
  async analyzeUserBehavior(userId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Get user baseline
      const baseline = this.baselineData.get(userId);
      if (!baseline) {
        return {
          success: false,
          error: 'No baseline exists for this user'
        };
      }
      
      // Get recent events for user
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentEvents = await SecurityEvent.find({
        'user.id': userId,
        timestamp: { $gte: last7Days }
      }).sort({ timestamp: -1 });
      
      // Get recent anomalies
      const anomalies = recentEvents.filter(event => 
        event.analysis && event.analysis.anomalyScore >= 70
      );
      
      // Calculate behavioral metrics
      const totalAnomalies = anomalies.length;
      const anomalyRatio = recentEvents.length > 0 
        ? totalAnomalies / recentEvents.length 
        : 0;
      
      // Calculate latest access patterns
      const hourCounts = new Array(24).fill(0);
      for (const event of recentEvents) {
        const hour = new Date(event.timestamp).getHours();
        hourCounts[hour]++;
      }
      
      // Find pattern deviations
      const patternDeviations = [];
      for (let hour = 0; hour < 24; hour++) {
        const baselineCount = baseline.hourlyPattern[hour];
        const recentCount = hourCounts[hour];
        
        // Calculate relative change (avoid division by zero)
        const relativeChange = baselineCount > 0
          ? (recentCount - baselineCount) / baselineCount
          : (recentCount > 0 ? 1 : 0);
          
        if (Math.abs(relativeChange) > 0.5) { // 50% change
          patternDeviations.push({
            hour,
            baselineCount,
            recentCount,
            relativeChange
          });
        }
      }
      
      // Determine overall risk score based on all factors
      let riskScore = 0;
      const riskFactors = [];
      
      if (anomalyRatio > 0.1) { // More than 10% of events are anomalies
        riskScore += 30;
        riskFactors.push(`High anomaly ratio: ${(anomalyRatio * 100).toFixed(1)}%`);
      }
      
      if (patternDeviations.length > 3) {
        riskScore += 25;
        riskFactors.push(`Significant changes in access patterns (${patternDeviations.length} hours affected)`);
      }
      
      // Check for new access points
      const newIpAddresses = new Set();
      const newLocations = new Set();
      
      for (const event of recentEvents) {
        if (event.network && event.network.srcIp && 
            !baseline.knownIpAddresses.includes(event.network.srcIp)) {
          newIpAddresses.add(event.network.srcIp);
        }
        
        if (event.geo && event.geo.country && 
            !baseline.knownLocations.includes(event.geo.country)) {
          newLocations.add(event.geo.country);
        }
      }
      
      if (newIpAddresses.size > 0) {
        riskScore += 15;
        riskFactors.push(`Access from ${newIpAddresses.size} new IP addresses`);
      }
      
      if (newLocations.size > 0) {
        riskScore += 20;
        riskFactors.push(`Access from ${newLocations.size} new countries/locations`);
      }
      
      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);
      
      return {
        success: true,
        userId,
        riskScore,
        riskFactors,
        events: {
          total: recentEvents.length,
          anomalies: totalAnomalies,
          anomalyRatio
        },
        patternChanges: patternDeviations,
        newAccessPoints: {
          ipAddresses: Array.from(newIpAddresses),
          locations: Array.from(newLocations)
        }
      };
    } catch (error) {
      logger.error(`Error analyzing user behavior: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BehavioralAnalytics();
