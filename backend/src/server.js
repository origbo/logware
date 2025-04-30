require('dotenv').config();
const express = require('express');
// Use mock MongoDB for development
const mongoose = require('./utils/mockModels');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const path = require('path');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'logware-backend' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize mock models for development
const connectDB = async () => {
  try {
    // Skip MongoDB connection and use mock models instead
    logger.info('Using mock MongoDB models for development');
    
    // Define required models
    mongoose.model('SecurityEvent', {});
    mongoose.model('AnalyticsModel', {});
    mongoose.model('User', {});
    mongoose.model('ThreatIntelligence', {});
    
    // Connect to mock MongoDB
    await mongoose.connect();
    logger.info('Mock MongoDB models initialized');
  } catch (error) {
    logger.error('Mock database initialization error:', error);
    process.exit(1);
  }
};

// Socket.io connection for real-time updates
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// API routes
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/users', require('./api/routes/users'));
app.use('/api/dashboard', require('./api/routes/dashboard'));
app.use('/api/logs', require('./api/routes/logs'));
app.use('/api/alerts', require('./api/routes/alerts'));
app.use('/api/reports', require('./api/routes/reports'));
app.use('/api/integrations', require('./api/routes/integrations'));
app.use('/api/2fa', require('./api/routes/twoFactor'));
app.use('/api/security-analytics', require('./api/routes/securityAnalytics'));
app.use('/api/mock-data', require('./api/routes/mockData'));

// Serve mock API documentation
app.get('/api', (req, res) => {
  res.send({
    success: true,
    message: 'Logware API Server - Development Mode with Mock Data',
    endpoints: [
      '/api/mock-data/security-analytics/user-risk',
      '/api/mock-data/security-analytics/behavioral/baselines',
      '/api/mock-data/security-analytics/events',
      '/api/mock-data/security-analytics/dashboard'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    connectDB();
  });
} else {
  // In test environment, just connect to DB
  connectDB();
}

module.exports = { app, server };
