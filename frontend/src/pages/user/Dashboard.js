import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock API call for dashboard data
const fetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: {
          activeAlerts: 12,
          resolvedAlerts: 28,
          totalLogs: 5873,
          activeSystems: 42
        },
        recentAlerts: [
          {
            id: 'a1',
            severity: 'high',
            source: 'OSSIM',
            message: 'Potential brute force attack detected',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: 'a2',
            severity: 'medium',
            source: 'Snort',
            message: 'Suspicious outbound connection',
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            id: 'a3',
            severity: 'low',
            source: 'Nagios',
            message: 'Disk space warning on server db-01',
            timestamp: new Date(Date.now() - 10800000)
          }
        ],
        systemStatus: [
          { name: 'Web Server', status: 'healthy', uptime: '99.9%' },
          { name: 'Database Server', status: 'healthy', uptime: '99.7%' },
          { name: 'Application Server', status: 'warning', uptime: '98.2%' },
          { name: 'Load Balancer', status: 'healthy', uptime: '99.9%' }
        ],
        networkTraffic: [
          { timestamp: '00:00', inbound: 42, outbound: 35 },
          { timestamp: '04:00', inbound: 58, outbound: 48 },
          { timestamp: '08:00', inbound: 64, outbound: 52 },
          { timestamp: '12:00', inbound: 72, outbound: 63 },
          { timestamp: '16:00', inbound: 81, outbound: 71 },
          { timestamp: '20:00', inbound: 76, outbound: 64 },
          { timestamp: '24:00', inbound: 68, outbound: 58 }
        ],
        alertsByType: [
          { name: 'Intrusion', value: 32 },
          { name: 'System', value: 18 },
          { name: 'Network', value: 27 },
          { name: 'Authentication', value: 23 }
        ],
        threatMap: {
          totalThreats: 87,
          topCountries: [
            { country: 'United States', count: 28 },
            { country: 'China', count: 18 },
            { country: 'Russia', count: 15 },
            { country: 'Brazil', count: 9 },
            { country: 'India', count: 7 }
          ]
        }
      });
    }, 1000);
  });
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Chart colors
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed'];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={loadDashboardData}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary">Active Alerts</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: 'error.main' }}>
              {dashboardData.summary.activeAlerts}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {dashboardData.summary.activeAlerts > 10 ? 'Requires attention' : 'Normal level'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary">Resolved Alerts</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: 'success.main' }}>
              {dashboardData.summary.resolvedAlerts}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Last 24 hours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary">Total Logs</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {dashboardData.summary.totalLogs.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Last 24 hours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary">Active Systems</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: 'info.main' }}>
              {dashboardData.summary.activeSystems}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All systems operational
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Network Traffic Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Network Traffic</Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dashboardData.networkTraffic}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="outbound" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Alerts by Type */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Alerts by Type</Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.alertsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.alertsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Recent Alerts */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title="Recent Alerts" 
              action={
                <Button size="small" color="primary">View All</Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {dashboardData.recentAlerts.map((alert) => (
                <ListItem 
                  key={alert.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="more">
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {alert.severity === 'high' && <ErrorIcon color="error" />}
                    {alert.severity === 'medium' && <WarningIcon color="warning" />}
                    {alert.severity === 'low' && <InfoIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {alert.source}
                        </Typography>
                        {` — ${new Date(alert.timestamp).toLocaleTimeString()}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* System Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title="System Status" 
              action={
                <Button size="small" color="primary">Details</Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {dashboardData.systemStatus.map((system, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {system.status === 'healthy' && <CheckCircleIcon color="success" />}
                    {system.status === 'warning' && <WarningIcon color="warning" />}
                    {system.status === 'error' && <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={system.name}
                    secondary={`Uptime: ${system.uptime}`}
                  />
                  <Chip 
                    label={system.status} 
                    size="small"
                    color={
                      system.status === 'healthy' ? 'success' : 
                      system.status === 'warning' ? 'warning' : 'error'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Threat Map */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title="Threat Intelligence" 
              action={
                <Button size="small" color="primary">View Map</Button>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Threats: {dashboardData.threatMap.totalThreats}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Top Origin Countries
              </Typography>
              {dashboardData.threatMap.topCountries.map((country, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {country.country}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {country.count}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
