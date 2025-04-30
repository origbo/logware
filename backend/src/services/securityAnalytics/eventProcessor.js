/**
 * Security Analytics - Event Processor
 * Handles ingestion, normalization, and initial processing of security events
 */
/**
 * Event Processor - Mock Implementation
 * Simplified implementation for demo purposes
 */
const mongoose = require('../../utils/mockModels');
const logger = require('../../utils/logger');
const SecurityEvent = mongoose.model('SecurityEvent');

class EventProcessor {
  /**
   * Process a security event
   * @param {Object} rawEvent - Raw event data from source
   * @returns {Promise<Object>} Processed event
   */
  async processEvent(rawEvent) {
    try {
      // Normalize the event into standard format
      const normalizedEvent = this.normalizeEvent(rawEvent);
      
      // Save event to database
      const savedEvent = await SecurityEvent.create(normalizedEvent);
      
      // Return the processed event
      return {
        success: true,
        eventId: savedEvent._id,
        event: savedEvent
      };
    } catch (error) {
      logger.error(`Error processing security event: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process multiple events in batch
   * @param {Array} events - Array of raw events
   * @returns {Promise<Object>} Processing results
   */
  async processBatch(events) {
    if (!Array.isArray(events)) {
      return {
        success: false,
        error: 'Events must be an array'
      };
    }

    const results = {
      total: events.length,
      processed: 0,
      failed: 0,
      events: []
    };

    for (const rawEvent of events) {
      try {
        const normalizedEvent = this.normalizeEvent(rawEvent);
        const savedEvent = await SecurityEvent.create(normalizedEvent);
        
        results.processed++;
        results.events.push({
          success: true,
          eventId: savedEvent._id
        });
      } catch (error) {
        logger.error(`Error processing batch event: ${error.message}`);
        results.failed++;
        results.events.push({
          success: false,
          error: error.message,
          rawEvent: rawEvent
        });
      }
    }

    return {
      success: results.failed === 0,
      results
    };
  }

  /**
   * Normalize event data into standard format
   * @param {Object} rawEvent - Raw event data from source
   * @returns {Object} Normalized event
   */
  normalizeEvent(rawEvent) {
    // Simple validation
    if (!rawEvent.source) {
      throw new Error('Event source is required');
    }
    if (!rawEvent.eventType) {
      throw new Error('Event type is required');
    }

    // Base normalized structure
    const normalizedEvent = {
      source: rawEvent.source,
      eventType: rawEvent.eventType,
      severity: this.normalizeSeverity(rawEvent.severity),
      category: this.determineCategory(rawEvent),
      timestamp: rawEvent.timestamp ? new Date(rawEvent.timestamp) : new Date(),
      status: 'new',
      rawData: rawEvent
    };

    // Add host information if available
    if (rawEvent.host || rawEvent.hostname || rawEvent.hostIP) {
      normalizedEvent.host = {
        hostname: rawEvent.hostname || rawEvent.host?.name,
        ip: rawEvent.hostIP || rawEvent.host?.ip,
        os: rawEvent.os || rawEvent.host?.os,
        type: rawEvent.hostType || rawEvent.host?.type
      };
    }

    // Add user information if available
    if (rawEvent.user || rawEvent.username || rawEvent.userId) {
      normalizedEvent.user = {
        id: rawEvent.userId || rawEvent.user?.id,
        name: rawEvent.username || rawEvent.user?.name,
        role: rawEvent.userRole || rawEvent.user?.role
      };
    }

    // Add network information if available
    if (rawEvent.srcIp || rawEvent.dstIp || rawEvent.network) {
      normalizedEvent.network = {
        srcIp: rawEvent.srcIp || rawEvent.network?.srcIp,
        dstIp: rawEvent.dstIp || rawEvent.network?.dstIp,
        srcPort: rawEvent.srcPort || rawEvent.network?.srcPort,
        dstPort: rawEvent.dstPort || rawEvent.network?.dstPort,
        protocol: rawEvent.protocol || rawEvent.network?.protocol,
        direction: rawEvent.direction || rawEvent.network?.direction
      };
    }

    // Add process information if available
    if (rawEvent.process || rawEvent.processName) {
      normalizedEvent.process = {
        name: rawEvent.processName || rawEvent.process?.name,
        path: rawEvent.processPath || rawEvent.process?.path,
        pid: rawEvent.pid || rawEvent.process?.pid,
        args: rawEvent.processArgs || rawEvent.process?.args,
        hash: rawEvent.processHash || rawEvent.process?.hash
      };
    }

    // Add file information if available
    if (rawEvent.file || rawEvent.fileName) {
      normalizedEvent.file = {
        name: rawEvent.fileName || rawEvent.file?.name,
        path: rawEvent.filePath || rawEvent.file?.path,
        hash: rawEvent.fileHash || rawEvent.file?.hash,
        size: rawEvent.fileSize || rawEvent.file?.size,
        type: rawEvent.fileType || rawEvent.file?.type
      };
    }

    // Add web request information if available
    if (rawEvent.web || rawEvent.url) {
      normalizedEvent.web = {
        method: rawEvent.method || rawEvent.web?.method,
        url: rawEvent.url || rawEvent.web?.url,
        userAgent: rawEvent.userAgent || rawEvent.web?.userAgent,
        referer: rawEvent.referer || rawEvent.web?.referer,
        statusCode: rawEvent.statusCode || rawEvent.web?.statusCode
      };
    }

    // Add DNS information if available
    if (rawEvent.dns || rawEvent.dnsQuery) {
      normalizedEvent.dns = {
        query: rawEvent.dnsQuery || rawEvent.dns?.query,
        recordType: rawEvent.dnsRecordType || rawEvent.dns?.recordType,
        response: rawEvent.dnsResponse || rawEvent.dns?.response
      };
    }

    // Add authentication information if available
    if (rawEvent.auth || rawEvent.authentication || rawEvent.eventType.includes('login')) {
      normalizedEvent.authentication = {
        method: rawEvent.authMethod || rawEvent.auth?.method || rawEvent.authentication?.method,
        success: rawEvent.authSuccess !== undefined ? rawEvent.authSuccess : 
                 (rawEvent.auth?.success !== undefined ? rawEvent.auth.success : 
                 (rawEvent.authentication?.success !== undefined ? rawEvent.authentication.success : undefined)),
        reason: rawEvent.authReason || rawEvent.auth?.reason || rawEvent.authentication?.reason
      };
    }

    return normalizedEvent;
  }

  /**
   * Normalize severity to 0-100 scale
   * @param {Any} severity - Raw severity value
   * @returns {Number} Normalized severity (0-100)
   */
  normalizeSeverity(severity) {
    if (severity === undefined || severity === null) {
      return 50; // Default to medium
    }

    // If already a number in range 0-100
    if (typeof severity === 'number' && severity >= 0 && severity <= 100) {
      return severity;
    }

    // Convert string severity levels to numbers
    if (typeof severity === 'string') {
      const lowerSeverity = severity.toLowerCase();
      
      if (lowerSeverity.includes('critical') || lowerSeverity.includes('emergency')) {
        return 90;
      } else if (lowerSeverity.includes('high') || lowerSeverity.includes('alert')) {
        return 75;
      } else if (lowerSeverity.includes('medium') || lowerSeverity.includes('warning')) {
        return 50;
      } else if (lowerSeverity.includes('low') || lowerSeverity.includes('info')) {
        return 25;
      } else if (lowerSeverity.includes('debug') || lowerSeverity.includes('trace')) {
        return 10;
      }
      
      // Try to parse numeric value from string
      const parsed = parseFloat(severity);
      if (!isNaN(parsed)) {
        // Scale different ranges to 0-100
        if (parsed >= 0 && parsed <= 1) { // 0-1 scale
          return parsed * 100;
        } else if (parsed >= 0 && parsed <= 10) { // 0-10 scale
          return parsed * 10;
        } else if (parsed >= 0 && parsed <= 5) { // 0-5 scale
          return parsed * 20;
        }
        
        // Cap at 0-100
        return Math.max(0, Math.min(100, parsed));
      }
    }

    // Default for unrecognized severity
    return 50;
  }

  /**
   * Determine event category from event data
   * @param {Object} event - Event data
   * @returns {String} Event category
   */
  determineCategory(event) {
    // If category is already provided, use it
    if (event.category) {
      return event.category;
    }

    const eventType = event.eventType.toLowerCase();

    // Determine category based on event type or content
    if (eventType.includes('auth') || eventType.includes('login') || 
        eventType.includes('user') || eventType.includes('password')) {
      return 'authentication';
    } else if (eventType.includes('network') || eventType.includes('traffic') || 
               eventType.includes('firewall') || eventType.includes('connection')) {
      return 'network';
    } else if (eventType.includes('malware') || eventType.includes('virus') || 
               eventType.includes('trojan') || eventType.includes('ransomware')) {
      return 'malware';
    } else if (eventType.includes('file') || eventType.includes('document')) {
      return 'file';
    } else if (eventType.includes('system') || eventType.includes('process') || 
               eventType.includes('service')) {
      return 'system';
    } else if (eventType.includes('web') || eventType.includes('http') || 
               eventType.includes('url')) {
      return 'web';
    } else if (eventType.includes('dns') || eventType.includes('domain')) {
      return 'dns';
    } else if (eventType.includes('access') || eventType.includes('permission')) {
      return 'data_access';
    } else if (eventType.includes('app') || eventType.includes('application')) {
      return 'application';
    }

    // Default to 'other' if no specific category can be determined
    return 'other';
  }
}

module.exports = new EventProcessor();
