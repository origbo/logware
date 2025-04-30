/**
 * Alerts Controller
 * Handles retrieving and managing security alerts from various sources
 */

const { OSSIMService, SplunkService } = require('../../services/integrations');
const config = require('../../config/integrations');
const logger = require('../../utils/logger');

// Initialize integration services based on configuration
const services = {};

if (config.ossim.enabled) {
  services.ossim = new OSSIMService(config.ossim);
}

if (config.splunk.enabled) {
  services.splunk = new SplunkService(config.splunk);
}

/**
 * Get alerts from configured security tools
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAlerts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status,
      severity,
      category,
      startDate,
      endDate,
      search
    } = req.query;
    
    // Format parameters for API calls
    const params = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      severity,
      category,
      startDate,
      endDate,
      search
    };
    
    // Remove undefined params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    
    logger.info(`Fetching alerts with params: ${JSON.stringify(params)}`);
    
    // Check if any integration services are available
    if (Object.keys(services).length === 0) {
      // If no integrations are enabled, use mock data
      logger.info('No integration services enabled, using mock data');
      const mockData = getMockAlerts(params);
      return res.json(mockData);
    }
    
    // Array to hold promises from all services
    const promises = [];
    const results = {};
    
    // Call each enabled service
    for (const [source, service] of Object.entries(services)) {
      promises.push(
        service.getAlerts(params)
          .then(data => {
            results[source] = data;
            return data;
          })
          .catch(error => {
            logger.error(`Error fetching alerts from ${source}:`, error);
            results[source] = { error: error.message };
            return [];
          })
      );
    }
    
    // Wait for all service calls to complete
    await Promise.all(promises);
    
    // Combine and normalize results
    const normalizedAlerts = normalizeAlerts(results);
    
    // Return combined results
    res.json({
      total: normalizedAlerts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: normalizedAlerts.slice((page - 1) * limit, page * limit)
    });
  } catch (error) {
    logger.error('Error in getAlerts controller:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
};

/**
 * Update alert status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;
    
    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ message: 'Alert ID and status are required' });
    }
    
    // Check if any source prefix is in the ID (e.g., ossim:12345)
    const [source, alertId] = id.includes(':') ? id.split(':') : [null, id];
    
    // If source is specified, use that integration
    if (source && services[source]) {
      try {
        const result = await services[source].updateAlertStatus(alertId, { status, assignedTo, notes });
        return res.json(result);
      } catch (error) {
        logger.error(`Error updating alert ${id} in ${source}:`, error);
        return res.status(500).json({ message: `Failed to update alert in ${source}`, error: error.message });
      }
    }
    
    // If no source or source not found, return error
    res.status(404).json({ message: 'Alert source not found or invalid alert ID' });
  } catch (error) {
    logger.error('Error in updateAlertStatus controller:', error);
    res.status(500).json({ message: 'Failed to update alert status', error: error.message });
  }
};

/**
 * Get alert details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any source prefix is in the ID (e.g., ossim:12345)
    const [source, alertId] = id.includes(':') ? id.split(':') : [null, id];
    
    // If source is specified, use that integration
    if (source && services[source]) {
      try {
        // Get alert details from the specified source
        const result = await services[source].getAlertDetails(alertId);
        return res.json(result);
      } catch (error) {
        logger.error(`Error fetching alert ${id} details from ${source}:`, error);
        return res.status(500).json({ message: `Failed to fetch alert details from ${source}`, error: error.message });
      }
    }
    
    // If no source or source not found, try all sources
    if (Object.keys(services).length === 0) {
      // If no integrations are enabled, use mock data
      logger.info('No integration services enabled, using mock data for details');
      const mockData = getMockAlertDetails(id);
      return res.json(mockData);
    }
    
    // Try each service until we find the alert
    for (const [sourceName, service] of Object.entries(services)) {
      try {
        const result = await service.getAlertDetails(id);
        if (result) {
          return res.json(result);
        }
      } catch (error) {
        logger.debug(`Alert ${id} not found in ${sourceName}`);
      }
    }
    
    // If we get here, alert wasn't found in any service
    res.status(404).json({ message: 'Alert not found' });
  } catch (error) {
    logger.error('Error in getAlertDetails controller:', error);
    res.status(500).json({ message: 'Failed to fetch alert details', error: error.message });
  }
};

/**
 * Normalize alerts from different sources into a common format
 * @param {Object} results - Object containing results from different sources
 * @returns {Array} - Normalized array of alerts
 */
