/**
 * OSSIM Integration Service
 * Connects to OSSIM API for security information and event management
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class OSSIMService {
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
   * Get security alerts from OSSIM
   * @param {Object} params - Query parameters for filtering alerts
   * @returns {Promise<Array>} - Array of alert objects
   */
  async getAlerts(params = {}) {
    try {
      const response = await this.client.get('/alerts', { params });
      logger.info(`Retrieved ${response.data.length} alerts from OSSIM`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching OSSIM alerts:', error);
      throw new Error('Failed to fetch alerts from OSSIM');
    }
  }

  /**
   * Get security logs from OSSIM
   * @param {Object} params - Query parameters for filtering logs
   * @returns {Promise<Array>} - Array of log objects
   */
  async getLogs(params = {}) {
    try {
      const response = await this.client.get('/logs', { params });
      logger.info(`Retrieved ${response.data.length} logs from OSSIM`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching OSSIM logs:', error);
      throw new Error('Failed to fetch logs from OSSIM');
    }
  }

  /**
   * Get network devices from OSSIM
   * @returns {Promise<Array>} - Array of network device objects
   */
  async getNetworkDevices() {
    try {
      const response = await this.client.get('/network/devices');
      logger.info(`Retrieved ${response.data.length} network devices from OSSIM`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching OSSIM network devices:', error);
      throw new Error('Failed to fetch network devices from OSSIM');
    }
  }

  /**
   * Get security events from OSSIM
   * @param {Object} params - Query parameters for filtering events
   * @returns {Promise<Array>} - Array of event objects
   */
  async getEvents(params = {}) {
    try {
      const response = await this.client.get('/events', { params });
      logger.info(`Retrieved ${response.data.length} events from OSSIM`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching OSSIM events:', error);
      throw new Error('Failed to fetch events from OSSIM');
    }
  }

  /**
   * Get security vulnerabilities from OSSIM
   * @param {Object} params - Query parameters for filtering vulnerabilities
   * @returns {Promise<Array>} - Array of vulnerability objects
   */
  async getVulnerabilities(params = {}) {
    try {
      const response = await this.client.get('/vulnerabilities', { params });
      logger.info(`Retrieved ${response.data.length} vulnerabilities from OSSIM`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching OSSIM vulnerabilities:', error);
      throw new Error('Failed to fetch vulnerabilities from OSSIM');
    }
  }
}

module.exports = OSSIMService;
