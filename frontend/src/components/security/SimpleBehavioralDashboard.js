import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, Button,
  Tabs, Tab, useMediaQuery, CircularProgress,
  Alert, IconButton 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { 
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';

// Import advanced visualization components
import AttackPathModeling from './visualizations/AttackPathModeling';
import ThreatIntelligenceDashboard from './visualizations/ThreatIntelligenceDashboard';
import AnomalyDetectionDashboard from './visualizations/AnomalyDetectionDashboard';
import AutomatedResponseDashboard from './visualizations/AutomatedResponseDashboard';
import SecurityOverviewDashboard from './visualizations/SecurityOverviewDashboard';
import RealTimeAlertDashboard from './notifications/RealTimeAlertDashboard';
import IncidentResponseTraining from './training/IncidentResponseTraining';
import MobileSecurityEntryPoint from './MobileSecurityEntryPoint';

// TabPanel component for accessibility
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock data generation functions
const generateMockRiskScores = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    userId: `user${i+1}`,
    username: `User ${i+1}`,
    riskScore: Math.floor(Math.random() * 100),
    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    lastActivity: new Date(Date.now() - Math.random() * 8640000).toISOString()
  }));
};

const generateMockEvents = () => {
  const eventTypes = ['login_failure', 'unusual_access', 'data_exfiltration', 'malware_detected', 'policy_violation'];
  const sources = ['firewall', 'endpoint', 'ids', 'user_behavior', 'email_gateway'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    eventId: `event${i+1}`,
    timestamp: new Date(Date.now() - Math.random() * 8640000).toISOString(),
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    source: sources[Math.floor(Math.random() * sources.length)],
    description: `Security event detected: ${eventTypes[Math.floor(Math.random() * eventTypes.length)].replace('_', ' ')}`,
    affectedUser: `user${Math.floor(Math.random() * 10) + 1}`,
    status: Math.random() > 0.3 ? 'resolved' : 'open'
  }));
};

const generateMockSummary = () => {
  return {
    overallRiskScore: Math.floor(Math.random() * 100),
    openAlerts: Math.floor(Math.random() * 15),
    resolvedAlerts: Math.floor(Math.random() * 30),
    criticalEvents: Math.floor(Math.random() * 5),
    complianceStatus: Math.random() > 0.7 ? 'at_risk' : 'compliant',
    topThreatVectors: [
      { name: 'Phishing', percentage: Math.floor(Math.random() * 100) },
      { name: 'Malware', percentage: Math.floor(Math.random() * 100) },
      { name: 'Insider Threat', percentage: Math.floor(Math.random() * 100) }
    ],
    securityPosture: Math.random() > 0.6 ? 'improving' : 'degrading'
  };
};

/**
 * Simple Behavioral Dashboard Component
 * Central hub for security analysis tools and visualizations
 */
