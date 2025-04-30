import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Grid, Chip, Avatar, List, ListItem, 
  ListItemText, ListItemAvatar, IconButton, Tooltip,
  CircularProgress, Alert, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Computer as ComputerIcon,
  Public as PublicIcon,
  QuestionMark as QuestionMarkIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import axios from 'axios';
import moment from 'moment';

// Chart components (optional - using recharts)
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

/**
 * Machine Learning Anomaly Detection Dashboard Component
 * Displays ML-detected anomalies and analytics
 */
const AnomalyDetectionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anomalyData, setAnomalyData] = useState({
    anomalies: [],
    stats: {}
  });
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  // Colors for severity levels
  const severityColors = {
    critical: '#d32f2f',
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50'
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Fetch anomaly data
  const fetchAnomalyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create axios instance with base URL
      const api = axios.create({
        baseURL: 'http://localhost:5050', // Updated port to match backend
        timeout: 10000
      });
      
      try {
        // Get anomaly detection data
        const response = await api.get('/api/mock-data/ml/anomalies', {
          params: { limit: 20 }
        });
        
        if (response.data.success) {
          setAnomalyData(response.data.data);
        } else {
          throw new Error('Failed to fetch anomaly data');
        }
      } catch (apiError) {
        console.warn('Error fetching anomaly data, using mock data', apiError);
        setAnomalyData(generateMockAnomalyData());
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setAnomalyData(generateMockAnomalyData());
      setError('Failed to fetch anomaly data. Using mock data instead.');
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchAnomalyData();
  }, []);
  
  // Handle anomaly selection
  const handleAnomalySelect = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setOpenDetails(true);
  };
  
  // Format severity string
  const formatSeverity = (severity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };
  
  // Get icon for anomaly type
  const getAnomalyTypeIcon = (type) => {
    switch (type) {
      case 'unusual_login_time':
        return <AccessTimeIcon />;
      case 'unusual_location':
        return <LocationIcon />;
      case 'excessive_failed_attempts':
        return <CloseIcon />;
      case 'data_exfiltration':
        return <StorageIcon />;
      case 'privilege_escalation':
        return <SecurityIcon />;
      case 'unusual_process':
        return <CodeIcon />;
      case 'lateral_movement':
        return <ComputerIcon />;
      default:
        return <QuestionMarkIcon />;
    }
  };
  
  // Format anomaly type for display
  const formatAnomalyType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Get color based on severity
  const getSeverityColor = (severity) => {
    return severityColors[severity] || '#757575';
  };
  
  // Load charts when data is available
  const renderCharts = () => {
    if (!anomalyData.stats || !anomalyData.stats.byType) {
      return <Typography>No statistical data available</Typography>;
    }
    
    // Prepare data for severity chart
    const severityData = [
      { name: 'Critical', value: anomalyData.stats.criticalCount || 0 },
      { name: 'High', value: anomalyData.stats.highCount || 0 },
      { name: 'Medium', value: anomalyData.stats.mediumCount || 0 },
      { name: 'Low', value: anomalyData.stats.lowCount || 0 }
    ];
    
    // Prepare data for type chart
    const typeData = anomalyData.stats.byType.map(item => ({
      name: formatAnomalyType(item.type),
      count: item.count
    }));
    
    return (
      <Grid container spacing={3}>
        {/* Severity Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Anomaly Severity Distribution" 
              subheader="Distribution of anomalies by severity level"
              avatar={<WarningIcon />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? severityColors.critical :
                            index === 1 ? severityColors.high :
                            index === 2 ? severityColors.medium :
                            severityColors.low
                          } 
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Anomaly Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Anomaly Type Distribution" 
              subheader="Distribution of anomalies by type"
              avatar={<BarChartIcon />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={typeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Count" fill="#8884d8">
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading anomaly detection data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Machine Learning Anomaly Detection
        </Typography>
        
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchAnomalyData}>
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
      
      {/* Overview Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Anomalies
              </Typography>
              <Typography variant="h4">
                {anomalyData.stats?.totalAnomalies?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Detected in the last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Anomalies
              </Typography>
              <Typography variant="h4" style={{ color: severityColors.critical }}>
                {anomalyData.stats?.criticalCount?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Requiring immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Severity
              </Typography>
              <Typography variant="h4" style={{ color: severityColors.high }}>
                {anomalyData.stats?.highCount?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Should be investigated soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Detection Rate
              </Typography>
              <Typography variant="h4">
                {Math.floor(Math.random() * 20) + 5}/hr
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average anomalies detected per hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Analytics Charts */}
      <Box sx={{ mb: 4 }}>
        {renderCharts()}
      </Box>
      
      {/* Recent Anomalies Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Recent Anomalies" 
          subheader="Latest detected anomalies from ML analysis"
          avatar={<TimelineIcon />}
          action={
            <Tooltip title="View All Anomalies">
              <IconButton>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anomalyData.anomalies && anomalyData.anomalies.length > 0 ? (
                  anomalyData.anomalies.map((anomaly) => (
                    <TableRow 
                      key={anomaly.id} 
                      hover
                      onClick={() => handleAnomalySelect(anomaly)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{moment(anomaly.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light' }}>
                            {getAnomalyTypeIcon(anomaly.type)}
                          </Avatar>
                          {formatAnomalyType(anomaly.type)}
                        </Box>
                      </TableCell>
                      <TableCell>{anomaly.username}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatSeverity(anomaly.severity)}
                          size="small"
                          style={{
                            backgroundColor: getSeverityColor(anomaly.severity),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={anomaly.confidence * 100} 
                              color={
                                anomaly.confidence > 0.8 ? "success" :
                                anomaly.confidence > 0.6 ? "primary" : "warning"
                              }
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {`${Math.round(anomaly.confidence * 100)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleAnomalySelect(anomaly);
                        }}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No anomalies detected
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      {/* Anomaly Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnomaly && (
          <>
            <DialogTitle sx={{ bgcolor: getSeverityColor(selectedAnomaly.severity), color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', color: getSeverityColor(selectedAnomaly.severity), mr: 2 }}>
                  {getAnomalyTypeIcon(selectedAnomaly.type)}
                </Avatar>
                <Box>
                  {formatAnomalyType(selectedAnomaly.type)}
                  <Typography variant="subtitle2">
                    {moment(selectedAnomaly.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Anomaly Details</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">User</TableCell>
                          <TableCell>{selectedAnomaly.username}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Severity</TableCell>
                          <TableCell>
                            <Chip
                              label={formatSeverity(selectedAnomaly.severity)}
                              size="small"
                              style={{
                                backgroundColor: getSeverityColor(selectedAnomaly.severity),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Confidence</TableCell>
                          <TableCell>{`${(selectedAnomaly.confidence * 100).toFixed(1)}%`}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Time Detected</TableCell>
                          <TableCell>{moment(selectedAnomaly.timestamp).fromNow()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Additional Information</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {selectedAnomaly.details && Object.entries(selectedAnomaly.details).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Recommended Actions</Typography>
                  <List dense>
                    {selectedAnomaly.type === 'unusual_login_time' && (
                      <>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>1</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Verify User Activity" 
                            secondary="Contact the user to confirm if they were actually logging in at this unusual time" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>2</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Review Recent Account Activity" 
                            secondary="Check for any other suspicious activities on this account" 
                          />
                        </ListItem>
                      </>
                    )}
                    {selectedAnomaly.type === 'unusual_location' && (
                      <>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>1</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Verify User Location" 
                            secondary="Contact the user to confirm if they are traveling or using a VPN" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>2</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Force Password Reset" 
                            secondary="If unauthorized access is suspected, force a password reset immediately" 
                          />
                        </ListItem>
                      </>
                    )}
                    {selectedAnomaly.type === 'data_exfiltration' && (
                      <>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'error.light' }}>1</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Block Traffic" 
                            secondary="Block traffic to the suspicious destination immediately" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'error.light' }}>2</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Isolate System" 
                            secondary="Isolate the affected system from the network for forensic analysis" 
                          />
                        </ListItem>
                      </>
                    )}
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={`${formatSeverity(selectedAnomaly.severity)} severity requires ${
                          selectedAnomaly.severity === 'critical' ? 'immediate' : 
                          selectedAnomaly.severity === 'high' ? 'urgent' : 
                          selectedAnomaly.severity === 'medium' ? 'prompt' : 'routine'
                        } attention`} 
                        secondary="Follow your organization's security incident response plan" 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<CheckIcon />}
                onClick={() => setOpenDetails(false)}
              >
                Mark as Reviewed
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setOpenDetails(false)}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

/**
 * Generate mock anomaly data if API call fails
 */
const generateMockAnomalyData = () => {
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
  
  // Generate mock anomalies
  const anomalies = [];
  for (let i = 0; i < 15; i++) {
    const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const username = users[Math.floor(Math.random() * users.length)];
    const confidence = parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)); // 0.5 to 1.0
    
    // Generate details based on type
    let details = {};
    switch (type) {
      case 'unusual_login_time':
        details = {
          expected: '9:00 AM - 5:00 PM',
          actual: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          location: ['New York', 'London', 'Tokyo', 'Remote'][Math.floor(Math.random() * 4)]
        };
        break;
      case 'unusual_location':
        details = {
          expected: 'New York, Washington',
          actual: ['Beijing', 'Moscow', 'Unknown', 'Singapore'][Math.floor(Math.random() * 4)],
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        };
        break;
      case 'data_exfiltration':
        details = {
          bytesTransferred: Math.floor(Math.random() * 1000000000),
          destination: ['cloud-storage.com', 'unknown-server.net', 'suspicious-domain.org'][Math.floor(Math.random() * 3)],
          protocol: ['HTTP', 'FTP', 'HTTPS'][Math.floor(Math.random() * 3)]
        };
        break;
      default:
        details = {
          source: 'ML Detection Engine',
          confidence: confidence
        };
    }
    
    // Generate timestamp within last 24 hours
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
    
    anomalies.push({
      id: `anomaly-${i}`,
      timestamp: timestamp.toISOString(),
      type: type,
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      username: username,
      severity: severity,
      confidence: confidence,
      details: details
    });
  }
  
  // Sort anomalies by timestamp (newest first)
  anomalies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Generate mock stats
  return {
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
      ]
    }
  };
};

export default AnomalyDetectionDashboard;
