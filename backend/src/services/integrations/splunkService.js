/**
 * Splunk Integration Service
 * Connects to Splunk API for advanced log search and analysis
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class SplunkService {
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
   * Execute a search query in Splunk
   * @param {String} query - Splunk search query
   * @param {Object} params - Additional search parameters
   * @returns {Promise<Object>} - Search results
   */
  async search(query, params = {}) {
    try {
      const response = await this.client.post('/services/search/jobs', {
        search: query,
        ...params
      });
      logger.info(`Executed Splunk search query: ${query}`);
      return response.data;
    } catch (error) {
      logger.error('Error executing Splunk search:', error);
      throw new Error('Failed to execute Splunk search');
    }
  }

  /**
   * Get search results for a specific job
   * @param {String} searchJobId - ID of the search job
   * @returns {Promise<Object>} - Search results
   */
  async getSearchResults(searchJobId) {
    try {
      const response = await this.client.get(`/services/search/jobs/${searchJobId}/results`);
      logger.info(`Retrieved results for Splunk search job: ${searchJobId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving results for Splunk search job ${searchJobId}:`, error);
      throw new Error('Failed to retrieve Splunk search results');
    }
  }

  /**
   * Get alerts from Splunk
   * @param {Object} params - Query parameters for filtering alerts
   * @returns {Promise<Array>} - Array of alert objects
   */
  async getAlerts(params = {}) {
    try {
      const response = await this.client.get('/services/alerts', { params });
      logger.info(`Retrieved ${response.data.length} alerts from Splunk`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching Splunk alerts:', error);
      throw new Error('Failed to fetch alerts from Splunk');
    }
  }

  /**
   * Create a new alert in Splunk
   * @param {Object} alertData - Alert configuration
   * @returns {Promise<Object>} - Created alert details
   */
  async createAlert(alertData) {
    try {
      const response = await this.client.post('/services/alerts', alertData);
      logger.info(`Created new alert in Splunk: ${response.data.name}`);
      return response.data;
    } catch (error) {
      logger.error('Error creating Splunk alert:', error);
      throw new Error('Failed to create Splunk alert');
    }
  }

  /**
   * Get dashboards from Splunk
   * @returns {Promise<Array>} - Array of dashboard objects
   */
  async getDashboards() {
    try {
      const response = await this.client.get('/services/data/ui/views');
      logger.info(`Retrieved ${response.data.length} dashboards from Splunk`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching Splunk dashboards:', error);
      throw new Error('Failed to fetch dashboards from Splunk');
    }
  }
}

module.exports = SplunkService;