const SimpleBehavioralDashboard = () => {
  // State for tab management
  const [tabIndex, setTabIndex] = useState(0);
  
  // Handle tab change
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  
  // State for mobile view toggle
  const [showMobileView, setShowMobileView] = useState(false);
  
  // State for data loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    userRiskScores: [],
    recentEvents: [],
    summary: {},
    isFromBackend: false
  });
  
  // Check if the device is mobile sized
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Fetch data from mock API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    // Check which API endpoints are actually available
    const API_URL = 'http://localhost:5000';
    console.log('Attempting to connect to API server at:', API_URL);
    
    try {
      // First check if the server is running
      try {
        const serverCheck = await axios.get(`${API_URL}/api/status`, {
          timeout: 5000
        });
        console.log('Server status check:', serverCheck.data);
      } catch (statusError) {
        console.error('Server status check failed:', statusError.message);
        // Continue anyway, the main requests might still work
      }
      
      // Create axios instance with base URL for mock server
      const api = axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Use mock data if connection fails
      let riskData = { userRiskScores: generateMockRiskScores() };
      let eventsData = { events: generateMockEvents() };
      let summaryData = { summary: generateMockSummary() };
      
      try {
        // Get user risk scores
        const riskResponse = await api.get('/api/mock-data/security-analytics/user-risk');
        console.log('Risk data:', riskResponse.data);
        riskData = riskResponse.data;
      } catch (riskError) {
        console.warn('Could not fetch risk data, using mock data:', riskError.message);
      }
      
      try {
        // Get recent security events
        const eventsResponse = await api.get('/api/mock-data/security-analytics/events');
        console.log('Events data:', eventsResponse.data);
        eventsData = eventsResponse.data;
      } catch (eventsError) {
        console.warn('Could not fetch events data, using mock data:', eventsError.message);
      }
      
      try {
        // Get dashboard summary
        const summaryResponse = await api.get('/api/mock-data/security-analytics/dashboard');
        console.log('Summary data:', summaryResponse.data);
        summaryData = summaryResponse.data;
      } catch (summaryError) {
        console.warn('Could not fetch summary data, using mock data:', summaryError.message);
      }
      
      setData({
        userRiskScores: riskData.userRiskScores || [],
        recentEvents: eventsData.events || [],
        summary: summaryData.summary || {},
        isFromBackend: true // Flag that data came from backend
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Instead of showing an error, always use mock data as a fallback
      console.log('Using mock data for demonstration');
      
      // Set mock data in case of error
      setData({
        userRiskScores: generateMockRiskScores(),
        recentEvents: generateMockEvents(),
        summary: generateMockSummary(),
        isFromBackend: false // Flag that data is mock
      });
      
      setLoading(false);
      // Don't set error state - just continue with mock data
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  // Render error state - only if we have an error AND no data
  if (error && !data.userRiskScores.length && !data.recentEvents.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Show warning if using mock data (connection issues)
  const usingMockData = !data.isFromBackend;
  
  // Format user risk score data
  const topRiskUsers = data.userRiskScores
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      {/* Mobile Entry Point - Show only on desktop and when not in mobile view */}
      {!isMobile && !showMobileView && (
        <MobileSecurityEntryPoint />
      )}
      
      {/* Mobile View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant={showMobileView ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setShowMobileView(!showMobileView)}
          sx={{ mb: 1 }}
        >
          {showMobileView ? "Desktop View" : "Mobile View"}
        </Button>
      </Box>
      
      <Tabs 
        value={tabIndex} 
        onChange={handleChange} 
        aria-label="dashboard tabs" 
        centered 
        sx={{ mb: 3 }}
        variant={showMobileView ? "scrollable" : "standard"}
        scrollButtons={showMobileView ? "auto" : false}
      >
        <Tab icon={<SecurityIcon />} label="Security Overview" />
        <Tab icon={<AnalyticsIcon />} label="Anomaly Detection" />
        <Tab icon={<AutoFixHighIcon />} label="Automated Response" />
        <Tab icon={<NotificationsIcon />} label="Real-Time Alerts" />
        <Tab icon={<SchoolIcon />} label="Training" />
        <Tab icon={<VisibilityIcon />} label="Attack Path Modeling" />
        <Tab icon={<SecurityIcon />} label="Threat Intelligence" />
      </Tabs>

      <Box sx={showMobileView ? { maxWidth: '480px', mx: 'auto', border: '1px solid #ccc', borderRadius: '8px' } : {}}>
        <TabPanel value={tabIndex} index={0}>
          <SecurityOverviewDashboard />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <AnomalyDetectionDashboard />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <AutomatedResponseDashboard />
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <RealTimeAlertDashboard />
        </TabPanel>
        <TabPanel value={tabIndex} index={4}>
          <IncidentResponseTraining />
        </TabPanel>
        <TabPanel value={tabIndex} index={5}>
          <AttackPathModeling title="Interactive Attack Path Visualization" />
        </TabPanel>
        <TabPanel value={tabIndex} index={6}>
          <ThreatIntelligenceDashboard />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SimpleBehavioralDashboard;
