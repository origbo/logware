const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// @route   GET api/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // This would normally fetch real data from various integrated tools
    // For now, we'll return mock data
    const dashboardData = {
      summary: {
        activeAlerts: 12,
        resolvedAlerts: 28,
        totalLogs: 5873,
        activeSystems: 42
      },
      recentAlerts: [
        {
          id: 'a1',
          severity: 'high',
          source: 'OSSIM',
          message: 'Potential brute force attack detected',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 'a2',
          severity: 'medium',
          source: 'Snort',
          message: 'Suspicious outbound connection',
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: 'a3',
          severity: 'low',
          source: 'Nagios',
          message: 'Disk space warning on server db-01',
          timestamp: new Date(Date.now() - 10800000)
        }
      ],
      systemStatus: [
        { name: 'Web Server', status: 'healthy', uptime: '99.9%' },
        { name: 'Database Server', status: 'healthy', uptime: '99.7%' },
        { name: 'Application Server', status: 'warning', uptime: '98.2%' },
        { name: 'Load Balancer', status: 'healthy', uptime: '99.9%' }
      ],
      networkTraffic: [
        { timestamp: new Date(Date.now() - 86400000), inbound: 42, outbound: 35 },
        { timestamp: new Date(Date.now() - 72000000), inbound: 58, outbound: 48 },
        { timestamp: new Date(Date.now() - 57600000), inbound: 64, outbound: 52 },
        { timestamp: new Date(Date.now() - 43200000), inbound: 72, outbound: 63 },
        { timestamp: new Date(Date.now() - 28800000), inbound: 81, outbound: 71 },
        { timestamp: new Date(Date.now() - 14400000), inbound: 76, outbound: 64 },
        { timestamp: new Date(Date.now()), inbound: 68, outbound: 58 }
      ],
      threatMap: {
        totalThreats: 87,
        topCountries: [
          { country: 'United States', count: 28 },
          { country: 'China', count: 18 },
          { country: 'Russia', count: 15 },
          { country: 'Brazil', count: 9 },
          { country: 'India', count: 7 }
        ]
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/user
// @desc    Get user-specific dashboard data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // In a real implementation, this would fetch user-specific data
    // For now, return mock data with user ID
    const userDashboardData = {
      userId: req.user.id,
      recentActivity: [
        {
          id: 'act1',
          action: 'Login',
          timestamp: new Date(Date.now() - 86400000),
          details: 'Login from 192.168.1.1'
        },
        {
          id: 'act2',
          action: 'Alert Acknowledged',
          timestamp: new Date(Date.now() - 43200000),
          details: 'Alert #5523: Potential data exfiltration'
        },
        {
          id: 'act3',
          action: 'Report Generated',
          timestamp: new Date(Date.now() - 21600000),
          details: 'Weekly Security Summary'
        }
      ],
      savedReports: [
        { id: 'r1', name: 'Monthly Network Traffic', created: new Date(Date.now() - 2592000000) },
        { id: 'r2', name: 'Security Incidents Q1', created: new Date(Date.now() - 1296000000) },
        { id: 'r3', name: 'System Performance', created: new Date(Date.now() - 604800000) }
      ],
      favoriteViews: [
        { id: 'v1', name: 'Network Traffic Monitor', type: 'dashboard' },
        { id: 'v2', name: 'Security Alerts', type: 'dashboard' },
        { id: 'v3', name: 'System Health', type: 'dashboard' }
      ]
    };

    res.json(userDashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
