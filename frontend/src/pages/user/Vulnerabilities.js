import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, 
  Chip, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  CircularProgress, Tooltip, TextField, InputAdornment,
  Tabs, Tab, FormControl, Select, MenuItem, InputLabel,
  Divider, LinearProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  CheckCircle as ResolvedIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

// Mock API call to fetch vulnerabilities data
const fetchVulnerabilitiesData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: {
          totalVulnerabilities: 128,
          criticalCount: 7,
          highCount: 22,
          mediumCount: 58,
          lowCount: 41,
          remediated: 56,
          inProgress: 36,
          open: 36,
          avgRemediationTime: '4.5 days'
        },
        vulnerabilities: [
          {
            id: 'CVE-2025-1234',
            title: 'OpenSSL Buffer Overflow',
            description: 'A buffer overflow vulnerability in OpenSSL could allow remote attackers to execute arbitrary code.',
            severity: 'critical',
            cvssScore: 9.8,
            status: 'open',
            affectedSystems: ['Web Server 01', 'Web Server 02', 'Application Server 01'],
            discoveryDate: '2025-04-12',
            remediation: 'Update OpenSSL to version 3.2.0 or later',
            assignedTo: 'John Smith'
          },
          {
            id: 'CVE-2025-5678',
            title: 'Apache Log4j Remote Code Execution',
            description: 'A remote code execution vulnerability in Apache Log4j allows attackers to execute arbitrary code on affected systems.',
            severity: 'critical',
            cvssScore: 10.0,
            status: 'in-progress',
            affectedSystems: ['Application Server 01', 'Application Server 02', 'Database Server 01'],
            discoveryDate: '2025-04-10',
            remediation: 'Update Log4j to version 2.17.1 or later',
            assignedTo: 'Emma Johnson'
          },
          {
            id: 'CVE-2025-9012',
            title: 'SQL Injection in Admin Console',
            description: 'A SQL injection vulnerability in the admin console could allow attackers to access sensitive data.',
            severity: 'high',
            cvssScore: 8.2,
            status: 'open',
            affectedSystems: ['Admin Console'],
            discoveryDate: '2025-04-14',
            remediation: 'Implement prepared statements and validate all user inputs',
            assignedTo: 'Unassigned'
          },
          {
            id: 'CVE-2025-3456',
            title: 'Cross-Site Scripting in User Portal',
            description: 'A cross-site scripting vulnerability in the user portal could allow attackers to inject malicious scripts.',
            severity: 'medium',
            cvssScore: 6.5,
            status: 'in-progress',
            affectedSystems: ['User Portal'],
            discoveryDate: '2025-04-05',
            remediation: 'Implement proper output encoding and content security policy',
            assignedTo: 'Sarah Davis'
          },
          {
            id: 'CVE-2025-7890',
            title: 'Outdated TLS Configuration',
            description: 'The system uses outdated TLS configurations that are vulnerable to known attacks.',
            severity: 'medium',
            cvssScore: 5.3,
            status: 'remediated',
            affectedSystems: ['Load Balancer', 'Web Server 01', 'Web Server 02'],
            discoveryDate: '2025-03-30',
            remediationDate: '2025-04-15',
            remediation: 'Update TLS configuration to use only TLS 1.2 and 1.3 with secure cipher suites',
            assignedTo: 'Michael Brown'
          }
        ],
        recentScans: [
          {
            id: 'scan-2025-04-17',
            date: '2025-04-17',
            scanType: 'Full Network Scan',
            vulnerabilitiesFound: 12,
            criticalFound: 1,
            status: 'completed'
          },
          {
            id: 'scan-2025-04-15',
            date: '2025-04-15',
            scanType: 'Web Application Scan',
            vulnerabilitiesFound: 8,
            criticalFound: 0,
            status: 'completed'
          },
          {
            id: 'scan-2025-04-13',
            date: '2025-04-13',
            scanType: 'Full Network Scan',
            vulnerabilitiesFound: 15,
            criticalFound: 2,
            status: 'completed'
          }
        ]
      });
    }, 1200);
  });
};

const severityColors = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info'
};

const statusColors = {
  'open': 'error',
  'in-progress': 'warning',
  'remediated': 'success'
};

