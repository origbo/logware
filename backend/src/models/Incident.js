/**
 * Incident Model
 * Represents a security incident in the system
 */
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'malware_detection',
      'unauthorized_access',
      'data_exfiltration',
      'network_intrusion',
      'suspicious_activity',
      'compliance_violation',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  source: {
    type: String,
    required: true,
    enum: ['manual', 'automated', 'integration', 'scan']
  },
  affectedSystems: [{
    type: String,
    trim: true
  }],
  affectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    required: true,
    enum: ['open', 'investigating', 'contained', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    action: String,
    notes: String,
    date: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  timeToDetect: {
    type: Number,
    default: 0
  },
  timeToRespond: {
    type: Number,
    default: 0
  },
  timeToResolve: {
    type: Number,
    default: 0
  },
  evidence: [{
    type: {
      type: String,
      enum: ['log', 'file', 'screenshot', 'network', 'other']
    },
    data: String,
    timestamp: Date,
    notes: String
  }],
  timeline: [{
    event: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }]
}, { timestamps: true });

// Add index for faster queries
incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ type: 1 });

// Method to add timeline event
incidentSchema.methods.addTimelineEvent = function(eventData) {
  this.timeline.push({
    event: eventData.event,
    timestamp: eventData.timestamp || new Date(),
    user: eventData.userId,
    details: eventData.details
  });
  return this.save();
};

// Middleware to update time metrics when status changes
incidentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    const createdAt = this.createdAt || now;
    
    // If status changed to investigating, calculate time to respond
    if (this.status === 'investigating' && this.timeToRespond === 0) {
      this.timeToRespond = (now - createdAt) / 1000; // in seconds
    }
    
    // If status changed to resolved, calculate time to resolve
    if (this.status === 'resolved' && this.timeToResolve === 0) {
      this.timeToResolve = (now - createdAt) / 1000; // in seconds
    }
  }
  next();
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
