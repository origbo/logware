/**
 * Threat Source Model
 * Defines external threat intelligence sources for integration
 */
const mongoose = require('mongoose');

const threatSourceSchema = new mongoose.Schema({
  // Name of the threat intelligence source
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  // Description of this source
  description: String,
  
  // Type of source
  type: {
    type: String,
    required: true,
    enum: [
      'misp',        // MISP (Malware Information Sharing Platform)
      'otx',         // AlienVault OTX
      'virustotal',  // VirusTotal
      'threatfox',   // ThreatFox
      'anomali',     // Anomali ThreatStream
      'riskiq',      // RiskIQ
      'crowdstrike', // CrowdStrike Intelligence
      'mandiant',    // Mandiant Intelligence
      'talos',       // Cisco Talos
      'urlhaus',     // URLhaus
      'hybrid',      // Hybrid Analysis
      'threatgrid',  // Cisco ThreatGrid
      'custom_api',  // Custom API Source
      'csv',         // CSV Feed
      'stix',        // STIX/TAXII feed
      'other'        // Other sources
    ]
  },
  
  // Status of the integration
  status: {
    type: String,
    enum: ['active', 'disabled', 'error'],
    default: 'active'
  },
  
  // Connection details
  connection: {
    // Base URL for the API
    url: {
      type: String,
      required: true
    },
    
    // Authentication details
    authentication: {
      type: {
        type: String,
        enum: ['api_key', 'oauth2', 'basic', 'none'],
        default: 'api_key'
      },
      apiKey: String,
      username: String,
      password: String,
      oauthClientId: String,
      oauthClientSecret: String,
      oauthTokenUrl: String,
      accessToken: String,
      refreshToken: String
    },
    
    // Additional headers to include
    headers: {
      type: Map,
      of: String
    }
  },
  
  // Feed configuration
  configuration: {
    // How often to sync data from this source (in minutes)
    syncInterval: {
      type: Number,
      default: 1440 // Default to daily
    },
    
    // Maximum age of indicators to fetch (in days, 0 for no limit)
    maxAgeInDays: {
      type: Number,
      default: 30
    },
    
    // Minimum confidence score to include (0-100)
    minimumConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    
    // Types of indicators to fetch from this source
    indicatorTypes: {
      type: [String],
      default: ['ip', 'domain', 'url', 'file_hash_md5', 'file_hash_sha1', 'file_hash_sha256']
    },
    
    // Threat categories to fetch
    threatCategories: {
      type: [String],
      default: []
    },
    
    // Tags to fetch (source-specific tag filtering)
    tags: {
      type: [String],
      default: []
    },
    
    // Whether to automatically create incidents for high-confidence matches
    autoCreateIncidents: {
      type: Boolean,
      default: false
    },
    
    // Default expiration for indicators from this source (in days, 0 for no expiration)
    defaultExpirationInDays: {
      type: Number,
      default: 90
    }
  },
  
  // Integration status tracking
  integrationStatus: {
    lastSyncAt: Date,
    lastSyncStatus: {
      type: String,
      enum: ['success', 'partial', 'failed', 'never_run'],
      default: 'never_run'
    },
    lastSyncMessage: String,
    indicatorCount: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    consecutiveErrors: {
      type: Number,
      default: 0
    }
  },
  
  // Custom transforms for this source (JavaScript function strings)
  transforms: {
    indicatorTransform: String,
    nameNormalization: String
  },
  
  // Created/managed by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const ThreatSource = mongoose.model('ThreatSource', threatSourceSchema);

module.exports = ThreatSource;
