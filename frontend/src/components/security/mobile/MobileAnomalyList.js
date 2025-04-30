import React, { useState } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider,
  FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, LinearProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

/**
 * Mobile Anomaly List Component
 * Displays machine learning-detected anomalies for mobile devices
 */
const MobileAnomalyList = ({ anomalies, onRefresh }) => {
  // States
  const [filteredAnomalies, setFilteredAnomalies] = useState(anomalies);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    category: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Apply filters to anomalies
  const applyFilters = () => {
    let result = [...anomalies];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(anomaly => 
        anomaly.title.toLowerCase().includes(query) || 
        anomaly.description.toLowerCase().includes(query) ||
        anomaly.entity.toLowerCase().includes(query)
      );
    }
    
    // Apply severity filter
    if (filters.severity !== 'all') {
      let minSeverity = 0;
      switch (filters.severity) {
        case 'critical': minSeverity = 0.9; break;
        case 'high': minSeverity = 0.7; break;
        case 'medium': minSeverity = 0.5; break;
        case 'low': minSeverity = 0.3; break;
        default: minSeverity = 0;
      }
      result = result.filter(anomaly => anomaly.severity >= minSeverity);
    }
    
    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(anomaly => anomaly.category === filters.category);
    }
    
    setFilteredAnomalies(result);
    setFilterDialogOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      severity: 'all',
      category: 'all'
    });
    setSearchQuery('');
    setFilteredAnomalies(anomalies);
    setFilterDialogOpen(false);
  };
  
  // Get unique categories for filter
  const getCategories = () => {
    const categories = new Set();
    anomalies.forEach(anomaly => categories.add(anomaly.category));
    return Array.from(categories);
  };
  
  // Format category name for display
  const formatCategory = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
  
  // Get severity label based on score
  const getSeverityLabel = (severity) => {
    if (severity >= 0.9) return 'CRITICAL';
    if (severity >= 0.7) return 'HIGH';
    if (severity >= 0.5) return 'MEDIUM';
    if (severity >= 0.3) return 'LOW';
    return 'INFO';
  };
  
  // Get severity color based on score
  const getSeverityColor = (severity) => {
    if (severity >= 0.9) return '#d32f2f';
    if (severity >= 0.7) return '#f44336';
    if (severity >= 0.5) return '#ff9800';
    if (severity >= 0.3) return '#4caf50';
    return '#2196f3';
  };
  
  // Get severity icon based on score
  const getSeverityIcon = (severity) => {
    if (severity >= 0.7) {
      return <ErrorIcon style={{ color: getSeverityColor(severity) }} />;
    }
    return <WarningIcon style={{ color: getSeverityColor(severity) }} />;
  };
  
  // Handle viewing anomaly details
  const handleViewAnomaly = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setDialogOpen(true);
  };
  
  // Render anomaly detail dialog
  const renderAnomalyDialog = () => {
    if (!selectedAnomaly) return null;
    
    return (
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedAnomaly.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={getSeverityIcon(selectedAnomaly.severity)}
              label={getSeverityLabel(selectedAnomaly.severity)}
              sx={{ 
                mr: 1,
                backgroundColor: getSeverityColor(selectedAnomaly.severity),
                color: 'white'
              }}
            />
            <Chip 
              label={formatCategory(selectedAnomaly.category)}
              color="primary"
            />
          </Box>
          
          <Typography variant="body1" paragraph>{selectedAnomaly.description}</Typography>
          
          <Typography variant="subtitle2">Entity</Typography>
          <Typography variant="body2" paragraph>{selectedAnomaly.entity}</Typography>
          
          <Typography variant="subtitle2">Detected At</Typography>
          <Typography variant="body2" paragraph>{formatTimestamp(selectedAnomaly.timestamp)}</Typography>
          
          <Typography variant="subtitle2">Confidence Score</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={selectedAnomaly.severity * 100} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getSeverityColor(selectedAnomaly.severity)
                  }
                }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(selectedAnomaly.severity * 100)}%`}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button color="primary">Investigate</Button>
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
        <DialogTitle>Filter Anomalies</DialogTitle>
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
                <MenuItem value="critical">Critical (90%+)</MenuItem>
                <MenuItem value="high">High (70%+)</MenuItem>
                <MenuItem value="medium">Medium (50%+)</MenuItem>
                <MenuItem value="low">Low (30%+)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {getCategories().map((category) => (
                  <MenuItem key={category} value={category}>{formatCategory(category)}</MenuItem>
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
        <BugReportIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Detected Anomalies
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {filteredAnomalies.length} anomalies
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setFilterDialogOpen(true)}
          color={
            filters.severity !== 'all' || 
            filters.category !== 'all' ? 
            'primary' : 'default'
          }
        >
          <FilterListIcon />
        </IconButton>
      </Box>
      
      {/* Search box */}
      <TextField
        fullWidth
        placeholder="Search anomalies..."
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
      
      {/* Anomalies list */}
      {filteredAnomalies.length > 0 ? (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {filteredAnomalies.map((anomaly, index) => (
            <React.Fragment key={anomaly.id}>
              <ListItem 
                button 
                onClick={() => handleViewAnomaly(anomaly)}
                sx={{
                  backgroundColor: anomaly.severity >= 0.9 
                    ? 'rgba(244, 67, 54, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {getSeverityIcon(anomaly.severity)}
                </ListItemIcon>
                <ListItemText 
                  primary={anomaly.title}
                  secondary={
                    <>
                      <Typography variant="caption" component="span">
                        {formatCategory(anomaly.category)} • {formatTimestamp(anomaly.timestamp)}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                />
                <Chip 
                  label={`${Math.round(anomaly.severity * 100)}%`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getSeverityColor(anomaly.severity),
                    color: 'white'
                  }}
                />
              </ListItem>
              {index < filteredAnomalies.length - 1 && <Divider component="li" />}
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
            No anomalies match your criteria
          </Typography>
        </Box>
      )}
      
      {/* Render dialogs */}
      {renderAnomalyDialog()}
      {renderFilterDialog()}
    </Box>
  );
};

export default MobileAnomalyList;
