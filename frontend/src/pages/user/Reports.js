import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Tabs, Tab,
  Card, CardContent, CardActions, Chip, List, ListItem,
  ListItemText, ListItemIcon, IconButton, ListItemSecondaryAction,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Description as ReportIcon,
  GetApp as DownloadIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  FileCopy as TemplateIcon,
  Share as ShareIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Mock API call for reports data
const fetchReportsData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        recent: [
          {
            id: 'report-1',
            name: 'Security Incident Summary - 2025-04-15',
            type: 'Security Incident Summary',
            description: 'Daily summary of security incidents',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            createdBy: 'admin',
            format: 'PDF',
            size: '1.2MB',
            status: 'completed'
          },
          {
            id: 'report-2',
            name: 'Network Traffic Analysis - 2025-04-10',
            type: 'Network Traffic Analysis',
            description: 'Detailed analysis of network traffic patterns',
            createdAt: new Date(Date.now() - 432000000), // 5 days ago
            createdBy: 'admin',
            format: 'PDF',
            size: '3.5MB',
            status: 'completed'
          },
          {
            id: 'report-3',
            name: 'User Activity Audit - 2025-04-01',
            type: 'User Activity Audit',
            description: 'Monthly audit of user activities',
            createdAt: new Date(Date.now() - 1296000000), // 15 days ago
            createdBy: 'admin',
            format: 'CSV',
            size: '0.8MB',
            status: 'completed'
          }
        ],
        scheduled: [
          {
            id: 'schedule-1',
            name: 'Security Incident Summary',
            type: 'Security Incident Summary',
            description: 'Daily summary of security incidents',
            schedule: 'Daily at 00:00',
            nextRun: new Date(new Date().setHours(24, 0, 0, 0)),
            format: 'PDF',
            recipients: ['admin@example.com', 'security@example.com'],
            status: 'active'
          },
          {
            id: 'schedule-2',
            name: 'Network Traffic Weekly',
            type: 'Network Traffic Analysis',
            description: 'Weekly analysis of network traffic',
            schedule: 'Weekly on Monday at 01:00',
            nextRun: new Date(new Date().setDate(new Date().getDate() + (1 + 7 - new Date().getDay()) % 7)),
            format: 'PDF',
            recipients: ['admin@example.com', 'network@example.com'],
            status: 'active'
          },
          {
            id: 'schedule-3',
            name: 'User Activity Monthly Audit',
            type: 'User Activity Audit',
            description: 'Monthly audit of user activities',
            schedule: 'Monthly on 1st at 02:00',
            nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1, 2, 0, 0),
            format: 'CSV',
            recipients: ['admin@example.com', 'compliance@example.com'],
            status: 'active'
          }
        ],
        templates: [
          {
            id: 'template-1',
            name: 'Security Incident Summary',
            description: 'Provides a summary of security incidents detected by the system',
            parameters: {
              timeRange: '24 hours',
              includeSeverities: ['critical', 'high', 'medium', 'low'],
              groupBy: 'source'
            }
          },
          {
            id: 'template-2',
            name: 'Network Traffic Analysis',
            description: 'Analyzes network traffic patterns, bandwidth usage, and potential anomalies',
            parameters: {
              timeRange: '7 days',
              includeProtocols: ['HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH'],
              groupBy: 'protocol'
            }
          },
          {
            id: 'template-3',
            name: 'System Performance',
            description: 'Overview of system performance metrics including CPU, memory, and disk usage',
            parameters: {
              timeRange: '7 days',
              interval: '1 hour',
              includeServers: 'all'
            }
          },
          {
            id: 'template-4',
            name: 'User Activity Audit',
            description: 'Detailed audit of user activities including logins, permission changes, and resource access',
            parameters: {
              timeRange: '30 days',
              includeUsers: 'all',
              groupBy: 'action'
            }
          },
          {
            id: 'template-5',
            name: 'Compliance Report',
            description: 'Helps verify compliance with security policies and standards',
            parameters: {
              framework: 'custom',
              includeControls: 'all',
              groupBy: 'status'
            }
          }
        ]
      });
    }, 1000);
  });
};

