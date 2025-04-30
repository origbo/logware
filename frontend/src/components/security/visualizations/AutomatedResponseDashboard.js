import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, CircularProgress, Alert, 
  Divider, IconButton, Tooltip, Button
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  AutoFixHigh as AutomationIcon,
  Add as AddIcon
} from '@mui/icons-material';

import axios from 'axios';

// Import custom components
import ResponseRulesList from './components/ResponseRulesList';
import RecentResponseActions from './components/RecentResponseActions';
import ResponsePerformanceMetrics from './components/ResponsePerformanceMetrics';
import RuleTestingInterface from './components/RuleTestingInterface';

/**
 * AutomatedResponseDashboard Component
 * Displays automated response workflows and configurations
 */
const AutomatedResponseDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    rules: [],
    responses: [],
    stats: {}
  });
  
  // Fetch automated response data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create axios instance
      const api = axios.create({
        baseURL: 'http://localhost:5050',
        timeout: 10000
      });
      
      // Fetch rules
      let rulesData = [];
      try {
        const rulesResponse = await api.get('/api/mock-data/automated-response/rules');
        if (rulesResponse.data.success) {
          rulesData = rulesResponse.data.data.rules;
        }
      } catch (rulesError) {
        console.warn('Error fetching rules:', rulesError);
        // Use mock rules data
        rulesData = generateMockRules();
      }
      
      // Fetch recent responses
      let responsesData = { responses: [], stats: {} };
      try {
        const responsesResponse = await api.get('/api/mock-data/automated-response/recent');
        if (responsesResponse.data.success) {
          responsesData = responsesResponse.data.data;
        }
      } catch (responsesError) {
        console.warn('Error fetching responses:', responsesError);
        // Generate mock responses data
        const mockResponses = generateMockResponses(rulesData);
        responsesData = {
          responses: mockResponses,
          stats: generateMockStats(mockResponses, rulesData)
        };
      }
      
      setData({
        rules: rulesData,
        responses: responsesData.responses,
        stats: responsesData.stats
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load automated response data. Using mock data instead.');
      
      // Generate mock data
      const mockRules = generateMockRules();
      const mockResponses = generateMockResponses(mockRules);
      
      setData({
        rules: mockRules,
        responses: mockResponses,
        stats: generateMockStats(mockResponses, mockRules)
      });
      
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  
  // Handle rule toggle
  const handleToggleRule = (ruleId, newState) => {
    setData(prevData => ({
      ...prevData,
      rules: prevData.rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: newState } : rule
      )
    }));
  };
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading automated response data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          <AutomationIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Automated Response Workflows
        </Typography>
        
        <Box>
          <Tooltip title="Add New Rule">
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              sx={{ mr: 2 }}
            >
              New Rule
            </Button>
          </Tooltip>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Display error message if any */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Response Performance Metrics */}
        <Grid item xs={12}>
          <ResponsePerformanceMetrics stats={data.stats} />
        </Grid>
        
        {/* Recent Response Actions */}
        <Grid item xs={12} lg={6}>
          <RecentResponseActions 
            responses={data.responses} 
            onRefresh={fetchData}
          />
        </Grid>
        
        {/* Response Rules List */}
        <Grid item xs={12} lg={6}>
          <ResponseRulesList 
            rules={data.rules} 
            onToggleRule={handleToggleRule}
          />
        </Grid>
        
        {/* Rule Testing Interface */}
        <Grid item xs={12}>
          <RuleTestingInterface rules={data.rules} />
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Generate mock rules
 */
function generateMockRules() {
  return [
    {
      id: 'rule-001',
      name: 'Critical Anomaly Auto-Response',
      description: 'Automatically respond to critical severity anomalies',
      conditions: {
        anomalySeverity: ['critical'],
        anomalyTypes: ['*']
      },
      actions: ['lockAccount', 'notifyAdmin', 'createIncident'],
      enabled: true
    },
    {
      id: 'rule-002',
      name: 'Unusual Login Location Response',
      description: 'Respond to unusual login locations',
      conditions: {
        anomalySeverity: ['high', 'critical'],
        anomalyTypes: ['unusual_location']
      },
      actions: ['requireMFA', 'notifyUser', 'createIncident'],
      enabled: true
    },
    {
      id: 'rule-003',
      name: 'Data Exfiltration Response',
      description: 'Respond to potential data exfiltration',
      conditions: {
        anomalySeverity: ['medium', 'high', 'critical'],
        anomalyTypes: ['data_exfiltration']
      },
      actions: ['blockIP', 'createIncident', 'notifyAdmin'],
      enabled: true
    },
    {
      id: 'rule-004',
      name: 'Brute Force Login Response',
      description: 'Respond to excessive failed login attempts',
      conditions: {
        anomalySeverity: ['medium', 'high'],
        anomalyTypes: ['excessive_failed_attempts']
      },
      actions: ['tempLockAccount', 'notifyUser'],
      enabled: false
    },
    {
      id: 'rule-005',
      name: 'Privilege Escalation Response',
      description: 'Respond to privilege escalation attempts',
      conditions: {
        anomalySeverity: ['high', 'critical'],
        anomalyTypes: ['privilege_escalation']
      },
      actions: ['revokePrivileges', 'createIncident', 'notifyAdmin'],
      enabled: true
    }
  ];
}

