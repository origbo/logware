/**
 * MISP Adapter
 * Connects to a MISP (Malware Information Sharing Platform) instance
 */
const axios = require('axios');
const logger = require('../../utils/logger');
const BaseAdapter = require('./BaseAdapter');

class MISPAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'MISP Adapter';
    this.supportedFeatures = [
      'fetchIndicators',
      'submitIndicators',
      'fetchAlerts',
      'updateAlert'
    ];
    this.apiClient = null;
  }

  /**
   * Initialize the MISP adapter
   * @param {Object} config - Adapter configuration
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    await super.initialize(config);
    
    // Verify required configuration
    if (!this.config.apiUrl) {
      throw new Error('MISP API URL is required');
    }
    
    if (!this.config.apiKey) {
      throw new Error('MISP API key is required');
    }
    
    // Initialize API client
    this.apiClient = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': this.config.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: this.config.timeout || 30000
    });
    
    return true;
  }

  /**
   * Connect to the MISP instance
   * @returns {Promise<boolean>} - Connection status
   */
  async connect() {
    this.lastConnectionAttempt = new Date();
    
    try {
      // Test connection by fetching server info
      const response = await this.apiClient.get('/servers/getVersion');
      
      if (response.status === 200) {
        this.isConnected = true;
        logger.info(`Connected to MISP instance: ${this.config.apiUrl}`);
        logger.debug(`MISP version: ${response.data.version}`);
        return true;
      }
      
      this.isConnected = false;
      return false;
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to MISP instance:', error.message);
      throw new Error(`MISP connection failed: ${error.message}`);
    }
  }

  /**
   * Test the connection to the MISP instance
   * @returns {Promise<Object>} - Connection test results
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.apiClient.get('/servers/getVersion');
      const endTime = Date.now();
      
      return {
        success: response.status === 200,
        responseTime: endTime - startTime,
        version: response.data.version,
        url: this.config.apiUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: this.config.apiUrl
      };
    }
  }

  /**
   * Fetch indicators from MISP
   * @param {Object} options - Fetch options
   * @param {Date} options.from - Start date for indicators
   * @param {Date} options.to - End date for indicators
   * @param {Array} options.types - Indicator types to fetch
   * @param {Array} options.tags - Tags to filter indicators
   * @param {Number} options.limit - Maximum number of indicators to fetch
   * @returns {Promise<Array>} - List of indicators
   */
  async fetchIndicators(options = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      // Prepare request parameters
      const requestBody = {
        returnFormat: 'json',
        limit: options.limit || 100,
        page: options.page || 1,
        includeContext: true,
        includeCorrelations: true
      };
      
      // Add date filters if provided
      if (options.from) {
        requestBody.from = options.from.toISOString().split('T')[0];
      }
      
      if (options.to) {
        requestBody.to = options.to.toISOString().split('T')[0];
      }
      
      // Add type filters if provided
      if (options.types && options.types.length > 0) {
        requestBody.type = options.types;
      }
      
      // Add tag filters if provided
      if (options.tags && options.tags.length > 0) {
        requestBody.tags = options.tags;
      }
      
      // Make API request to fetch attributes (indicators)
      const response = await this.apiClient.post('/attributes/restSearch', requestBody);
      
      if (response.status !== 200) {
        throw new Error(`MISP API error: ${response.statusText}`);
      }
      
      logger.info(`Fetched ${response.data.response.Attribute.length} indicators from MISP`);
      
      // Transform MISP attributes to standard indicator format
      return this._transformMISPIndicators(response.data.response.Attribute);
    } catch (error) {
      logger.error('Error fetching indicators from MISP:', error.message);
      throw new Error(`Failed to fetch indicators from MISP: ${error.message}`);
    }
  }

  /**
   * Submit indicators to MISP
   * @param {Array} indicators - List of indicators to submit
   * @returns {Promise<Object>} - Submission results
   */
  async submitIndicators(indicators) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      // Create a new event to hold the indicators
      const event = {
        info: `Indicators submitted from Logware - ${new Date().toISOString()}`,
        threat_level_id: 2, // Default to Medium
        analysis: 1, // Default to Initial
        distribution: 0, // Default to Your Organization Only
        date: new Date().toISOString().split('T')[0],
        Attribute: indicators.map(indicator => this._transformToMISPAttribute(indicator))
      };
      
      // Submit the event
      const response = await this.apiClient.post('/events/add', { Event: event });
      
      if (response.status !== 200) {
        throw new Error(`MISP API error: ${response.statusText}`);
      }
      
      logger.info(`Submitted ${indicators.length} indicators to MISP, event ID: ${response.data.Event.id}`);
      
      return {
        success: true,
        eventId: response.data.Event.id,
        submittedCount: indicators.length,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error submitting indicators to MISP:', error.message);
      throw new Error(`Failed to submit indicators to MISP: ${error.message}`);
    }
  }

  /**
   * Fetch alerts from MISP (sightings)
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - List of alerts
   */
  async fetchAlerts(options = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      // Get sightings
      const response = await this.apiClient.post('/sightings/restSearch', {
        returnFormat: 'json',
        limit: options.limit || 50,
        page: options.page || 1
      });
      
      if (response.status !== 200) {
        throw new Error(`MISP API error: ${response.statusText}`);
      }
      
      // Transform sightings to alerts
      const alerts = response.data.response.map(sighting => ({
        id: sighting.id,
        type: 'misp-sighting',
        timestamp: new Date(sighting.date_sighting * 1000),
        source: 'MISP',
        title: `Sighting of indicator ${sighting.attribute_id}`,
        description: sighting.description || 'No description provided',
        severity: this._mapMISPTypesToSeverity(sighting.type),
        status: 'open',
        indicatorId: sighting.attribute_id,
        eventId: sighting.event_id,
        rawData: sighting
      }));
      
      logger.info(`Fetched ${alerts.length} alerts from MISP`);
      return alerts;
    } catch (error) {
      logger.error('Error fetching alerts from MISP:', error.message);
      throw new Error(`Failed to fetch alerts from MISP: ${error.message}`);
    }
  }

  /**
   * Update an alert status in MISP
   * @param {String} alertId - Alert ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated alert
   */
  async updateAlert(alertId, updates) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      // MISP doesn't have a direct way to update sightings
      // This would typically involve creating a comment on the event
      const response = await this.apiClient.post('/events/addComment', {
        event: updates.eventId,
        comment: `Alert ${alertId} status updated to: ${updates.status}`,
        distribution: 0
      });
      
      if (response.status !== 200) {
        throw new Error(`MISP API error: ${response.statusText}`);
      }
      
      logger.info(`Updated alert ${alertId} in MISP`);
      
      return {
        id: alertId,
        status: updates.status,
        updatedAt: new Date(),
        commentId: response.data.Comment.id
      };
    } catch (error) {
      logger.error('Error updating alert in MISP:', error.message);
      throw new Error(`Failed to update alert in MISP: ${error.message}`);
    }
  }

  // Helper methods
  
  /**
   * Transform MISP attributes to standard indicator format
   * @param {Array} attributes - MISP attributes
   * @returns {Array} - Standardized indicators
   */
  _transformMISPIndicators(attributes) {
    return attributes.map(attr => {
      // Determine indicator type
      let type = attr.type;
      if (type === 'ip-src' || type === 'ip-dst') {
        type = 'ip';
      } else if (type === 'domain' || type === 'hostname') {
        type = 'domain';
      } else if (type === 'url' || type === 'uri') {
        type = 'url';
      } else if (type.includes('hash')) {
        type = type.replace('-', '_');
      }
      
      // Determine severity based on MISP threat level
      let severity = 'medium';
      if (attr.Event && attr.Event.threat_level_id) {
        severity = this._mapMISPThreatLevelToSeverity(attr.Event.threat_level_id);
      }
      
      // Calculate confidence score based on MISP data
      let confidenceScore = 0.5; // Default medium confidence
      
      // If we have sightings, increase confidence
      if (attr.Sighting && attr.Sighting.length > 0) {
        confidenceScore = Math.min(0.9, 0.5 + attr.Sighting.length * 0.1);
      }
      
      // Extract tags
      const tags = attr.Tag ? attr.Tag.map(tag => tag.name) : [];
      
      return {
        id: attr.uuid || attr.id,
        type: type,
        value: attr.value,
        source: {
          name: 'MISP',
          type: 'misp',
          url: this.config.apiUrl
        },
        severity: severity,
        confidenceScore: confidenceScore,
        firstSeenAt: attr.first_seen || new Date(attr.timestamp * 1000),
        lastSeenAt: attr.last_seen || new Date(attr.timestamp * 1000),
        tags: tags,
        description: attr.comment || '',
        threat: {
          category: this._extractThreatCategory(tags),
          family: this._extractThreatFamily(tags)
        },
        rawData: attr
      };
    });
  }
  
  /**
   * Transform standard indicator to MISP attribute format
   * @param {Object} indicator - Standard indicator
   * @returns {Object} - MISP attribute
   */
  _transformToMISPAttribute(indicator) {
    // Map standard indicator type to MISP type
    let mispType = indicator.type;
    if (indicator.type === 'ip') {
      mispType = indicator.context === 'source' ? 'ip-src' : 'ip-dst';
    } else if (indicator.type === 'domain') {
      mispType = 'domain';
    } else if (indicator.type === 'url') {
      mispType = 'url';
    } else if (indicator.type === 'file_hash_md5') {
      mispType = 'md5';
    } else if (indicator.type === 'file_hash_sha1') {
      mispType = 'sha1';
    } else if (indicator.type === 'file_hash_sha256') {
      mispType = 'sha256';
    }
    
    // Create MISP attribute
    const attribute = {
      type: mispType,
      value: indicator.value,
      category: this._getMISPCategory(indicator.type),
      to_ids: true,
      comment: indicator.description || '',
      distribution: 0 // Your organization only
    };
    
    // Add tags if available
    if (indicator.tags && indicator.tags.length > 0) {
      attribute.Tag = indicator.tags.map(tag => ({ name: tag }));
    }
    
    // Add threat information as tags if available
    if (indicator.threat) {
      if (!attribute.Tag) {
        attribute.Tag = [];
      }
      
      if (indicator.threat.category) {
        attribute.Tag.push({ name: `category:${indicator.threat.category}` });
      }
      
      if (indicator.threat.family) {
        attribute.Tag.push({ name: `malware:${indicator.threat.family}` });
      }
    }
    
    return attribute;
  }
  
  /**
   * Map MISP threat level to standard severity
   * @param {Number} threatLevel - MISP threat level ID
   * @returns {String} - Standard severity
   */
  _mapMISPThreatLevelToSeverity(threatLevel) {
    switch (parseInt(threatLevel)) {
      case 1: return 'critical'; // High
      case 2: return 'high';     // Medium
      case 3: return 'medium';   // Low
      case 4: return 'low';      // Undefined
      default: return 'medium';
    }
  }
  
  /**
   * Map MISP sighting types to severity
   * @param {Number} type - MISP sighting type
   * @returns {String} - Standard severity
   */
  _mapMISPTypesToSeverity(type) {
    switch (parseInt(type)) {
      case 0: return 'medium';  // Default sighting
      case 1: return 'low';     // False positive
      case 2: return 'high';    // Expiration
      default: return 'medium';
    }
  }
  
  /**
   * Get appropriate MISP category for indicator type
   * @param {String} type - Indicator type
   * @returns {String} - MISP category
   */
  _getMISPCategory(type) {
    if (type === 'ip' || type === 'domain' || type === 'url') {
      return 'Network activity';
    } else if (type.includes('hash')) {
      return 'Payload delivery';
    } else if (type === 'email') {
      return 'Payload delivery';
    } else {
      return 'Other';
    }
  }
  
  /**
   * Extract threat category from MISP tags
   * @param {Array} tags - MISP tags
   * @returns {String} - Threat category
   */
  _extractThreatCategory(tags) {
    if (!tags || tags.length === 0) {
      return 'Unknown';
    }
    
    // Look for category tags
    for (const tag of tags) {
      if (tag.name && tag.name.startsWith('category:')) {
        return tag.name.replace('category:', '');
      }
      
      // Some common MISP tags that indicate categories
      if (tag.name === 'type:phishing') return 'Phishing';
      if (tag.name === 'type:exploit') return 'Exploit';
      if (tag.name === 'type:malware') return 'Malware';
      if (tag.name === 'type:botnet') return 'Botnet';
      if (tag.name === 'type:ransomware') return 'Ransomware';
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract threat family from MISP tags
   * @param {Array} tags - MISP tags
   * @returns {String} - Threat family
   */
  _extractThreatFamily(tags) {
    if (!tags || tags.length === 0) {
      return '';
    }
    
    // Look for malware family tags
    for (const tag of tags) {
      if (tag.name && tag.name.startsWith('malware:')) {
        return tag.name.replace('malware:', '');
      }
    }
    
    return '';
  }
}

module.exports = MISPAdapter;
