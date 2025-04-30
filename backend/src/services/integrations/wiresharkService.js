/**
 * Wireshark Integration Service
 * Connects to Wireshark/tshark API for network packet capture and analysis
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class WiresharkService {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get network traffic captures
   * @param {Object} params - Query parameters for filtering captures
   * @returns {Promise<Array>} - Array of packet capture data
   */
  async getCaptures(params = {}) {
    try {
      const response = await this.client.get('/captures', { params });
      logger.info(`Retrieved ${response.data.length} captures from Wireshark`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching Wireshark captures:', error);
      throw new Error('Failed to fetch captures from Wireshark');
    }
  }

  /**
   * Start a new packet capture
   * @param {Object} config - Capture configuration (interface, filter, duration)
   * @returns {Promise<Object>} - Capture session details
   */
  async startCapture(config = {}) {
    try {
      const response = await this.client.post('/captures/start', config);
      logger.info(`Started new capture with ID ${response.data.captureId}`);
      return response.data;
    } catch (error) {
      logger.error('Error starting Wireshark capture:', error);
      throw new Error('Failed to start Wireshark capture');
    }
  }

  /**
   * Stop an active packet capture
   * @param {String} captureId - ID of the capture to stop
   * @returns {Promise<Object>} - Capture results
   */
  async stopCapture(captureId) {
    try {
      const response = await this.client.post(`/captures/${captureId}/stop`);
      logger.info(`Stopped capture ${captureId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error stopping Wireshark capture ${captureId}:`, error);
      throw new Error('Failed to stop Wireshark capture');
    }
  }

  /**
   * Apply filters to an existing capture
   * @param {String} captureId - ID of the capture
   * @param {Object} filters - Wireshark display filters
   * @returns {Promise<Object>} - Filtered packet data
   */
  async applyFilters(captureId, filters) {
    try {
      const response = await this.client.post(`/captures/${captureId}/filter`, filters);
      logger.info(`Applied filters to capture ${captureId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error applying filters to capture ${captureId}:`, error);
      throw new Error('Failed to apply filters to Wireshark capture');
    }
  }
}

module.exports = WiresharkService;
