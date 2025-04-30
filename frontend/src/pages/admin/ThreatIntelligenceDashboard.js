import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardHeader,
  Tabs, Tab, Button, Chip, Divider, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Sync as SyncIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import moment from 'moment';

// Threat Stats Cards Component
const ThreatStatsCards = ({ stats }) => {
  const theme = useTheme();
  
  const SEVERITY_COLORS = {
    critical: theme.palette.error.dark,
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main
  };
  
  // Transform severity data for pie chart
  const severityData = stats?.indicators?.bySeverity?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    color: SEVERITY_COLORS[item._id] || theme.palette.grey[500]
  })) || [];
  
  // Transform source data for bar chart
  const sourceData = stats?.indicators?.bySource?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];
  
  return (
    <Grid container spacing={3}>
      {/* Total Indicators Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Indicators
            </Typography>
            <Typography variant="h4" component="div">
              {stats?.indicators?.total?.toLocaleString() || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active: {stats?.indicators?.active?.toLocaleString() || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Active Sources Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Threat Sources
            </Typography>
            <Typography variant="h4" component="div">
              {stats?.sources?.total || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active: {stats?.sources?.active || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Indicator Types Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Top Indicator Type
            </Typography>
            <Typography variant="h4" component="div">
              {stats?.indicators?.byType?.[0]?._id || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Count: {stats?.indicators?.byType?.[0]?.count?.toLocaleString() || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Threat Categories Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Top Threat Category
            </Typography>
            <Typography variant="h4" component="div">
              {stats?.indicators?.byCategory?.[0]?._id || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Count: {stats?.indicators?.byCategory?.[0]?.count?.toLocaleString() || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Severity Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Indicators by Severity" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">No data available</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Sources Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top 10 Sources" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="count" name="Indicators" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">No data available</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Threat Indicators Table Component
const ThreatIndicatorsTable = ({ 
  indicators, 
  loading, 
  pagination, 
  onPageChange, 
  onRowsPerPageChange,
  onView,
  filters,
  onFilterChange
}) => {
  const theme = useTheme();
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return theme.palette.error.dark;
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  const handleFilterChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };
  
  const indicatorTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'ip', label: 'IP Address' },
    { value: 'domain', label: 'Domain' },
    { value: 'url', label: 'URL' },
    { value: 'file_hash_md5', label: 'MD5 Hash' },
    { value: 'file_hash_sha1', label: 'SHA1 Hash' },
    { value: 'file_hash_sha256', label: 'SHA256 Hash' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' }
  ];
  
  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];
  
  return (
    <Paper sx={{ mt: 3 }}>
      {/* Filter Controls */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Indicators"
          value={filters.value || ''}
          onChange={(e) => handleFilterChange('value', e.target.value)}
          placeholder="IP, domain, hash..."
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            label="Type"
          >
            {indicatorTypeOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            label="Severity"
          >
            {severityOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider />
      
      {/* Indicators Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Threat</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : indicators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No indicators found
                </TableCell>
              </TableRow>
            ) : (
              indicators.map((indicator) => (
                <TableRow key={indicator._id}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={indicator.value}
                    >
                      {indicator.value}
                    </Typography>
                  </TableCell>
                  <TableCell>{indicator.type}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {indicator.threat?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {indicator.threat?.category || 'Uncategorized'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={indicator.severity.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(indicator.severity),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{indicator.confidenceScore}%</TableCell>
                  <TableCell>{indicator.source?.name}</TableCell>
                  <TableCell>
                    {moment(indicator.lastSeen).format('MM/DD/YYYY')}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => onView(indicator)}
                      title="View Details"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination.total || 0}
          rowsPerPage={filters.limit || 10}
          page={pagination.page - 1 || 0}
          onPageChange={(event, page) => onPageChange(page + 1)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(event.target.value)}
        />
      </TableContainer>
    </Paper>
  );
};

// Main Dashboard Component
const ThreatIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [sources, setSources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ limit: 10, page: 1, status: 'active' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  
  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/threat-intelligence/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      setError('Failed to load threat intelligence statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch threat indicators
  const fetchIndicators = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`/api/threat-intelligence/indicators?${queryParams.toString()}`);
      if (response.data.success) {
        setIndicators(response.data.indicators);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load threat indicators');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch threat sources
  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/threat-intelligence/sources');
      if (response.data.success) {
        setSources(response.data.sources);
      }
    } catch (err) {
      setError('Failed to load threat sources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (limit) => {
    setFilters({ ...filters, limit, page: 1 });
  };
  
  // View indicator details
  const handleViewIndicator = (indicator) => {
    setSelectedIndicator(indicator);
    // Implementation would open a dialog/modal to show details
  };
  
  // Load data when component mounts or filters change
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    fetchIndicators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  useEffect(() => {
    if (activeTab === 1) {
      fetchSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Threat Intelligence</Typography>
        
        <Box>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchStats();
              fetchIndicators();
              if (activeTab === 1) fetchSources();
            }}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            // This would open a dialog to add a new indicator or source
          >
            {activeTab === 0 ? 'Add Indicator' : 'Add Source'}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Dashboard Stats Section */}
      {activeTab === 0 && (
        <ThreatStatsCards stats={stats} />
      )}
      
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Indicators" />
          <Tab label="Sources" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        <ThreatIndicatorsTable
          indicators={indicators}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={handleViewIndicator}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Threat Intelligence Sources
          </Typography>
          {/* Sources would be displayed here */}
          {/* This would be implemented in a separate component */}
        </Paper>
      )}
    </Box>
  );
};

export default ThreatIntelligenceDashboard;
