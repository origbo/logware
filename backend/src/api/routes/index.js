/**
 * Main API Router
 * Centralizes all API routes for the Logware platform
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const alertRoutes = require('./alerts');
const dashboardRoutes = require('./dashboard');
const incidentResponseRoutes = require('./incidentResponse');
const threatIntelligenceRoutes = require('./threatIntelligence');
const securityAnalyticsRoutes = require('./securityAnalytics');

// Define API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/incidents', incidentResponseRoutes);
router.use('/threat-intelligence', threatIntelligenceRoutes);
router.use('/security-analytics', securityAnalyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0'
  });
});

module.exports = router;
