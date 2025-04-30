/**
 * Elasticsearch Integration Service
 * Connects to Elasticsearch API for log storage, indexing, and search
 */

const { Client } = require('@elastic/elasticsearch');
const logger = require('../../utils/logger');

class ElasticSearchService {
  constructor(config) {
    this.client = new Client({
      node: config.node,
      auth: {
        apiKey: config.apiKey
      }
    });
    this.defaultIndex = config.defaultIndex || 'logware-logs';
  }

  /**
   * Search for documents in Elasticsearch
   * @param {Object} query - Elasticsearch query DSL object
   * @param {String} index - Index to search (optional, uses default if not provided)
   * @returns {Promise<Object>} - Search results
   */
  async search(query, index = this.defaultIndex) {
    try {
      const response = await this.client.search({
        index,
        body: query
      });
      
      logger.info(`Elasticsearch search returned ${response.body.hits.total.value} results`);
      return response.body.hits;
    } catch (error) {
      logger.error('Error performing Elasticsearch search:', error);
      throw new Error('Failed to search Elasticsearch');
    }
  }

  /**
   * Index a document in Elasticsearch
   * @param {Object} document - Document to index
   * @param {String} index - Index to store document (optional, uses default if not provided)
   * @returns {Promise<Object>} - Indexing result
   */
  async indexDocument(document, index = this.defaultIndex) {
    try {
      const response = await this.client.index({
        index,
        body: document,
        refresh: true
      });
      
      logger.info(`Document indexed in Elasticsearch: ${response.body._id}`);
      return response.body;
    } catch (error) {
      logger.error('Error indexing document in Elasticsearch:', error);
      throw new Error('Failed to index document in Elasticsearch');
    }
  }

  /**
   * Get document by ID from Elasticsearch
   * @param {String} id - Document ID
   * @param {String} index - Index to search (optional, uses default if not provided)
   * @returns {Promise<Object>} - Document data
   */
  async getDocument(id, index = this.defaultIndex) {
    try {
      const response = await this.client.get({
        index,
        id
      });
      
      logger.info(`Retrieved document from Elasticsearch: ${id}`);
      return response.body;
    } catch (error) {
      logger.error(`Error retrieving document ${id} from Elasticsearch:`, error);
      throw new Error('Failed to retrieve document from Elasticsearch');
    }
  }

  /**
   * Delete document by ID from Elasticsearch
   * @param {String} id - Document ID
   * @param {String} index - Index containing document (optional, uses default if not provided)
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDocument(id, index = this.defaultIndex) {
    try {
      const response = await this.client.delete({
        index,
        id,
        refresh: true
      });
      
      logger.info(`Deleted document from Elasticsearch: ${id}`);
      return response.body;
    } catch (error) {
      logger.error(`Error deleting document ${id} from Elasticsearch:`, error);
      throw new Error('Failed to delete document from Elasticsearch');
    }
  }

  /**
   * Get cluster health status
   * @returns {Promise<Object>} - Cluster health information
   */
  async getClusterHealth() {
    try {
      const response = await this.client.cluster.health();
      logger.info(`Elasticsearch cluster status: ${response.body.status}`);
      return response.body;
    } catch (error) {
      logger.error('Error getting Elasticsearch cluster health:', error);
      throw new Error('Failed to get Elasticsearch cluster health');
    }
  }
}

module.exports = ElasticSearchService;