/**
 * Generate mock responses
 */
function generateMockResponses(rules) {
  // Mock anomaly types
  const anomalyTypes = [
    'unusual_login_time',
    'unusual_location',
    'excessive_failed_attempts',
    'data_exfiltration',
    'privilege_escalation',
    'unusual_process',
    'lateral_movement'
  ];
  
  // Mock users
  const users = [
    'john.doe',
    'alice.smith',
    'bob.jackson',
    'admin',
    'system'
  ];
  
  // Mock severities
  const severities = ['low', 'medium', 'high', 'critical'];
  
  // Generate mock responses
  const responses = [];
  
  for (let i = 0; i < 10; i++) {
    const rule = rules[Math.floor(Math.random() * rules.length)];
    const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const username = users[Math.floor(Math.random() * users.length)];
    const action = rule.actions[Math.floor(Math.random() * rule.actions.length)];
    
    // Generate timestamp in the last 24 hours
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
    
    // Action result
    const actionResult = {
      success: Math.random() > 0.1, // 10% chance of failure
      timestamp: new Date(timestamp.getTime() + Math.floor(Math.random() * 60 * 1000)), // 0-60 seconds after anomaly
      duration: Math.floor(Math.random() * 1000) + 200, // 200-1200 ms
      details: {}
    };
    
    // Add details based on action type
    switch (action) {
      case 'lockAccount':
        actionResult.details = {
          message: `Locked account for user ${username}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          username: username,
          lockDuration: 'permanent',
          unlockRequiresAdmin: true
        };
        break;
        
      case 'notifyAdmin':
        actionResult.details = {
          message: `Notified administrator of ${severity} anomaly`,
          notificationChannel: 'email',
          recipients: ['security-admin@example.com'],
          alertLevel: severity
        };
        break;
        
      case 'createIncident':
        actionResult.details = {
          message: `Created security incident for ${severity} anomaly`,
          incidentId: `INC-${Math.floor(Math.random() * 10000)}`,
          severity: severity,
          assignedTo: 'security-team',
          status: 'open'
        };
        break;
        
      default:
        actionResult.details = {
          message: `Executed ${action} action`,
          status: 'completed'
        };
    }
    
    responses.push({
      id: `response-${i}`,
      timestamp: timestamp.toISOString(),
      anomalyId: `anomaly-${Math.floor(Math.random() * 1000)}`,
      anomalyType: type,
      anomalySeverity: severity,
      username: username,
      ruleId: rule.id,
      ruleName: rule.name,
      actionType: action,
      actionResult: actionResult,
      status: actionResult.success ? 'completed' : 'failed'
    });
  }
  
  // Sort by timestamp (newest first)
  return responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Generate mock stats
 */
function generateMockStats(responses, rules) {
  // Count successful and failed responses
  const successfulResponses = responses.filter(r => r.status === 'completed' || r.actionResult?.success).length;
  const failedResponses = responses.length - successfulResponses;
  
  // Count by action type
  const actionTypeCounts = {};
  responses.forEach(response => {
    if (!actionTypeCounts[response.actionType]) {
      actionTypeCounts[response.actionType] = 0;
    }
    actionTypeCounts[response.actionType]++;
  });
  
  const byActionType = Object.keys(actionTypeCounts).map(action => ({
    action: action,
    count: actionTypeCounts[action]
  }));
  
  // Count by rule ID
  const ruleCountsMap = rules.reduce((acc, rule) => {
    acc[rule.id] = 0;
    return acc;
  }, {});
  
  responses.forEach(response => {
    if (ruleCountsMap[response.ruleId] !== undefined) {
      ruleCountsMap[response.ruleId]++;
    }
  });
  
  const byRuleId = rules.map(rule => ({
    ruleId: rule.id,
    ruleName: rule.name,
    count: ruleCountsMap[rule.id] || Math.floor(Math.random() * 30) + 5
  }));
  
  return {
    totalResponses: 127,
    successfulResponses: 119,
    failedResponses: 8,
    avgResponseTime: '0.8',
    byActionType: byActionType.length > 0 ? byActionType : [
      { action: 'lockAccount', count: 18 },
      { action: 'notifyAdmin', count: 42 },
      { action: 'createIncident', count: 31 },
      { action: 'requireMFA', count: 15 },
      { action: 'blockIP', count: 12 },
      { action: 'tempLockAccount', count: 9 }
    ],
    byRuleId: byRuleId,
    lastUpdated: new Date()
  };
}

export default AutomatedResponseDashboard;
