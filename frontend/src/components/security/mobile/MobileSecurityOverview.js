import React from 'react';
import { 
  Box, Typography, Paper, Card, CardContent, 
  Button, Divider, List, ListItem, ListItemText, 
  ListItemIcon, Chip, CircularProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

/**
 * Mobile Security Overview Component
 * Shows a summary of security metrics for mobile devices
 */
const MobileSecurityOverview = ({ metrics, alerts, anomalies, onViewAllAlerts, onViewAllAnomalies }) => {
  // Color mappings for severity
  const severityColors = {
    critical: '#d32f2f',
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50',
    info: '#2196f3'
  };
  
  // Get severity icon based on severity level
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon style={{ color: severityColors[severity] }} />;
      case 'medium':
        return <WarningIcon style={{ color: severityColors[severity] }} />;
      case 'low':
        return <CheckCircleIcon style={{ color: severityColors[severity] }} />;
      case 'info':
      default:
        return <InfoIcon style={{ color: severityColors[severity] }} />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <Box>
      {/* Security Score Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Security Score</Typography>
          
          <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
            <CircularProgress
              variant="determinate"
              value={metrics.securityScore}
              size={120}
              thickness={10}
              sx={{
                color: metrics.securityScore > 70 ? severityColors.low :
                       metrics.securityScore > 40 ? severityColors.medium :
                       severityColors.high,
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
              <Typography variant="h4" component="div">
                {Math.round(metrics.securityScore)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" color="textSecondary">
            {metrics.lastUpdated ? `Last updated: ${formatTimestamp(metrics.lastUpdated)}` : 'Not updated yet'}
          </Typography>
        </CardContent>
      </Card>
      
      {/* Alert Summary */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}>
          <Typography variant="h6">Recent Alerts</Typography>
          <Button 
            endIcon={<ArrowForwardIcon />} 
            onClick={onViewAllAlerts}
            size="small"
          >
            View All
          </Button>
        </Box>
        
        <Paper variant="outlined" sx={{ borderRadius: 1 }}>
          {alerts && alerts.length > 0 ? (
            <List disablePadding>
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getSeverityIcon(alert.severity)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={alert.title} 
                      secondary={formatTimestamp(alert.timestamp)} 
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        fontWeight: 'medium',
                        noWrap: true 
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption'
                      }}
                    />
                    <Chip 
                      label={alert.severity.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        backgroundColor: severityColors[alert.severity],
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No recent alerts
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Anomaly Summary */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}>
          <Typography variant="h6">Recent Anomalies</Typography>
          <Button 
            endIcon={<ArrowForwardIcon />} 
            onClick={onViewAllAnomalies}
            size="small"
          >
            View All
          </Button>
        </Box>
        
        <Paper variant="outlined" sx={{ borderRadius: 1 }}>
          {anomalies && anomalies.length > 0 ? (
            <List disablePadding>
              {anomalies.map((anomaly, index) => (
                <React.Fragment key={anomaly.id}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {anomaly.severity > 0.8 ? (
                        <ErrorIcon style={{ color: severityColors.high }} />
                      ) : anomaly.severity > 0.5 ? (
                        <WarningIcon style={{ color: severityColors.medium }} />
                      ) : (
                        <InfoIcon style={{ color: severityColors.info }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={anomaly.title} 
                      secondary={formatTimestamp(anomaly.timestamp)} 
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        fontWeight: 'medium',
                        noWrap: true 
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption'
                      }}
                    />
                    <Chip 
                      label={`${Math.round(anomaly.severity * 100)}%`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: anomaly.severity > 0.8 ? severityColors.high :
                                         anomaly.severity > 0.5 ? severityColors.medium :
                                         severityColors.info,
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </ListItem>
                  {index < anomalies.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No recent anomalies
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Summary Stats */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          mt: 3
        }}
      >
        <Paper 
          sx={{ 
            p: 1.5, 
            width: '31%', 
            textAlign: 'center',
            bgcolor: severityColors.critical,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" fontWeight="bold">{metrics.criticalAlerts}</Typography>
          <Typography variant="caption">Critical</Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 1.5, 
            width: '31%', 
            textAlign: 'center',
            bgcolor: severityColors.high,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" fontWeight="bold">{metrics.highAlerts}</Typography>
          <Typography variant="caption">High</Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 1.5, 
            width: '31%', 
            textAlign: 'center',
            bgcolor: severityColors.medium,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" fontWeight="bold">{metrics.mediumAlerts}</Typography>
          <Typography variant="caption">Medium</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default MobileSecurityOverview;
