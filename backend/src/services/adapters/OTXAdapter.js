/**
 * AlienVault OTX Adapter
 * Connects to AlienVault Open Threat Exchange (OTX) API
 */
const axios = require('axios');
const logger = require('../../utils/logger');
const BaseAdapter = require('./BaseAdapter');

class OTXAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'AlienVault OTX Adapter';
    this.supportedFeatures = [
      'fetchIndicators',
      'fetchAlerts'
    ];
    this.apiClient = null;
  }

  /**
   * Initialize the OTX adapter
   * @param {Object} config - Adapter configuration
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    await super.initialize(config);
    
    // Verify required configuration
    if (!this.config.apiKey) {
      throw new Error('OTX API key is required');
    }
    
    // Initialize API client
    this.apiClient = axios.create({
      baseURL: 'https://otx.alienvault.com/api/v1',
      headers: {
        'X-OTX-API-KEY': this.config.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: this.config.timeout || 30000
    });
    
    return true;
  }

  /**
   * Connect to the OTX API
   * @returns {Promise<boolean>} - Connection status
   */
  async connect() {
    this.lastConnectionAttempt = new Date();
    
    try {
      // Test connection by fetching user information
      const response = await this.apiClient.get('/user/me');
      
      if (response.status === 200) {
        this.isConnected = true;
        logger.info(`Connected to AlienVault OTX: ${response.data.username}`);
        return true;
      }
      
      this.isConnected = false;
      return false;
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to AlienVault OTX:', error.message);
      throw new Error(`OTX connection failed: ${error.message}`);
    }
  }

  /**
   * Test the connection to the OTX API
   * @returns {Promise<Object>} - Connection test results
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.apiClient.get('/user/me');
      const endTime = Date.now();
      
      return {
        success: response.status === 200,
        responseTime: endTime - startTime,
        username: response.data.username,
        apiUrl: 'https://otx.alienvault.com/api/v1'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        apiUrl: 'https://otx.alienvault.com/api/v1'
      };
    }
  }

  /**
   * Fetch indicators from OTX
   * @param {Object} options - Fetch options
   * @param {String} options.pulseId - Specific pulse ID to fetch
   * @param {String} options.type - Indicator type
   * @param {Number} options.limit - Maximum number of indicators to fetch
   * @returns {Promise<Array>} - List of indicators
   */
  async fetchIndicators(options = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      let indicators = [];
      
      // If a specific pulse ID is provided, fetch indicators from that pulse
      if (options.pulseId) {
        const response = await this.apiClient.get(`/pulses/${options.pulseId}/indicators`);
        indicators = response.data.results || [];
      } 
      // Otherwise fetch indicators from subscribed pulses
      else {
        // Fetch subscribed pulses first
        const pulsesResponse = await this.apiClient.get('/pulses/subscribed', {
          params: {
            limit: options.pulseLimit || 10
          }
        });
        
        const pulses = pulsesResponse.data.results || [];
        
        // For each pulse, fetch its indicators
        for (const pulse of pulses) {
          const indicatorsResponse = await this.apiClient.get(`/pulses/${pulse.id}/indicators`);
          const pulseIndicators = indicatorsResponse.data.results || [];
          
          // Add pulse metadata to each indicator
          pulseIndicators.forEach(indicator => {
            indicator.pulse = {
              id: pulse.id,
              name: pulse.name,
              description: pulse.description,
              tlp: pulse.tlp,
              tags: pulse.tags
            };
          });
          
          indicators = [...indicators, ...pulseIndicators];
          
          // Check if we've reached the limit
          if (options.limit && indicators.length >= options.limit) {
            indicators = indicators.slice(0, options.limit);
            break;
          }
        }
      }
      
      // Filter by indicator type if specified
      if (options.type && indicators.length > 0) {
        indicators = indicators.filter(indicator => indicator.type === options.type);
      }
      
      logger.info(`Fetched ${indicators.length} indicators from AlienVault OTX`);
      
      // Transform OTX indicators to standard indicator format
      return this._transformOTXIndicators(indicators);
    } catch (error) {
      logger.error('Error fetching indicators from AlienVault OTX:', error.message);
      throw new Error(`Failed to fetch indicators from OTX: ${error.message}`);
    }
  }

  /**
   * Fetch alerts from OTX (implemented as new pulses)
   * @param {Object} options - Fetch options
   * @param {Number} options.limit - Maximum number of alerts to fetch
   * @param {Date} options.since - Fetch alerts since this date
   * @returns {Promise<Array>} - List of alerts
   */
  async fetchAlerts(options = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      // Fetch recent pulses (these serve as "alerts" in OTX)
      const params = {
        limit: options.limit || 20,
        modified_since: options.since ? options.since.toISOString() : undefined
      };
      
      const response = await this.apiClient.get('/pulses/subscribed', { params });
      
      if (response.status !== 200) {
        throw new Error(`OTX API error: ${response.statusText}`);
      }
      
      const pulses = response.data.results || [];
      
      // Transform pulses to alerts
      const alerts = pulses.map(pulse => {
        // Determine severity based on TLP
        let severity;
        switch (pulse.tlp) {
          case 'red': severity = 'critical'; break;
          case 'amber': severity = 'high'; break;
          case 'green': severity = 'medium'; break;
          case 'white': severity = 'low'; break;
          default: severity = 'medium';
        }
        
        return {
          id: pulse.id,
          type: 'otx-pulse',
          timestamp: new Date(pulse.modified),
          source: 'AlienVault OTX',
          title: pulse.name,
          description: pulse.description,
          severity: severity,
          status: 'open',
          tags: pulse.tags || [],
          indicatorCount: pulse.indicator_count,
          tlp: pulse.tlp,
          author: pulse.author.username,
          rawData: pulse
        };
      });
      
      logger.info(`Fetched ${alerts.length} alerts from AlienVault OTX`);
      return alerts;
    } catch (error) {
      logger.error('Error fetching alerts from AlienVault OTX:', error.message);
      throw new Error(`Failed to fetch alerts from OTX: ${error.message}`);
    }
  }

  // Helper methods
  
  /**
   * Transform OTX indicators to standard indicator format
   * @param {Array} otxIndicators - OTX indicators
   * @returns {Array} - Standardized indicators
   */
  _transformOTXIndicators(otxIndicators) {
    return otxIndicators.map(indicator => {
      // Map OTX type to standard type
      let type = this._mapOTXType(indicator.type);
      
      // Determine severity based on pulse TLP if available
      let severity = 'medium';
      if (indicator.pulse && indicator.pulse.tlp) {
        severity = this._mapTLPToSeverity(indicator.pulse.tlp);
      }
      
      // Extract tags from pulse if available
      const tags = indicator.pulse && indicator.pulse.tags ? indicator.pulse.tags : [];
      
      // Determine confidence based on OTX indicator data
      let confidenceScore = 0.6; // Default confidence
      
      // If indicator has validation status, adjust confidence
      if (indicator.is_valid === true) {
        confidenceScore = 0.85;
      } else if (indicator.is_valid === false) {
        confidenceScore = 0.3;
      }
      
      return {
        id: indicator.id || `otx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        value: indicator.indicator,
        source: {
          name: 'AlienVault OTX',
          type: 'otx',
          url: 'https://otx.alienvault.com'
        },
        severity: severity,
        confidenceScore: confidenceScore,
        firstSeenAt: new Date(indicator.created),
        lastSeenAt: new Date(indicator.created), // OTX doesn't provide last seen date
        tags: tags,
        description: indicator.description || '',
        threat: {
          category: this._extractThreatCategory(tags),
          family: this._extractThreatFamily(tags)
        },
        rawData: indicator
      };
    });
  }
  
  /**
   * Map OTX indicator type to standard type
   * @param {String} otxType - OTX indicator type
   * @returns {String} - Standard indicator type
   */
  _mapOTXType(otxType) {
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
      default:
        return otxType.toLowerCase();
    }
  }
  
  /**
   * Map TLP (Traffic Light Protocol) to severity
   * @param {String} tlp - TLP value
   * @returns {String} - Standard severity
   */
  _mapTLPToSeverity(tlp) {
    switch (tlp.toLowerCase()) {
      case 'red': return 'critical';
      case 'amber': return 'high';
      case 'green': return 'medium';
      case 'white': return 'low';
      default: return 'medium';
    }
  }
  
  /**
   * Extract threat category from OTX tags
   * @param {Array} tags - OTX tags
   * @returns {String} - Threat category
   */
  _extractThreatCategory(tags) {
    if (!tags || tags.length === 0) {
      return 'Unknown';
    }
    
    // Common categories found in OTX tags
    const categoryMap = {
      'phishing': 'Phishing',
      'malware': 'Malware',
      'ransomware': 'Ransomware',
      'botnet': 'Botnet',
      'c2': 'C2',
      'apt': 'APT',
      'ddos': 'DDoS',
      'scanning': 'Scanning',
      'exploit': 'Exploit'
    };
    
    // Look for category tags
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      
      for (const [key, value] of Object.entries(categoryMap)) {
        if (tagLower.includes(key)) {
          return value;
        }
      }
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract threat family from OTX tags
   * @param {Array} tags - OTX tags
   * @returns {String} - Threat family
   */
  _extractThreatFamily(tags) {
    if (!tags || tags.length === 0) {
      return '';
    }
    
    // Common malware families that might appear in tags
    const malwareFamilies = [
      'emotet', 'trickbot', 'ryuk', 'qakbot', 'maze', 'lokibot',
      'dridex', 'ursnif', 'formbook', 'revil', 'darkside', 'conti',
      'wannacry', 'petya', 'notpetya', 'gandcrab', 'cerber', 'locky',
      'cryptolocker', 'zeus', 'zloader', 'icedid'
    ];
    
    // Look for malware family tags
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      
      for (const family of malwareFamilies) {
        if (tagLower.includes(family)) {
          return family.charAt(0).toUpperCase() + family.slice(1);
        }
      }
    }
    
    return '';
  }
}

module.exports = OTXAdapter;
