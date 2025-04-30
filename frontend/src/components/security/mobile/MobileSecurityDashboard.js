import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Chip, Badge,
  BottomNavigation, BottomNavigationAction, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Drawer, AppBar, Toolbar, Divider, CircularProgress, Alert,
  LinearProgress, Tab, Tabs
} from '@mui/material';
import { 
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

// Severity colors for consistent UI
const severityColors = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  info: '#2196f3'
};

/**
 * Mobile Security Dashboard Component
 * Optimized for mobile devices with touch-friendly interactions
 */
const MobileSecurityDashboard = () => {
  // States
  const [tabIndex, setTabIndex] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({
    riskScore: 72,
    openAlerts: 0,
    criticalAlerts: 0,
    anomalies: 0
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setRefreshing(true);
    
    try {
      // Fetch alerts
      const alertsResponse = await axios.get('http://localhost:5050/api/security/alerts');
      setAlerts(alertsResponse.data);
      
      // Update metrics based on alerts
      const openAlerts = alertsResponse.data.filter(alert => alert.status === 'open');
      const criticalAlerts = alertsResponse.data.filter(
        alert => (alert.severity === 'critical' || alert.severity === 'high') && alert.status === 'open'
      );
      
      // Fetch incidents
      const incidentsResponse = await axios.get('http://localhost:5050/api/security/incidents');
      setIncidents(incidentsResponse.data);
      
      // Update metrics
      setMetrics({
        riskScore: calculateOverallRiskScore(alertsResponse.data, incidentsResponse.data),
        openAlerts: openAlerts.length,
        criticalAlerts: criticalAlerts.length,
        anomalies: incidentsResponse.data.filter(incident => incident.type === 'anomaly').length
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching security data:', err);
      setError('Failed to fetch security data. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Calculate overall risk score based on alerts and incidents
  const calculateOverallRiskScore = (alerts, incidents) => {
    // Simple algorithm: weighted average of alert severities and incident impacts
    if (!alerts.length && !incidents.length) return 0;
    
    let totalScore = 0;
    let count = 0;
    
    // Score from alerts
    alerts.forEach(alert => {
      if (alert.status === 'open') {
        switch (alert.severity) {
          case 'critical': totalScore += 100; count++; break;
          case 'high': totalScore += 80; count++; break;
          case 'medium': totalScore += 50; count++; break;
          case 'low': totalScore += 30; count++; break;
          case 'info': totalScore += 10; count++; break;
          default: break;
        }
      }
    });
    
    // Score from incidents
    incidents.forEach(incident => {
      if (incident.status !== 'resolved') {
        switch (incident.impact) {
          case 'critical': totalScore += 100; count++; break;
          case 'high': totalScore += 80; count++; break;
          case 'medium': totalScore += 50; count++; break;
          case 'low': totalScore += 30; count++; break;
          default: break;
        }
      }
    });
    
    return count > 0 ? Math.round(totalScore / count) : 0;
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  
  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };
  
  // Handle acknowledging an alert
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await axios.post(`http://localhost:5050/api/security/alerts/${alertId}/acknowledge`);
      
      // Update local state
      setAlerts(alerts.map(alert => {
        if (alert.id === alertId) {
          return { ...alert, status: 'acknowledged', acknowledgedAt: new Date() };
        }
        return alert;
      }));
      
      setDetailOpen(false);
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      setError('Failed to acknowledge alert.');
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Render security overview card
  const renderSecurityOverview = () => {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Security Posture</Typography>
          <IconButton size="small" onClick={fetchData} disabled={refreshing}>
            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={metrics.riskScore}
              size={100}
              thickness={5}
              sx={{
                color: metrics.riskScore > 80 ? severityColors.critical :
                       metrics.riskScore > 60 ? severityColors.high :
                       metrics.riskScore > 40 ? severityColors.medium :
                       severityColors.low
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
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" component="div" fontWeight="bold">
                {metrics.riskScore}
              </Typography>
              <Typography variant="caption" component="div">
                Risk Score
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={metrics.criticalAlerts > 0 ? severityColors.critical : 'text.primary'}>
              {metrics.criticalAlerts}
            </Typography>
            <Typography variant="body2">Critical Alerts</Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={metrics.openAlerts > 0 ? severityColors.high : 'text.primary'}>
              {metrics.openAlerts}
            </Typography>
            <Typography variant="body2">Open Alerts</Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={metrics.anomalies > 0 ? severityColors.medium : 'text.primary'}>
              {metrics.anomalies}
            </Typography>
            <Typography variant="body2">Anomalies</Typography>
          </Box>
        </Box>
      </Paper>
    );
  };
  
  // Render alerts tab
  const renderAlertsTab = () => {
    return (
      <Box>
        {alerts.length > 0 ? (
          <List>
            {alerts.map(alert => (
              <ListItem 
                key={alert.id} 
                button 
                onClick={() => handleItemSelect(alert)}
                sx={{
                  mb: 1,
                  backgroundColor: alert.status === 'open' && 
                    (alert.severity === 'critical' || alert.severity === 'high') 
                    ? 'rgba(244, 67, 54, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {alert.severity === 'critical' || alert.severity === 'high' ? (
                    <ErrorIcon sx={{ color: severityColors[alert.severity] }} />
                  ) : alert.severity === 'medium' ? (
                    <WarningIcon sx={{ color: severityColors.medium }} />
                  ) : (
                    <CheckIcon sx={{ color: severityColors.low }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={alert.title}
                  secondary={`${alert.source} • ${formatTimestamp(alert.timestamp)}`}
                />
                <ListItemSecondaryAction>
                  <Chip 
                    label={alert.status.toUpperCase()} 
                    size="small"
                    color={
                      alert.status === 'open' ? 'error' :
                      alert.status === 'acknowledged' ? 'warning' : 'success'
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No alerts found
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  // Render incidents tab
  const renderIncidentsTab = () => {
    return (
      <Box>
        {incidents.length > 0 ? (
          <List>
            {incidents.map(incident => (
              <ListItem 
                key={incident.id} 
                button 
                onClick={() => handleItemSelect(incident)}
                sx={{
                  mb: 1,
                  backgroundColor: incident.status === 'active' && 
                    (incident.impact === 'critical' || incident.impact === 'high') 
                    ? 'rgba(244, 67, 54, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {incident.impact === 'critical' || incident.impact === 'high' ? (
                    <ErrorIcon sx={{ color: severityColors.high }} />
                  ) : incident.impact === 'medium' ? (
                    <WarningIcon sx={{ color: severityColors.medium }} />
                  ) : (
                    <CheckIcon sx={{ color: severityColors.low }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={incident.title}
                  secondary={`${incident.type} • ${formatTimestamp(incident.timestamp)}`}
                />
                <ListItemSecondaryAction>
                  <Chip 
                    label={incident.status.toUpperCase()} 
                    size="small"
                    color={
                      incident.status === 'active' ? 'error' :
                      incident.status === 'investigating' ? 'warning' : 'success'
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No incidents found
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  // Render training tab
  const renderTrainingTab = () => {
    // Simplified version of the full training module for mobile
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Available Training</Typography>
        
        <List>
          <ListItem button component="a" href="#full-training">
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Phishing Attack Response"
              secondary="Learn how to identify and respond to phishing attacks"
            />
          </ListItem>
          
          <ListItem button component="a" href="#full-training">
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Ransomware Outbreak Response"
              secondary="Learn how to contain and recover from ransomware"
            />
          </ListItem>
          
          <ListItem button component="a" href="#full-training">
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Data Breach Handling"
              secondary="Practice steps to take when data is potentially exposed"
            />
          </ListItem>
        </List>
        
        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            component="a"
            href="/training"
          >
            Open Full Training Module
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render detail drawer
  const renderDetailDrawer = () => {
    if (!selectedItem) return null;
    
    const isAlert = selectedItem.hasOwnProperty('severity');
    
    return (
      <Drawer
        anchor="bottom"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        PaperProps={{
          sx: { 
            height: '80%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setDetailOpen(false)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              {isAlert ? 'Alert Details' : 'Incident Details'}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 2, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>{selectedItem.title}</Typography>
          
          <Box mt={2} mb={2}>
            <Chip 
              label={
                isAlert 
                  ? selectedItem.severity.toUpperCase() 
                  : selectedItem.impact.toUpperCase()
              }
              sx={{ 
                mr: 1,
                backgroundColor: isAlert 
                  ? severityColors[selectedItem.severity] 
                  : (
                    selectedItem.impact === 'critical' ? severityColors.critical :
                    selectedItem.impact === 'high' ? severityColors.high :
                    selectedItem.impact === 'medium' ? severityColors.medium :
                    severityColors.low
                  ),
                color: 'white'
              }}
            />
            
            <Chip 
              label={selectedItem.status.toUpperCase()}
              color={
                selectedItem.status === 'open' || selectedItem.status === 'active' ? 'error' :
                selectedItem.status === 'acknowledged' || selectedItem.status === 'investigating' ? 'warning' : 'success'
              }
            />
          </Box>
          
          <Typography variant="body1" paragraph>{selectedItem.description}</Typography>
          
          <Typography variant="subtitle2">Source</Typography>
          <Typography variant="body2" gutterBottom>{selectedItem.source || 'N/A'}</Typography>
          
          <Typography variant="subtitle2">Timestamp</Typography>
          <Typography variant="body2" gutterBottom>{formatTimestamp(selectedItem.timestamp)}</Typography>
          
          {isAlert && selectedItem.status === 'open' && (
            <Box mt={3}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => handleAcknowledgeAlert(selectedItem.id)}
              >
                Acknowledge Alert
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    );
  };
  
  return (
    <Box 
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Security Monitor
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Badge
            badgeContent={metrics.criticalAlerts} 
            color="error"
            sx={{ mr: 2 }}
          >
            <NotificationsIcon />
          </Badge>
        </Toolbar>
      </AppBar>
      
      {/* Pull to refresh indicator */}
      {refreshing && (
        <Box sx={{ width: '100%', position: 'fixed', top: 0, zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      )}
      
      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderSecurityOverview()}
            
            <Box sx={{ width: '100%', mt: 2 }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Alerts" />
                <Tab label="Incidents" />
                <Tab label="Training" />
              </Tabs>
              
              <Box sx={{ mt: 2 }}>
                {tabIndex === 0 && renderAlertsTab()}
                {tabIndex === 1 && renderIncidentsTab()}
                {tabIndex === 2 && renderTrainingTab()}
              </Box>
            </Box>
          </>
        )}
      </Box>
      
      {/* Bottom Navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          value={tabIndex}
          onChange={handleTabChange}
          showLabels
        >
          <BottomNavigationAction 
            label="Alerts" 
            icon={
              <Badge badgeContent={metrics.openAlerts} color="error">
                <NotificationsIcon />
              </Badge>
            } 
          />
          <BottomNavigationAction 
            label="Incidents" 
            icon={<WarningIcon />} 
          />
          <BottomNavigationAction 
            label="Training" 
            icon={<SchoolIcon />} 
          />
        </BottomNavigation>
      </Paper>
      
      {/* Detail drawer */}
      {renderDetailDrawer()}
    </Box>
  );
};

export default MobileSecurityDashboard;
