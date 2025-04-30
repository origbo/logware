const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// @route   GET api/logs
// @desc    Get logs with pagination and filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, source, severity, startDate, endDate, search } = req.query;

    // Mock log data - in a real implementation, this would query from Elasticsearch or similar
    const mockLogs = [];
    const sources = ['OSSIM', 'Wireshark', 'Snort', 'Zeek', 'Nagios', 'Graylog'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const messageTemplates = [
      'Connection attempt from unauthorized IP: {ip}',
      'Failed login attempt for user: {user}',
      'Port scan detected from {ip}',
      'High CPU usage on server {server}: {value}%',
      'Memory usage threshold exceeded on {server}: {value}%',
      'Suspicious traffic pattern detected: {pattern}',
      'Firewall rule violation: {rule}',
      'Service {service} is down on {server}',
      'Database query error: {error}',
      'SSL certificate expiration warning for {domain}'
    ];

    // Generate mock logs
    const totalLogs = 1000; // Total in the "database"
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + parseInt(limit), totalLogs);

    for (let i = 0; i < 1000; i++) {
      const sourceIndex = Math.floor(Math.random() * sources.length);
      const severityIndex = Math.floor(Math.random() * severities.length);
      const messageIndex = Math.floor(Math.random() * messageTemplates.length);
      
      // Generate random IP, user, server, etc.
      const ip = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      const user = `user${Math.floor(Math.random() * 100)}`;
      const server = `server-${Math.floor(Math.random() * 20)}`;
      const value = Math.floor(Math.random() * 100);
      const pattern = `pattern-${Math.floor(Math.random() * 50)}`;
      const rule = `rule-${Math.floor(Math.random() * 30)}`;
      const service = [`http`, `mysql`, `ssh`, `ftp`, `smtp`][Math.floor(Math.random() * 5)];
      const error = `ERROR-${Math.floor(Math.random() * 100)}`;
      const domain = [`example.com`, `test.org`, `logware.net`, `acme.co`][Math.floor(Math.random() * 4)];
      
      // Replace placeholders in message template
      let message = messageTemplates[messageIndex]
        .replace('{ip}', ip)
        .replace('{user}', user)
        .replace('{server}', server)
        .replace('{value}', value)
        .replace('{pattern}', pattern)
        .replace('{rule}', rule)
        .replace('{service}', service)
        .replace('{error}', error)
        .replace('{domain}', domain);
      
      // Generate timestamp within the last 7 days
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      
      mockLogs.push({
        id: `log-${i}`,
        source: sources[sourceIndex],
        severity: severities[severityIndex],
        message,
        timestamp,
        rawData: JSON.stringify({
          source_ip: ip,
          destination_ip: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
          protocol: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 5)],
          port: Math.floor(Math.random() * 65536),
          action: ['ALLOW', 'BLOCK', 'ALERT'][Math.floor(Math.random() * 3)]
        })
      });
    }

    // Apply filters - this would be more efficient in a real database
    let filteredLogs = [...mockLogs];
    
    if (source) {
      filteredLogs = filteredLogs.filter(log => log.source === source);
    }
    
    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => log.timestamp >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => log.timestamp <= end);
    }
    
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Paginate results
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      total: filteredLogs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      logs: paginatedLogs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/:id
// @desc    Get log by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // In a real implementation, this would fetch from a database
    // For now, return mock data for the requested log
    
    const logId = req.params.id;
    
    // Generate a deterministic log based on the ID
    const idNumber = parseInt(logId.replace('log-', '')) || 0;
    const sources = ['OSSIM', 'Wireshark', 'Snort', 'Zeek', 'Nagios', 'Graylog'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    const sourceIndex = idNumber % sources.length;
    const severityIndex = (idNumber * 3) % severities.length;
    
    const ip = `${192 + (idNumber % 64)}.${168 + (idNumber % 88)}.${1 + (idNumber % 254)}.${1 + (idNumber % 254)}`;
    const timestamp = new Date(Date.now() - (idNumber * 100000));
    
    const log = {
      id: logId,
      source: sources[sourceIndex],
      severity: severities[severityIndex],
      message: `Security event detected from IP: ${ip}`,
      timestamp,
      rawData: JSON.stringify({
        source_ip: ip,
        destination_ip: '192.168.1.1',
        protocol: 'TCP',
        port: 443,
        action: 'ALERT',
        details: 'Suspicious connection attempt',
        rule_id: `RULE-${1000 + idNumber}`
      }),
      related: [
        { id: `log-${idNumber + 1}`, type: 'subsequent_event' },
        { id: `log-${idNumber - 1}`, type: 'prior_event' }
      ]
    };
    
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/source/:source
// @desc    Get logs by source
// @access  Private
router.get('/source/:source', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const source = req.params.source;
    
    // In a real implementation, this would query the database
    // For now, return mock data filtered by source
    
    // Generate mock logs for the requested source
    const mockLogs = [];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < 100; i++) {
      const severityIndex = Math.floor(Math.random() * severities.length);
      const ip = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      
      mockLogs.push({
        id: `log-src-${i}`,
        source,
        severity: severities[severityIndex],
        message: `Event from ${source}: Activity from ${ip}`,
        timestamp
      });
    }
    
    // Sort by timestamp (newest first)
    mockLogs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + parseInt(limit), mockLogs.length);
    const paginatedLogs = mockLogs.slice(startIndex, endIndex);
    
    res.json({
      total: mockLogs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      source,
      logs: paginatedLogs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
