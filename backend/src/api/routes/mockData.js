/**
 * Mock Data API Routes
 * These routes provide test data for development and demonstration
 */
const express = require('express');
const router = express.Router();
const moment = require('moment');
const { generateMockData } = require('../../utils/mockDataGenerator');
const mlAnomalyDetectionService = require('../../services/mlAnomalyDetectionService');
const automatedResponseService = require('../../services/automatedResponseService');
const logger = require('../../utils/logger');

/**
 * @route   GET /api/mock-data/security-analytics/user-risk
 * @desc    Get mock user risk scores for behavioral dashboard
 */
router.get('/security-analytics/user-risk', (req, res) => {
  const users = [
    {
      userId: 'user123',
      username: 'John Developer',
      eventCount: 532,
      anomalyCount: 15,
      behavioralAnomalyCount: 8,
      threatCount: 2,
      highestAnomaly: 85,
      highestBehavioral: 78,
      lastActivity: moment().subtract(2, 'hours').toISOString(),
      riskScore: 83
    },
    {
      userId: 'user456',
      username: 'Sarah Admin',
      eventCount: 823,
      anomalyCount: 23,
      behavioralAnomalyCount: 17,
      threatCount: 5,
      highestAnomaly: 95,
      highestBehavioral: 92,
      lastActivity: moment().subtract(30, 'minutes').toISOString(),
      riskScore: 91
    },
    {
      userId: 'user789',
      username: 'Mike Analyst',
      eventCount: 421,
      anomalyCount: 9,
      behavioralAnomalyCount: 3,
      threatCount: 1,
      highestAnomaly: 76,
      highestBehavioral: 62,
      lastActivity: moment().subtract(1, 'day').toISOString(),
      riskScore: 65
    },
    {
      userId: 'user234',
      username: 'Lisa Manager',
      eventCount: 350,
      anomalyCount: 12,
      behavioralAnomalyCount: 7,
      threatCount: 0,
      highestAnomaly: 72,
      highestBehavioral: 68,
      lastActivity: moment().subtract(4, 'hours').toISOString(),
      riskScore: 58
    },
    {
      userId: 'user567',
      username: 'David Guest',
      eventCount: 87,
      anomalyCount: 2,
      behavioralAnomalyCount: 0,
      threatCount: 0,
      highestAnomaly: 45,
      highestBehavioral: 28,
      lastActivity: moment().subtract(2, 'days').toISOString(),
      riskScore: 32
    }
  ];
  
  res.json({
    success: true,
    userRiskScores: users
  });
});

/**
 * @route   GET /api/mock-data/security-analytics/behavioral/baselines
 * @desc    Get mock behavioral baselines data
 */
