const express = require('express');
const router = express.Router();

// Mock logs data
const logData = [];

// Generate 100 sample log entries
for (let i = 1; i <= 100; i++) {
  const types = ['info', 'warning', 'error', 'critical'];
  const sources = ['firewall', 'server', 'router', 'switch', 'endpoint'];
  const actions = ['connection', 'authentication', 'data transfer', 'configuration change', 'system startup'];
  const statuses = ['success', 'failure', 'blocked', 'allowed', 'timeout'];
  const ips = [
    '192.168.1.' + Math.floor(Math.random() * 254 + 1),
    '10.0.0.' + Math.floor(Math.random() * 254 + 1),
    '172.16.0.' + Math.floor(Math.random() * 254 + 1)
  ];
  
  // Create random timestamp within the last 30 days
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
  timestamp.setHours(Math.floor(Math.random() * 24));
  timestamp.setMinutes(Math.floor(Math.random() * 60));
  timestamp.setSeconds(Math.floor(Math.random() * 60));
  
  // Construct log message based on random elements
  const type = types[Math.floor(Math.random() * types.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const sourceIp = ips[Math.floor(Math.random() * ips.length)];
  const destIp = ips[Math.floor(Math.random() * ips.length)];
  
  let message = '';
  if (type === 'info') {
    message = `${action.charAt(0).toUpperCase() + action.slice(1)} ${status} from ${sourceIp}`;
  } else if (type === 'warning') {
    message = `Multiple failed ${action} attempts from ${sourceIp}`;
  } else if (type === 'error') {
    message = `${action.charAt(0).toUpperCase() + action.slice(1)} failed: ${status} for ${destIp}`;
  } else {
    message = `Security breach: Unauthorized ${action} from ${sourceIp} to ${destIp}`;
  }
  
  logData.push({
    id: i.toString(),
    timestamp: timestamp,
    type: type,
    source: source,
    sourceIp: sourceIp,
    destinationIp: destIp,
    action: action,
    status: status,
    message: message,
    details: {
      protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
      port: Math.floor(Math.random() * 65535),
      user: Math.random() > 0.7 ? 'admin' : Math.random() > 0.5 ? 'system' : 'guest'
    }
  });
}

// Middleware to simulate authentication
const authenticate = (req, res, next) => {
  // In a real app, this would verify the JWT token
  req.user = { id: '1', role: 'admin' };
  next();
};

// Get logs with pagination and filtering
router.get('/', authenticate, (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      source, 
      startDate, 
      endDate, 
      search 
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Apply filters
    let filteredLogs = [...logData];
    
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    if (source) {
      filteredLogs = filteredLogs.filter(log => log.source === source);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.sourceIp.toLowerCase().includes(searchLower) ||
        log.destinationIp.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    // Prepare response
    const response = {
      logs: paginatedLogs,
      page: pageNum,
      limit: limitNum,
      totalLogs: filteredLogs.length,
      totalPages: Math.ceil(filteredLogs.length / limitNum)
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'An error occurred while fetching logs' });
  }
});

// Get log by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const log = logData.find(log => log.id === id);
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    res.json(log);
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ message: 'An error occurred while fetching log' });
  }
});

// Get log summary stats
router.get('/stats/summary', authenticate, (req, res) => {
  try {
    // Get count by type
    const typeCount = {};
    logData.forEach(log => {
      typeCount[log.type] = (typeCount[log.type] || 0) + 1;
    });
    
    // Get count by source
    const sourceCount = {};
    logData.forEach(log => {
      sourceCount[log.source] = (sourceCount[log.source] || 0) + 1;
    });
    
    // Get count by status
    const statusCount = {};
    logData.forEach(log => {
      statusCount[log.status] = (statusCount[log.status] || 0) + 1;
    });
    
    // Get logs by time (last 24 hours by hour)
    const now = new Date();
    const last24Hours = new Date(now);
    last24Hours.setDate(last24Hours.getDate() - 1);
    
    const hourlyLogs = Array(24).fill(0);
    logData.forEach(log => {
      const logTime = new Date(log.timestamp);
      if (logTime >= last24Hours) {
        const hourDiff = 23 - Math.floor((now - logTime) / 1000 / 60 / 60);
        if (hourDiff >= 0 && hourDiff < 24) {
          hourlyLogs[hourDiff]++;
        }
      }
    });
    
    // Prepare response
    const response = {
      total: logData.length,
      byType: typeCount,
      bySource: sourceCount,
      byStatus: statusCount,
      byHour: hourlyLogs
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ message: 'An error occurred while fetching log stats' });
  }
});

// Create a new log entry (for testing)
router.post('/', authenticate, (req, res) => {
  try {
    const { type, source, sourceIp, destinationIp, action, status, message, details } = req.body;
    
    // Validate required fields
    if (!type || !source || !sourceIp || !action || !status || !message) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Create new log entry
    const newLog = {
      id: (logData.length + 1).toString(),
      timestamp: new Date(),
      type,
      source,
      sourceIp,
      destinationIp: destinationIp || '',
      action,
      status,
      message,
      details: details || {}
    };
    
    // Add to mock database
    logData.push(newLog);
    
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'An error occurred while creating log entry' });
  }
});

module.exports = router;
