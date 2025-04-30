/**
 * Integration Configuration
 * Contains connection details for security tools and SIEM systems
 */

// Load environment variables
require('dotenv').config();

// Integration configuration
const integrations = {
  // SIEM and Security Tool Integrations
  ossim: {
    baseURL: process.env.OSSIM_BASE_URL || 'https://ossim.example.com/api/v1',
    apiKey: process.env.OSSIM_API_KEY || 'your-ossim-api-key',
    enabled: process.env.OSSIM_ENABLED === 'true' || false
  },
  wireshark: {
    baseURL: process.env.WIRESHARK_BASE_URL || 'http://wireshark-api.local:8080',
    apiKey: process.env.WIRESHARK_API_KEY || 'your-wireshark-api-key',
    enabled: process.env.WIRESHARK_ENABLED === 'true' || false
  },
  splunk: {
    baseURL: process.env.SPLUNK_BASE_URL || 'https://splunk.example.com/services/rest',
    apiKey: process.env.SPLUNK_API_KEY || 'your-splunk-api-key',
    enabled: process.env.SPLUNK_ENABLED === 'true' || false
  },
  elasticsearch: {
    node: process.env.ELK_NODE || 'http://elasticsearch:9200',
    apiKey: process.env.ELK_API_KEY || 'your-elk-api-key',
    defaultIndex: process.env.ELK_DEFAULT_INDEX || 'logware-logs',
    enabled: process.env.ELK_ENABLED === 'true' || false
  },
  
  // Threat Intelligence Platform Integrations
  misp: {
    apiUrl: process.env.MISP_API_URL || 'https://misp.example.org/api',
    apiKey: process.env.MISP_API_KEY || 'your-misp-api-key',
    timeout: process.env.MISP_TIMEOUT || 30000,
    enabled: process.env.MISP_ENABLED === 'true' || false,
    verifySSL: process.env.MISP_VERIFY_SSL !== 'false',
    syncInterval: process.env.MISP_SYNC_INTERVAL || 3600000, // Default: 1 hour
    defaultDistribution: process.env.MISP_DEFAULT_DISTRIBUTION || 0 // Default: Your organization only
  },
  otx: {
    apiKey: process.env.OTX_API_KEY || 'your-otx-api-key',
    timeout: process.env.OTX_TIMEOUT || 30000,
    enabled: process.env.OTX_ENABLED === 'true' || false,
    syncInterval: process.env.OTX_SYNC_INTERVAL || 3600000, // Default: 1 hour
    pulseLimit: process.env.OTX_PULSE_LIMIT || 20 // Default: 20 pulses per sync
  },
  virustotal: {
    apiUrl: process.env.VT_API_URL || 'https://www.virustotal.com/api/v3',
    apiKey: process.env.VT_API_KEY || 'your-virustotal-api-key',
    timeout: process.env.VT_TIMEOUT || 30000,
    enabled: process.env.VT_ENABLED === 'true' || false,
    syncInterval: process.env.VT_SYNC_INTERVAL || 3600000, // Default: 1 hour
    quotaPerMinute: process.env.VT_QUOTA_PER_MINUTE || 4 // Default: 4 requests per minute (free tier)
  },
  threatfox: {
    apiUrl: process.env.THREATFOX_API_URL || 'https://threatfox-api.abuse.ch/api/v1',
    timeout: process.env.THREATFOX_TIMEOUT || 30000,
    enabled: process.env.THREATFOX_ENABLED === 'true' || false,
    syncInterval: process.env.THREATFOX_SYNC_INTERVAL || 3600000 // Default: 1 hour
  }
};

module.exports = integrations;