// Report generation form dialog
const ReportGenerationDialog = ({ open, onClose, templates, onGenerate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [reportName, setReportName] = useState('');
  const [timeRange, setTimeRange] = useState('24 hours');
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset form
    setSelectedTemplate('');
    setReportName('');
    setTimeRange('24 hours');
    setFormat('PDF');
  };

  const handleGenerate = () => {
    setLoading(true);
    
    // Simulate report generation request
    setTimeout(() => {
      onGenerate({
        templateId: selectedTemplate,
        name: reportName,
        timeRange,
        format
      });
      setLoading(false);
      handleClose();
    }, 1500);
  };

  const isFormValid = selectedTemplate && reportName && timeRange && format;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate New Report</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="template-select-label">Report Template</InputLabel>
          <Select
            labelId="template-select-label"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            label="Report Template"
          >
            <MenuItem value="" disabled>Select a template</MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedTemplate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {templates.find(t => t.id === selectedTemplate)?.description}
          </Typography>
        )}

        <TextField
          label="Report Name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="time-range-select-label">Time Range</InputLabel>
          <Select
            labelId="time-range-select-label"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="24 hours">Last 24 Hours</MenuItem>
            <MenuItem value="7 days">Last 7 Days</MenuItem>
            <MenuItem value="30 days">Last 30 Days</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="format-select-label">Format</InputLabel>
          <Select
            labelId="format-select-label"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            label="Format"
          >
            <MenuItem value="PDF">PDF</MenuItem>
            <MenuItem value="CSV">CSV</MenuItem>
            <MenuItem value="JSON">JSON</MenuItem>
            <MenuItem value="HTML">HTML</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleGenerate} 
          variant="contained" 
          color="primary"
          disabled={!isFormValid || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View report dialog
const ViewReportDialog = ({ report, open, onClose }) => {
  if (!report) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{report.name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Report Type</Typography>
            <Typography variant="body1" gutterBottom>{report.type}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1" gutterBottom>{report.description}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Generated On</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(report.createdAt)}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Generated By</Typography>
            <Typography variant="body1" gutterBottom>{report.createdBy}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Format</Typography>
            <Typography variant="body1" gutterBottom>{report.format}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Size</Typography>
            <Typography variant="body1" gutterBottom>{report.size}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip 
              label={report.status} 
              color={report.status === 'completed' ? 'success' : 'warning'} 
              size="small" 
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Preview</Typography>
            <Paper variant="outlined" sx={{ p: 2, height: 300, overflowY: 'auto' }}>
              <Typography variant="subtitle1" align="center" gutterBottom>
                {report.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                This is a preview of the report content. In a real implementation, this would show an actual preview or summary of the report.
              </Typography>
              
              <Typography variant="body2" paragraph>
                The report contains analysis and data collected from {report.type.toLowerCase()}, 
                providing insights and metrics to help monitor and maintain system security and performance.
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['High Priority', 'Medium Priority', 'Low Priority'].map((row, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row}
                        </TableCell>
                        <TableCell align="right">{Math.floor(Math.random() * 100)}</TableCell>
                        <TableCell align="right">{Math.floor(Math.random() * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="body2" paragraph>
                For more detailed information, please download the full report.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          startIcon={<DownloadIcon />}
          variant="contained" 
          color="primary"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState({ recent: [], scheduled: [], templates: [] });
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReportsData();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGenerateDialogOpen = () => {
    setGenerateDialogOpen(true);
  };

  const handleGenerateDialogClose = () => {
    setGenerateDialogOpen(false);
  };

  const handleGenerateReport = (reportData) => {
    // In a real app, this would make an API call
    console.log('Generating report with data:', reportData);
    
    // Simulate adding a new report to the list
    const newReport = {
      id: `report-${Date.now()}`,
      name: reportData.name,
      type: reports.templates.find(t => t.id === reportData.templateId)?.name || 'Custom Report',
      description: `Generated from ${reports.templates.find(t => t.id === reportData.templateId)?.name} template`,
      createdAt: new Date(),
      createdBy: 'user', // Would come from authenticated user
      format: reportData.format,
      size: `${Math.floor(Math.random() * 5) + 0.5}MB`,
      status: 'completed'
    };
    
    setReports(prev => ({
      ...prev,
      recent: [newReport, ...prev.recent]
    }));
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
  };

  const renderRecentReports = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (reports.recent.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No recent reports found</Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={handleGenerateDialogOpen}
            sx={{ mt: 2 }}
          >
            Generate New Report
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {reports.recent.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card elevation={0} sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <ReportIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div" noWrap>
                    {report.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                  {report.description}
                </Typography>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <Chip 
                    label={report.format} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={new Date(report.createdAt).toLocaleDateString()} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={report.size} 
                    size="small" 
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                >
                  Download
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleViewReport(report)}
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderScheduledReports = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (reports.scheduled.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No scheduled reports found</Typography>
        </Box>
      );
    }

    return (
      <List>
        {reports.scheduled.map((schedule) => (
          <React.Fragment key={schedule.id}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={schedule.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {schedule.description}
                    </Typography>
                    <Typography variant="body2" display="block">
                      Schedule: {schedule.schedule} • Next run: {new Date(schedule.nextRun).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Format: {schedule.format} • Recipients: {schedule.recipients.join(', ')}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderTemplates = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (reports.templates.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No report templates found</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {reports.templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card elevation={0} sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <TemplateIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div" noWrap>
                    {template.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {template.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={handleGenerateDialogOpen}
                >
                  Generate
                </Button>
                <Button 
                  size="small" 
                  startIcon={<ScheduleIcon />}
                >
                  Schedule
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadReports}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={handleGenerateDialogOpen}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="report tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Recent Reports" />
          <Tab label="Scheduled Reports" />
          <Tab label="Templates" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderRecentReports()}
          {tabValue === 1 && renderScheduledReports()}
          {tabValue === 2 && renderTemplates()}
        </Box>
      </Paper>

      {/* Dialogs */}
      <ReportGenerationDialog
        open={generateDialogOpen}
        onClose={handleGenerateDialogClose}
        templates={reports.templates}
        onGenerate={handleGenerateReport}
      />

      <ViewReportDialog
        report={selectedReport}
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
      />
    </Box>
  );
};

export default Reports;
