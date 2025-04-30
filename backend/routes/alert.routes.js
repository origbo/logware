const express = require('express');
const router = express.Router();

// Mock alerts data
const alertsData = [];

// Alert severity levels
const severities = ['critical', 'high', 'medium', 'low'];

// Alert categories
const categories = [
  'intrusion',
  'malware',
  'authentication',
  'policy_violation',
  'system',
  'network',
  'data_leak'
];

// Mock sources
const sources = ['IDS', 'Firewall', 'Antivirus', 'SIEM', 'Network Monitor', 'System Monitor'];

// Generate 50 sample alerts
for (let i = 1; i <= 50; i++) {
  // Create random timestamp within the last 7 days
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7));
  timestamp.setHours(Math.floor(Math.random() * 24));
  timestamp.setMinutes(Math.floor(Math.random() * 60));
  
  // Random severity with weighted distribution
  const rand = Math.random();
  let severity;
  if (rand < 0.1) {
    severity = 'critical';
  } else if (rand < 0.3) {
    severity = 'high';
  } else if (rand < 0.7) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  // Random category, source, and status
  const category = categories[Math.floor(Math.random() * categories.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  
  // Status logic: newer and higher severity alerts more likely to be 'active'
  const daysSince = (new Date() - timestamp) / (1000 * 60 * 60 * 24);
  const sevIndex = severities.indexOf(severity);
  let status;
  
  // Weight calculation: newer and more severe alerts are more likely to be active
  const activeWeight = 0.9 - (daysSince * 0.1) - (sevIndex * 0.15);
  
  if (Math.random() < activeWeight) {
    status = 'active';
  } else if (Math.random() < 0.6) {
    status = 'acknowledged';
  } else {
    status = 'resolved';
  }
  
  // Create different alert messages based on category
  let message = '';
  let affectedSystem = '';
  let ipAddress = `192.168.1.${Math.floor(Math.random() * 254 + 1)}`;
  
  switch (category) {
    case 'intrusion':
      message = `Possible intrusion attempt detected from ${ipAddress}`;
      affectedSystem = 'Firewall';
      break;
    case 'malware':
      message = `Malware detected: ${['Trojan', 'Ransomware', 'Spyware', 'Worm'][Math.floor(Math.random() * 4)]} found on ${['Web Server', 'Database Server', 'File Server', 'Client Workstation'][Math.floor(Math.random() * 4)]}`;
      affectedSystem = 'Server';
      break;
    case 'authentication':
      message = `Multiple failed login attempts for user ${'user' + Math.floor(Math.random() * 10)}`;
      affectedSystem = 'Authentication Server';
      break;
    case 'policy_violation':
      message = `Policy violation: Unauthorized access to restricted resource`;
      affectedSystem = 'Access Control System';
      break;
    case 'system':
      message = `System resource exceeded threshold: ${['CPU', 'Memory', 'Disk', 'Network'][Math.floor(Math.random() * 4)]} usage at ${Math.floor(Math.random() * 30 + 70)}%`;
      affectedSystem = 'Monitoring System';
      break;
    case 'network':
      message = `Network anomaly detected: ${['Unusual traffic pattern', 'Bandwidth spike', 'Port scanning', 'ARP poisoning'][Math.floor(Math.random() * 4)]}`;
      affectedSystem = 'Network IDS';
      break;
    case 'data_leak':
      message = `Potential data exfiltration detected: Large data transfer to external IP`;
      affectedSystem = 'DLP System';
      break;
    default:
      message = `Security alert detected`;
      affectedSystem = 'Security System';
  }
  
  // Create the alert object
  const alert = {
    id: i.toString(),
    timestamp: timestamp,
    message: message,
    severity: severity,
    category: category,
    source: source,
    status: status,
    affectedSystem: affectedSystem,
    ipAddress: ipAddress,
    assignedTo: status !== 'active' ? ['John Smith', 'Emma Johnson', 'Michael Brown'][Math.floor(Math.random() * 3)] : null,
    notes: status === 'resolved' ? ['Issue investigated and resolved', 'False positive confirmed', 'Patch applied to affected system'][Math.floor(Math.random() * 3)] : [],
    resolvedAt: status === 'resolved' ? new Date(timestamp.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null
  };
  
  alertsData.push(alert);
}

// Sort alerts by timestamp (newest first)
alertsData.sort((a, b) => b.timestamp - a.timestamp);

// Middleware to simulate authentication
const authenticate = (req, res, next) => {
  // In a real app, this would verify the JWT token
  req.user = { id: '1', role: 'admin' };
  next();
};

// Get all alerts with filtering and pagination
router.get('/', authenticate, (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      severity,
      category,
      startDate,
      endDate,
      search
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Apply filters
    let filteredAlerts = [...alertsData];
    
    if (status) {
      const statuses = status.split(',');
      filteredAlerts = filteredAlerts.filter(alert => statuses.includes(alert.status));
    }
    
    if (severity) {
      const severities = severity.split(',');
      filteredAlerts = filteredAlerts.filter(alert => severities.includes(alert.severity));
    }
    
    if (category) {
      const categories = category.split(',');
      filteredAlerts = filteredAlerts.filter(alert => categories.includes(alert.category));
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.timestamp) <= end);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.message.toLowerCase().includes(searchLower) ||
        alert.affectedSystem.toLowerCase().includes(searchLower) ||
        alert.ipAddress.toLowerCase().includes(searchLower) ||
        (alert.assignedTo && alert.assignedTo.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
    // Group by status for summary
    const summary = {
      active: filteredAlerts.filter(alert => alert.status === 'active').length,
      acknowledged: filteredAlerts.filter(alert => alert.status === 'acknowledged').length,
      resolved: filteredAlerts.filter(alert => alert.status === 'resolved').length,
      total: filteredAlerts.length
    };
    
    // Group by severity for summary
    const severitySummary = {
      critical: filteredAlerts.filter(alert => alert.severity === 'critical').length,
      high: filteredAlerts.filter(alert => alert.severity === 'high').length,
      medium: filteredAlerts.filter(alert => alert.severity === 'medium').length,
      low: filteredAlerts.filter(alert => alert.severity === 'low').length
    };
    
    // Prepare response
    const response = {
      alerts: paginatedAlerts,
      page: pageNum,
      limit: limitNum,
      totalAlerts: filteredAlerts.length,
      totalPages: Math.ceil(filteredAlerts.length / limitNum),
      summary: summary,
      severitySummary: severitySummary
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'An error occurred while fetching alerts' });
  }
});

