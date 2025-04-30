import React, { useState } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider,
  FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, CircularProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import axios from 'axios';

// Severity colors for consistent UI
const severityColors = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  info: '#2196f3'
};

/**
 * Mobile Alerts List Component
 * Displays and manages security alerts for mobile devices
 */
const MobileAlertsList = ({ alerts, onRefresh }) => {
  // States
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    source: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Apply filters to alerts
  const applyFilters = () => {
    let result = [...alerts];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(alert => 
        alert.title.toLowerCase().includes(query) || 
        alert.description.toLowerCase().includes(query) ||
        alert.source.toLowerCase().includes(query)
      );
    }
    
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
    setFilterDialogOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      severity: 'all',
      status: 'all',
      source: 'all'
    });
    setSearchQuery('');
    setFilteredAlerts(alerts);
    setFilterDialogOpen(false);
  };
  
  // Get sources for filter
  const getSources = () => {
    const sources = new Set();
    alerts.forEach(alert => sources.add(alert.source));
    return Array.from(sources);
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
  
  // Handle viewing alert details
  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };
  
  // Handle acknowledging an alert
  const handleAcknowledge = async (alertId) => {
    setProcessing(true);
    
    try {
      // Update the alert status via API
      await axios.post(`http://localhost:5050/api/security/alerts/${alertId}/acknowledge`);
      
      // Close the dialog and refresh data
      setDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      // Handle error (you could show a snackbar or other feedback)
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle resolving an alert
  const handleResolve = async (alertId) => {
    setProcessing(true);
    
    try {
      // Update the alert status via API
      await axios.post(`http://localhost:5050/api/security/alerts/${alertId}/resolve`);
      
      // Close the dialog and refresh data
      setDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error resolving alert:', error);
      // Handle error (you could show a snackbar or other feedback)
    } finally {
      setProcessing(false);
    }
  };
  
  // Render alert detail dialog
  const renderAlertDialog = () => {
    if (!selectedAlert) return null;
    
    return (
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedAlert.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={getSeverityIcon(selectedAlert.severity)}
              label={selectedAlert.severity.toUpperCase()}
              sx={{ 
                mr: 1,
                backgroundColor: severityColors[selectedAlert.severity],
                color: 'white'
              }}
            />
            <Chip 
              label={selectedAlert.status.toUpperCase()}
              color={
                selectedAlert.status === 'open' ? 'error' :
                selectedAlert.status === 'acknowledged' ? 'warning' : 'success'
              }
            />
          </Box>
          
          <Typography variant="body1" paragraph>{selectedAlert.description}</Typography>
          
          <Typography variant="subtitle2">Source</Typography>
          <Typography variant="body2" paragraph>{selectedAlert.source}</Typography>
          
          <Typography variant="subtitle2">Detected At</Typography>
          <Typography variant="body2" paragraph>{formatTimestamp(selectedAlert.timestamp)}</Typography>
          
          {selectedAlert.acknowledgedAt && (
            <>
              <Typography variant="subtitle2">Acknowledged At</Typography>
              <Typography variant="body2" paragraph>{formatTimestamp(selectedAlert.acknowledgedAt)}</Typography>
            </>
          )}
          
          {selectedAlert.resolvedAt && (
            <>
              <Typography variant="subtitle2">Resolved At</Typography>
              <Typography variant="body2" paragraph>{formatTimestamp(selectedAlert.resolvedAt)}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          
          {selectedAlert.status === 'open' && (
            <Button 
              onClick={() => handleAcknowledge(selectedAlert.id)} 
              color="primary"
              disabled={processing}
            >
              {processing ? <CircularProgress size={24} /> : 'Acknowledge'}
            </Button>
          )}
          
          {(selectedAlert.status === 'open' || selectedAlert.status === 'acknowledged') && (
            <Button 
              onClick={() => handleResolve(selectedAlert.id)} 
              color="secondary"
              disabled={processing}
            >
              {processing ? <CircularProgress size={24} /> : 'Resolve'}
            </Button>
          )}
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
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filter Alerts</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="severity-filter-label">Severity</InputLabel>
              <Select
                labelId="severity-filter-label"
                value={filters.severity}
                label="Severity"
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="source-filter-label">Source</InputLabel>
              <Select
                labelId="source-filter-label"
                value={filters.source}
                label="Source"
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value="all">All Sources</MenuItem>
                {getSources().map((source) => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={applyFilters} color="primary">Apply</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Box>
      {/* Header with search and filter */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          p: 1,
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        <NotificationsActiveIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Security Alerts
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {filteredAlerts.length} alerts
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setFilterDialogOpen(true)}
          color={
            filters.severity !== 'all' || 
            filters.status !== 'all' || 
            filters.source !== 'all' ? 
            'primary' : 'default'
          }
        >
          <FilterListIcon />
        </IconButton>
      </Box>
      
      {/* Search box */}
      <TextField
        fullWidth
        placeholder="Search alerts..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          // Update filters with small delay for better UX
          setTimeout(() => applyFilters(), 300);
        }}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* Alerts list */}
      {filteredAlerts.length > 0 ? (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {filteredAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <ListItem 
                button 
                onClick={() => handleViewAlert(alert)}
                sx={{
                  backgroundColor: alert.status === 'open' && 
                    (alert.severity === 'critical' || alert.severity === 'high') 
                    ? 'rgba(244, 67, 54, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {getSeverityIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText 
                  primary={alert.title}
                  secondary={
                    <>
                      <Typography variant="caption" component="span">
                        {alert.source} • {formatTimestamp(alert.timestamp)}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                />
                <Chip 
                  label={alert.status.toUpperCase()} 
                  size="small" 
                  color={
                    alert.status === 'open' ? 'error' :
                    alert.status === 'acknowledged' ? 'warning' : 'success'
                  }
                />
              </ListItem>
              {index < filteredAlerts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No alerts match your criteria
          </Typography>
        </Box>
      )}
      
      {/* Render dialogs */}
      {renderAlertDialog()}
      {renderFilterDialog()}
    </Box>
  );
};

export default MobileAlertsList;
