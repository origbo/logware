/**
 * Base Adapter Class
 * Defines the interface for all external security platform adapters
 */
class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
    this.isConnected = false;
    this.lastConnectionAttempt = null;
    this.name = 'BaseAdapter';
    this.supportedFeatures = [];
  }

  /**
   * Initialize the adapter with configuration
   * @param {Object} config - Adapter configuration
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    this.config = { ...this.config, ...config };
    return true;
  }

  /**
   * Connect to the external service
   * @returns {Promise<boolean>} - Connection status
   */
  async connect() {
    this.lastConnectionAttempt = new Date();
    throw new Error('Method not implemented');
  }

  /**
   * Test the connection to the external service
   * @returns {Promise<Object>} - Connection test results
   */
  async testConnection() {
    throw new Error('Method not implemented');
  }

  /**
   * Disconnect from the external service
   * @returns {Promise<boolean>} - Disconnection status
   */
  async disconnect() {
    this.isConnected = false;
    return true;
  }

  /**
   * Fetch indicators from the external service
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - List of indicators
   */
  async fetchIndicators(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Submit indicators to the external service
   * @param {Array} indicators - List of indicators to submit
   * @returns {Promise<Object>} - Submission results
   */
  async submitIndicators(indicators) {
    throw new Error('Method not implemented');
  }

  /**
   * Fetch alerts from the external service
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - List of alerts
   */
  async fetchAlerts(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an alert status in the external service
   * @param {String} alertId - Alert ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated alert
   */
  async updateAlert(alertId, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Get adapter metadata and capabilities
   * @returns {Object} - Adapter information
   */
  getInfo() {
    return {
      name: this.name,
      isConnected: this.isConnected,
      lastConnectionAttempt: this.lastConnectionAttempt,
      supportedFeatures: this.supportedFeatures,
      config: {
        ...this.config,
        // Mask sensitive fields
        apiKey: this.config.apiKey ? '****' : undefined,
        password: this.config.password ? '****' : undefined
      }
    };
  }
}

module.exports = BaseAdapter;
