import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  ArrowUpward as ImproveIcon
} from '@mui/icons-material';

// Mock API call to fetch compliance data
const fetchComplianceData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: {
          overallScore: 78,
          lastAssessment: "2025-04-10",
          nextAssessment: "2025-07-10",
          totalControls: 164,
          compliantControls: 128,
          partiallyCompliantControls: 22,
          nonCompliantControls: 14,
          criticalFindings: 3
        },
        frameworks: [
          {
            id: 'gdpr',
            name: 'GDPR',
            score: 82,
            compliantControls: 38,
            totalControls: 45,
            lastUpdated: '2025-04-05',
            status: 'active'
          },
          {
            id: 'pci',
            name: 'PCI-DSS',
            score: 76,
            compliantControls: 35,
            totalControls: 46,
            lastUpdated: '2025-04-08',
            status: 'active'
          },
          {
            id: 'hipaa',
            name: 'HIPAA',
            score: 85,
            compliantControls: 28,
            totalControls: 33,
            lastUpdated: '2025-04-01',
            status: 'active'
          },
          {
            id: 'iso27001',
            name: 'ISO 27001',
            score: 71,
            compliantControls: 27,
            totalControls: 40,
            lastUpdated: '2025-03-25',
            status: 'active'
          }
        ],
        findings: [
          {
            id: 'f1',
            title: 'Missing encryption for data at rest',
            description: 'Customer data stored in the primary database is not encrypted at rest',
            severity: 'critical',
            framework: 'GDPR, PCI-DSS',
            status: 'open',
            assignedTo: 'John Smith',
            dueDate: '2025-05-01'
          },
          {
            id: 'f2',
            title: 'Weak password policy',
            description: 'Current password policy does not enforce sufficient complexity requirements',
            severity: 'high',
            framework: 'ISO 27001, PCI-DSS',
            status: 'in-progress',
            assignedTo: 'Emma Johnson',
            dueDate: '2025-04-25'
          },
          {
            id: 'f3',
            title: 'Incomplete access reviews',
            description: 'Quarterly access reviews are not being fully documented',
            severity: 'medium',
            framework: 'HIPAA, ISO 27001',
            status: 'in-progress',
            assignedTo: 'Michael Brown',
            dueDate: '2025-04-30'
          },
          {
            id: 'f4',
            title: 'Insufficient logging of admin activities',
            description: 'Admin activities in the customer database are not comprehensively logged',
            severity: 'high',
            framework: 'GDPR, PCI-DSS',
            status: 'open',
            assignedTo: 'Unassigned',
            dueDate: '2025-05-05'
          },
          {
            id: 'f5',
            title: 'Incomplete data retention policy',
            description: 'Data retention policy does not cover all required data types',
            severity: 'medium',
            framework: 'GDPR, HIPAA',
            status: 'open',
            assignedTo: 'Sarah Davis',
            dueDate: '2025-05-10'
          }
        ],
        recentActions: [
          {
            date: '2025-04-17',
            action: 'Updated PCI-DSS evidence for requirement 3.4',
            user: 'Emma Johnson'
          },
          {
            date: '2025-04-16',
            action: 'Completed remediation for ISO 27001 finding F25',
            user: 'Michael Brown'
          },
          {
            date: '2025-04-15',
            action: 'Added new GDPR data processing documentation',
            user: 'John Smith'
          },
          {
            date: '2025-04-13',
            action: 'Performed HIPAA quarterly assessment',
            user: 'Sarah Davis'
          },
          {
            date: '2025-04-10',
            action: 'Updated data retention documentation',
            user: 'John Smith'
          }
        ]
      });
    }, 1000);
  });
};