function normalizeAlerts(results) {
  const normalized = [];
  
  // Process each source's results
  for (const [source, alerts] of Object.entries(results)) {
    // Skip sources with errors
    if (alerts.error) continue;
    
    // If alerts is an array, process each alert
    if (Array.isArray(alerts)) {
      alerts.forEach(alert => {
        // Common format for alerts from all sources
        normalized.push({
          id: `${source}:${alert.id || alert._id || alert.alertId}`,
          source: source,
          title: alert.title || alert.name || alert.message || 'Unknown Alert',
          severity: alert.severity || alert.risk || alert.level || 'unknown',
          status: alert.status || 'active',
          category: alert.category || alert.type || 'uncategorized',
          timestamp: alert.timestamp || alert.created || alert.time || new Date().toISOString(),
          description: alert.description || alert.message || '',
          sourceIp: alert.sourceIp || alert.src_ip || '',
          destinationIp: alert.destinationIp || alert.dst_ip || '',
          // Add any additional fields common across sources
        });
      });
    }
  }
  
  // Sort by timestamp (newest first)
  return normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Generate mock alerts for testing when no integration is available
 * @param {Object} params - Query parameters
 * @returns {Object} - Mock data with pagination
 */
function getMockAlerts(params) {
  const { page = 1, limit = 20 } = params;
  
  // Generate mock alerts
  const mockAlerts = Array.from({ length: 50 }, (_, i) => ({
    id: `mock:${i + 1}`,
    source: 'mock',
    title: `Mock Alert ${i + 1}`,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    status: ['active', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)],
    category: ['malware', 'intrusion', 'authentication', 'policy'][Math.floor(Math.random() * 4)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    description: `This is a mock alert for testing purposes.`,
    sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    destinationIp: `10.0.0.${Math.floor(Math.random() * 254) + 1}`
  }));
  
  // Apply filtering based on params
  let filtered = [...mockAlerts];
  
  if (params.status) {
    filtered = filtered.filter(a => a.status === params.status);
  }
  
  if (params.severity) {
    filtered = filtered.filter(a => a.severity === params.severity);
  }
  
  if (params.category) {
    filtered = filtered.filter(a => a.category === params.category);
  }
  
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(searchLower) || 
      a.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.startDate) {
    const startDate = new Date(params.startDate);
    filtered = filtered.filter(a => new Date(a.timestamp) >= startDate);
  }
  
  if (params.endDate) {
    const endDate = new Date(params.endDate);
    filtered = filtered.filter(a => new Date(a.timestamp) <= endDate);
  }
  
  // Apply pagination
  const paginatedResults = filtered.slice((page - 1) * limit, page * limit);
  
  return {
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginatedResults
  };
}

/**
 * Generate mock alert details for testing
 * @param {String} id - Alert ID
 * @returns {Object} - Mock alert details
 */
function getMockAlertDetails(id) {
  return {
    id: id,
    source: 'mock',
    title: `Detailed Mock Alert ${id}`,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    status: ['active', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)],
    category: ['malware', 'intrusion', 'authentication', 'policy'][Math.floor(Math.random() * 4)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    description: `This is a detailed mock alert for testing purposes.`,
    sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    destinationIp: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
    // Additional detailed fields
    protocol: ['TCP', 'UDP', 'ICMP', 'HTTP'][Math.floor(Math.random() * 4)],
    port: Math.floor(Math.random() * 65535) + 1,
    user: `user${Math.floor(Math.random() * 10) + 1}`,
    hostname: `host-${Math.floor(Math.random() * 10) + 1}.example.com`,
    eventCount: Math.floor(Math.random() * 100) + 1,
    firstSeen: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString(),
    relatedEvents: Array.from({ length: 5 }, (_, i) => ({
      id: `event-${i + 1}`,
      type: ['login', 'access', 'network', 'file'][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      description: `Related event ${i + 1} for alert ${id}`
    }))
  };
}
