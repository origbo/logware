import React from 'react';
import { 
  Card, CardContent, CardHeader, Divider, 
  Box, Typography, Tooltip
} from '@mui/material';
import { 
  red, orange, yellow, green, grey
} from '@mui/material/colors';

/**
 * User Risk Score Chart Component
 * Visualizes risk scores for users
 */
const UserRiskScoreChart = ({ userRiskScores, title }) => {
  if (!userRiskScores || userRiskScores.length === 0) {
    return (
      <Card>
        <CardHeader title={title || 'User Risk Scores'} />
        <Divider />
        <CardContent>
          <Typography>No user risk data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Sort users by risk score
  const sortedUsers = [...userRiskScores]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10); // Only show top 10 users
    
  // Get color based on risk score
  const getRiskColor = (score) => {
    if (score >= 80) return red[700];
    if (score >= 60) return orange[700];
    if (score >= 40) return yellow[700];
    if (score >= 20) return green[700];
    return grey[400];
  };
  
  return (
    <Card>
      <CardHeader title={title || 'User Risk Scores'} />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Users ranked by risk score based on behavioral patterns and security events.
            Higher scores indicate greater security risk.
          </Typography>
        </Box>
        
        {sortedUsers.map((user, index) => {
          const riskColor = getRiskColor(user.riskScore);
          
          // Calculate counters for risk factors
          const factorCount = {
            anomalies: user.anomalyCount || 0,
            behavioral: user.behavioralAnomalyCount || 0,
            threats: user.threatCount || 0
          };
          
          // Format tooltip text
          const tooltipText = `
            Risk Score: ${Math.round(user.riskScore)}
            Anomalies: ${factorCount.anomalies}
            Behavioral Anomalies: ${factorCount.behavioral}
            Threats: ${factorCount.threats}
            Highest Anomaly Score: ${user.highestAnomaly || 0}
            Highest Behavioral Score: ${user.highestBehavioral || 0}
          `;
          
          return (
            <Box key={user.userId} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {user.username || `User ${user.userId}`}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(user.riskScore)}
                </Typography>
              </Box>
              
              <Tooltip title={tooltipText.trim()}>
                <Box sx={{ position: 'relative', width: '100%', height: 10, bgcolor: grey[200], borderRadius: 1 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${Math.min(user.riskScore, 100)}%`,
                      height: '100%',
                      bgcolor: riskColor,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Tooltip>
              
              {/* Risk factors */}
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                {factorCount.anomalies > 0 && (
                  <Typography variant="caption" fontWeight="medium" color="error.main">
                    {factorCount.anomalies} Anomalies
                  </Typography>
                )}
                
                {factorCount.behavioral > 0 && (
                  <Typography variant="caption" fontWeight="medium" color="warning.main">
                    {factorCount.behavioral} Behavioral
                  </Typography>
                )}
                
                {factorCount.threats > 0 && (
                  <Typography variant="caption" fontWeight="medium" color="error.dark">
                    {factorCount.threats} Threats
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: red[700], mr: 1 }} />
            <Typography variant="caption">High Risk (80+)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: orange[700], mr: 1 }} />
            <Typography variant="caption">Medium Risk (60-79)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: green[700], mr: 1 }} />
            <Typography variant="caption">Low Risk ({'<'} 40)</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserRiskScoreChart;
