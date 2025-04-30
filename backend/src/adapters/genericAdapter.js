/**
 * Generic Threat Intelligence Adapter
 * Base adapter implementation for threat intelligence sources
 */
const axios = require('axios');
const logger = require('../utils/logger');

class GenericAdapter {
  /**
   * Fetch indicators from a generic threat intelligence source
   * @param {Object} source - The configured threat source
   * @returns {Promise<Array>} - Array of normalized indicators
   */
  async fetchIndicators(source) {
    try {
      logger.info(`[GenericAdapter] Fetching indicators from ${source.name}`);
      
      // Set up request configuration
      const config = this.buildRequestConfig(source);
      
      // Make the API request
      const response = await axios(config);
      
      // Process the response
      const indicators = this.processResponse(response.data, source);
      
      logger.info(`[GenericAdapter] Successfully fetched ${indicators.length} indicators from ${source.name}`);
      
      return indicators;
    } catch (error) {
      logger.error(`[GenericAdapter] Error fetching indicators from ${source.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build request configuration based on source settings
   * @param {Object} source - The configured threat source
   * @returns {Object} - Axios request configuration
   */
  buildRequestConfig(source) {
    const config = {
      method: 'get',
      url: source.connection.url,
      headers: {}
    };
    
    // Add authentication
    if (source.connection.authentication) {
      switch (source.connection.authentication.type) {
        case 'api_key':
          // Different APIs handle API keys differently
          // By default, add as Authorization header
          config.headers['Authorization'] = `ApiKey ${source.connection.authentication.apiKey}`;
          break;
          
        case 'basic':
          // Add Basic authentication
          const auth = Buffer.from(
            `${source.connection.authentication.username}:${source.connection.authentication.password}`
          ).toString('base64');
          config.headers['Authorization'] = `Basic ${auth}`;
          break;
          
        case 'oauth2':
          // Add Bearer token
          config.headers['Authorization'] = `Bearer ${source.connection.authentication.accessToken}`;
          break;
      }
    }
    
    // Add custom headers if defined
    if (source.connection.headers && source.connection.headers.size > 0) {
      source.connection.headers.forEach((value, key) => {
        config.headers[key] = value;
      });
    }
    
    return config;
  }

  /**
   * Process API response and normalize to standard format
   * @param {Object} data - Raw API response data
   * @param {Object} source - The configured threat source
   * @returns {Array} - Array of normalized indicators
   */
  processResponse(data, source) {
    // By default, assume data is already an array of indicators
    // Specific adapters will override this method to handle their format
    
    if (!Array.isArray(data)) {
      logger.warn(`[GenericAdapter] Response from ${source.name} is not an array, returning empty array`);
      return [];
    }
    
    // Map to standard format
    return data.map(item => this.normalizeIndicator(item, source));
  }

  /**
   * Normalize an indicator to standard format
   * @param {Object} rawIndicator - Raw indicator data from source
   * @param {Object} source - The configured threat source
   * @returns {Object} - Normalized indicator
   */
  normalizeIndicator(rawIndicator, source) {
    // This is a very basic implementation
    // Specific adapters will provide more detailed mappings
    
    return {
      value: rawIndicator.value || rawIndicator.indicator || rawIndicator.ioc,
      type: this.normalizeType(rawIndicator.type),
      threat: {
        name: rawIndicator.threatName || rawIndicator.malware,
        category: this.normalizeCategory(rawIndicator.category),
        family: rawIndicator.family,
        description: rawIndicator.description
      },
      confidenceScore: this.normalizeConfidence(rawIndicator.confidence),
      severity: this.normalizeSeverity(rawIndicator.severity),
      tags: Array.isArray(rawIndicator.tags) ? rawIndicator.tags : [],
      source: {
        name: source.name,
        reference: rawIndicator.id || rawIndicator.reference
      },
      mitre: {
        tacticId: rawIndicator.mitreTactic || rawIndicator.tacticId,
        tacticName: rawIndicator.mitreTacticName,
        techniqueId: rawIndicator.mitreTechnique || rawIndicator.techniqueId,
        techniqueName: rawIndicator.mitreTechniqueName
      },
      firstSeen: rawIndicator.firstSeen ? new Date(rawIndicator.firstSeen) : new Date(),
      lastSeen: rawIndicator.lastSeen ? new Date(rawIndicator.lastSeen) : new Date()
    };
  }

  /**
   * Normalize indicator type to standard format
   * @param {String} type - Original type from source
   * @returns {String} - Normalized type
   */
  normalizeType(type) {
    if (!type) return 'other';
    
    type = type.toLowerCase();
    
    // Map common variations to standard types
    if (type.includes('ip') || type === 'ipv4' || type === 'ipv6') {
      return 'ip';
    } else if (type.includes('domain')) {
      return 'domain';
    } else if (type.includes('url') || type === 'uri') {
      return 'url';
    } else if (type.includes('email')) {
      return 'email';
    } else if (type.includes('md5') || (type.includes('hash') && type.includes('md5'))) {
      return 'file_hash_md5';
    } else if (type.includes('sha1') || (type.includes('hash') && type.includes('sha1'))) {
      return 'file_hash_sha1';
    } else if (type.includes('sha256') || (type.includes('hash') && type.includes('sha256'))) {
      return 'file_hash_sha256';
    } else if (type.includes('sha512') || (type.includes('hash') && type.includes('sha512'))) {
      return 'file_hash_sha512';
    } else if (type.includes('mutex')) {
      return 'mutex';
    } else if (type.includes('registry')) {
      return 'registry';
    } else if (type.includes('user_agent') || type.includes('useragent')) {
      return 'user_agent';
    } else if (type.includes('cve')) {
      return 'cve';
    } else {
      return 'other';
    }
  }

  /**
   * Normalize threat category to standard format
   * @param {String} category - Original category from source
   * @returns {String} - Normalized category
   */
  normalizeCategory(category) {
    if (!category) return 'other';
    
    category = category.toLowerCase();
    
    // Map common variations to standard categories
    if (category.includes('malware')) {
      return 'malware';
    } else if (category.includes('ransom')) {
      return 'ransomware';
    } else if (category.includes('apt') || category.includes('advanced')) {
      return 'apt';
    } else if (category.includes('phish')) {
      return 'phishing';
    } else if (category.includes('exploit')) {
      return 'exploit';
    } else if (category.includes('backdoor')) {
      return 'backdoor';
    } else if (category.includes('trojan')) {
      return 'trojan';
    } else if (category.includes('botnet')) {
      return 'botnet';
    } else if (category.includes('c2') || category.includes('command') || category.includes('control')) {
      return 'command_and_control';
    } else if (category.includes('ddos') || category.includes('dos')) {
      return 'ddos';
    } else if (category.includes('scan')) {
      return 'scanner';
    } else if (category.includes('proxy')) {
      return 'proxy';
    } else if (category.includes('vuln')) {
      return 'vulnerability';
    } else {
      return 'other';
    }
  }

  /**
   * Normalize confidence score to 0-100 scale
   * @param {Number|String} confidence - Original confidence value
   * @returns {Number} - Normalized confidence score (0-100)
   */
  normalizeConfidence(confidence) {
    if (confidence === undefined || confidence === null) {
      return 50; // Default medium confidence
    }
    
    // If it's already a number between 0-100, use it
    if (typeof confidence === 'number' && confidence >= 0 && confidence <= 100) {
      return confidence;
    }
    
    // Convert string to number if possible
    if (typeof confidence === 'string') {
      // Try to parse as number
      const parsed = parseFloat(confidence);
      if (!isNaN(parsed)) {
        confidence = parsed;
      } else {
        // Handle text-based confidence levels
        const lower = confidence.toLowerCase();
        if (lower.includes('high')) return 80;
        if (lower.includes('medium')) return 50;
        if (lower.includes('low')) return 30;
        return 50; // Default
      }
    }
    
    // If it's a number but not on 0-100 scale, convert it
    if (typeof confidence === 'number') {
      // Convert from 0-1 scale
      if (confidence >= 0 && confidence <= 1) {
        return confidence * 100;
      }
      
      // Convert from 0-10 scale
      if (confidence >= 0 && confidence <= 10) {
        return confidence * 10;
      }
      
      // Ensure the value is within 0-100
      return Math.max(0, Math.min(100, confidence));
    }
    
    return 50; // Default medium confidence
  }

  /**
   * Normalize severity to standard format
   * @param {String|Number} severity - Original severity from source
   * @returns {String} - Normalized severity (low, medium, high, critical)
   */
  normalizeSeverity(severity) {
    if (!severity) return 'medium';
    
    // Handle string severities
    if (typeof severity === 'string') {
      severity = severity.toLowerCase();
      
      if (severity.includes('critical') || severity.includes('severe') || severity === 'very high') {
        return 'critical';
      } else if (severity.includes('high')) {
        return 'high';
      } else if (severity.includes('medium') || severity.includes('moderate') || severity.includes('med')) {
        return 'medium';
      } else if (severity.includes('low')) {
        return 'low';
      } else {
        return 'medium'; // Default
      }
    }
    
    // Handle numeric severities
    if (typeof severity === 'number') {
      // 0-100 scale
      if (severity >= 0 && severity <= 100) {
        if (severity >= 90) return 'critical';
        if (severity >= 70) return 'high';
        if (severity >= 40) return 'medium';
        return 'low';
      }
      
      // 0-10 scale
      if (severity >= 0 && severity <= 10) {
        if (severity >= 9) return 'critical';
        if (severity >= 7) return 'high';
        if (severity >= 4) return 'medium';
        return 'low';
      }
      
      // 0-5 scale
      if (severity >= 0 && severity <= 5) {
        if (severity >= 4.5) return 'critical';
        if (severity >= 3.5) return 'high';
        if (severity >= 2) return 'medium';
        return 'low';
      }
    }
    
    return 'medium'; // Default
  }
}

module.exports = new GenericAdapter();