// Get alert by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = alertsData.find(alert => alert.id === id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ message: 'An error occurred while fetching alert' });
  }
});

// Update alert status (acknowledge or resolve)
router.put('/:id/status', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    if (!status || !['active', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const alertIndex = alertsData.findIndex(alert => alert.id === id);
    
    if (alertIndex === -1) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    const alert = alertsData[alertIndex];
    
    // Update status
    alert.status = status;
    
    // Add note if provided
    if (note) {
      if (!alert.notes) {
        alert.notes = [];
      }
      alert.notes.push(note);
    }
    
    // Assign to current user if acknowledging
    if (status === 'acknowledged' && !alert.assignedTo) {
      alert.assignedTo = `User ${req.user.id}`;
    }
    
    // Set resolved timestamp if resolving
    if (status === 'resolved' && !alert.resolvedAt) {
      alert.resolvedAt = new Date();
    }
    
    // Update in mock database
    alertsData[alertIndex] = alert;
    
    res.json(alert);
  } catch (error) {
    console.error('Update alert status error:', error);
    res.status(500).json({ message: 'An error occurred while updating alert status' });
  }
});

// Assign alert to user
router.put('/:id/assign', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({ message: 'Assigned user is required' });
    }
    
    const alertIndex = alertsData.findIndex(alert => alert.id === id);
    
    if (alertIndex === -1) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Update assigned user
    alertsData[alertIndex].assignedTo = assignedTo;
    
    // If alert is active, change to acknowledged
    if (alertsData[alertIndex].status === 'active') {
      alertsData[alertIndex].status = 'acknowledged';
    }
    
    res.json(alertsData[alertIndex]);
  } catch (error) {
    console.error('Assign alert error:', error);
    res.status(500).json({ message: 'An error occurred while assigning alert' });
  }
});

// Add note to alert
router.post('/:id/notes', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const alertIndex = alertsData.findIndex(alert => alert.id === id);
    
    if (alertIndex === -1) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Initialize notes array if it doesn't exist
    if (!alertsData[alertIndex].notes) {
      alertsData[alertIndex].notes = [];
    }
    
    // Add note with timestamp and user
    const noteEntry = {
      content: note,
      timestamp: new Date(),
      user: `User ${req.user.id}`
    };
    
    alertsData[alertIndex].notes.push(noteEntry);
    
    res.json(alertsData[alertIndex]);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'An error occurred while adding note' });
  }
});

// Get alert statistics
router.get('/stats/summary', authenticate, (req, res) => {
  try {
    // Count by status
    const statusCount = {
      active: alertsData.filter(alert => alert.status === 'active').length,
      acknowledged: alertsData.filter(alert => alert.status === 'acknowledged').length,
      resolved: alertsData.filter(alert => alert.status === 'resolved').length
    };
    
    // Count by severity
    const severityCount = {
      critical: alertsData.filter(alert => alert.severity === 'critical').length,
      high: alertsData.filter(alert => alert.severity === 'high').length,
      medium: alertsData.filter(alert => alert.severity === 'medium').length,
      low: alertsData.filter(alert => alert.severity === 'low').length
    };
    
    // Count by category
    const categoryCount = {};
    alertsData.forEach(alert => {
      categoryCount[alert.category] = (categoryCount[alert.category] || 0) + 1;
    });
    
    // Get alerts by day (last 7 days)
    const now = new Date();
    const last7Days = [];
    const dailyCounts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      last7Days.push(date.toISOString().split('T')[0]);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = alertsData.filter(alert => {
        const alertDate = new Date(alert.timestamp);
        return alertDate >= date && alertDate < nextDay;
      }).length;
      
      dailyCounts.push(count);
    }
    
    // Average resolution time (for resolved alerts)
    const resolvedAlerts = alertsData.filter(alert => alert.status === 'resolved' && alert.resolvedAt);
    let avgResolutionTime = 0;
    
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        return sum + (new Date(alert.resolvedAt) - new Date(alert.timestamp));
      }, 0);
      
      avgResolutionTime = totalResolutionTime / resolvedAlerts.length;
      // Convert to hours
      avgResolutionTime = Math.round(avgResolutionTime / (1000 * 60 * 60) * 10) / 10;
    }
    
    // Prepare response
    const response = {
      total: alertsData.length,
      byStatus: statusCount,
      bySeverity: severityCount,
      byCategory: categoryCount,
      byDay: {
        labels: last7Days,
        data: dailyCounts
      },
      avgResolutionTimeHours: avgResolutionTime
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ message: 'An error occurred while fetching alert stats' });
  }
});

module.exports = router;
