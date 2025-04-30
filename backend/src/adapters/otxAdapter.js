/**
 * AlienVault OTX (Open Threat Exchange) Adapter
 * Specialized adapter for fetching and processing threat data from OTX
 */
const axios = require('axios');
const logger = require('../utils/logger');
const genericAdapter = require('./genericAdapter');

class OtxAdapter {
  /**
   * Fetch indicators from AlienVault OTX
   * @param {Object} source - The configured threat source
   * @returns {Promise<Array>} - Array of normalized indicators
   */
  async fetchIndicators(source) {
    try {
      logger.info(`[OtxAdapter] Fetching indicators from AlienVault OTX: ${source.name}`);
      
      // Get configuration from source
      const apiKey = source.connection.authentication.apiKey;
      if (!apiKey) {
        throw new Error('OTX API Key is required');
      }
      
      const baseUrl = source.connection.url || 'https://otx.alienvault.com/api/v1';
      const maxAgeInDays = source.configuration.maxAgeInDays || 30;
      const indicatorTypes = source.configuration.indicatorTypes || ['ip', 'domain', 'url', 'file_hash_md5'];
      
      // Convert indicator types to OTX pulse indicator types
      const otxTypes = this.mapToOtxTypes(indicatorTypes);
      
      // Calculate the timestamp for the maximum age
      const since = maxAgeInDays > 0 
        ? new Date(Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000)).toISOString()
        : undefined;
      
      // Get subscribed pulses
      const pulses = await this.fetchPulses(baseUrl, apiKey, since);
      logger.info(`[OtxAdapter] Fetched ${pulses.length} pulses from OTX`);
      
      if (pulses.length === 0) {
        return [];
      }
      
      // Extract and normalize indicators from pulses
      const indicators = [];
      for (const pulse of pulses) {
        if (!pulse.indicators) continue;
        
        const pulseIndicators = pulse.indicators
          // Filter by selected indicator types
          .filter(ind => otxTypes.includes(ind.type))
          // Map to normalized format
          .map(ind => this.normalizeIndicator(ind, pulse, source));
        
        indicators.push(...pulseIndicators);
      }
      
      logger.info(`[OtxAdapter] Extracted ${indicators.length} indicators from OTX pulses`);
      
      return indicators;
    } catch (error) {
      logger.error(`[OtxAdapter] Error fetching indicators from OTX: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch subscribed pulses from OTX
   * @param {String} baseUrl - OTX API base URL
   * @param {String} apiKey - OTX API key
   * @param {String} since - ISO timestamp to filter pulses by creation date
   * @returns {Promise<Array>} - Array of OTX pulses
   */
  async fetchPulses(baseUrl, apiKey, since) {
    try {
      const url = `${baseUrl}/pulses/subscribed`;
      const params = since ? { modified_since: since } : {};
      
      const response = await axios.get(url, {
        headers: {
          'X-OTX-API-KEY': apiKey
        },
        params
      });
      
      return response.data.results || [];
    } catch (error) {
      logger.error(`[OtxAdapter] Error fetching OTX pulses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map internal indicator types to OTX pulse indicator types
   * @param {Array} types - Array of internal indicator types
   * @returns {Array} - Array of OTX pulse indicator types
   */
  mapToOtxTypes(types) {
    const typeMap = {
      'ip': ['IPv4', 'IPv6'],
      'domain': ['domain', 'hostname'],
      'url': ['URL'],
      'file_hash_md5': ['FileHash-MD5'],
      'file_hash_sha1': ['FileHash-SHA1'],
      'file_hash_sha256': ['FileHash-SHA256'],
      'email': ['email'],
      'cve': ['CVE'],
      'mutex': ['mutex'],
      'user_agent': ['user-agent'],
      'registry': ['WindowsRegistryKey']
    };
    
    // Map each type to OTX types and flatten the array
    return types.flatMap(type => typeMap[type] || []);
  }

  /**
   * Normalize an OTX indicator to the internal format
   * @param {Object} indicator - Raw OTX indicator
   * @param {Object} pulse - OTX pulse containing the indicator
   * @param {Object} source - The threat source configuration
   * @returns {Object} - Normalized indicator
   */
  normalizeIndicator(indicator, pulse, source) {
    // Map OTX indicator type to internal type
    const type = this.normalizeType(indicator.type);
    
    // Extract threat details from pulse
    const threat = {
      name: pulse.name,
      description: pulse.description,
      category: this.normalizeThreatCategory(pulse.tags),
      family: pulse.malware_families?.length > 0 ? pulse.malware_families[0] : undefined
    };
    
    // Extract MITRE ATT&CK information if available
    const mitre = {
      tacticId: undefined,
      tacticName: undefined,
      techniqueId: undefined,
      techniqueName: undefined
    };
    
    // Look for MITRE ATT&CK tags
    if (pulse.tags) {
      for (const tag of pulse.tags) {
        if (tag.startsWith('T')) {
          // Extract technique ID from tag (format: T1234)
          const match = tag.match(/^(T\d{4}(\.\d{3})?)$/);
          if (match) {
            mitre.techniqueId = match[1];
          }
        }
      }
    }
    
    // Convert OTX pulse tags to normalized tags
    const tags = pulse.tags || [];
    
    // Create a normalized indicator
    return {
      value: indicator.indicator,
      type,
      threat,
      confidenceScore: this.calculateConfidenceScore(pulse),
      severity: this.determineSeverity(pulse),
      source: {
        name: source.name,
        reference: pulse.id
      },
      mitre,
      tags,
      firstSeen: new Date(indicator.created || pulse.created),
      lastSeen: new Date(pulse.modified)
    };
  }

  /**
   * Normalize OTX indicator type to internal type
   * @param {String} otxType - OTX indicator type
   * @returns {String} - Internal indicator type
   */
  normalizeType(otxType) {
    switch (otxType) {
      case 'IPv4':
      case 'IPv6':
        return 'ip';
      case 'domain':
      case 'hostname':
        return 'domain';
      case 'URL':
        return 'url';
      case 'FileHash-MD5':
        return 'file_hash_md5';
      case 'FileHash-SHA1':
        return 'file_hash_sha1';
      case 'FileHash-SHA256':
        return 'file_hash_sha256';
      case 'email':
        return 'email';
      case 'CVE':
        return 'cve';
      case 'mutex':
        return 'mutex';
      case 'WindowsRegistryKey':
        return 'registry';
      case 'user-agent':
        return 'user_agent';
      default:
        return 'other';
    }
  }

  /**
   * Calculate confidence score from OTX pulse data
   * @param {Object} pulse - OTX pulse
   * @returns {Number} - Confidence score (0-100)
   */
  calculateConfidenceScore(pulse) {
    // Start with a base score
    let score = 50;
    
    // Adjust based on various factors
    
    // TLP affects confidence - most restricted information is often more reliable
    if (pulse.tlp) {
      switch(pulse.tlp) {
        case 'red':
          score += 25;
          break;
        case 'amber':
          score += 15;
          break;
        case 'green':
          score += 5;
          break;
      }
    }
    
    // Pulses with more references are more reliable
    if (pulse.references && pulse.references.length > 0) {
      score += Math.min(10, pulse.references.length * 2);
    }
    
    // More indicators can mean more confidence in the overall pulse
    if (pulse.indicators && pulse.indicators.length > 10) {
      score += 5;
    }
    
    // More subscriber count indicates community trust
    if (pulse.subscriber_count > 100) {
      score += 10;
    } else if (pulse.subscriber_count > 50) {
      score += 5;
    }
    
    // Cap the score between 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine severity from OTX pulse data
   * @param {Object} pulse - OTX pulse
   * @returns {String} - Severity (low, medium, high, critical)
   */
  determineSeverity(pulse) {
    // Look for severity indicators in tags
    if (pulse.tags) {
      const tags = pulse.tags.map(tag => tag.toLowerCase());
      
      if (tags.some(tag => tag.includes('critical') || tag.includes('severe'))) {
        return 'critical';
      }
      
      if (tags.some(tag => tag.includes('high'))) {
        return 'high';
      }
      
      if (tags.some(tag => tag.includes('medium') || tag.includes('moderate'))) {
        return 'medium';
      }
      
      if (tags.some(tag => tag.includes('low'))) {
        return 'low';
      }
    }
    
    // Infer severity from other factors if not explicitly stated
    
    // TLP can be an indicator of severity
    if (pulse.tlp === 'red') {
      return 'critical';
    }
    
    // Pulses that mention specific attacks are typically higher severity
    const description = (pulse.description || '').toLowerCase();
    
    if (description.includes('ransomware') || 
        description.includes('data breach') || 
        description.includes('zero-day')) {
      return 'critical';
    }
    
    if (description.includes('exploit') || 
        description.includes('backdoor') || 
        description.includes('remote code execution')) {
      return 'high';
    }
    
    // Default to medium if no clear indicators
    return 'medium';
  }

  /**
   * Determine threat category from OTX pulse tags
   * @param {Array} tags - OTX pulse tags
   * @returns {String} - Normalized threat category
   */
  normalizeThreatCategory(tags) {
    if (!tags || tags.length === 0) {
      return 'other';
    }
    
    // Convert tags to lowercase for easier matching
    const lowerTags = tags.map(tag => tag.toLowerCase());
    
    // Check for common categories in tags
    if (lowerTags.some(tag => tag.includes('malware'))) {
      return 'malware';
    }
    
    if (lowerTags.some(tag => tag.includes('ransomware'))) {
      return 'ransomware';
    }
    
    if (lowerTags.some(tag => tag.includes('apt') || tag.includes('targeted'))) {
      return 'apt';
    }
    
    if (lowerTags.some(tag => tag.includes('phish'))) {
      return 'phishing';
    }
    
    if (lowerTags.some(tag => tag.includes('exploit'))) {
      return 'exploit';
    }
    
    if (lowerTags.some(tag => tag.includes('backdoor'))) {
      return 'backdoor';
    }
    
    if (lowerTags.some(tag => tag.includes('trojan'))) {
      return 'trojan';
    }
    
    if (lowerTags.some(tag => tag.includes('botnet'))) {
      return 'botnet';
    }
    
    if (lowerTags.some(tag => 
      tag.includes('c2') || 
      tag.includes('command') && tag.includes('control'))) {
      return 'command_and_control';
    }
    
    if (lowerTags.some(tag => tag.includes('ddos') || tag.includes('dos'))) {
      return 'ddos';
    }
    
    if (lowerTags.some(tag => tag.includes('scan'))) {
      return 'scanner';
    }
    
    if (lowerTags.some(tag => tag.includes('proxy'))) {
      return 'proxy';
    }
    
    if (lowerTags.some(tag => tag.includes('vuln'))) {
      return 'vulnerability';
    }
    
    return 'other';
  }
}

module.exports = new OtxAdapter();