router.get('/security-analytics/behavioral/baselines', (req, res) => {
  // Create mock user baselines
  const baselines = [
    {
      userId: 'user123',
      username: 'John Developer',
      totalEvents: 532,
      loginCount: 78,
      uniqueIPCount: 3,
      uniqueLocations: ['US', 'UK'],
      eventTypes: ['login', 'logout', 'file_access', 'code_commit'],
      categories: ['authentication', 'file', 'admin'],
      hourlyActivity: generateHourlyActivity([8, 9, 10, 11, 12, 13, 14, 15, 16, 17]),
      activeHours: [9, 10, 11, 14, 15, 16]
    },
    {
      userId: 'user456',
      username: 'Sarah Admin',
      totalEvents: 823,
      loginCount: 92,
      uniqueIPCount: 2,
      uniqueLocations: ['US'],
      eventTypes: ['login', 'logout', 'user_create', 'permission_change', 'system_config'],
      categories: ['authentication', 'admin'],
      hourlyActivity: generateHourlyActivity([7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      activeHours: [8, 9, 10, 13, 14, 15]
    },
    {
      userId: 'user789',
      username: 'Mike Analyst',
      totalEvents: 421,
      loginCount: 65,
      uniqueIPCount: 4,
      uniqueLocations: ['US', 'Canada'],
      eventTypes: ['login', 'logout', 'data_export', 'report_generation'],
      categories: ['authentication', 'data'],
      hourlyActivity: generateHourlyActivity([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]),
      activeHours: [10, 11, 14, 15, 16, 17]
    },
    {
      userId: 'user234',
      username: 'Lisa Manager',
      totalEvents: 350,
      loginCount: 45,
      uniqueIPCount: 3,
      uniqueLocations: ['US', 'Germany'],
      eventTypes: ['login', 'logout', 'report_access', 'user_review'],
      categories: ['authentication', 'reporting', 'admin'],
      hourlyActivity: generateHourlyActivity([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
      activeHours: [9, 10, 15, 16, 17, 18]
    },
    {
      userId: 'user567',
      username: 'David Guest',
      totalEvents: 87,
      loginCount: 32,
      uniqueIPCount: 1,
      uniqueLocations: ['US'],
      eventTypes: ['login', 'logout', 'document_view'],
      categories: ['authentication', 'file'],
      hourlyActivity: generateHourlyActivity([10, 11, 12, 13, 14, 15]),
      activeHours: [11, 12, 13, 14]
    }
  ];

  res.json({
    success: true,
    baselines
  });
});

/**
 * @route   GET /api/mock-data/security-analytics/dashboard
 * @desc    Get mock dashboard summary data
 */
router.get('/security-analytics/dashboard', (req, res) => {
  // Create timeline data (last 24 hours)
  const timeline = [];
  for (let i = 0; i < 24; i++) {
    const hourAgo = moment().subtract(i, 'hours');
    const hour = hourAgo.hour();
    
    // More events during business hours
    const baseCount = (hour >= 8 && hour <= 18) ? 
      Math.floor(Math.random() * 30) + 20 : 
      Math.floor(Math.random() * 10) + 1;
    
    // Generate some anomalies
    const anomalies = Math.floor(Math.random() * (baseCount / 5));
    
    timeline.push({
      timestamp: hourAgo.toISOString(),
      hour: hour.toString(),
      total: baseCount,
      anomalies
    });
  }
  
  // Reverse to get chronological order
  timeline.reverse();
  
  const summary = {
    totalEvents: 1257,
    eventsByStatus: {
      'normal': 1124,
      'suspicious': 98,
      'threat': 35
    },
    eventsByCategory: {
      'authentication': 485,
      'network': 352,
      'file': 215,
      'admin': 124,
      'other': 81
    },
    timeline,
    topAnomalies: generateMockAnomalies(10)
  };
  
  res.json({
    success: true,
    summary
  });
});

/**
 * @route   GET /api/mock-data/security-analytics/attack-paths
 * @desc    Get mock attack path data for visualization
 */
router.get('/security-analytics/attack-paths', (req, res) => {
  // Generate attack path data
  const attackPathData = generateAttackPathData();
  
  res.json({
    success: true,
    data: attackPathData
  });
});

/**
 * @route   GET /api/mock-data/threat-intelligence/feeds
 * @desc    Get mock threat intelligence feed data
 */
router.get('/threat-intelligence/feeds', (req, res) => {
  // Generate mock threat intelligence sources
  const mockThreatSources = [
    {
      id: 'src_misp01',
      name: 'MISP Community Feed',
      type: 'misp',
      status: 'active',
      description: 'Malware Information Sharing Platform & Threat Sharing',
      configuration: {
        syncInterval: 720, // 12 hours
        indicatorTypes: ['ip', 'domain', 'url', 'file_hash_md5', 'file_hash_sha1', 'file_hash_sha256'],
        threatCategories: ['Malware', 'Ransomware', 'APT']
      },
      integrationStatus: {
        lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        lastSyncStatus: 'success',
        indicatorCount: 1423,
        errorCount: 0
      }
    },
    {
      id: 'src_otx01',
      name: 'AlienVault OTX',
      type: 'otx',
      status: 'active',
      description: 'Open Threat Exchange - Crowd-sourced threat intelligence',
      configuration: {
        syncInterval: 1440, // Daily
        indicatorTypes: ['ip', 'domain', 'url', 'file_hash_md5', 'file_hash_sha256'],
        threatCategories: ['Malware', 'Phishing', 'C2']
      },
      integrationStatus: {
        lastSyncAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        lastSyncStatus: 'success',
        indicatorCount: 2156,
        errorCount: 0
      }
    },
    {
      id: 'src_vt01',
      name: 'VirusTotal Intelligence',
      type: 'virustotal',
      status: 'active',
      description: 'Advanced threat intelligence from VirusTotal',
      configuration: {
        syncInterval: 360, // 6 hours
        indicatorTypes: ['file_hash_md5', 'file_hash_sha1', 'file_hash_sha256', 'url'],
        threatCategories: ['Malware']
      },
      integrationStatus: {
        lastSyncAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        lastSyncStatus: 'success',
        indicatorCount: 876,
        errorCount: 0
      }
    },
    {
      id: 'src_tf01',
      name: 'ThreatFox Database',
      type: 'threatfox',
      status: 'active',
      description: 'ThreatFox malware IOC database',
      configuration: {
        syncInterval: 720, // 12 hours
        indicatorTypes: ['ip', 'domain', 'url', 'file_hash_md5', 'file_hash_sha256'],
        threatCategories: ['Malware', 'Botnet']
      },
      integrationStatus: {
        lastSyncAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
        lastSyncStatus: 'success',
        indicatorCount: 943,
        errorCount: 0
      }
    },
    {
      id: 'src_ti01',
      name: 'Internal Threat Feed',
      type: 'custom_api',
      status: 'active',
      description: 'Custom internal threat intelligence feed',
      configuration: {
        syncInterval: 180, // 3 hours
        indicatorTypes: ['ip', 'domain', 'url', 'file_hash_md5'],
        threatCategories: ['Malware', 'Insider Threat', 'Data Leak']
      },
      integrationStatus: {
        lastSyncAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        lastSyncStatus: 'success',
        indicatorCount: 324,
        errorCount: 0
      }
    }
  ];
  
  // Generate recent threat indicators
  const mockRecentIndicators = [
    {
      id: 'ind_1',
      value: '185.193.141.247',
      type: 'ip',
      source: { name: 'MISP Community Feed', type: 'misp' },
      severity: 'high',
      confidenceScore: 92,
      firstSeenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      lastSeenAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      threat: { category: 'Malware', family: 'Emotet', actor: null },
      tags: ['emotet', 'banking-trojan', 'misp'],
      matchCount: 3
    },
    {
      id: 'ind_2',
      value: 'secure-document-preview.com',
      type: 'domain',
      source: { name: 'AlienVault OTX', type: 'otx' },
      severity: 'critical',
      confidenceScore: 95,
      firstSeenAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      lastSeenAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      threat: { category: 'Phishing', family: null, campaign: 'Credential Harvesting' },
      tags: ['phishing', 'credential-theft', 'otx-pulse'],
      matchCount: 7
    },
    {
      id: 'ind_3',
      value: '8f31e9706614b30b42eac27d22d4c3a996e0ed916af039e9f8ce91649eed0b4a',
      type: 'file_hash_sha256',
      source: { name: 'VirusTotal Intelligence', type: 'virustotal' },
      severity: 'high',
      confidenceScore: 100,
      firstSeenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastSeenAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      threat: { category: 'Ransomware', family: 'BlackCat', actor: null },
      tags: ['ransomware', 'blackcat', 'alphv'],
      matchCount: 2,
      attributes: { detections: 53 }
    },
    {
      id: 'ind_4',
      value: 'https://invoice-secure-portal.xyz/document.php?id=INV-2023-04-30',
      type: 'url',
      source: { name: 'ThreatFox Database', type: 'threatfox' },
      severity: 'high',
      confidenceScore: 89,
      firstSeenAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      lastSeenAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      threat: { category: 'Malware', family: 'Qakbot', actor: null },
      tags: ['qakbot', 'malspam', 'threatfox'],
      matchCount: 5
    },
    {
      id: 'ind_5',
      value: '91.196.149.42',
      type: 'ip',
      source: { name: 'Internal Threat Feed', type: 'custom_api' },
      severity: 'medium',
      confidenceScore: 78,
      firstSeenAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      lastSeenAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      threat: { category: 'C2', family: 'Cobalt Strike', actor: 'APT-41' },
      tags: ['c2', 'apt41', 'cobalt-strike'],
      matchCount: 12
    }
  ];
  
  // Generate statistics summary
  const mockStats = {
    totalIndicators: 5722,
    activeIndicators: 5241,
    recentAdditions: 247, // Last 24 hours
    bySeverity: [
      { severity: 'critical', count: 427 },
      { severity: 'high', count: 1358 },
      { severity: 'medium', count: 2106 },
      { severity: 'low', count: 1350 },
      { severity: 'unknown', count: 481 }
    ],
    byType: [
      { type: 'ip', count: 1875 },
      { type: 'domain', count: 1342 },
      { type: 'url', count: 986 },
      { type: 'file_hash_md5', count: 624 },
      { type: 'file_hash_sha1', count: 315 },
      { type: 'file_hash_sha256', count: 580 }
    ],
    byCategory: [
      { category: 'Malware', count: 2487 },
      { category: 'Phishing', count: 1246 },
      { category: 'C2', count: 742 },
      { category: 'Ransomware', count: 583 },
      { category: 'Botnet', count: 352 },
      { category: 'APT', count: 174 },
      { category: 'Other', count: 138 }
    ],
    recentMatches: 38, // Matches in last 24 hours
    topMatchingIndicators: [
      { id: 'ind_5', value: '91.196.149.42', type: 'ip', matchCount: 12 },
      { id: 'ind_2', value: 'secure-document-preview.com', type: 'domain', matchCount: 7 },
      { id: 'ind_4', value: 'https://invoice-secure-portal.xyz/document.php?id=INV-2023-04-30', type: 'url', matchCount: 5 }
    ]
  };
  
  res.json({
    success: true,
    data: {
      sources: mockThreatSources,
      recentIndicators: mockRecentIndicators,
      stats: mockStats
    }
  });
});

/**
 * @route   GET /api/mock-data/security-analytics/events
 * @desc    Get mock security events with filtering
 */
router.get('/security-analytics/events', (req, res) => {
  // Parse query params
  const { status, anomalyScore, limit = 10 } = req.query;
  
  // Generate events
  let events = generateMockAnomalies(limit ? parseInt(limit) : 10);
  
  // Apply filters if present
  if (status) {
    const statuses = status.split(',');
    events = events.filter(event => statuses.includes(event.status));
  }
  
  if (anomalyScore) {
    const minScore = parseInt(anomalyScore);
    events = events.filter(event => event.analysis && event.analysis.anomalyScore >= minScore);
  }
  
  res.json({
    success: true,
    events,
    pagination: {
      total: events.length,
      page: 1,
      pages: 1,
      limit: parseInt(limit) || 10
    }
  });
});

/**
 * Helper function to generate mock hourly activity data
 */
function generateHourlyActivity(activeHoursArray) {
  const hourlyActivity = new Array(24).fill(0);
  
  // Populate with random activity counts
  for (let hour = 0; hour < 24; hour++) {
    if (activeHoursArray.includes(hour)) {
      // More activity during active hours
      hourlyActivity[hour] = Math.floor(Math.random() * 40) + 20;
    } else {
      // Light activity during inactive hours
      hourlyActivity[hour] = Math.floor(Math.random() * 5);
    }
  }
  
  return hourlyActivity;
}

/**
 * Helper function to generate mock anomaly events
 */
function generateMockAnomalies(count) {
  const eventTypes = ['login', 'logout', 'data_transfer', 'file_access', 'permission_change', 'system_config'];
  const categories = ['authentication', 'network', 'file', 'admin'];
  const sources = ['firewall', 'database', 'application', 'endpoint', 'server'];
  const users = [
    { id: 'user123', name: 'John Developer', role: 'developer' },
    { id: 'user456', name: 'Sarah Admin', role: 'admin' },
    { id: 'user789', name: 'Mike Analyst', role: 'analyst' },
    { id: 'user234', name: 'Lisa Manager', role: 'manager' },
    { id: 'user567', name: 'David Guest', role: 'guest' }
  ];
  const statuses = ['normal', 'suspicious', 'threat'];
  
  const events = [];
  
  // Generate random events
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    // Random time in the last 7 days
    const timestamp = moment()
      .subtract(Math.floor(Math.random() * 7), 'days')
      .subtract(Math.floor(Math.random() * 24), 'hours')
      .subtract(Math.floor(Math.random() * 60), 'minutes');
    
    // Random anomaly and behavioral scores
    const anomalyScore = Math.floor(Math.random() * 100);
    const behavioralScore = Math.floor(Math.random() * 100);
    
    // Determine status based on scores
    let status;
    if (anomalyScore >= 80 || behavioralScore >= 80) {
      status = 'threat';
    } else if (anomalyScore >= 60 || behavioralScore >= 60) {
      status = 'suspicious';
    } else {
      status = 'normal';
    }
    
    // Generate reasons
    const reasons = [];
    if (anomalyScore >= 60) {
      if (category === 'authentication') {
        reasons.push('Unusual login time');
        reasons.push('Multiple failed attempts');
      } else if (category === 'network') {
        reasons.push('Unusual data transfer volume');
        reasons.push('Suspicious destination IP');
      } else if (category === 'file') {
        reasons.push('Access to sensitive files');
        reasons.push('Unusual file access pattern');
      } else {
        reasons.push('Unusual administrative action');
        reasons.push('Sensitive configuration change');
      }
    }
    
    // Generate behavioral reasons
    const behavioralReasons = [];
    if (behavioralScore >= 60) {
      behavioralReasons.push('Activity outside normal working hours');
      behavioralReasons.push('Access from unusual location');
      behavioralReasons.push('Unusual resource access pattern');
    }
    
    // Create the event object
    const event = {
      _id: `evt${i}${Date.now()}`,
      category,
      eventType,
      timestamp: timestamp.toISOString(),
      severity: anomalyScore >= 80 ? 'high' : anomalyScore >= 60 ? 'medium' : 'low',
      source,
      status,
      user,
      host: {
        hostname: `host-${Math.floor(Math.random() * 10) + 1}`,
        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
      },
      geo: {
        country: Math.random() > 0.8 ? 
          ['Russia', 'China', 'North Korea'][Math.floor(Math.random() * 3)] : 
          ['US', 'UK', 'Canada', 'Germany'][Math.floor(Math.random() * 4)],
        city: ['New York', 'London', 'Toronto', 'Berlin', 'Moscow', 'Beijing'][Math.floor(Math.random() * 6)]
      },
      analysis: {
        anomalyScore,
        behavioralScore,
        reasons,
        behavioralReasons,
        analyzedAt: moment().subtract(Math.floor(Math.random() * 60), 'minutes').toISOString()
      }
    };
    
    // Add category-specific data
    if (category === 'authentication') {
      event.auth = {
        success: Math.random() > 0.3,
        method: ['password', 'sso', 'mfa'][Math.floor(Math.random() * 3)],
        failedAttempts: Math.floor(Math.random() * 5)
      };
    } else if (category === 'network') {
      event.network = {
        srcIp: event.host.ip,
        dstIp: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
        destinationPort: [80, 443, 3389, 22, 25][Math.floor(Math.random() * 5)],
        bytes: Math.floor(Math.random() * 10000000)
      };
    } else if (category === 'file') {
      event.file = {
        path: `/path/to/${['documents', 'source', 'config', 'users'][Math.floor(Math.random() * 4)]}/${Math.floor(Math.random() * 100)}.${['txt', 'pdf', 'doc', 'exe'][Math.floor(Math.random() * 4)]}`,
        action: ['access', 'create', 'modify', 'delete'][Math.floor(Math.random() * 4)],
        size: Math.floor(Math.random() * 10000000),
        type: ['document', 'image', 'executable', 'archive'][Math.floor(Math.random() * 4)]
      };
    }
    
    // Add to events array
    events.push(event);
  }
  
  return events;
}

/**
 * Helper function to generate attack path data for visualization
 */
function generateAttackPathData() {
  // Create nodes for assets, users, and entry points
  const nodes = [
    // Entry points
    { id: 'entry1', name: 'External Website', type: 'entry', entryType: 'web', exposureLevel: 'high' },
    { id: 'entry2', name: 'VPN', type: 'entry', entryType: 'network', exposureLevel: 'medium' },
    { id: 'entry3', name: 'Email Gateway', type: 'entry', entryType: 'email', exposureLevel: 'high' },
    
    // Users
    { id: 'user1', name: 'Admin User', type: 'user', role: 'administrator', privilegeLevel: 0.9, riskLevel: 'high' },
    { id: 'user2', name: 'Regular User', type: 'user', role: 'employee', privilegeLevel: 0.4, riskLevel: 'low' },
    { id: 'user3', name: 'Developer', type: 'user', role: 'developer', privilegeLevel: 0.7, riskLevel: 'medium' },
    { id: 'user4', name: 'Contractor', type: 'user', role: 'external', privilegeLevel: 0.5, riskLevel: 'high' },
    
    // Assets
    { id: 'asset1', name: 'Web Server', type: 'asset', assetType: 'server', criticality: 'high', vulnerabilityScore: 0.6 },
    { id: 'asset2', name: 'Database Server', type: 'asset', assetType: 'database', criticality: 'high', vulnerabilityScore: 0.7 },
    { id: 'asset3', name: 'File Server', type: 'asset', assetType: 'storage', criticality: 'medium', vulnerabilityScore: 0.4 },
    { id: 'asset4', name: 'Domain Controller', type: 'asset', assetType: 'infrastructure', criticality: 'high', vulnerabilityScore: 0.5 },
    { id: 'asset5', name: 'Workstation', type: 'asset', assetType: 'endpoint', criticality: 'low', vulnerabilityScore: 0.8 },
    { id: 'asset6', name: 'IoT Devices', type: 'asset', assetType: 'iot', criticality: 'medium', vulnerabilityScore: 0.9 },
    { id: 'asset7', name: 'Cloud Storage', type: 'asset', assetType: 'cloud', criticality: 'medium', vulnerabilityScore: 0.3 },
  ];
  
  // Create links between nodes to represent attack paths
  const links = [
    // Entry points to assets
    { source: 'entry1', target: 'asset1', weight: 0.8 },
    { source: 'entry2', target: 'asset4', weight: 0.5 },
    { source: 'entry3', target: 'asset5', weight: 0.7 },
    
    // User access
    { source: 'user1', target: 'asset1', weight: 0.6 },
    { source: 'user1', target: 'asset2', weight: 0.8 },
    { source: 'user1', target: 'asset3', weight: 0.7 },
    { source: 'user1', target: 'asset4', weight: 0.9 },
    { source: 'user2', target: 'asset3', weight: 0.5 },
    { source: 'user2', target: 'asset5', weight: 0.6 },
    { source: 'user3', target: 'asset1', weight: 0.7 },
    { source: 'user3', target: 'asset2', weight: 0.4 },
    { source: 'user3', target: 'asset7', weight: 0.8 },
    { source: 'user4', target: 'asset6', weight: 0.9 },
    { source: 'user4', target: 'asset7', weight: 0.6 },
    
    // Asset to asset connections (lateral movement)
    { source: 'asset1', target: 'asset2', weight: 0.7 },
    { source: 'asset2', target: 'asset4', weight: 0.8 },
    { source: 'asset4', target: 'asset3', weight: 0.5 },
    { source: 'asset5', target: 'asset4', weight: 0.6 },
    { source: 'asset5', target: 'asset6', weight: 0.4 },
    { source: 'asset1', target: 'asset7', weight: 0.3 },
    { source: 'asset6', target: 'asset2', weight: 0.7 },
  ];
  
  return { nodes, links };
}

/**
 * @route GET /api/mock-data/ml/anomalies
 * @desc Get ML-detected anomalies
 * @access Public (for demo)
 */
router.get('/ml/anomalies', (req, res) => {
  try {
    logger.info('Fetching ML anomaly detection data');
    
    // Get limit from query params or use default
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    // Generate mock anomalies
    const anomalies = mlAnomalyDetectionService.generateMockAnomalies(limit);
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        anomalies: anomalies,
        stats: {
          totalAnomalies: 156,
          criticalCount: 28,
          highCount: 47,
          mediumCount: 64,
          lowCount: 17,
          byType: [
            { type: 'unusual_login_time', count: 42 },
            { type: 'unusual_location', count: 31 },
            { type: 'excessive_failed_attempts', count: 19 },
            { type: 'data_exfiltration', count: 15 },
            { type: 'privilege_escalation', count: 27 },
            { type: 'unusual_process', count: 12 },
            { type: 'lateral_movement', count: 10 }
          ],
          lastUpdated: new Date()
        }
      }
    });
  } catch (error) {
    logger.error('Error generating ML anomaly data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate anomaly detection data'
    });
  }
});

