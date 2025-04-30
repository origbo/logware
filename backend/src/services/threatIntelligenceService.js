/**
 * Threat Intelligence Service
 * Manages integration with external threat intelligence sources and correlates with internal events
 */
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const cron = require('cron');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');
const incidentResponseService = require('./incidentResponseService');

class ThreatIntelligenceService {
  constructor() {
    this.ThreatIndicator = mongoose.model('ThreatIndicator');
    this.ThreatSource = mongoose.model('ThreatSource');
    this.scheduledJobs = {};
    
    // Initialize sync schedules
    this.initSyncSchedules();
  }

  /**
   * Initialize scheduled synchronization jobs for all active sources
   */
  async initSyncSchedules() {
    try {
      // Clear any existing jobs
      Object.values(this.scheduledJobs).forEach(job => job.stop());
      this.scheduledJobs = {};
      
      // Get all active sources
      const sources = await this.ThreatSource.find({ status: 'active' });
      
      // Set up a job for each source
      sources.forEach(source => {
        this.scheduleSourceSync(source);
      });
      
      logger.info(`Initialized sync schedules for ${sources.length} threat intelligence sources`);
    } catch (error) {
      logger.error(`Error initializing threat sync schedules: ${error.message}`);
    }
  }

  /**
   * Schedule synchronization for a specific source
   * @param {Object} source - The threat source object
   */
  scheduleSourceSync(source) {
    // Default to daily if not specified
    const intervalMinutes = source.configuration.syncInterval || 1440;
    const cronExpression = `0 */${intervalMinutes} * * * *`;
    
    // Create and start the job
    const job = new cron.CronJob(
      cronExpression,
      () => this.syncSource(source._id),
      null,
      true
    );
    
    this.scheduledJobs[source._id] = job;
    logger.info(`Scheduled sync for ${source.name} every ${intervalMinutes} minutes`);
  }

  /**
   * Synchronize indicators from a specific source
   * @param {String} sourceId - The ID of the source to sync
   */
  async syncSource(sourceId) {
    try {
      const source = await this.ThreatSource.findById(sourceId);
      if (!source || source.status !== 'active') {
        logger.warn(`Skipping sync for inactive or deleted source: ${sourceId}`);
        return;
      }
      
      logger.info(`Starting sync for ${source.name}`);
      
      // Get the appropriate adapter for this source type
      const adapter = this.getSourceAdapter(source.type);
      if (!adapter) {
        throw new Error(`No adapter available for source type: ${source.type}`);
      }
      
      // Fetch indicators from the source
      const indicators = await adapter.fetchIndicators(source);
      
      if (!indicators || !indicators.length) {
        logger.warn(`No indicators found for source: ${source.name}`);
        await this.updateSourceSyncStatus(source._id, 'success', 'No indicators found', 0);
        return;
      }
      
      logger.info(`Fetched ${indicators.length} indicators from ${source.name}`);
      
      // Process and store the indicators
      const results = await this.processIndicators(indicators, source);
      
      // Update source status
      await this.updateSourceSyncStatus(
        source._id, 
        'success', 
        `Successfully synced ${results.added} new, updated ${results.updated} existing indicators`,
        results.total
      );
      
      return results;
    } catch (error) {
      logger.error(`Error syncing source ${sourceId}: ${error.message}`);
      await this.updateSourceSyncStatus(sourceId, 'failed', error.message, 0);
      
      // Notify admins of sync failure
      await notificationService.notifyAdmins({
        title: 'Threat Intelligence Sync Failure',
        message: `Failed to sync threat data from source ID ${sourceId}: ${error.message}`,
        severity: 'high'
      });
      
      return { error: error.message };
    }
  }

  /**
   * Update the sync status for a source
   */
  async updateSourceSyncStatus(sourceId, status, message, count) {
    try {
      const updateData = {
        'integrationStatus.lastSyncAt': new Date(),
        'integrationStatus.lastSyncStatus': status,
        'integrationStatus.lastSyncMessage': message
      };
      
      if (count !== undefined) {
        updateData['integrationStatus.indicatorCount'] = count;
      }
      
      // If failed, increment error counters
      if (status === 'failed') {
        updateData['$inc'] = { 
          'integrationStatus.errorCount': 1,
          'integrationStatus.consecutiveErrors': 1 
        };
      } else {
        // Reset consecutive errors on success
        updateData['integrationStatus.consecutiveErrors'] = 0;
      }
      
      await this.ThreatSource.findByIdAndUpdate(sourceId, updateData);
    } catch (error) {
      logger.error(`Error updating source sync status: ${error.message}`);
    }
  }

