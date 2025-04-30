import React from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Grid, Paper
} from '@mui/material';

import {
  Assessment as AssessmentIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

/**
 * ResponsePerformanceMetrics Component
 * Displays performance metrics for automated response system
 */
const ResponsePerformanceMetrics = ({ stats = {} }) => {
  // Colors for pie chart
  const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#00bcd4'];
  
  // Prepare data for action type chart
  const actionTypeData = stats.byActionType?.map(item => ({
    name: formatActionType(item.action),
    count: item.count
  })) || [];
  
  // Prepare data for rule performance chart
  const rulePerformanceData = stats.byRuleId?.map(item => ({
    name: item.ruleName.split(' ').slice(0, 2).join(' '),
    count: item.count
  })) || [];
  
  // Format action type for display
  function formatActionType(actionType) {
    return actionType?.split(/(?=[A-Z])/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown';
  }
  
  return (
    <Card>
      <CardHeader 
        title="Response Performance Metrics" 
        subheader="Effectiveness and metrics of automated responses"
        avatar={<AssessmentIcon />}
      />
      <Divider />
      <CardContent>
        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.totalResponses?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Total Responses
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <SuccessIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.successfulResponses?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Successful Actions
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.failedResponses?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Failed Actions
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <TimeIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats.avgResponseTime || '0.8'}s
              </Typography>
              <Typography color="text.secondary">
                Avg. Response Time
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={4}>
          {/* Action Type Distribution */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Actions by Type
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {actionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          {/* Rule Performance */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Actions by Rule
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rulePerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    interval={0}
                  />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" name="Actions" fill="#8884d8">
                    {rulePerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
        
        {/* Success Rate */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Success Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <Box
                sx={{
                  height: 20,
                  borderRadius: 10,
                  background: `linear-gradient(to right, #4caf50 0%, #4caf50 ${getSuccessRate(stats)}%, #f44336 ${getSuccessRate(stats)}%, #f44336 100%)`,
                }}
              />
            </Box>
            <Box minWidth={60}>
              <Typography variant="body2" color="text.secondary">
                {getSuccessRate(stats)}%
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
          Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Helper function to calculate success rate
function getSuccessRate(stats) {
  if (!stats.totalResponses || stats.totalResponses === 0) {
    return 0;
  }
  
  return Math.round((stats.successfulResponses / stats.totalResponses) * 100);
}

export default ResponsePerformanceMetrics;