const Vulnerabilities = () => {
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    search: ''
  });
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  useEffect(() => {
    const loadVulnerabilitiesData = async () => {
      try {
        const data = await fetchVulnerabilitiesData();
        setVulnerabilitiesData(data);
      } catch (error) {
        console.error('Error loading vulnerabilities data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVulnerabilitiesData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const handleSearchChange = (event) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchVulnerabilitiesData();
      setVulnerabilitiesData(data);
    } catch (error) {
      console.error('Error refreshing vulnerabilities data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  const getFilteredVulnerabilities = () => {
    if (!vulnerabilitiesData) return [];
    
    return vulnerabilitiesData.vulnerabilities.filter(vuln => {
      const matchesSeverity = filters.severity === 'all' || vuln.severity === filters.severity;
      const matchesStatus = filters.status === 'all' || vuln.status === filters.status;
      const matchesSearch = filters.search === '' || 
        vuln.id.toLowerCase().includes(filters.search.toLowerCase()) || 
        vuln.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        vuln.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSeverity && matchesStatus && matchesSearch;
    });
  };
  
  const getCvssColor = (score) => {
    if (score >= 9.0) return 'error';
    if (score >= 7.0) return 'error';
    if (score >= 4.0) return 'warning';
    return 'info';
  };
  
  if (loading && !vulnerabilitiesData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vulnerabilities
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Start New Scan
          </Button>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              height: '100%', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vulnerability Risk
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex'
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    thickness={4}
                    sx={{ color: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={vulnerabilitiesData ? 
                      ((vulnerabilitiesData.summary.criticalCount * 4 + 
                        vulnerabilitiesData.summary.highCount * 3 + 
                        vulnerabilitiesData.summary.mediumCount * 2 + 
                        vulnerabilitiesData.summary.lowCount) /
                        (vulnerabilitiesData.summary.totalVulnerabilities * 4)) * 100 : 0}
                    size={80}
                    thickness={4}
                    sx={{ 
                      color: 'error.main',
                      position: 'absolute',
                      left: 0
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
                    <Typography variant="h5" component="div" color="text.secondary">
                      High
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="error">Critical</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {vulnerabilitiesData?.summary.criticalCount}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vulnerabilitiesData?.summary.criticalCount / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                      sx={{ height: 6, borderRadius: 4 }}
                      color="error"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="error.light">High</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.light">
                        {vulnerabilitiesData?.summary.highCount}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vulnerabilitiesData?.summary.highCount / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                      sx={{ height: 6, borderRadius: 4 }}
                      color="error"
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  <strong>Total Vulnerabilities:</strong> {vulnerabilitiesData?.summary.totalVulnerabilities}
                </Typography>
                <Typography variant="body2">
                  <strong>Avg. Remediation Time:</strong> {vulnerabilitiesData?.summary.avgRemediationTime}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              height: '100%', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Remediation Status
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex'
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    thickness={4}
                    sx={{ color: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={(vulnerabilitiesData?.summary.remediated / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                    size={80}
                    thickness={4}
                    sx={{ 
                      color: 'success.main',
                      position: 'absolute',
                      left: 0
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
                    <Typography variant="h5" component="div" color="text.secondary">
                      {Math.round(vulnerabilitiesData?.summary.remediated / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="success.main">Remediated</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {vulnerabilitiesData?.summary.remediated}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vulnerabilitiesData?.summary.remediated / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                      sx={{ height: 6, borderRadius: 4 }}
                      color="success"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="warning.main">In Progress</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {vulnerabilitiesData?.summary.inProgress}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vulnerabilitiesData?.summary.inProgress / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                      sx={{ height: 6, borderRadius: 4 }}
                      color="warning"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="error.main">Open</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {vulnerabilitiesData?.summary.open}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vulnerabilitiesData?.summary.open / vulnerabilitiesData?.summary.totalVulnerabilities * 100) || 0}
                      sx={{ height: 6, borderRadius: 4 }}
                      color="error"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              height: '100%', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Scans
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Vulnerabilities</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vulnerabilitiesData?.recentScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>{scan.date}</TableCell>
                        <TableCell>{scan.scanType}</TableCell>
                        <TableCell align="right">
                          {scan.vulnerabilitiesFound}
                          {scan.criticalFound > 0 && (
                            <Chip 
                              label={`${scan.criticalFound} critical`} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Button 
                variant="text" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                View All Scans
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Vulnerabilities Tab */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="vulnerability tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Vulnerabilities" icon={<BugIcon />} iconPosition="start" />
          <Tab label="Critical & High" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {/* Filters */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search vulnerabilities..."
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="severity-filter-label">Severity</InputLabel>
                <Select
                  labelId="severity-filter-label"
                  value={filters.severity}
                  label="Severity"
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="remediated">Remediated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Vulnerabilities Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vulnerability</TableCell>
                  <TableCell>CVSS</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Affected Systems</TableCell>
                  <TableCell>Discovery Date</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredVulnerabilities().map((vuln) => (
                  <TableRow key={vuln.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {vuln.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vuln.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={vuln.cvssScore.toFixed(1)} 
                        color={getCvssColor(vuln.cvssScore)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={vuln.severity.toUpperCase()} 
                        color={severityColors[vuln.severity]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={vuln.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        color={statusColors[vuln.status]} 
                        icon={vuln.status === 'remediated' ? <ResolvedIcon /> : null}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {vuln.affectedSystems.length > 1 ? (
                        `${vuln.affectedSystems[0]} +${vuln.affectedSystems.length - 1} more`
                      ) : vuln.affectedSystems[0]}
                    </TableCell>
                    <TableCell>{vuln.discoveryDate}</TableCell>
                    <TableCell>{vuln.assignedTo}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(vuln)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {getFilteredVulnerabilities().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No vulnerabilities matching the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      
      {/* Vulnerability Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedVulnerability && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{selectedVulnerability.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedVulnerability.id}
                  </Typography>
                </Box>
                <Chip 
                  label={selectedVulnerability.severity.toUpperCase()} 
                  color={severityColors[selectedVulnerability.severity]}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Description</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedVulnerability.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Details</Typography>
                  <Typography variant="body2">
                    <strong>CVSS Score:</strong> {selectedVulnerability.cvssScore.toFixed(1)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Discovery Date:</strong> {selectedVulnerability.discoveryDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedVulnerability.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Assigned To:</strong> {selectedVulnerability.assignedTo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Affected Systems</Typography>
                  {selectedVulnerability.affectedSystems.map((system, index) => (
                    <Typography key={index} variant="body2">• {system}</Typography>
                  ))}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Remediation</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedVulnerability.remediation}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              {selectedVulnerability.status !== 'remediated' && (
                <Button 
                  variant="contained" 
                  color={selectedVulnerability.status === 'in-progress' ? 'success' : 'primary'}
                >
                  {selectedVulnerability.status === 'in-progress' ? 'Mark as Remediated' : 'Start Remediation'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Vulnerabilities;
