/**
 * Analytics Model
 * Stores ML model configurations and metadata for security analytics
 */
const mongoose = require('mongoose');

const analyticsModelSchema = new mongoose.Schema({
  // Model name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Model description
  description: String,
  
  // Model type
  type: {
    type: String,
    required: true,
    enum: [
      'anomaly_detection',  // For detecting unusual patterns
      'classification',     // For classifying events into categories
      'clustering',         // For grouping similar events
      'forecasting',        // For predicting future events
      'pattern_recognition' // For identifying attack patterns
    ]
  },
  
  // Algorithm used
  algorithm: {
    type: String,
    required: true,
    enum: [
      'isolation_forest',   // Anomaly detection
      'local_outlier_factor',
      'one_class_svm',
      'gaussian_mixture',
      'dbscan',             // Clustering
      'kmeans',
      'random_forest',      // Classification
      'decision_tree',
      'naive_bayes',
      'knn',
      'lstm',               // Forecasting/time series
      'prophet',
      'arima',
      'custom'              // Custom algorithm
    ]
  },
  
  // Event categories this model applies to
  eventCategories: [{
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
      'other',
      'all' // Special case for models that apply to all categories
    ]
  }],
  
  // Status of the model
  status: {
    type: String,
    required: true,
    enum: [
      'draft',      // Initial configuration, not yet trained
      'training',   // Currently being trained
      'active',     // Deployed and in use
      'inactive',   // Trained but not in use
      'failed',     // Training or validation failed
      'archived'    // Outdated and archived
    ],
    default: 'draft'
  },
  
  // Training configuration
  trainingConfig: {
    // Feature selection
    features: [String],
    
    // Target variable for supervised models
    targetVariable: String,
    
    // Hyperparameters as JSON
    hyperparameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    
    // Data split ratio (training/validation/test)
    trainRatio: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7
    },
    
    validationRatio: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.15
    },
    
    testRatio: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.15
    },
    
    // Time window for training data
    timeWindow: {
      startDate: Date,
      endDate: Date
    }
  },
  
  // Deployment configuration
  deploymentConfig: {
    // How often to run the model (in minutes)
    scheduleIntervalMinutes: {
      type: Number,
      min: 5,
      default: 60
    },
    
    // Batch size for processing
    batchSize: {
      type: Number,
      min: 1,
      default: 1000
    },
    
    // Threshold settings
    thresholds: {
      // Anomaly threshold (0-100)
      anomalyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 80
      },
      
      // Probability threshold for classification (0-1)
      probability: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
      }
    },
    
    // Actions to take on detection
    actions: {
      // Whether to create incidents automatically
      createIncidents: {
        type: Boolean,
        default: false
      },
      
      // Minimum anomaly score to create incident
      incidentThreshold: {
        type: Number,
        min: 0,
        max: 100,
        default: 90
      },
      
      // Whether to send notifications
      sendNotifications: {
        type: Boolean,
        default: true
      },
      
      // Minimum anomaly score to send notification
      notificationThreshold: {
        type: Number,
        min: 0,
        max: 100,
        default: 85
      }
    }
  },
  
  // Model performance metrics
  performance: {
    // Training accuracy/metrics
    trainingMetrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      auc: Number,
      mse: Number,
      mae: Number,
      otherMetrics: {
        type: Map,
        of: Number
      }
    },
    
    // Validation metrics
    validationMetrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      auc: Number,
      mse: Number,
      mae: Number,
      otherMetrics: {
        type: Map,
        of: Number
      }
    },
    
    // Production metrics
    productionMetrics: {
      eventsProcessed: {
        type: Number,
        default: 0
      },
      anomaliesDetected: {
        type: Number,
        default: 0
      },
      incidentsCreated: {
        type: Number,
        default: 0
      },
      falsePositives: {
        type: Number,
        default: 0
      },
      lastEvaluationDate: Date
    }
  },
  
  // Model versioning
  version: {
    major: {
      type: Number,
      default: 1
    },
    minor: {
      type: Number,
      default: 0
    }
  },
  
  // Model file storage information
  modelStorage: {
    // Storage path or ID
    path: String,
    
    // Serialization format
    format: {
      type: String,
      enum: ['pickle', 'joblib', 'h5', 'onnx', 'json', 'other'],
      default: 'pickle'
    },
    
    // File size in bytes
    sizeBytes: Number,
    
    // Checksum for integrity validation
    checksum: String
  },
  
  // Training/update history
  history: [{
    version: String,
    trainedAt: Date,
    trainedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String,
    performance: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number
    },
    notes: String
  }],
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Updated by
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Create indexes for common queries
analyticsModelSchema.index({ type: 1, status: 1 });
analyticsModelSchema.index({ eventCategories: 1 });
analyticsModelSchema.index({ 'version.major': -1, 'version.minor': -1 });
analyticsModelSchema.index({ algorithm: 1 });
analyticsModelSchema.index({ tags: 1 });

// Method to get the full version string
analyticsModelSchema.methods.getVersionString = function() {
  return `${this.version.major}.${this.version.minor}`;
};

// Method to create a new version based on this model
analyticsModelSchema.methods.createNewVersion = async function(isMinor = true) {
  // Clone the current model
  const modelData = this.toObject();
  delete modelData._id;
  delete modelData.createdAt;
  delete modelData.updatedAt;
  
  // Update version
  if (isMinor) {
    modelData.version.minor += 1;
  } else {
    modelData.version.major += 1;
    modelData.version.minor = 0;
  }
  
  // Set status to draft
  modelData.status = 'draft';
  
  // Add current version to history
  if (!modelData.history) {
    modelData.history = [];
  }
  
  modelData.history.push({
    version: this.getVersionString(),
    trainedAt: this.updatedAt,
    trainedBy: this.updatedBy,
    status: this.status,
    performance: this.performance.validationMetrics,
    notes: `Created from version ${this.getVersionString()}`
  });
  
  // Create new model
  const newModel = new this.constructor(modelData);
  return await newModel.save();
};

const AnalyticsModel = mongoose.model('AnalyticsModel', analyticsModelSchema);

module.exports = AnalyticsModel;
