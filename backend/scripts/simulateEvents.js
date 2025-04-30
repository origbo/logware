/**
 * Security Analytics Simulator
 * This script simulates security events to demonstrate the behavioral analytics features
 * by sending API requests rather than directly manipulating the database
 */
const axios = require('axios');
const moment = require('moment');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const API_TOKEN = 'YOUR_TOKEN_HERE'; // Replace with actual token if needed

// User profiles - each with their normal behavioral pattern
const USER_PROFILES = [
  {
    name: 'John Developer',
    username: 'jdeveloper',
    role: 'developer',
    workHours: { start: 8, end: 17 },
    typicalIPs: ['192.168.1.100', '10.0.0.45'],
    typicalLocations: ['US', 'UK'],
    commonResources: ['codebase', 'jira', 'gitlab']
  },
  {
    name: 'Sarah Admin',
    username: 'sadmin',
    role: 'sysadmin',
    workHours: { start: 7, end: 16 },
    typicalIPs: ['192.168.1.101', '10.0.0.50'],
    typicalLocations: ['US'],
    commonResources: ['servers', 'admin-panel', 'network-config']
  }
];

// Sample events to simulate
const SAMPLE_EVENTS = [
  // Normal login for John Developer
  {
    category: 'authentication',
    eventType: 'login',
    timestamp: moment().hour(9).minute(15).toISOString(),
    severity: 'medium',
    source: 'webapp',
    user: {
      id: 'jdeveloper',
      name: 'John Developer',
      role: 'developer'
    },
    host: {
      hostname: 'dev-laptop-1',
      ip: '192.168.1.100'
    },
    geo: {
      country: 'US',
      city: 'San Francisco'
    },
    auth: {
      success: true,
      method: 'password',
      failedAttempts: 0
    }
  },
  
  // Abnormal login for Sarah Admin (unusual time and location)
  {
    category: 'authentication',
    eventType: 'login',
    timestamp: moment().hour(3).minute(20).toISOString(),
    severity: 'high',
    source: 'webapp',
    user: {
      id: 'sadmin',
      name: 'Sarah Admin',
      role: 'sysadmin'
    },
    host: {
      hostname: 'unknown-device',
      ip: '45.60.75.90'
    },
    geo: {
      country: 'Russia',
      city: 'Moscow'
    },
    auth: {
      success: true,
      method: 'password',
      failedAttempts: 5
    }
  },
  
  // Data exfiltration event for Sarah (follows unusual login)
  {
    category: 'network',
    eventType: 'data_transfer',
    timestamp: moment().hour(3).minute(45).toISOString(),
    severity: 'critical',
    source: 'firewall',
    user: {
      id: 'sadmin',
      name: 'Sarah Admin',
      role: 'sysadmin'
    },
    host: {
      hostname: 'unknown-device',
      ip: '45.60.75.90'
    },
    geo: {
      country: 'Russia',
      city: 'Moscow'
    },
    network: {
      srcIp: '45.60.75.90',
      dstIp: '91.33.44.55',
      protocol: 'HTTPS',
      destinationPort: 443,
      bytes: 750000000
    },
    resource: {
      id: 'user-database',
      type: 'database',
      name: 'User Records'
    }
  },
  
  // Normal file access for John
  {
    category: 'file',
    eventType: 'file_access',
    timestamp: moment().hour(10).minute(30).toISOString(),
    severity: 'low',
    source: 'file_server',
    user: {
      id: 'jdeveloper',
      name: 'John Developer',
      role: 'developer'
    },
    host: {
      hostname: 'dev-laptop-1',
      ip: '192.168.1.100'
    },
    geo: {
      country: 'US',
      city: 'San Francisco'
    },
    file: {
      path: '/projects/codebase/src/main.js',
      action: 'access',
      size: 15000,
      type: 'javascript'
    },
    resource: {
      id: 'codebase',
      type: 'repository',
      name: 'Main Codebase'
    }
  },
  
  // Sensitive file access by John (unusual for his role)
  {
    category: 'file',
    eventType: 'file_access',
    timestamp: moment().hour(14).minute(45).toISOString(),
    severity: 'medium',
    source: 'file_server',
    user: {
      id: 'jdeveloper',
      name: 'John Developer',
      role: 'developer'
    },
    host: {
      hostname: 'dev-laptop-1',
      ip: '192.168.1.100'
    },
    geo: {
      country: 'US',
      city: 'San Francisco'
    },
    file: {
      path: '/admin/configs/security-settings.json',
      action: 'access',
      size: 8500,
      type: 'json'
    },
    resource: {
      id: 'admin-panel',
      type: 'configuration',
      name: 'Security Settings'
    }
  }
];

// Function to simulate sending events to API
const simulateEvents = async () => {
  try {
    console.log('Starting event simulation...');
    
    // Set up API client
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    // Send each event and process it through the security analytics system
    for (const event of SAMPLE_EVENTS) {
      try {
        console.log(`Sending event: ${event.category} / ${event.eventType} for user ${event.user.name}`);
        
        // Uncomment this to actually send to API when ready
        /*
        const response = await apiClient.post('/security-events', event);
        console.log(`Event processed: ${response.data.success ? 'Success' : 'Failed'}`);
        
        if (response.data.analysis) {
          console.log(`  Anomaly Score: ${response.data.analysis.anomalyScore}`);
          if (response.data.analysis.behavioralScore) {
            console.log(`  Behavioral Score: ${response.data.analysis.behavioralScore}`);
          }
        }
        */
        
        // For now, just simulate the event processing
        console.log('  Event would be processed by:');
        console.log('  1. eventProcessor.processEvent()');
        console.log('  2. securityAnalyticsService.processEvent()');
        console.log('  3. anomalyDetection.analyzeEvent() with behavioral analysis');
        
        // Simulate scores based on the event type
        const isAnomalous = 
          event.category === 'authentication' && event.geo.country === 'Russia' ||
          event.category === 'network' && event.network?.bytes > 500000000 ||
          event.resource?.id === 'admin-panel' && event.user.role !== 'sysadmin';
        
        const anomalyScore = isAnomalous ? 85 : 25;
        const behavioralScore = isAnomalous ? 90 : 15;
        
        console.log(`  Simulated Analysis Results:`);
        console.log(`  - Anomaly Score: ${anomalyScore}`);
        console.log(`  - Behavioral Score: ${behavioralScore}`);
        console.log(`  - Status: ${isAnomalous ? 'suspicious or threat' : 'normal'}`);
        
        console.log('-----------------------------------');
        
        // Small delay between events
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (eventError) {
        console.error(`Error processing event: ${eventError.message}`);
      }
    }
    
    console.log('Simulation complete!');
    console.log('\nTo test the actual API endpoints:');
    console.log('1. Make sure the backend server is running');
    console.log('2. Use an API client like Postman to call:');
    console.log('   - GET /api/security-analytics/user-risk');
    console.log('   - GET /api/security-analytics/dashboard');
    console.log('   - GET /api/security-analytics/behavioral/baselines');
    console.log('   - GET /api/security-analytics/user/sadmin/behavior');
    
  } catch (error) {
    console.error('Error in simulation:', error.message);
  }
};

// Run the simulation
simulateEvents();