  /**
   * Process and store a batch of indicators
   * @param {Array} indicators - Array of indicator objects
   * @param {Object} source - The source object
   */
  async processIndicators(indicators, source) {
    let added = 0;
    let updated = 0;
    let errors = 0;
    
    // Calculate default expiration date if configured
    let expiresAt = null;
    if (source.configuration.defaultExpirationInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + source.configuration.defaultExpirationInDays);
    }
    
    // Process each indicator
    for (const indicator of indicators) {
      try {
        // Apply source-specific transforms if defined
        const processedIndicator = source.transforms?.indicatorTransform 
          ? this.applyTransform(indicator, source.transforms.indicatorTransform)
          : indicator;
        
        // Skip if below minimum confidence threshold
        if (processedIndicator.confidenceScore < source.configuration.minimumConfidence) {
          continue;
        }
        
        // Set source information and expiration
        processedIndicator.source = {
          name: source.name,
          url: source.connection.url,
          reference: processedIndicator.source?.reference
        };
        
        if (expiresAt) {
          processedIndicator.expiresAt = expiresAt;
        }
        
        // Check if indicator already exists
        const existingIndicator = await this.ThreatIndicator.findOne({
          value: processedIndicator.value,
          type: processedIndicator.type
        });
        
        if (existingIndicator) {
          // Update existing indicator
          existingIndicator.confidenceScore = Math.max(existingIndicator.confidenceScore, processedIndicator.confidenceScore);
          existingIndicator.severity = this.getHighestSeverity(existingIndicator.severity, processedIndicator.severity);
          existingIndicator.lastSeen = new Date();
          
          // Merge tags without duplicates
          const tags = new Set([...existingIndicator.tags, ...(processedIndicator.tags || [])]);
          existingIndicator.tags = Array.from(tags);
          
          // Update threat information if this source has higher confidence
          if (processedIndicator.confidenceScore > existingIndicator.confidenceScore) {
            existingIndicator.threat = processedIndicator.threat;
          }
          
          await existingIndicator.save();
          updated++;
        } else {
          // Create new indicator
          await this.ThreatIndicator.create(processedIndicator);
          added++;
          
          // Check if this is a high-severity indicator that should trigger an incident
          if (
            source.configuration.autoCreateIncidents && 
            ['high', 'critical'].includes(processedIndicator.severity) &&
            processedIndicator.confidenceScore >= 80
          ) {
            this.createIncidentFromIndicator(processedIndicator);
          }
        }
      } catch (error) {
        logger.error(`Error processing indicator: ${error.message}`);
        errors++;
      }
    }
    
