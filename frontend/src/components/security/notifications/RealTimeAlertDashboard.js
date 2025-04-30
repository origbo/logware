import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, Paper, Typography, Box, Chip, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'recharts';

// Alert severity colors
const severityColors = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  info: '#2196f3'
};

// Alert severity icons
const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return <ErrorIcon style={{ color: severityColors[severity] }} />;
    case 'medium':
      return <WarningIcon style={{ color: severityColors[severity] }} />;
    case 'low':
      return <CheckIcon style={{ color: severityColors[severity] }} />;
    case 'info':
    default:
      return <InfoIcon style={{ color: severityColors[severity] }} />;
  }
};

const RealTimeAlertDashboard = () => {
  // States
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    source: 'all'
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [updateTimer, setUpdateTimer] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default

  // Fetch alerts from the API
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5050/api/security/alerts');
      setAlerts(response.data);
      
      // Extract unique sources for filtering
      const uniqueSources = [...new Set(response.data.map(alert => alert.source))];
      setSources(uniqueSources);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to alerts
  useEffect(() => {
    let result = [...alerts];
    
    // Apply severity filter
    if (filters.severity !== 'all') {
      result = result.filter(alert => alert.severity === filters.severity);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(alert => alert.status === filters.status);
    }
    
    // Apply source filter
    if (filters.source !== 'all') {
      result = result.filter(alert => alert.source === filters.source);
    }
    
    setFilteredAlerts(result);
  }, [alerts, filters]);

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    fetchAlerts();
    
    // Setup auto-refresh timer
    if (autoRefresh) {
      const timer = setInterval(() => {
        fetchAlerts();
      }, refreshInterval);
      
      setUpdateTimer(timer);
      
      // Clear timer on unmount
      return () => clearInterval(timer);
    } else if (updateTimer) {
      clearInterval(updateTimer);
    }
  }, [fetchAlerts, autoRefresh, refreshInterval]);

  // Handle alert selection
  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAlert(null);
  };

  // Handle alert acknowledgement
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
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      setError('Failed to acknowledge alert. Please try again later.');
    }
  };

  // Handle alert resolution
  const handleResolveAlert = async (alertId) => {
    try {
      await axios.post(`http://localhost:5050/api/security/alerts/${alertId}/resolve`);
      
      // Update local state
      setAlerts(alerts.map(alert => {
        if (alert.id === alertId) {
          return { ...alert, status: 'resolved', resolvedAt: new Date() };
        }
        return alert;
      }));
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert. Please try again later.');
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Render alert detail dialog
  const renderAlertDetailDialog = () => {
    if (!selectedAlert) return null;
    
    return (
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              {getSeverityIcon(selectedAlert.severity)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {selectedAlert.title}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                {selectedAlert.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Source</Typography>
              <Typography variant="body2">{selectedAlert.source}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Severity</Typography>
              <Chip 
                label={selectedAlert.severity.toUpperCase()} 
                style={{ 
                  backgroundColor: severityColors[selectedAlert.severity],
                  color: 'white'
                }} 
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Chip 
                label={selectedAlert.status.toUpperCase()} 
                color={
                  selectedAlert.status === 'open' ? 'error' : 
                  selectedAlert.status === 'acknowledged' ? 'warning' : 'success'
                } 
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Timestamp</Typography>
              <Typography variant="body2">{formatTimestamp(selectedAlert.timestamp)}</Typography>
            </Grid>
            
            {selectedAlert.acknowledgedAt && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Acknowledged At</Typography>
                <Typography variant="body2">{formatTimestamp(selectedAlert.acknowledgedAt)}</Typography>
              </Grid>
            )}
            
            {selectedAlert.resolvedAt && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Resolved At</Typography>
                <Typography variant="body2">{formatTimestamp(selectedAlert.resolvedAt)}</Typography>
              </Grid>
            )}
            
            {selectedAlert.tags && selectedAlert.tags.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Tags</Typography>
                <Box mt={1}>
                  {selectedAlert.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            
            {selectedAlert.relatedEntities && selectedAlert.relatedEntities.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Related Entities</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAlert.relatedEntities.map((entity, index) => (
                        <TableRow key={index}>
                          <TableCell>{entity.type}</TableCell>
                          <TableCell>{entity.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            
            {/* Additional details specific to the alert type */}
            {selectedAlert.additionalDetails && Object.keys(selectedAlert.additionalDetails).length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Additional Details</Typography>
                <Box mt={1} component={Paper} variant="outlined" sx={{ p: 2 }}>
                  {Object.entries(selectedAlert.additionalDetails).map(([key, value]) => (
                    <Box key={key} mb={1}>
                      <Typography variant="caption" color="textSecondary">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                      <Typography variant="body2">
                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedAlert.status === 'open' && (
            <Button 
              onClick={() => handleAcknowledgeAlert(selectedAlert.id)} 
              color="primary"
            >
              Acknowledge
            </Button>
          )}
          {(selectedAlert.status === 'open' || selectedAlert.status === 'acknowledged') && (
            <Button 
              onClick={() => handleResolveAlert(selectedAlert.id)} 
              color="secondary"
            >
              Resolve
            </Button>
          )}
          <Button onClick={handleCloseDialog} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render filter dialog
  const renderFilterDialog = () => {
    return (
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Filter Alerts</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="severity-filter-label">Severity</InputLabel>
                <Select
                  labelId="severity-filter-label"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="acknowledged">Acknowledged</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="source-filter-label">Source</InputLabel>
                <Select
                  labelId="source-filter-label"
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  label="Source"
                >
                  <MenuItem value="all">All Sources</MenuItem>
                  {sources.map((source, index) => (
                    <MenuItem key={index} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setFilters({
                severity: 'all',
                status: 'all',
                source: 'all'
              });
            }} 
            color="inherit"
          >
            Reset
          </Button>
          <Button 
            onClick={() => setFilterDialogOpen(false)} 
            color="primary"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Count alerts by severity
  const countBySeverity = {
    critical: alerts.filter(alert => alert.severity === 'critical').length,
    high: alerts.filter(alert => alert.severity === 'high').length,
    medium: alerts.filter(alert => alert.severity === 'medium').length,
    low: alerts.filter(alert => alert.severity === 'low').length,
    info: alerts.filter(alert => alert.severity === 'info').length
  };

  // Count alerts by status
  const countByStatus = {
    open: alerts.filter(alert => alert.status === 'open').length,
    acknowledged: alerts.filter(alert => alert.status === 'acknowledged').length,
    resolved: alerts.filter(alert => alert.status === 'resolved').length
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Real-Time Security Alerts
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          
          <Button
            variant="outlined"
            color={autoRefresh ? 'success' : 'inherit'}
            startIcon={<RefreshIcon />}
            onClick={toggleAutoRefresh}
            sx={{ mr: 1 }}
          >
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchAlerts}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Alert summary cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" component="div">
              Critical & High
            </Typography>
            <Typography variant="h3" component="div">
              {countBySeverity.critical + countBySeverity.high}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={`Critical: ${countBySeverity.critical}`} 
                size="small" 
                sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Chip 
                label={`High: ${countBySeverity.high}`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" component="div">
              Medium
            </Typography>
            <Typography variant="h3" component="div">
              {countBySeverity.medium}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" component="div">
              Low & Info
            </Typography>
            <Typography variant="h3" component="div">
              {countBySeverity.low + countBySeverity.info}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={`Low: ${countBySeverity.low}`} 
                size="small" 
                sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Chip 
                label={`Info: ${countBySeverity.info}`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #2196f3 30%, #03a9f4 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" component="div">
              Open Alerts
            </Typography>
            <Typography variant="h3" component="div">
              {countByStatus.open}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={`Acknowledged: ${countByStatus.acknowledged}`} 
                size="small" 
                sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Chip 
                label={`Resolved: ${countByStatus.resolved}`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Alert table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Severity</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading alerts...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No alerts match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow 
                    key={alert.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      // Highlight unresolved critical and high alerts
                      ...(alert.status === 'open' && 
                        (alert.severity === 'critical' || alert.severity === 'high') && {
                          backgroundColor: 'rgba(244, 67, 54, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.12)',
                          },
                        }),
                    }}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getSeverityIcon(alert.severity)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {alert.severity.toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.status.toUpperCase()} 
                        color={
                          alert.status === 'open' ? 'error' : 
                          alert.status === 'acknowledged' ? 'warning' : 'success'
                        } 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertClick(alert);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Alert detail dialog */}
      {renderAlertDetailDialog()}
      
      {/* Filter dialog */}
      {renderFilterDialog()}
    </Box>
  );
};

export default RealTimeAlertDashboard;
