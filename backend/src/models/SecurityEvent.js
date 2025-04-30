/**
 * Security Event Model
 * Stores security events for analysis and anomaly detection
 */
const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  // Event source (e.g., firewall, IDS, server logs)
  source: {
    type: String,
    required: true,
    index: true
  },
  
  // Event type 
  eventType: {
    type: String,
    required: true,
    index: true
  },
  
  // Severity level (0-100)
  severity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
    index: true
  },
  
  // Normalized event category
  category: {
    type: String,
    enum: [
      'authentication',
      'authorization',
      'network',
      'malware',
      'data_access',
      'system',
      'application',
      'file',
      'dns',
      'web',
      'other'
    ],
    required: true,
    index: true
  },
  
  // Event timestamp
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // Event status
  status: {
    type: String,
    enum: ['new', 'analyzing', 'normal', 'suspicious', 'threat', 'benign'],
    default: 'new',
    index: true
  },
  
  // Host information
  host: {
    hostname: String,
    ip: String,
    os: String,
    type: {
      type: String,
      enum: ['server', 'desktop', 'mobile', 'network', 'other']
    }
  },
  
  // User information
  user: {
    id: String,
    name: String,
    role: String
  },
  
  // Network details
  network: {
    srcIp: String,
    dstIp: String,
    srcPort: Number,
    dstPort: Number,
    protocol: String,
    direction: {
      type: String,
      enum: ['inbound', 'outbound', 'internal', 'external']
    }
  },
  
  // Process information
  process: {
    name: String,
    path: String,
    pid: Number,
    args: String,
    hash: String
  },
  
  // File information
  file: {
    name: String,
    path: String,
    hash: String,
    size: Number,
    type: String
  },
  
  // Web request details
  web: {
    method: String,
    url: String,
    userAgent: String,
    referer: String,
    statusCode: Number
  },
  
  // DNS query information
  dns: {
    query: String,
    recordType: String,
    response: String
  },
  
  // Authentication details
  authentication: {
    method: String,
    success: Boolean,
    reason: String
  },
  
  // Raw event data
  rawData: mongoose.Schema.Types.Mixed,
  
  // Analysis results
  analysis: {
    // Anomaly score (0-100, higher = more anomalous)
    anomalyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    // Anomaly details
    anomalyFactors: [{
      factor: String,
      score: Number,
      description: String
    }],
    
    // Flag if event is part of a pattern
    partOfPattern: {
      type: Boolean,
      default: false
    },
    
    // Related pattern ID if part of one
    patternId: mongoose.Schema.Types.ObjectId,
    
    // Model version used for analysis
    modelVersion: String,
    
    // Analysis timestamp
    analyzedAt: Date
  },
  
  // Related events
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecurityEvent'
  }],
  
  // Related threat indicators (if matched)
  relatedThreats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ThreatIndicator'
  }],
  
  // Related incidents
  relatedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  
  // Tags for manual classification
  tags: [{
    type: String,
    trim: true
  }],
  
  // Notes for analysts
  notes: String
}, { 
  timestamps: true,
  // Enable TTL index to automatically delete old events
  // Default to 90 days retention
  expireAfterSeconds: 60 * 60 * 24 * 90
});

// Create compound indices for common queries
securityEventSchema.index({ 'host.hostname': 1, timestamp: -1 });
securityEventSchema.index({ 'network.srcIp': 1, timestamp: -1 });
securityEventSchema.index({ 'network.dstIp': 1, timestamp: -1 });
securityEventSchema.index({ 'user.id': 1, timestamp: -1 });
securityEventSchema.index({ category: 1, severity: -1, timestamp: -1 });
securityEventSchema.index({ 'analysis.anomalyScore': -1, timestamp: -1 });

// Pre-save middleware to ensure category is set
securityEventSchema.pre('save', function(next) {
  if (!this.category) {
    // Set a default category based on eventType if not explicitly provided
    if (this.eventType.includes('login') || this.eventType.includes('auth')) {
      this.category = 'authentication';
    } else if (this.eventType.includes('network') || this.eventType.includes('connection')) {
      this.category = 'network';
    } else if (this.eventType.includes('malware') || this.eventType.includes('virus')) {
      this.category = 'malware';
    } else if (this.eventType.includes('file')) {
      this.category = 'file';
    } else if (this.eventType.includes('system')) {
      this.category = 'system';
    } else if (this.eventType.includes('web')) {
      this.category = 'web';
    } else if (this.eventType.includes('dns')) {
      this.category = 'dns';
    } else {
      this.category = 'other';
    }
  }
  next();
});

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);

module.exports = SecurityEvent;
