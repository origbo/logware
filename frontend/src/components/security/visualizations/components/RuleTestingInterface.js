import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Grid, Button, FormControl, InputLabel,
  MenuItem, Select, TextField, Paper, Alert,
  CircularProgress, Stepper, Step, StepLabel,
  List, ListItem, ListItemIcon, ListItemText,
  Chip
} from '@mui/material';

import {
  PlayArrow as TestIcon,
  Refresh as ResetIcon,
  SyncAlt as SimulateIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

import axios from 'axios';

/**
 * RuleTestingInterface Component
 * Allows testing of automated response rules against sample anomalies
 */
const RuleTestingInterface = ({ rules = [] }) => {
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [anomalyType, setAnomalyType] = useState('unusual_login_time');
  const [anomalySeverity, setAnomalySeverity] = useState('high');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Anomaly type options
  const anomalyTypes = [
    { value: 'unusual_login_time', label: 'Unusual Login Time' },
    { value: 'unusual_location', label: 'Unusual Location' },
    { value: 'excessive_failed_attempts', label: 'Excessive Failed Attempts' },
    { value: 'data_exfiltration', label: 'Data Exfiltration' },
    { value: 'privilege_escalation', label: 'Privilege Escalation' },
    { value: 'unusual_process', label: 'Unusual Process' },
    { value: 'lateral_movement', label: 'Lateral Movement' }
  ];
  
  // Severity options
  const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];
  
  // Test steps
  const steps = [
    'Configure Test',
    'Generate Anomaly',
    'Execute Actions'
  ];
  
  // Handle rule selection
  const handleRuleChange = (event) => {
    setSelectedRuleId(event.target.value);
  };
  
  // Handle anomaly type change
  const handleAnomalyTypeChange = (event) => {
    setAnomalyType(event.target.value);
  };
  
  // Handle severity change
  const handleSeverityChange = (event) => {
    setAnomalySeverity(event.target.value);
  };
  
  // Reset test
  const handleReset = () => {
    setTestResults(null);
    setError(null);
    setActiveStep(0);
  };
  
  // Run the test
  const handleRunTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      // Create a test anomaly
      const testAnomaly = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: anomalyType,
        userId: 'test-user-001',
        username: 'test.user',
        severity: anomalySeverity,
        confidence: 0.85,
        details: {
          source: 'Test Interface',
          testGenerated: true
        }
      };
      
      // Customize details based on anomaly type
      switch (anomalyType) {
        case 'unusual_login_time':
          testAnomaly.details = {
            ...testAnomaly.details,
            expected: '9:00 AM - 5:00 PM',
            actual: '3:15 AM',
            location: 'New York'
          };
          break;
        case 'unusual_location':
          testAnomaly.details = {
            ...testAnomaly.details,
            expected: 'New York, Washington',
            actual: 'Moscow',
            ipAddress: '185.68.93.42'
          };
          break;
        case 'data_exfiltration':
          testAnomaly.details = {
            ...testAnomaly.details,
            bytesTransferred: 758432567,
            destination: 'unknown-server.net',
            protocol: 'HTTPS',
            duration: '27 minutes'
          };
          break;
      }
      
      setActiveStep(1);
      
      // Create axios instance
      const api = axios.create({
        baseURL: 'http://localhost:5050',
        timeout: 10000
      });
      
      // Test the rule
      const response = await api.post('/api/mock-data/automated-response/test-rule', {
        ruleId: selectedRuleId,
        anomaly: testAnomaly
      });
      
      if (response.data.success) {
        setTestResults(response.data.data);
        setActiveStep(2);
      } else {
        throw new Error('Failed to test rule');
      }
    } catch (err) {
      console.error('Error testing rule:', err);
      setError(err.message || 'Failed to test rule');
      
      // Generate mock results if API fails
      setTestResults(generateMockTestResults(selectedRuleId, anomalyType, anomalySeverity));
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };
  
  // Get selected rule
  const selectedRule = rules.find(rule => rule.id === selectedRuleId) || null;
  
  // Get status color
  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };
  
  return (
    <Card>
      <CardHeader 
        title="Rule Testing Interface" 
        subheader="Test automated response rules against sample security events"
        avatar={<ScienceIcon />}
      />
      <Divider />
      <CardContent>
        {/* Test Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Configuration Form */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="rule-select-label">Response Rule</InputLabel>
                <Select
                  labelId="rule-select-label"
                  id="rule-select"
                  value={selectedRuleId}
                  label="Response Rule"
                  onChange={handleRuleChange}
                >
                  <MenuItem value="">
                    <em>Select a rule</em>
                  </MenuItem>
                  {rules.map((rule) => (
                    <MenuItem key={rule.id} value={rule.id}>
                      {rule.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="anomaly-type-label">Anomaly Type</InputLabel>
                <Select
                  labelId="anomaly-type-label"
                  id="anomaly-type-select"
                  value={anomalyType}
                  label="Anomaly Type"
                  onChange={handleAnomalyTypeChange}
                >
                  {anomalyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="severity-label">Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  id="severity-select"
                  value={anomalySeverity}
                  label="Severity"
                  onChange={handleSeverityChange}
                >
                  {severityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<TestIcon />}
                  onClick={handleRunTest}
                  disabled={!selectedRuleId || loading}
                  sx={{ mr: 2 }}
                >
                  Run Test
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {activeStep === 1 ? 'Generating Test Anomaly...' : 'Testing Rule...'}
            </Typography>
          </Box>
        )}
        
        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Test Results */}
        {testResults && (
          <Box sx={{ mt: 2 }}>
            {/* Anomaly Details */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
              <Typography variant="subtitle1" gutterBottom>
                <SimulateIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Test Anomaly
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Anomaly Type"
                    value={anomalyTypes.find(t => t.value === testResults.testAnomaly.type)?.label || testResults.testAnomaly.type}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Severity"
                    value={severityOptions.find(s => s.value === testResults.testAnomaly.severity)?.label || testResults.testAnomaly.severity}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="User"
                    value={testResults.testAnomaly.username}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {/* Rule Details */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
              <Typography variant="subtitle1" gutterBottom>
                Response Rule
              </Typography>
              <TextField
                label="Rule Name"
                value={testResults.rule.name}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                margin="normal"
              />
              <TextField
                label="Description"
                value={testResults.rule.description}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                margin="normal"
              />
            </Paper>
            
            {/* Actions Executed */}
            <Paper sx={{ p: 2 }} variant="outlined">
              <Typography variant="subtitle1" gutterBottom>
                Actions Executed
              </Typography>
              
              <List>
                {testResults.actions.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {action.success ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.actionType}
                      secondary={action.details.message}
                    />
                    <Chip 
                      label={action.success ? 'Success' : 'Failed'} 
                      color={getStatusColor(action.success)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  sx={{ mt: 2 }}
                >
                  Run Another Test
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Generate mock test results if API fails
 */
function generateMockTestResults(ruleId, anomalyType, anomalySeverity) {
  const testAnomaly = {
    id: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: anomalyType,
    userId: 'test-user-001',
    username: 'test.user',
    severity: anomalySeverity,
    confidence: 0.85,
    details: {
      source: 'Test Interface',
      testGenerated: true
    }
  };
  
  // Customize details based on anomaly type
  switch (anomalyType) {
    case 'unusual_login_time':
      testAnomaly.details = {
        ...testAnomaly.details,
        expected: '9:00 AM - 5:00 PM',
        actual: '3:15 AM',
        location: 'New York'
      };
      break;
    case 'unusual_location':
      testAnomaly.details = {
        ...testAnomaly.details,
        expected: 'New York, Washington',
        actual: 'Moscow',
        ipAddress: '185.68.93.42'
      };
      break;
    case 'data_exfiltration':
      testAnomaly.details = {
        ...testAnomaly.details,
        bytesTransferred: 758432567,
        destination: 'unknown-server.net',
        protocol: 'HTTPS',
        duration: '27 minutes'
      };
      break;
  }
  
  // Mock rule
  const rule = {
    id: ruleId || 'rule-001',
    name: ruleId === 'rule-001' ? 'Critical Anomaly Auto-Response' :
          ruleId === 'rule-002' ? 'Unusual Login Location Response' :
          ruleId === 'rule-003' ? 'Data Exfiltration Response' :
          ruleId === 'rule-004' ? 'Brute Force Login Response' :
          ruleId === 'rule-005' ? 'Privilege Escalation Response' : 'Test Rule',
    description: 'Rule used for testing automated responses',
    conditions: {
      anomalySeverity: [anomalySeverity],
      anomalyTypes: [anomalyType]
    },
    actions: ruleId === 'rule-001' ? ['lockAccount', 'notifyAdmin', 'createIncident'] :
             ruleId === 'rule-002' ? ['requireMFA', 'notifyUser', 'createIncident'] :
             ruleId === 'rule-003' ? ['blockIP', 'createIncident', 'notifyAdmin'] :
             ruleId === 'rule-004' ? ['tempLockAccount', 'notifyUser'] :
             ruleId === 'rule-005' ? ['revokePrivileges', 'createIncident', 'notifyAdmin'] : 
             ['notifyAdmin', 'createIncident'],
    enabled: true
  };
  
  // Mock actions
  const actions = rule.actions.map(actionType => ({
    actionType,
    success: Math.random() > 0.2, // 20% chance of failure
    timestamp: new Date(),
    details: {
      message: `Test execution of ${actionType} for anomaly ${anomalyType}`,
      anomalySeverity: anomalySeverity,
      anomalyType: anomalyType,
      username: testAnomaly.username,
      status: 'simulated'
    }
  }));
  
  return {
    rule,
    testAnomaly,
    actions,
    executionTime: Math.floor(Math.random() * 800) + 200, // 200-1000ms
    timestamp: new Date()
  };
}

export default RuleTestingInterface;
