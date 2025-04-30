import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, CircularProgress, 
  Card, CardContent, CardHeader, Divider, 
  Tabs, Tab, IconButton, Tooltip, Alert, Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  AccountCircle as UserIcon,
  AccessTime as TimeIcon,
  Public as LocationIcon,
  Storage as ResourceIcon
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

// Import visualization components
import UserActivityHeatmap from './visualizations/UserActivityHeatmap';
import UserRiskScoreChart from './visualizations/UserRiskScoreChart';
import LocationActivityMap from './visualizations/LocationActivityMap';
import ResourceAccessChart from './visualizations/ResourceAccessChart';
import BehavioralTimelineChart from './visualizations/BehavioralTimelineChart';
import AnomalyList from './AnomalyList';

const BehavioralDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    userRiskScores: [],
    userBaselines: [],
    recentAnomalies: [],
    timeBasedActivity: {},
    locationActivity: {},
    resourceAccess: {},
    behavioralTimeline: []
  });
  
  // Configure axios for the mock server
  const apiBaseUrl = 'http://localhost:5000';
  
  // Fetch data for the dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create axios instance with the correct base URL
      const api = axios.create({
        baseURL: apiBaseUrl,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch user risk scores
      const riskScoresResponse = await api.get('/api/mock-data/security-analytics/user-risk');
      console.log('Risk scores data:', riskScoresResponse.data);
      
      // Fetch behavioral baselines
      const baselinesResponse = await api.get('/api/mock-data/security-analytics/behavioral/baselines');
      console.log('Baselines data:', baselinesResponse.data);
      
      // Fetch recent anomalies
      const anomaliesResponse = await api.get('/api/mock-data/security-analytics/events', {
        params: {
          status: 'suspicious,threat',
          anomalyScore: 70,
          limit: 10,
          sort: '-timestamp'
        }
      });
      console.log('Anomalies data:', anomaliesResponse.data);
      
      // Fetch analytics summary for dashboard
      const summaryResponse = await api.get('/api/mock-data/security-analytics/dashboard');
      console.log('Summary data:', summaryResponse.data);
      
      // Process time-based activity
      const timeBasedActivity = processTimeBasedActivity(
        baselinesResponse.data.baselines,
        summaryResponse.data.summary.timeline
      );
      
      // Process location activity
      const locationActivity = processLocationActivity(
        anomaliesResponse.data.events,
        baselinesResponse.data.baselines
      );
      
      // Process resource access patterns
      const resourceAccess = processResourceAccess(
        anomaliesResponse.data.events,
        baselinesResponse.data.baselines
      );
      
      // Process behavioral timeline
      const behavioralTimeline = processBehavioralTimeline(
        anomaliesResponse.data.events
      );
      
      setDashboardData({
        userRiskScores: riskScoresResponse.data.userRiskScores || [],
        userBaselines: baselinesResponse.data.baselines || [],
        recentAnomalies: anomaliesResponse.data.events || [],
        timeBasedActivity,
        locationActivity,
        resourceAccess,
        behavioralTimeline,
        summary: summaryResponse.data.summary
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response ? 
        `Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}` : 
        'Network error: Cannot connect to the backend server. Please check if the server is running.';
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  // Process time-based activity for visualization
  const processTimeBasedActivity = (baselines, timeline) => {
    // Create a 24-hour activity heatmap data structure
    const userHourlyActivity = {};
    
    // Process baseline data for each user
    baselines.forEach(user => {
      userHourlyActivity[user.userId] = {
        username: user.username,
        hourlyActivity: user.hourlyActivity || new Array(24).fill(0),
        activeHours: user.activeHours || []
      };
    });
    
    // Create aggregated hourly activity for all users
    const aggregatedHourly = new Array(24).fill(0);
    baselines.forEach(user => {
      if (user.hourlyActivity) {
        user.hourlyActivity.forEach((count, hour) => {
          aggregatedHourly[hour] += count;
        });
      }
    });
    
    // Process recent activity from timeline
    const recentActivity = timeline ? timeline.map(item => ({
      hour: parseInt(item.hour),
      total: item.total,
      anomalies: item.anomalies,
      timestamp: item.timestamp
    })) : [];
    
    return {
      userHourlyActivity,
      aggregatedHourly,
      recentActivity
    };
  };
  
  // Process location data for visualization
  const processLocationActivity = (events, baselines) => {
    // Create map of locations and their activity counts
    const locationCounts = {};
    const knownLocations = new Set();
    const suspiciousLocations = new Set();
    
    // Process baseline data to determine "known" locations
    baselines.forEach(user => {
      if (user.uniqueLocations) {
        user.uniqueLocations.forEach(location => {
          knownLocations.add(location);
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        });
      }
    });
    
    // Process recent events to find suspicious locations
    events.forEach(event => {
      if (event.geo && event.geo.country) {
        const location = event.geo.country;
        
        if (!knownLocations.has(location)) {
          suspiciousLocations.add(location);
        }
        
        // Count events by location
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });
    
    const locationData = Object.entries(locationCounts).map(([location, count]) => ({
      location,
      count,
      isSuspicious: suspiciousLocations.has(location)
    }));
    
    return {
      locationData,
      knownLocations: Array.from(knownLocations),
      suspiciousLocations: Array.from(suspiciousLocations)
    };
  };
  
  // Process resource access data for visualization
  const processResourceAccess = (events, baselines) => {
    const resourceCounts = {};
    const userResources = {};
    const suspiciousAccesses = [];
    
    // Process baseline data to determine "normal" resource access
    baselines.forEach(user => {
      if (!userResources[user.userId]) {
        userResources[user.userId] = new Set();
      }
      
      if (user.eventTypes) {
        user.eventTypes.forEach(type => {
          const resourceId = `${type}`;
          userResources[user.userId].add(resourceId);
          resourceCounts[resourceId] = (resourceCounts[resourceId] || 0) + 1;
        });
      }
    });
    
    // Process recent events to find suspicious resource accesses
    events.forEach(event => {
      if (event.resource && event.resource.id && event.user && event.user.id) {
        const resourceId = event.resource.id;
        const userId = event.user.id;
        
        resourceCounts[resourceId] = (resourceCounts[resourceId] || 0) + 1;
        
        // Check if this is an unusual access for this user
        if (userResources[userId] && !userResources[userId].has(resourceId)) {
          suspiciousAccesses.push({
            userId,
            username: event.user.name,
            resourceId,
            resourceName: event.resource.name,
            timestamp: event.timestamp,
            anomalyScore: event.analysis?.anomalyScore || 0,
            behavioralScore: event.analysis?.behavioralScore || 0
          });
        }
      }
    });
    
    // Convert to array for visualization
    const resourceData = Object.entries(resourceCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      resourceData,
      userResources: Object.fromEntries(
        Object.entries(userResources).map(([userId, resources]) => [userId, Array.from(resources)])
      ),
      suspiciousAccesses
    };
  };
  
  // Process behavioral timeline
  const processBehavioralTimeline = (events) => {
    // Group events by user
    const userEvents = {};
    
    events.forEach(event => {
      if (event.user && event.user.id) {
        const userId = event.user.id;
        if (!userEvents[userId]) {
          userEvents[userId] = [];
        }
        
        userEvents[userId].push({
          timestamp: new Date(event.timestamp),
          eventType: event.eventType,
          category: event.category,
          anomalyScore: event.analysis?.anomalyScore || 0,
          behavioralScore: event.analysis?.behavioralScore || 0,
          id: event._id
        });
      }
    });
    
    // Sort events for each user
    Object.keys(userEvents).forEach(userId => {
      userEvents[userId].sort((a, b) => a.timestamp - b.timestamp);
    });
    
    return userEvents;
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
    
    // Set up refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => fetchDashboardData()}
            >
              <RefreshIcon />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Behavioral Analytics Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchDashboardData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Users at Risk
              </Typography>
              <Typography variant="h3">
                {dashboardData.userRiskScores?.filter(user => user.riskScore > 50).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users with elevated risk scores
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Behavioral Anomalies
              </Typography>
              <Typography variant="h3">
                {dashboardData.recentAnomalies?.filter(e => e.analysis?.behavioralScore > 70).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In the last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Suspicious Locations
              </Typography>
              <Typography variant="h3">
                {dashboardData.locationActivity?.suspiciousLocations?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unusual geographic access points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Unusual Resource Access
              </Typography>
              <Typography variant="h3">
                {dashboardData.resourceAccess?.suspiciousAccesses?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Abnormal access patterns detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Visualization Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<UserIcon />} label="USER RISK" />
          <Tab icon={<TimeIcon />} label="TIME PATTERNS" />
          <Tab icon={<LocationIcon />} label="LOCATIONS" />
          <Tab icon={<ResourceIcon />} label="RESOURCES" />
        </Tabs>
        <Divider />
        
        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* User Risk Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <UserRiskScoreChart userRiskScores={dashboardData.userRiskScores} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader title="Highest Risk Users" />
                  <Divider />
                  <CardContent>
                    {dashboardData.userRiskScores
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 5)
                      .map((user, index) => (
                        <Box key={user.userId} sx={{ mb: 1 }}>
                          <Typography variant="subtitle1">
                            {user.username}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: `${user.riskScore}%`,
                                height: 10,
                                bgcolor: user.riskScore > 70 ? 'error.main' : 
                                         user.riskScore > 50 ? 'warning.main' : 'info.main',
                                borderRadius: 1
                              }}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {Math.round(user.riskScore)}
                            </Typography>
                          </Box>
                          {index < 4 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <BehavioralTimelineChart 
                  timelineData={dashboardData.behavioralTimeline}
                  title="User Behavioral Timeline"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Time Patterns Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <UserActivityHeatmap 
                  data={dashboardData.timeBasedActivity}
                  title="User Activity Patterns by Hour"
                />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Activity Anomalies" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      {Object.entries(dashboardData.timeBasedActivity.userHourlyActivity || {})
                        .slice(0, 4)
                        .map(([userId, userData]) => (
                          <Grid item xs={12} md={6} key={userId}>
                            <Typography variant="subtitle1">
                              {userData.username}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              {Array.from({ length: 24 }).map((_, hour) => {
                                const isActive = userData.activeHours.includes(hour);
                                const activity = userData.hourlyActivity[hour] || 0;
                                const opacity = Math.min(activity / 20, 1) * 0.8 + 0.2;
                                
                                return (
                                  <Tooltip 
                                    key={hour}
                                    title={`${hour}:00 - ${activity} events${isActive ? ' (active hour)' : ''}`}
                                  >
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 24,
                                        bgcolor: isActive ? 'primary.main' : 'text.disabled',
                                        opacity,
                                        borderRadius: 1,
                                        mx: 0.2
                                      }}
                                    />
                                  </Tooltip>
                                );
                              })}
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Locations Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <LocationActivityMap 
                  locationData={dashboardData.locationActivity.locationData}
                  title="Geographic Access Patterns"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Known Locations" />
                  <Divider />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dashboardData.locationActivity.knownLocations?.map(location => (
                        <span 
                          key={location}
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            margin: '2px',
                            borderRadius: '16px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        >
                          {location}
                        </span>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Suspicious Locations" 
                    sx={{ color: 'error.main' }}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dashboardData.locationActivity.suspiciousLocations?.map(location => (
                        <span 
                          key={location}
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            margin: '2px',
                            borderRadius: '16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        >
                          {location}
                        </span>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Resources Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ResourceAccessChart 
                  resourceData={dashboardData.resourceAccess.resourceData}
                  title="Resource Access Patterns"
                />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Suspicious Resource Access" />
                  <Divider />
                  <CardContent>
                    {dashboardData.resourceAccess.suspiciousAccesses?.length > 0 ? (
                      <Box>
                        {dashboardData.resourceAccess.suspiciousAccesses
                          .slice(0, 5)
                          .map((access, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">
                                  {access.username}
                                </Typography>
                                <Typography variant="body2">
                                  {moment(access.timestamp).format('YYYY-MM-DD HH:mm')}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="error">
                                Accessed {access.resourceName} (unusual for this user)
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="caption">
                                  Anomaly Score: {access.anomalyScore}
                                </Typography>
                                <Typography variant="caption">
                                  Behavioral Score: {access.behavioralScore}
                                </Typography>
                              </Box>
                              {index < 4 && <Divider sx={{ my: 1 }} />}
                            </Box>
                          ))}
                      </Box>
                    ) : (
                      <Typography variant="body1">
                        No suspicious resource access detected
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Recent Anomalies */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Behavioral Anomalies
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <AnomalyList anomalies={dashboardData.recentAnomalies} />
      </Paper>
    </Box>
  );
};

export default BehavioralDashboard;
