import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, 
  Tabs, Tab, Chip, Button, CircularProgress, Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import EventsTable from '../../components/security/EventsTable';
import AnomalyList from '../../components/security/AnomalyList';

const SecurityAnalyticsDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  
  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/security-analytics/dashboard');
      
      if (response.data.success) {
        setSummaryData(response.data.summary);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(`Error loading dashboard: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch security events list
  const fetchEvents = async (filters = {}) => {
    try {
      setEventsLoading(true);
      
      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/api/security-analytics/events?${params.toString()}`);
      
      if (response.data.success) {
        setEvents(response.data.events);
      } else {
        console.error('Failed to load events:', response.data.error);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchDashboardData();
    // Fetch latest events with default filters
    fetchEvents({ limit: 10, status: 'suspicious,threat' });
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Prepare data for charts
  const getStatusCounts = () => {
    if (!summaryData || !summaryData.eventsByStatus) return {};
    
    return {
      normal: summaryData.eventsByStatus.normal || 0,
      analyzing: summaryData.eventsByStatus.analyzing || 0,
      suspicious: summaryData.eventsByStatus.suspicious || 0,
      threat: summaryData.eventsByStatus.threat || 0
    };
  };
  
  const statusData = getStatusCounts();
  
  // Transform category data for pie chart
  const getCategoryChartData = () => {
    if (!summaryData || !summaryData.eventsByCategory) return [];
    
    return Object.entries(summaryData.eventsByCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };
  
  const CATEGORY_COLORS = {
    authentication: theme.palette.primary.main,
    network: theme.palette.secondary.main,
    malware: theme.palette.error.dark,
    system: theme.palette.warning.main,
    file: theme.palette.info.main,
    dns: theme.palette.success.main,
    web: theme.palette.secondary.light,
    data_access: theme.palette.error.light,
    application: theme.palette.warning.light,
    other: theme.palette.grey[500]
  };
  
  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Security Analytics</Typography>
        
        <Button 
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Status Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: theme.palette.error.main, mb: 1 }}>
                    <ErrorIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div">
                    {statusData.threat?.toLocaleString() || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Threats
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: theme.palette.warning.main, mb: 1 }}>
                    <WarningIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div">
                    {statusData.suspicious?.toLocaleString() || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Suspicious
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: theme.palette.info.main, mb: 1 }}>
                    <Info fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div">
                    {statusData.analyzing?.toLocaleString() || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Analyzing
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: theme.palette.success.main, mb: 1 }}>
                    <CheckCircleIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div">
                    {statusData.normal?.toLocaleString() || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Normal
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Security Events Timeline (24h)</Typography>
                {summaryData?.timeline ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={summaryData.timeline}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Total Events" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="anomalies" 
                        name="Anomalies" 
                        stroke={theme.palette.error.main} 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <Typography color="text.secondary">No timeline data available</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Event Categories</Typography>
                {getCategoryChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name] || theme.palette.grey[500]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <Typography color="text.secondary">No category data available</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Top Anomalies" />
              <Tab label="Recent Events" />
              <Tab label="Event Search" />
            </Tabs>
          </Box>
          
          {/* Tab Content */}
          {activeTab === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Top Anomalies (Last 24h)</Typography>
              {summaryData?.topAnomalies && summaryData.topAnomalies.length > 0 ? (
                <AnomalyList anomalies={summaryData.topAnomalies} />
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No anomalies detected in the last 24 hours
                </Typography>
              )}
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Recent Security Events</Typography>
              <EventsTable 
                events={events} 
                loading={eventsLoading} 
                onRefresh={() => fetchEvents({ limit: 10 })}
              />
            </Paper>
          )}
          
          {activeTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Event Search</Typography>
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Event search functionality will be implemented here
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default SecurityAnalyticsDashboard;