    return {
      total: indicators.length,
      added,
      updated,
      errors,
      skipped: indicators.length - (added + updated + errors)
    };
  }

  /**
   * Compare two severity levels and return the higher one
   */
  getHighestSeverity(sev1, sev2) {
    const severityMap = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    return severityMap[sev1] >= severityMap[sev2] ? sev1 : sev2;
  }

  /**
   * Create an incident from a high-severity indicator
   * @param {Object} indicator - The threat indicator that triggered the incident
   */
  async createIncidentFromIndicator(indicator) {
    try {
      const incidentData = {
        title: `Threat Intelligence Match: ${indicator.threat?.name || indicator.value}`,
        description: `High-confidence threat indicator detected: ${indicator.value} (${indicator.type}).\n\n` +
          `${indicator.threat?.description || 'No additional details available.'}\n\n` +
          `Source: ${indicator.source.name}`,
        type: 'threat_intelligence',
        severity: indicator.severity,
        source: 'automated',
        affectedSystems: [],
        tags: [...(indicator.tags || []), 'threat_intelligence', indicator.threat?.category || 'unknown']
      };
      
      await incidentResponseService.createIncident(incidentData);
    } catch (error) {
      logger.error(`Error creating incident from indicator: ${error.message}`);
    }
  }

  /**
   * Get the appropriate adapter for a source type
   * @param {String} sourceType - Type of threat intelligence source
   * @returns {Object} - Adapter for the source type
   */
  getSourceAdapter(sourceType) {
    // Check if we're in development mode or if using mock adapters is forced
    if (process.env.USE_MOCK_ADAPTERS === 'true' || process.env.NODE_ENV === 'development') {
      const mockAdapter = require('./adapters/mockThreatFeedAdapter');
      return mockAdapter;
    }
    
    // Use real adapters in production
    switch (sourceType) {
      case 'misp':
        try {
          const MISPAdapter = require('./adapters/MISPAdapter');
          return new MISPAdapter();
        } catch (error) {
          logger.error(`Error loading MISP adapter: ${error.message}. Falling back to mock adapter.`);
          return require('./adapters/mockThreatFeedAdapter');
        }
        
      case 'otx':
        try {
          const OTXAdapter = require('./adapters/OTXAdapter');
          return new OTXAdapter();
        } catch (error) {
          logger.error(`Error loading OTX adapter: ${error.message}. Falling back to mock adapter.`);
          return require('./adapters/mockThreatFeedAdapter');
        }
        
      case 'virustotal':
        // TODO: Implement VirusTotal adapter
        return require('./adapters/mockThreatFeedAdapter');
        
      case 'threatfox':
        // TODO: Implement ThreatFox adapter
        return require('./adapters/mockThreatFeedAdapter');
        
      default:
        logger.warn(`Unknown source type: ${sourceType}. Using mock adapter.`);
        return require('./adapters/mockThreatFeedAdapter');
    }
  }

  /**
   * Apply a custom transform function to an indicator
   * @param {Object} indicator - The indicator to transform
   * @param {String} transformFn - The transform function as a string
   */
  applyTransform(indicator, transformFn) {
    try {
      // Create a function from the string
      const fn = new Function('indicator', transformFn);
      return fn(indicator);
    } catch (error) {
      logger.error(`Error applying indicator transform: ${error.message}`);
      return indicator;
    }
  }

  /**
   * Search for indicators based on criteria
   * @param {Object} criteria - Search criteria
   */
  async searchIndicators(criteria = {}) {
    try {
      const query = {};
      
      // Apply filters from criteria
      if (criteria.value) {
        query.value = { $regex: criteria.value, $options: 'i' };
      }
      
      if (criteria.type) {
        query.type = criteria.type;
      }
      
      if (criteria.severity) {
        query.severity = criteria.severity;
      }
      
      if (criteria.threatCategory) {
        query['threat.category'] = criteria.threatCategory;
      }
      
      if (criteria.source) {
        query['source.name'] = criteria.source;
      }
      
      if (criteria.status) {
        query.status = criteria.status;
      }
      
      if (criteria.tags && criteria.tags.length) {
        query.tags = { $in: criteria.tags };
      }
      
      if (criteria.minConfidence) {
        query.confidenceScore = { $gte: criteria.minConfidence };
      }
      
      // Build sort order
      const sortOrder = {};
      if (criteria.sortBy) {
        sortOrder[criteria.sortBy] = criteria.sortDirection === 'desc' ? -1 : 1;
      } else {
        sortOrder.confidenceScore = -1; // Default sort by confidence (highest first)
      }
      
      // Apply pagination
      const limit = criteria.limit || 50;
      const skip = criteria.page ? (criteria.page - 1) * limit : 0;
      
      // Execute query
      const indicators = await this.ThreatIndicator
        .find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit);
        
      const total = await this.ThreatIndicator.countDocuments(query);
      
      return {
        indicators,
        pagination: {
          total,
          page: criteria.page || 1,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error searching indicators: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check a single indicator value against threat intelligence
   * @param {String} value - The indicator value to check
   * @param {String} type - The indicator type
   */
  async checkIndicator(value, type) {
    try {
      const indicator = await this.ThreatIndicator.findOne({
        value,
        type,
        status: 'active'
      });
      
      return indicator;
    } catch (error) {
      logger.error(`Error checking indicator: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch check multiple indicators against threat intelligence
   * @param {Array} indicators - Array of {value, type} objects to check
   */
  async batchCheckIndicators(indicators) {
    try {
      const query = {
        $or: indicators.map(i => ({ value: i.value, type: i.type })),
        status: 'active'
      };
      
      const matches = await this.ThreatIndicator.find(query);
      
      // Group matches by value and type for easy lookup
      const matchMap = matches.reduce((acc, match) => {
        const key = `${match.value}:${match.type}`;
        acc[key] = match;
        return acc;
      }, {});
      
      // Map results with matched indicators
      return indicators.map(indicator => {
        const key = `${indicator.value}:${indicator.type}`;
        return {
          ...indicator,
          matched: !!matchMap[key],
          matchDetails: matchMap[key] || null
        };
      });
    } catch (error) {
      logger.error(`Error batch checking indicators: ${error.message}`);
      throw error;
    }
  }

  /**
   * Correlate logs or events with threat intelligence
   * @param {Array} events - Array of event objects to check
   */
  async correlateEvents(events) {
    try {
      // Extract potential indicators from events
      const potentialIndicators = [];
      
      for (const event of events) {
        // Extract IPs
        const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        const ips = (event.sourceIp || event.destinationIp || event.ip || event.message || '')
          .match(ipPattern) || [];
        
        ips.forEach(ip => potentialIndicators.push({ value: ip, type: 'ip' }));
        
        // Extract domains
        const domainPattern = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
        const domains = (event.domain || event.url || event.message || '')
          .match(domainPattern) || [];
        
        domains.forEach(domain => potentialIndicators.push({ value: domain, type: 'domain' }));
        
        // Extract URLs
        const urlPattern = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        const urls = (event.url || event.message || '')
          .match(urlPattern) || [];
        
        urls.forEach(url => potentialIndicators.push({ value: url, type: 'url' }));
        
        // Extract file hashes
        const md5Pattern = /\b[a-f0-9]{32}\b/gi;
        const md5Hashes = (event.fileHash || event.md5 || event.message || '')
          .match(md5Pattern) || [];
        
        md5Hashes.forEach(hash => potentialIndicators.push({ value: hash, type: 'file_hash_md5' }));
        
        const sha1Pattern = /\b[a-f0-9]{40}\b/gi;
        const sha1Hashes = (event.fileHash || event.sha1 || event.message || '')
          .match(sha1Pattern) || [];
        
        sha1Hashes.forEach(hash => potentialIndicators.push({ value: hash, type: 'file_hash_sha1' }));
        
        const sha256Pattern = /\b[a-f0-9]{64}\b/gi;
        const sha256Hashes = (event.fileHash || event.sha256 || event.message || '')
          .match(sha256Pattern) || [];
        
        sha256Hashes.forEach(hash => potentialIndicators.push({ value: hash, type: 'file_hash_sha256' }));
      }
      
      // Deduplicate indicators
      const uniqueIndicators = {};
      potentialIndicators.forEach(indicator => {
        const key = `${indicator.value}:${indicator.type}`;
        uniqueIndicators[key] = indicator;
      });
      
      const indicatorsToCheck = Object.values(uniqueIndicators);
      
      // No indicators found
      if (indicatorsToCheck.length === 0) {
        return { matches: [] };
      }
      
      // Check indicators against threat intelligence
      const checkedIndicators = await this.batchCheckIndicators(indicatorsToCheck);
      
      // Filter for matches only
      const matches = checkedIndicators.filter(indicator => indicator.matched);
      
      // If matches found, map back to source events
      const correlatedEvents = [];
      if (matches.length > 0) {
        for (const event of events) {
          const eventMatches = matches.filter(match => {
            // Check if this event contains the matched indicator
            const eventText = [
              event.sourceIp, event.destinationIp, event.ip,
              event.domain, event.url, event.fileHash,
              event.md5, event.sha1, event.sha256,
              event.message
            ].filter(Boolean).join(' ');
            
            return eventText.includes(match.value);
          });
          
          if (eventMatches.length > 0) {
            correlatedEvents.push({
              event,
              matches: eventMatches.map(m => m.matchDetails)
            });
            
            // Update match count for each matched indicator
            for (const match of eventMatches) {
              await this.ThreatIndicator.findByIdAndUpdate(
                match.matchDetails._id,
                {
                  $inc: { matchCount: 1 },
                  lastMatchedAt: new Date()
                }
              );
            }
          }
        }
      }
      
      return {
        matches: correlatedEvents,
        summary: {
          totalEvents: events.length,
          eventsWithMatches: correlatedEvents.length,
          uniqueIndicatorsFound: indicatorsToCheck.length,
          matchedIndicators: matches.length
        }
      };
    } catch (error) {
      logger.error(`Error correlating events with threat intelligence: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ThreatIntelligenceService();
