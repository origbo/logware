/**
 * Workflow Template Model
 * Defines reusable incident response workflow templates
 */
const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: [
      'isolate_host',
      'block_ip',
      'scan_system',
      'create_ticket',
      'require_approval',
      'generate_report',
      'custom_script'
    ]
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timeoutMinutes: {
    type: Number,
    default: 60
  },
  retryAttempts: {
    type: Number,
    default: 0
  },
  retryDelayMinutes: {
    type: Number,
    default: 5
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  onFailure: {
    type: String,
    enum: ['stop', 'continue', 'retry'],
    default: 'stop'
  }
});

const workflowTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  incidentType: {
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
  applicableSeverity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical', 'all'],
    default: 'all'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  isAutomated: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 5
  },
  steps: [workflowStepSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedCompletionMinutes: {
    type: Number
  },
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Add indices for faster queries
workflowTemplateSchema.index({ incidentType: 1, applicableSeverity: 1, isEnabled: 1 });
workflowTemplateSchema.index({ priority: -1 });

const WorkflowTemplate = mongoose.model('WorkflowTemplate', workflowTemplateSchema);

module.exports = WorkflowTemplate;
