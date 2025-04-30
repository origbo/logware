/**
 * Integration Services Tests
 * Tests the functionality of security tool integrations
 */

const axios = require('axios');
const { OSSIMService } = require('../../services/integrations/ossimService');
const { SplunkService } = require('../../services/integrations/splunkService');
const { WiresharkService } = require('../../services/integrations/wiresharkService');
const { ElasticsearchService } = require('../../services/integrations/elasticSearchService');

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('Security Integrations', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('OSSIM Integration', () => {
    const config = {
      baseURL: 'https://ossim.example.com/api/v1',
      apiKey: 'test-api-key',
      enabled: true
    };
    
    let ossimService;
    
    beforeEach(() => {
      ossimService = new OSSIMService(config);
    });
    
    it('should fetch alerts from OSSIM', async () => {
      // Mock successful API response
      const mockAlerts = [
        { id: 1, title: 'Intrusion Detected', severity: 'high' },
        { id: 2, title: 'Suspicious Activity', severity: 'medium' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: { alerts: mockAlerts } });
      
      const result = await ossimService.getAlerts({ limit: 10 });
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/alerts'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-API-Key': config.apiKey })
        })
      );
      
      expect(result).toEqual(mockAlerts);
    });
    
    it('should handle API errors when fetching alerts', async () => {
      // Mock API error
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(ossimService.getAlerts()).rejects.toThrow('Error fetching OSSIM alerts');
    });
    
    it('should get alert details from OSSIM', async () => {
      const alertId = '12345';
      const mockAlertDetails = {
        id: alertId,
        title: 'Intrusion Detected',
        severity: 'high',
        description: 'Potential unauthorized access detected',
        timestamp: '2025-04-29T12:00:00Z',
        sourceIp: '192.168.1.100',
        destinationIp: '10.0.0.1'
      };
      
      axios.get.mockResolvedValueOnce({ data: mockAlertDetails });
      
      const result = await ossimService.getAlertDetails(alertId);
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/alerts/${alertId}`),
        expect.any(Object)
      );
      
      expect(result).toEqual(mockAlertDetails);
    });
    
    it('should update alert status in OSSIM', async () => {
      const alertId = '12345';
      const updateData = { status: 'resolved', notes: 'Fixed the issue' };
      const mockResponse = { success: true };
      
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await ossimService.updateAlertStatus(alertId, updateData);
      
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/alerts/${alertId}`),
        updateData,
        expect.any(Object)
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('Splunk Integration', () => {
    const config = {
      baseURL: 'https://splunk.example.com/services/rest',
      apiKey: 'test-splunk-token',
      enabled: true
    };
    
    let splunkService;
    
    beforeEach(() => {
      splunkService = new SplunkService(config);
    });
    
    it('should execute search query in Splunk', async () => {
      const searchQuery = 'index=security error';
      const mockResults = {
        results: [
          { _time: '2025-04-29T12:00:00Z', _raw: 'Error log entry 1' },
          { _time: '2025-04-29T12:05:00Z', _raw: 'Error log entry 2' }
        ]
      };
      
      axios.post.mockResolvedValueOnce({ data: { sid: 'search123' } });
      axios.get.mockResolvedValueOnce({ data: mockResults });
      
      const result = await splunkService.search(searchQuery);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/search/jobs'),
        expect.objectContaining({ search: `search ${searchQuery}` }),
        expect.any(Object)
      );
      
      expect(result).toEqual(mockResults.results);
    });
    
    it('should handle search errors in Splunk', async () => {
      axios.post.mockRejectedValueOnce(new Error('Splunk API Error'));
      
      await expect(splunkService.search('test query')).rejects.toThrow('Error executing Splunk search');
    });
    
    it('should get recent logs from Splunk', async () => {
      const mockLogs = [
        { _time: '2025-04-29T12:00:00Z', _raw: 'Log entry 1', source: 'firewall' },
        { _time: '2025-04-29T12:05:00Z', _raw: 'Log entry 2', source: 'webserver' }
      ];
      
      axios.post.mockResolvedValueOnce({ data: { sid: 'search123' } });
      axios.get.mockResolvedValueOnce({ data: { results: mockLogs } });
      
      const result = await splunkService.getRecentLogs({ limit: 10 });
      
      expect(result).toEqual(mockLogs);
    });
  });
  
  describe('Wireshark Integration', () => {
    const config = {
      baseURL: 'http://wireshark-api.local:8080',
      apiKey: 'test-wireshark-key',
      enabled: true
    };
    
    let wiresharkService;
    
    beforeEach(() => {
      wiresharkService = new WiresharkService(config);
    });
    
    it('should capture network packets', async () => {
      const captureOptions = { interface: 'eth0', duration: 30, filter: 'tcp' };
      const mockCaptureId = 'capture123';
      
      axios.post.mockResolvedValueOnce({ data: { captureId: mockCaptureId } });
      
      const result = await wiresharkService.startCapture(captureOptions);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/capture/start'),
        captureOptions,
        expect.any(Object)
      );
      
      expect(result).toEqual({ captureId: mockCaptureId });
    });
    
    it('should get packet capture status', async () => {
      const captureId = 'capture123';
      const mockStatus = { status: 'running', packetsCollected: 156 };
      
      axios.get.mockResolvedValueOnce({ data: mockStatus });
      
      const result = await wiresharkService.getCaptureStatus(captureId);
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/capture/${captureId}/status`),
        expect.any(Object)
      );
      
      expect(result).toEqual(mockStatus);
    });
    
    it('should get network devices', async () => {
      const mockDevices = [
        { id: 'eth0', name: 'Ethernet Interface', ipAddress: '192.168.1.100' },
        { id: 'wlan0', name: 'Wireless Interface', ipAddress: '192.168.1.101' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: { devices: mockDevices } });
      
      const result = await wiresharkService.getNetworkDevices();
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/devices'),
        expect.any(Object)
      );
      
      expect(result).toEqual(mockDevices);
    });
  });
  
  describe('Elasticsearch Integration', () => {
    const config = {
      node: 'http://elasticsearch:9200',
      apiKey: 'test-es-key',
      defaultIndex: 'logware-logs',
      enabled: true
    };
    
    let esService;
    
    beforeEach(() => {
      esService = new ElasticsearchService(config);
    });
    
    it('should search logs in Elasticsearch', async () => {
      const searchQuery = 'error';
      const mockHits = [
        { _source: { message: 'Error in application', timestamp: '2025-04-29T12:00:00Z' } },
        { _source: { message: 'Another error occurred', timestamp: '2025-04-29T12:05:00Z' } }
      ];
      
      axios.post.mockResolvedValueOnce({ 
        data: { 
          hits: { total: { value: 2 }, hits: mockHits } 
        } 
      });
      
      const result = await esService.searchLogs(searchQuery);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/_search'),
        expect.objectContaining({
          query: expect.objectContaining({
            query_string: expect.objectContaining({
              query: searchQuery
            })
          })
        }),
        expect.any(Object)
      );
      
      expect(result).toEqual(mockHits.map(hit => hit._source));
    });
    
    it('should store a new log entry', async () => {
      const logEntry = {
        message: 'System event',
        level: 'info',
        source: 'application',
        timestamp: '2025-04-29T12:00:00Z'
      };
      
      const mockResponse = { _id: 'log123', result: 'created' };
      
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await esService.storeLog(logEntry);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining(`/${config.defaultIndex}/_doc`),
        logEntry,
        expect.any(Object)
      );
      
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle Elasticsearch query errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Elasticsearch Error'));
      
      await expect(esService.searchLogs('test')).rejects.toThrow('Error searching logs');
    });
  });
});
