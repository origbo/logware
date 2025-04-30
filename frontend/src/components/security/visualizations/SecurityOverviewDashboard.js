import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Grid, Chip, Avatar, IconButton, Tooltip,
  LinearProgress, Paper, Button, Alert, CircularProgress
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  AutoFixHigh as AutoFixHighIcon,
  Warning as WarningIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CheckCircle as CheckCircleIcon,
  DonutLarge as DonutLargeIcon
} from '@mui/icons-material';

import axios from 'axios';
import moment from 'moment';

// Chart components
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, AreaChart, Area
} from 'recharts';

/**
 * Security Overview Dashboard Component
 * Provides a unified view of all security metrics
 */
const SecurityOverviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    securityScore: 0,
    threatIntelligence: {},
    anomalyDetection: {},
    automatedResponse: {},
    recentIncidents: [],
    trends: {}
  });
  
  // Fetch security overview data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate mock data as we don't have a dedicated endpoint yet
      const mockData = generateMockData();
      setData(mockData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching security overview data:', err);
      setError('Failed to load security overview data');
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  
  // Get security score color
  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 70) return '#8bc34a'; // Light Green
    if (score >= 50) return '#ffc107'; // Amber
    if (score >= 30) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };
  
  // Format trend indicator
  const formatTrend = (value) => {
    if (value > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#f44336' }}>
          <ArrowUpIcon fontSize="small" />
          <Typography variant="body2" component="span">
            {value}%
          </Typography>
        </Box>
      );
    } else if (value < 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#4caf50' }}>
          <ArrowDownIcon fontSize="small" />
          <Typography variant="body2" component="span">
            {Math.abs(value)}%
          </Typography>
        </Box>
      );
    }
    return (
      <Typography variant="body2" component="span" color="text.secondary">
        0%
      </Typography>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading security overview data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          <ShieldIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Security Overview
        </Typography>
        
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Display error message if any */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Security Score Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Overall Security Score
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={data.securityScore} 
                  size={120}
                  thickness={5}
                  sx={{ 
                    color: getScoreColor(data.securityScore),
                    circle: {
                      strokeLinecap: 'round',
                    }
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" color={getScoreColor(data.securityScore)}>
                    {data.securityScore}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                {data.securityScore >= 90 ? 'Excellent' :
                 data.securityScore >= 70 ? 'Good' :
                 data.securityScore >= 50 ? 'Fair' :
                 data.securityScore >= 30 ? 'Poor' : 'Critical'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>
                Component Scores
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ minWidth: 200 }}>
                      Threat Intelligence
                    </Typography>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.threatIntelligence.score} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(data.threatIntelligence.score),
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {data.threatIntelligence.score}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ minWidth: 200 }}>
                      Anomaly Detection
                    </Typography>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.anomalyDetection.score} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(data.anomalyDetection.score),
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {data.anomalyDetection.score}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AutoFixHighIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ minWidth: 200 }}>
                      Automated Response
                    </Typography>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.automatedResponse.score} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(data.automatedResponse.score),
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {data.automatedResponse.score}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {moment(data.lastUpdated).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  sx={{ ml: 2 }}
                  onClick={fetchData}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Threat Intelligence */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Threat Intelligence" 
              avatar={<SecurityIcon />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Active Threats
                    </Typography>
                    <Typography variant="h4">
                      {data.threatIntelligence.activeThreats}
                    </Typography>
                    {formatTrend(data.threatIntelligence.trends?.activeThreats)}
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Critical Indicators
                    </Typography>
                    <Typography variant="h4" color="error">
                      {data.threatIntelligence.criticalIndicators}
                    </Typography>
                    {formatTrend(data.threatIntelligence.trends?.criticalIndicators)}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Indicators by Severity
                    </Typography>
                    <Box sx={{ height: 100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.threatIntelligence.bySeverity || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                            dataKey="value"
                            nameKey="name"
                          >
                            <Cell fill="#f44336" /> {/* Critical */}
                            <Cell fill="#ff9800" /> {/* High */}
                            <Cell fill="#ffeb3b" /> {/* Medium */}
                            <Cell fill="#4caf50" /> {/* Low */}
                          </Pie>
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Anomaly Detection */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Anomaly Detection" 
              avatar={<AnalyticsIcon />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Recent Anomalies
                    </Typography>
                    <Typography variant="h4">
                      {data.anomalyDetection.recentAnomalies}
                    </Typography>
                    {formatTrend(data.anomalyDetection.trends?.recentAnomalies)}
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Critical Anomalies
                    </Typography>
                    <Typography variant="h4" color="error">
                      {data.anomalyDetection.criticalAnomalies}
                    </Typography>
                    {formatTrend(data.anomalyDetection.trends?.criticalAnomalies)}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Anomaly Trend (7 days)
                    </Typography>
                    <Box sx={{ height: 100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.anomalyDetection.trend || []}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" hide />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Automated Response */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Automated Response" 
              avatar={<AutoFixHighIcon />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Auto-Mitigated
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {data.automatedResponse.mitigatedThreats}
                    </Typography>
                    {formatTrend(data.automatedResponse.trends?.mitigatedThreats)}
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Success Rate
                    </Typography>
                    <Typography variant="h4">
                      {data.automatedResponse.successRate}%
                    </Typography>
                    {formatTrend(data.automatedResponse.trends?.successRate)}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Actions by Type
                    </Typography>
                    <Box sx={{ height: 100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.automatedResponse.byActionType || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                            dataKey="value"
                            nameKey="name"
                          >
                            <Cell fill="#3f51b5" /> {/* Block */}
                            <Cell fill="#009688" /> {/* Notify */}
                            <Cell fill="#ff5722" /> {/* Lock */}
                            <Cell fill="#9c27b0" /> {/* Other */}
                          </Pie>
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Security Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Security Score Trend" 
          subheader="Last 30 days"
          avatar={<TimelineIcon />}
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trends.securityScore || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      
      {/* Recent Security Incidents */}
      <Card>
        <CardHeader 
          title="Recent Security Incidents" 
          subheader="Last 7 days"
          avatar={<WarningIcon />}
        />
        <Divider />
        <CardContent sx={{ pb: 0 }}>
          <Grid container spacing={2}>
            {data.recentIncidents && data.recentIncidents.length > 0 ? (
              data.recentIncidents.map((incident, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      position: 'relative',
                      borderLeft: `4px solid ${
                        incident.severity === 'critical' ? '#f44336' :
                        incident.severity === 'high' ? '#ff9800' :
                        incident.severity === 'medium' ? '#ffeb3b' : '#4caf50'
                      }`
                    }}
                  >
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {incident.title}
                      </Typography>
                      <Chip
                        label={incident.severity.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: incident.severity === 'critical' ? '#f44336' :
                                          incident.severity === 'high' ? '#ff9800' :
                                          incident.severity === 'medium' ? '#ffeb3b' : '#4caf50',
                          color: incident.severity === 'medium' ? '#000' : '#fff'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {incident.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light' }}>
                          {incident.type === 'threat' ? <SecurityIcon fontSize="small" /> :
                           incident.type === 'anomaly' ? <AnalyticsIcon fontSize="small" /> :
                           <AutoFixHighIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {incident.type === 'threat' ? 'Threat Intelligence' :
                           incident.type === 'anomaly' ? 'Anomaly Detection' :
                           'Automated Response'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {moment(incident.timestamp).fromNow()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6">No Recent Security Incidents</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your systems appear to be secure. Continue monitoring for potential threats.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Generate mock data for the security overview dashboard
 */
function generateMockData() {
  // Generate a realistic security score between 65 and 95
  const securityScore = Math.floor(Math.random() * 30) + 65;
  
  // Current date
  const now = new Date();
  
  // Generate threat intelligence data
  const threatIntelligence = {
    score: Math.floor(Math.random() * 20) + securityScore - 10, // +/- 10 points from security score
    activeThreats: Math.floor(Math.random() * 50) + 10,
    criticalIndicators: Math.floor(Math.random() * 5) + 1,
    bySeverity: [
      { name: 'Critical', value: Math.floor(Math.random() * 5) + 1 },
      { name: 'High', value: Math.floor(Math.random() * 15) + 5 },
      { name: 'Medium', value: Math.floor(Math.random() * 20) + 10 },
      { name: 'Low', value: Math.floor(Math.random() * 30) + 20 }
    ],
    trends: {
      activeThreats: Math.floor(Math.random() * 30) - 15, // -15% to +15%
      criticalIndicators: Math.floor(Math.random() * 40) - 10 // -10% to +30%
    }
  };
  
  // Generate anomaly detection data
  const anomalyDetection = {
    score: Math.floor(Math.random() * 20) + securityScore - 10, // +/- 10 points from security score
    recentAnomalies: Math.floor(Math.random() * 30) + 5,
    criticalAnomalies: Math.floor(Math.random() * 3),
    trend: Array(7).fill().map((_, i) => ({
      name: moment().subtract(6 - i, 'days').format('ddd'),
      value: Math.floor(Math.random() * 10) + 1
    })),
    trends: {
      recentAnomalies: Math.floor(Math.random() * 30) - 10, // -10% to +20%
      criticalAnomalies: Math.floor(Math.random() * 20) - 10 // -10% to +10%
    }
  };
  
  // Generate automated response data
  const automatedResponse = {
    score: Math.floor(Math.random() * 20) + securityScore - 10, // +/- 10 points from security score
    mitigatedThreats: Math.floor(Math.random() * 20) + 5,
    successRate: Math.floor(Math.random() * 15) + 85, // 85% to 100%
    byActionType: [
      { name: 'Block', value: Math.floor(Math.random() * 15) + 5 },
      { name: 'Notify', value: Math.floor(Math.random() * 25) + 15 },
      { name: 'Lock', value: Math.floor(Math.random() * 10) + 2 },
      { name: 'Other', value: Math.floor(Math.random() * 5) + 1 }
    ],
    trends: {
      mitigatedThreats: Math.floor(Math.random() * 40) - 5, // -5% to +35%
      successRate: Math.floor(Math.random() * 10) - 2 // -2% to +8%
    }
  };
  
  // Generate recent incidents
  const incidentTypes = ['threat', 'anomaly', 'response'];
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  
  const recentIncidents = Array(Math.floor(Math.random() * 4) + 2).fill().map((_, i) => {
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const severity = i === 0 ? 
      severityLevels[Math.floor(Math.random() * 2)] : // First incident is either critical or high
      severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    let title, description;
    
    switch (type) {
      case 'threat':
        title = severity === 'critical' || severity === 'high' ? 
          'Malicious IP Address Detected' : 
          'Suspicious Domain Activity';
        description = severity === 'critical' || severity === 'high' ?
          'Multiple connection attempts from known malicious IP address.' :
          'Unusual DNS queries to potentially suspicious domains.';
        break;
      case 'anomaly':
        title = severity === 'critical' ? 
          'Unusual Admin Access Detected' : 
          severity === 'high' ?
          'Unusual Login Location' :
          'Abnormal User Behavior';
        description = severity === 'critical' ?
          'Admin account accessed sensitive resources outside normal hours.' :
          severity === 'high' ?
          'User login detected from unusual geographic location.' :
          'User activity pattern deviates from established baseline.';
        break;
      case 'response':
        title = severity === 'critical' ? 
          'Account Locked Due to Suspicious Activity' : 
          severity === 'high' ?
          'IP Address Blocked' :
          'Additional Authentication Required';
        description = severity === 'critical' ?
          'User account automatically locked due to multiple suspicious actions.' :
          severity === 'high' ?
          'External IP address blocked due to repeated failed login attempts.' :
          'MFA enabled for user after detecting unusual access patterns.';
        break;
      default:
        title = 'Security Event Detected';
        description = 'A security event was detected and logged.';
    }
    
    return {
      id: `incident-${i}`,
      title,
      description,
      type,
      severity,
      timestamp: new Date(now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // 0-7 days ago
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Generate security score trend data
  const securityScoreTrend = Array(30).fill().map((_, i) => {
    const date = moment().subtract(29 - i, 'days').format('MMM DD');
    // Create a somewhat realistic trend with some fluctuation
    const baseScore = securityScore - 5 + (i / 5); // Gradually improving score
    const randomVariation = Math.floor(Math.random() * 6) - 3; // -3 to +3 random variation
    return {
      date,
      score: Math.min(100, Math.max(0, Math.floor(baseScore + randomVariation)))
    };
  });
  
  return {
    securityScore,
    threatIntelligence,
    anomalyDetection,
    automatedResponse,
    recentIncidents,
    trends: {
      securityScore: securityScoreTrend
    },
    lastUpdated: now
  };
}

export default SecurityOverviewDashboard;