/**
 * @route GET /api/mock-data/automated-response/rules
 * @desc Get automated response rules
 * @access Public (for demo)
 */
router.get('/automated-response/rules', (req, res) => {
  try {
    logger.info('Fetching automated response rules');
    
    // Get rules from service
    const rules = automatedResponseService.getRules();
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        rules,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    logger.error('Error fetching automated response rules:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch automated response rules'
    });
  }
});

/**
 * @route GET /api/mock-data/automated-response/recent
 * @desc Get recent automated responses
 * @access Public (for demo)
 */
router.get('/automated-response/recent', (req, res) => {
  try {
    logger.info('Fetching recent automated responses');
    
    // Get limit from query params or use default
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    // Generate mock responses
    const responses = automatedResponseService.generateMockResponses(limit);
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        responses,
        stats: {
          totalResponses: 127,
          successfulResponses: 119,
          failedResponses: 8,
          byActionType: [
            { action: 'lockAccount', count: 18 },
            { action: 'notifyAdmin', count: 42 },
            { action: 'createIncident', count: 31 },
            { action: 'requireMFA', count: 15 },
            { action: 'blockIP', count: 12 },
            { action: 'tempLockAccount', count: 9 }
          ],
          byRuleId: automatedResponseService.getRules().map(rule => ({
            ruleId: rule.id,
            ruleName: rule.name,
            count: Math.floor(Math.random() * 30) + 5
          })),
          lastUpdated: new Date()
        }
      }
    });
  } catch (error) {
    logger.error('Error generating automated response data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate automated response data'
    });
  }
});

