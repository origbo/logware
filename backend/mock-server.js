/**
 * Mock Backend Server for Behavioral Analytics Dashboard
 * This simplified server provides mock API endpoints for testing the frontend
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mockData = require('./src/api/routes/mockData');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS Configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// CORS preflight options
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enhanced request logging
app.use((req, res, next) => {
  // Log request details
  console.log(`\n===== REQUEST =====`);
  console.log(`${new Date().toISOString()}`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'Not specified'}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  
  // Log response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`\n===== RESPONSE =====`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body preview: ${typeof body === 'string' ? body.substring(0, 100) + '...' : 'Non-string body'}`); 
    return originalSend.call(this, body);
  };
  
  next();
});

// Mount mock data routes
app.use('/api/mock-data', mockData);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Logware API Mock Server - Running',
    availableEndpoints: [
      '/api/mock-data/security-analytics/user-risk',
      '/api/mock-data/security-analytics/behavioral/baselines',
      '/api/mock-data/security-analytics/events',
      '/api/mock-data/security-analytics/dashboard',
      '/api/mock-data/security-analytics/attack-paths'
    ]
  });
});

// Test endpoint for connection verification
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API server is running and reachable',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).send({ 
    success: false, 
    message: 'Internal Server Error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api`);
});
