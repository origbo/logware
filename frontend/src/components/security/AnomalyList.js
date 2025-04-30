import React from 'react';
import {
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Typography, Paper, Box, Chip, IconButton, Divider, Tooltip,
  LinearProgress, Grid, Badge
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const AnomalyList = ({ anomalies }) => {
  const navigate = useNavigate();

  const handleViewAnomaly = (eventId) => {
    navigate(`/admin/security/events/${eventId}`);
  };

  // Get severity icon and color based on anomaly score
  const getSeverityInfo = (score) => {
    if (score >= 90) {
      return {
        icon: <ErrorIcon color="error" />,
        color: 'error',
        label: 'Critical',
        progressColor: 'error'
      };
    } else if (score >= 75) {
      return {
        icon: <ErrorIcon color="error" />,
        color: 'error',
        label: 'High',
        progressColor: 'error'
      };
    } else if (score >= 60) {
      return {
        icon: <WarningIcon color="warning" />,
        color: 'warning',
        label: 'Medium',
        progressColor: 'warning'
      };
    } else {
      return {
        icon: <WarningIcon color="info" />,
        color: 'info',
        label: 'Low',
        progressColor: 'info'
      };
    }
  };
  
  // Get behavioral badge content
  const getBehavioralBadge = (anomaly) => {
    if (!anomaly.analysis.behavioralScore) return null;
    
    const score = anomaly.analysis.behavioralScore;
    let color = 'info';
    
    if (score >= 80) color = 'error';
    else if (score >= 60) color = 'warning';
    else if (score >= 40) color = 'info';
    else return null; // Don't show badge for low behavioral scores
    
    return (
      <Tooltip title={`Behavioral Score: ${score}`}>
        <Badge 
          badgeContent={score} 
          color={color} 
          overlap="circular"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <PsychologyIcon color="action" />
        </Badge>
      </Tooltip>
    );
  };

  if (!anomalies || anomalies.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No anomalies detected</Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {anomalies.map((anomaly, index) => {
          const severityInfo = getSeverityInfo(anomaly.analysis.anomalyScore);
          
          return (
            <React.Fragment key={anomaly._id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {severityInfo.icon}
                    {anomaly.analysis.behavioralScore && (
                      <Box mt={1}>
                        {getBehavioralBadge(anomaly)}
                      </Box>
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {anomaly.eventType || 'Unknown Event Type'}
                      </Typography>
                      <Chip 
                        label={severityInfo.label} 
                        color={severityInfo.color} 
                        size="small" 
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'block' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {moment(anomaly.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {`Source: ${anomaly.source} | Category: ${anomaly.category}`}
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={anomaly.analysis.behavioralScore ? 6 : 12}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Anomaly Score: {anomaly.analysis.anomalyScore}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={anomaly.analysis.anomalyScore} 
                            color={severityInfo.progressColor}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Grid>
                        
                        {anomaly.analysis.behavioralScore && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Behavioral Score: {anomaly.analysis.behavioralScore}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={anomaly.analysis.behavioralScore} 
                              color={anomaly.analysis.behavioralScore >= 75 ? 'error' : 
                                    anomaly.analysis.behavioralScore >= 60 ? 'warning' : 'info'}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Grid>
                        )}
                      </Grid>
                      {anomaly.analysis.reasons && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          <Box component="span" fontWeight="medium">Reason:</Box> {anomaly.analysis.reasons[0]}
                          {anomaly.analysis.reasons.length > 1 && (
                            <Tooltip title={anomaly.analysis.reasons.slice(1, 4).join('\n')}>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="primary.main" 
                                sx={{ ml: 1, cursor: 'help' }}
                              >
                                +{anomaly.analysis.reasons.length - 1} more
                              </Typography>
                            </Tooltip>
                          )}
                        </Typography>
                      )}
                      
                      {anomaly.analysis.behavioralReasons && anomaly.analysis.behavioralReasons.length > 0 && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          <Box component="span" fontWeight="medium" display="inline-flex" alignItems="center">
                            <PsychologyIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                            Behavioral factors:
                          </Box> {anomaly.analysis.behavioralReasons[0]}
                          {anomaly.analysis.behavioralReasons.length > 1 && (
                            <Tooltip title={anomaly.analysis.behavioralReasons.slice(1).join('\n')}>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="primary.main" 
                                sx={{ ml: 1, cursor: 'help' }}
                              >
                                +{anomaly.analysis.behavioralReasons.length - 1} more
                              </Typography>
                            </Tooltip>
                          )}
                        </Typography>
                      )}
                      {anomaly.host && (
                        <Typography variant="body2" color="text.secondary">
                          Host: {anomaly.host.hostname || 'Unknown'} 
                          {anomaly.user && ` | User: ${anomaly.user.name || 'Unknown'}`}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="View Details">
                    <IconButton 
                      edge="end" 
                      aria-label="view" 
                      onClick={() => handleViewAnomaly(anomaly._id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default AnomalyList;