/**
 * @route POST /api/mock-data/automated-response/test-rule
 * @desc Test an automated response rule against a sample anomaly
 * @access Public (for demo)
 */
router.post('/automated-response/test-rule', (req, res) => {
  try {
    logger.info('Testing automated response rule');
    
    // Get rule ID and test anomaly from request body or use defaults
    const { ruleId, anomaly } = req.body;
    
    // Get the rule
    let rule;
    if (ruleId) {
      rule = automatedResponseService.getRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({
          success: false,
          error: `Rule with ID ${ruleId} not found`
        });
      }
    } else {
      // Use first rule if none specified
      rule = automatedResponseService.getRules()[0];
    }
    
    // Use provided anomaly or generate one
    const testAnomaly = anomaly || mlAnomalyDetectionService.generateMockAnomalies(1)[0];
    
    // Simulate response actions
    const startTime = new Date();
    const actions = rule.actions.map(actionType => {
      return {
        actionType,
        success: Math.random() > 0.1, // 10% chance of failure for test
        timestamp: new Date(),
        details: {
          message: `Test execution of ${actionType} for anomaly ${testAnomaly.type}`,
          anomalySeverity: testAnomaly.severity,
          anomalyType: testAnomaly.type,
          username: testAnomaly.username,
          status: 'simulated'
        }
      };
    });
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        rule,
        testAnomaly,
        actions,
        executionTime: new Date() - startTime,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error testing automated response rule:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test automated response rule'
    });
  }
});

