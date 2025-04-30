/**
 * Threat Indicator Model
 * Stores indicators of compromise (IoCs) from various threat intelligence sources
 */
const mongoose = require('mongoose');

const threatIndicatorSchema = new mongoose.Schema({
  // Indicator value (IP, domain, file hash, etc.)
  value: {
    type: String,
    required: true,
    trim: true
  },
  
  // Type of indicator
  type: {
    type: String,
    required: true,
    enum: [
      'ip', 
      'domain', 
      'url', 
      'email', 
      'file_hash_md5', 
      'file_hash_sha1', 
      'file_hash_sha256', 
      'file_hash_sha512',
      'mutex',
      'registry',
      'user_agent',
      'cve',
      'other'
    ]
  },
  
  // Threat details
  threat: {
    name: String,
    category: {
      type: String,
      enum: [
        'malware',
        'ransomware',
        'apt',
        'phishing',
        'exploit',
        'backdoor',
        'trojan',
        'botnet',
        'command_and_control',
        'ddos',
        'scanner',
        'proxy',
        'vulnerability',
        'other'
      ]
    },
    family: String,
    description: String
  },
  
  // Confidence level (0-100)
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Severity of the threat
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Source information
  source: {
    name: {
      type: String,
      required: true
    },
    url: String,
    reference: String
  },
  
  // MITRE ATT&CK information
  mitre: {
    tacticId: String,
    tacticName: String,
    techniqueId: String,
    techniqueName: String
  },
  
  // Tracking dates
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Expiration date (when this indicator is no longer considered a threat)
  expiresAt: Date,
  
  // Validation status
  status: {
    type: String,
    enum: ['active', 'expired', 'false_positive', 'retired'],
    default: 'active'
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Custom fields for source-specific data
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Matches within organization (count of times this indicator was seen)
  matchCount: {
    type: Number,
    default: 0
  },
  
  // Last time this indicator was observed in the organization
  lastMatchedAt: Date
}, { timestamps: true });

// Create compound index for faster lookups
threatIndicatorSchema.index({ value: 1, type: 1 }, { unique: true });
threatIndicatorSchema.index({ 'threat.name': 1 });
threatIndicatorSchema.index({ 'threat.category': 1 });
threatIndicatorSchema.index({ severity: 1 });
threatIndicatorSchema.index({ 'source.name': 1 });
threatIndicatorSchema.index({ status: 1 });
threatIndicatorSchema.index({ tags: 1 });

const ThreatIndicator = mongoose.model('ThreatIndicator', threatIndicatorSchema);

module.exports = ThreatIndicator;