const Compliance = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFramework, setSelectedFramework] = useState('all');
  
  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        const data = await fetchComplianceData();
        setComplianceData(data);
      } catch (error) {
        console.error('Error loading compliance data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadComplianceData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleFrameworkChange = (event) => {
    setSelectedFramework(event.target.value);
  };
  
  // Helper functions for rendering
  const getScoreColor = (score) => {
    if (score >= 85) return 'success.main';
    if (score >= 70) return 'warning.main';
    return 'error.main';
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
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'in-progress':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'completed':
        return <CheckIcon color="success" fontSize="small" />;
      default:
        return null;
    }
  };
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await fetchComplianceData();
      setComplianceData(data);
    } catch (error) {
      console.error('Error refreshing compliance data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !complianceData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Filter findings based on selected framework
  const filteredFindings = complianceData?.findings.filter(finding => 
    selectedFramework === 'all' || finding.framework.includes(selectedFramework)
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Compliance
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            sx={{ mr: 2 }}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              height: '100%', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardHeader
              title="Overall Compliance Score"
              subheader={`Last assessed: ${complianceData?.summary.lastAssessment}`}
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 2
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={complianceData?.summary.overallScore || 0}
                  size={160}
                  thickness={5}
                  sx={{ color: getScoreColor(complianceData?.summary.overallScore) }}
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
                  <Typography variant="h3" component="div" color={getScoreColor(complianceData?.summary.overallScore)}>
                    {complianceData?.summary.overallScore}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Next assessment due: {complianceData?.summary.nextAssessment}
              </Typography>
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
            <CardHeader
              title="Control Status"
              subheader={`${complianceData?.summary.compliantControls} of ${complianceData?.summary.totalControls} controls compliant`}
            />
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Compliant</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {complianceData?.summary.compliantControls} ({Math.round(complianceData?.summary.compliantControls / complianceData?.summary.totalControls * 100)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(complianceData?.summary.compliantControls / complianceData?.summary.totalControls * 100) || 0}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(76, 175, 80, 0.1)', mb: 1 }}
                      color="success"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Partially Compliant</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {complianceData?.summary.partiallyCompliantControls} ({Math.round(complianceData?.summary.partiallyCompliantControls / complianceData?.summary.totalControls * 100)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(complianceData?.summary.partiallyCompliantControls / complianceData?.summary.totalControls * 100) || 0}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255, 152, 0, 0.1)', mb: 1 }}
                      color="warning"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Non-Compliant</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {complianceData?.summary.nonCompliantControls} ({Math.round(complianceData?.summary.nonCompliantControls / complianceData?.summary.totalControls * 100)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(complianceData?.summary.nonCompliantControls / complianceData?.summary.totalControls * 100) || 0}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                      color="error"
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  color="error" 
                  label={`${complianceData?.summary.criticalFindings} Critical Findings`} 
                  icon={<ErrorIcon />}
                />
                <Button variant="text" size="small">View Details</Button>
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
            <CardHeader
              title="Recent Activity"
              subheader="Last 5 compliance actions"
            />
            <CardContent sx={{ px: 0, py: 0, "&:last-child": { pb: 0 } }}>
              <List dense>
                {complianceData?.recentActions.map((action, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={action.action}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {action.date} • {action.user}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < complianceData.recentActions.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tabs */}
        <Grid item xs={12}>
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
              aria-label="compliance tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Frameworks" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Findings" icon={<AssignmentIcon />} iconPosition="start" />
            </Tabs>
            
            {/* Frameworks Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {complianceData?.frameworks.map((framework) => (
                    <Grid item xs={12} md={6} key={framework.id}>
                      <Card variant="outlined">
                        <CardHeader
                          title={framework.name}
                          subheader={`Last updated: ${framework.lastUpdated}`}
                          action={
                            <Chip 
                              label={`${framework.score}%`} 
                              color={framework.score >= 85 ? 'success' : framework.score >= 70 ? 'warning' : 'error'}
                            />
                          }
                        />
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Compliance Status</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {framework.compliantControls} of {framework.totalControls} controls
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(framework.compliantControls / framework.totalControls * 100) || 0}
                              sx={{ height: 8, borderRadius: 4 }}
                              color={framework.score >= 85 ? 'success' : framework.score >= 70 ? 'warning' : 'error'}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button variant="outlined" size="small">
                              View Details
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small" 
                              startIcon={<ImproveIcon />}
                              color={framework.score >= 85 ? 'success' : framework.score >= 70 ? 'warning' : 'error'}
                            >
                              Improve Score
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Findings Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="framework-filter-label">Framework</InputLabel>
                    <Select
                      labelId="framework-filter-label"
                      value={selectedFramework}
                      label="Framework"
                      onChange={handleFrameworkChange}
                    >
                      <MenuItem value="all">All Frameworks</MenuItem>
                      {complianceData?.frameworks.map(framework => (
                        <MenuItem key={framework.id} value={framework.name}>
                          {framework.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Finding</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Framework</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFindings?.map((finding) => (
                        <TableRow key={finding.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {finding.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {finding.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={finding.severity.toUpperCase()} 
                              color={getSeverityColor(finding.severity)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{finding.framework}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getStatusIcon(finding.status)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {finding.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{finding.assignedTo}</TableCell>
                          <TableCell>{finding.dueDate}</TableCell>
                          <TableCell>
                            <Button variant="text" size="small">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Compliance;