/**
 * @route POST /api/mock-data/ml/analyze-login
 * @desc Analyze a login event for anomalies
 * @access Public (for demo)
 */
router.post('/ml/analyze-login', (req, res) => {
  try {
    logger.info('Analyzing login event for anomalies');
    
    // Get login event from request body or generate mock data
    const loginEvent = req.body.loginEvent || {
      userId: 'user_' + Math.floor(Math.random() * 1000),
      username: 'user' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      location: ['New York', 'Remote', 'London', 'Beijing'][Math.floor(Math.random() * 4)],
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      deviceId: 'device_' + Math.floor(Math.random() * 100)
    };
    
    // Analyze for anomalies
    const anomalies = mlAnomalyDetectionService.detectLoginAnomalies(loginEvent);
    
    // Calculate risk score based on anomalies
    const riskScore = anomalies.length > 0 ? 
      Math.min(100, anomalies.reduce((score, anomaly) => {
        const severityMultiplier = 
          anomaly.severity === 'critical' ? 25 :
          anomaly.severity === 'high' ? 15 :
          anomaly.severity === 'medium' ? 10 : 5;
        return score + (severityMultiplier * anomaly.confidence);
      }, 0)) : 0;
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        loginEvent,
        anomalies,
        riskScore,
        analysis: {
          anomaliesDetected: anomalies.length,
          riskLevel: riskScore > 75 ? 'critical' : 
                    riskScore > 50 ? 'high' : 
                    riskScore > 25 ? 'medium' : 'low',
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    logger.error('Error analyzing login event:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze login event'
    });
  }
});

module.exports = router;
