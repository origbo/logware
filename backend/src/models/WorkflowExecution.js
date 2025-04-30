/**
 * Workflow Execution Model
 * Tracks the execution of incident response workflows
 */
const mongoose = require('mongoose');

const workflowExecutionStepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'in_progress',
      'awaiting_approval',
      'completed',
      'failed',
      'skipped',
      'timed_out'
    ],
    default: 'pending'
  },
  output: mongoose.Schema.Types.Mixed,
  startedAt: Date,
  completedAt: Date,
  duration: Number,
  retryCount: {
    type: Number,
    default: 0
  },
  approvalData: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approved: Boolean,
    comments: String,
    timestamp: Date
  },
  error: String
});

const workflowExecutionSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowTemplate',
    required: true
  },
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: [
      'created',
      'in_progress',
      'awaiting_approval',
      'completed',
      'failed',
      'canceled'
    ],
    default: 'created'
  },
  steps: [workflowExecutionStepSchema],
  currentStepIndex: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalDuration: Number,
  executedBy: {
    type: String,
    enum: ['system', 'user'],
    default: 'system'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Add indices for faster queries
workflowExecutionSchema.index({ incidentId: 1 });
workflowExecutionSchema.index({ status: 1 });
workflowExecutionSchema.index({ startedAt: -1 });

// Calculate total duration when workflow completes
workflowExecutionSchema.pre('save', function(next) {
  if (this.isModified('completedAt') && this.completedAt) {
    const startTime = this.startedAt || this.createdAt;
    this.totalDuration = (this.completedAt - startTime) / 1000; // in seconds
  }
  next();
});

const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

module.exports = WorkflowExecution;
