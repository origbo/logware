import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

// Mock API call for logs data
const fetchLogsData = (page, rowsPerPage, filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock logs data
      const logs = [];
      const sources = ['OSSIM', 'Wireshark', 'Snort', 'Zeek', 'Nagios', 'Graylog'];
      const severities = ['low', 'medium', 'high', 'critical'];
      
      // Apply filters if provided
      let filteredSources = sources;
      let filteredSeverities = severities;
      
      if (filters) {
        if (filters.source && filters.source !== 'all') {
          filteredSources = [filters.source];
        }
        
        if (filters.severity && filters.severity !== 'all') {
          filteredSeverities = [filters.severity];
        }
      }
      
      // Generate logs with potential search filter
      for (let i = 0; i < 1000; i++) {
        const sourceIndex = Math.floor(Math.random() * filteredSources.length);
        const severityIndex = Math.floor(Math.random() * filteredSeverities.length);
        
        const source = filteredSources[sourceIndex];
        const severity = filteredSeverities[severityIndex];
        
        // Generate IP addresses
        const srcIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        const destIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        
        // Generate log messages based on source
        let message = '';
        
        switch (source) {
          case 'OSSIM':
            message = `Security event detected: Potential ${['SQL injection', 'XSS attack', 'CSRF attempt', 'credential stuffing'][Math.floor(Math.random() * 4)]}`;
            break;
          case 'Wireshark':
            message = `Packet capture: ${['HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH'][Math.floor(Math.random() * 5)]} traffic from ${srcIp} to ${destIp}`;
            break;
          case 'Snort':
            message = `Alert: ${['Signature match', 'Anomaly detected', 'Protocol violation', 'Policy violation'][Math.floor(Math.random() * 4)]} - ID: SNT-${Math.floor(Math.random() * 10000)}`;
            break;
          case 'Zeek':
            message = `Network analysis: ${['Connection established', 'Connection terminated', 'Data transfer', 'Protocol anomaly'][Math.floor(Math.random() * 4)]} between ${srcIp} and ${destIp}`;
            break;
          case 'Nagios':
            message = `System status: ${['CPU usage', 'Memory usage', 'Disk space', 'Service status'][Math.floor(Math.random() * 4)]} ${['critical', 'warning', 'OK', 'unknown'][Math.floor(Math.random() * 4)]}`;
            break;
          case 'Graylog':
            message = `Log entry: ${['Application error', 'User login', 'Configuration change', 'System event'][Math.floor(Math.random() * 4)]} on ${['app-server', 'db-server', 'web-server', 'auth-server'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10)}`;
            break;
          default:
            message = `Generic log entry #${i}`;
        }
        
        // Apply text search filter if provided
        if (filters && filters.search && !message.toLowerCase().includes(filters.search.toLowerCase()) && 
            !source.toLowerCase().includes(filters.search.toLowerCase())) {
          continue;
        }
        
        // Apply date range filter if provided
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
        
        if (filters && filters.startDate && new Date(filters.startDate) > timestamp) {
          continue;
        }
        
        if (filters && filters.endDate && new Date(filters.endDate) < timestamp) {
          continue;
        }
        
        logs.push({
          id: `log-${i}`,
          timestamp,
          source,
          severity,
          message,
          sourceIp: srcIp,
          destinationIp: destIp
        });
      }
      
      // Sort logs by timestamp (newest first)
      logs.sort((a, b) => b.timestamp - a.timestamp);
      
      // Paginate results
      const paginatedLogs = logs.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
      
      resolve({
        logs: paginatedLogs,
        total: logs.length
      });
    }, 1000);
  });
};

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [source, setSource] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState(null);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Prepare filters
      const filters = {
        source: source !== 'all' ? source : null,
        severity: severity !== 'all' ? severity : null,
        search: searchQuery || null,
        startDate: startDate || null,
        endDate: endDate || null
      };
      
      const data = await fetchLogsData(page, rowsPerPage, filters);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, source, severity, searchQuery, startDate, endDate]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSourceChange = (event) => {
    setSource(event.target.value);
    setPage(0);
  };
  
  const handleSeverityChange = (event) => {
    setSeverity(event.target.value);
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setPage(0);
  };
  
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setPage(0);
  };
  
  const handleClearFilters = () => {
    setSource('all');
    setSeverity('all');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };
  
  const handleLogRowClick = (log) => {
    setSelectedLog(log);
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
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Log Viewer
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={fetchLogs}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search logs..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="source-select-label">Source</InputLabel>
                  <Select
                    labelId="source-select-label"
                    value={source}
                    onChange={handleSourceChange}
                    label="Source"
                  >
                    <MenuItem value="all">All Sources</MenuItem>
                    <MenuItem value="OSSIM">OSSIM</MenuItem>
                    <MenuItem value="Wireshark">Wireshark</MenuItem>
                    <MenuItem value="Snort">Snort</MenuItem>
                    <MenuItem value="Zeek">Zeek</MenuItem>
                    <MenuItem value="Nagios">Nagios</MenuItem>
                    <MenuItem value="Graylog">Graylog</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="severity-select-label">Severity</InputLabel>
                  <Select
                    labelId="severity-select-label"
                    value={severity}
                    onChange={handleSeverityChange}
                    label="Severity"
                  >
                    <MenuItem value="all">All Severities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
          
          {(source !== 'all' || severity !== 'all' || searchQuery || startDate || endDate) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Active Filters:</Typography>
                {source !== 'all' && (
                  <Chip 
                    label={`Source: ${source}`} 
                    onDelete={() => setSource('all')} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {severity !== 'all' && (
                  <Chip 
                    label={`Severity: ${severity}`} 
                    onDelete={() => setSeverity('all')} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {searchQuery && (
                  <Chip 
                    label={`Search: ${searchQuery}`} 
                    onDelete={() => setSearchQuery('')} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {startDate && (
                  <Chip 
                    label={`From: ${startDate}`} 
                    onDelete={() => setStartDate('')} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {endDate && (
                  <Chip 
                    label={`To: ${endDate}`} 
                    onDelete={() => setEndDate('')} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ ml: 'auto' }}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Log Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6">Log Entries</Typography>
          <Box>
            <Button 
              startIcon={<DownloadIcon />} 
              variant="text" 
              size="small" 
              sx={{ mr: 1 }}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Source IP</TableCell>
                <TableCell>Destination IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow 
                    key={log.id}
                    hover
                    onClick={() => handleLogRowClick(log)}
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedLog?.id === log.id ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      {log.timestamp.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.source} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.severity} 
                        size="small"
                        color={getSeverityColor(log.severity)}
                      />
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.sourceIp}</TableCell>
                    <TableCell>{log.destinationIp}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No logs found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Log Detail View */}
      {selectedLog && (
        <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" gutterBottom>Log Details</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">ID</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.id}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.timestamp.toLocaleString()}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Source</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.source}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Severity</Typography>
              <Chip 
                label={selectedLog.severity} 
                size="small"
                color={getSeverityColor(selectedLog.severity)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Source IP</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.sourceIp}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Destination IP</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.destinationIp}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Message</Typography>
              <Typography variant="body1" gutterBottom>{selectedLog.message}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Raw Data</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify({
                  id: selectedLog.id,
                  timestamp: selectedLog.timestamp,
                  source: selectedLog.source,
                  severity: selectedLog.severity,
                  message: selectedLog.message,
                  sourceIp: selectedLog.sourceIp,
                  destinationIp: selectedLog.destinationIp,
                  protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'][Math.floor(Math.random() * 5)],
                  port: Math.floor(Math.random() * 65535) + 1,
                  action: ['ALLOW', 'BLOCK', 'ALERT'][Math.floor(Math.random() * 3)],
                  user: Math.random() > 0.5 ? `user${Math.floor(Math.random() * 100)}` : null,
                  applicationName: Math.random() > 0.5 ? [`web-server`, `database`, `auth-service`, `api-gateway`][Math.floor(Math.random() * 4)] : null
                }, null, 2)}
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedLog(null)}
            >
              Close
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default LogViewer;
