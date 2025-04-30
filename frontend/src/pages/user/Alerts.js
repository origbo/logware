import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Tab, Tabs, Button,
  Chip, List, ListItem, ListItemText, ListItemIcon, IconButton,
  Divider, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, MenuItem, Select,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock API call for alerts data
const fetchAlertsData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        active: [
          {
            id: 'alert-1',
            severity: 'critical',
            source: 'OSSIM',
            message: 'Potential data breach detected',
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            details: 'Multiple failed login attempts followed by successful login and unusual data access patterns'
          },
          {
            id: 'alert-2',
            severity: 'high',
            source: 'Snort',
            message: 'Malware signature detected',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            details: 'Signature match for known malware variant in network traffic'
          },
          {
            id: 'alert-3',
            severity: 'medium',
            source: 'Nagios',
            message: 'High CPU usage on application server',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            details: 'CPU usage exceeded 90% for more than 15 minutes'
          }
        ],
        acknowledged: [
          {
            id: 'alert-4',
            severity: 'high',
            source: 'Zeek',
            message: 'Suspicious outbound connection',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            acknowledgedBy: 'admin',
            acknowledgedAt: new Date(Date.now() - 82800000), // 23 hours ago
            details: 'Outbound connection to known malicious IP address'
          }
        ],
        resolved: [
          {
            id: 'alert-5',
            severity: 'medium',
            source: 'Graylog',
            message: 'Failed database backup',
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            resolvedBy: 'admin',
            resolvedAt: new Date(Date.now() - 169200000), // 1 day and 23 hours ago
            resolution: 'Disk space issue resolved, backup completed successfully',
            details: 'Scheduled database backup failed due to insufficient disk space'
          },
          {
            id: 'alert-6',
            severity: 'low',
            source: 'OSSIM',
            message: 'Unusual login time',
            timestamp: new Date(Date.now() - 259200000), // 3 days ago
            resolvedBy: 'admin',
            resolvedAt: new Date(Date.now() - 255600000), // 2 days and 23 hours ago
            resolution: 'Verified with user, authorized access during maintenance window',
            details: 'Login detected outside normal business hours'
          }
        ]
      });
    }, 1000);
  });
};

const AlertTabs = ({ value, onChange }) => {
  return (
    <Tabs value={value} onChange={onChange} aria-label="alert tabs">
      <Tab label="Active" id="tab-0" />
      <Tab label="Acknowledged" id="tab-1" />
      <Tab label="Resolved" id="tab-2" />
    </Tabs>
  );
};

const AlertList = ({ alerts, onAlertClick, emptyMessage }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  if (alerts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <List>
      {alerts.map((alert) => (
        <React.Fragment key={alert.id}>
          <ListItem 
            alignItems="flex-start" 
            button 
            onClick={() => onAlertClick(alert)}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              {getSeverityIcon(alert.severity)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" component="span">
                    {alert.message}
                  </Typography>
                  <Chip 
                    label={alert.severity} 
                    color={getSeverityColor(alert.severity)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {alert.source}
                  </Typography>
                  {` - ${alert.timestamp.toLocaleString()}`}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {alert.details}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

const AlertDetail = ({ alert, open, onClose, onAcknowledge, onResolve }) => {
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAcknowledge = () => {
    setLoading(true);
    setTimeout(() => {
      onAcknowledge(alert);
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleResolve = () => {
    setLoading(true);
    setTimeout(() => {
      onResolve(alert, resolution);
      setLoading(false);
      onClose();
    }, 1000);
  };

  if (!alert) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">Alert Details</Typography>
          <Chip 
            label={alert.severity} 
            color={getSeverityColor(alert.severity)} 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">ID</Typography>
            <Typography variant="body1" gutterBottom>{alert.id}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Source</Typography>
            <Typography variant="body1" gutterBottom>{alert.source}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
            <Typography variant="body1" gutterBottom>{alert.timestamp.toLocaleString()}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Message</Typography>
            <Typography variant="body1" gutterBottom>{alert.message}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Details</Typography>
            <Typography variant="body1" gutterBottom>{alert.details}</Typography>
          </Grid>
          
          {alert.acknowledgedBy && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2">Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt.toLocaleString()}</Typography>
              </Box>
            </Grid>
          )}
          
          {alert.resolvedBy && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2">Resolved by {alert.resolvedBy} at {alert.resolvedAt.toLocaleString()}</Typography>
                <Typography variant="body2">{alert.resolution}</Typography>
              </Box>
            </Grid>
          )}
          
          {!alert.acknowledgedBy && !alert.resolvedBy && (
            <Grid item xs={12}>
              <TextField
                label="Resolution Notes"
                multiline
                rows={4}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter notes about how this alert was resolved..."
                sx={{ mt: 2 }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!alert.acknowledgedBy && !alert.resolvedBy && (
          <>
            <Button 
              onClick={handleAcknowledge} 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Acknowledge'}
            </Button>
            <Button 
              onClick={handleResolve} 
              variant="contained" 
              color="primary"
              disabled={loading || !resolution}
            >
              {loading ? <CircularProgress size={24} /> : 'Resolve'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Alerts = () => {
  const [tabValue, setTabValue] = useState(0);
  const [alerts, setAlerts] = useState({ active: [], acknowledged: [], resolved: [] });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlertsData();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAcknowledgeAlert = (alert) => {
    // In a real app, this would make an API call
    setAlerts(prevAlerts => ({
      active: prevAlerts.active.filter(a => a.id !== alert.id),
      acknowledged: [
        {
          ...alert,
          acknowledgedBy: 'user', // Would come from authenticated user
          acknowledgedAt: new Date()
        },
        ...prevAlerts.acknowledged
      ],
      resolved: prevAlerts.resolved
    }));
  };

  const handleResolveAlert = (alert, resolution) => {
    // In a real app, this would make an API call
    const updatedAlerts = { ...alerts };
    
    // Remove from active or acknowledged list
    if (alert.acknowledgedBy) {
      updatedAlerts.acknowledged = updatedAlerts.acknowledged.filter(a => a.id !== alert.id);
    } else {
      updatedAlerts.active = updatedAlerts.active.filter(a => a.id !== alert.id);
    }
    
    // Add to resolved list
    updatedAlerts.resolved = [
      {
        ...alert,
        resolvedBy: 'user', // Would come from authenticated user
        resolvedAt: new Date(),
        resolution
      },
      ...updatedAlerts.resolved
    ];
    
    setAlerts(updatedAlerts);
  };

  const getAlertsForCurrentTab = () => {
    switch (tabValue) {
      case 0:
        return alerts.active;
      case 1:
        return alerts.acknowledged;
      case 2:
        return alerts.resolved;
      default:
        return [];
    }
  };

  const getEmptyMessage = () => {
    switch (tabValue) {
      case 0:
        return 'No active alerts';
      case 1:
        return 'No acknowledged alerts';
      case 2:
        return 'No resolved alerts';
      default:
        return 'No alerts found';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Alerts
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={loadAlerts}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <AlertTabs value={tabValue} onChange={handleTabChange} />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AlertList 
            alerts={getAlertsForCurrentTab()} 
            onAlertClick={handleAlertClick}
            emptyMessage={getEmptyMessage()}
          />
        )}
      </Paper>

      <AlertDetail 
        alert={selectedAlert}
        open={dialogOpen}
        onClose={handleDialogClose}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />
    </Box>
  );
};

export default Alerts;
