import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Tabs, Tab, Button, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import moment from 'moment';

// Workflow selection dialog component
const WorkflowDialog = ({ open, onClose, onStart, incidentId, templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!selectedTemplate) {
      setError('Please select a workflow template');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onStart(selectedTemplate);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start Response Workflow</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Workflow Template</InputLabel>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            label="Select Workflow Template"
          >
            {templates.map(template => (
              <MenuItem key={template._id} value={template._id}>
                {template.name} - {template.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleStart} 
          variant="contained" 
          color="primary"
          disabled={loading || !selectedTemplate}
        >
          Start Workflow
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Incident detail dialog component
const IncidentDetailDialog = ({ open, onClose, incident, workflows }) => {
  const theme = useTheme();
  
  if (!incident) return null;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.error.light;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return theme.palette.info.main;
      case 'investigating': return theme.palette.warning.main;
      case 'contained': return theme.palette.success.light;
      case 'resolved': return theme.palette.success.main;
      case 'closed': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Incident Details
        <Typography variant="subtitle2" color="textSecondary">
          ID: {incident._id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>{incident.title}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={incident.severity.toUpperCase()} 
              sx={{ bgcolor: getSeverityColor(incident.severity), color: 'white' }}
            />
            <Chip 
              label={incident.status.toUpperCase()} 
              sx={{ bgcolor: getStatusColor(incident.status), color: 'white' }}
            />
            <Chip label={incident.type.replace('_', ' ').toUpperCase()} />
          </Box>
          <Typography variant="body1" paragraph>
            {incident.description}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>Affected Systems</Typography>
        <Box sx={{ mb: 3 }}>
          {incident.affectedSystems && incident.affectedSystems.length > 0 ? (
            incident.affectedSystems.map((system, idx) => (
              <Chip key={idx} label={system} sx={{ mr: 1, mb: 1 }} />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">None specified</Typography>
          )}
        </Box>

        <Typography variant="h6" gutterBottom>Timeline</Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incident.timeline && incident.timeline.map((event, idx) => (
                <TableRow key={idx}>
                  <TableCell>{moment(event.timestamp).format('MM/DD/YYYY HH:mm:ss')}</TableCell>
                  <TableCell>{event.event}</TableCell>
                  <TableCell>{event.user ? event.user : 'System'}</TableCell>
                  <TableCell>{event.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>Response Workflows</Typography>
        {workflows && workflows.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Template</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Current Step</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow._id}>
                    <TableCell>{workflow.templateId.name}</TableCell>
                    <TableCell>{moment(workflow.startedAt).format('MM/DD/YYYY HH:mm:ss')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={workflow.status.toUpperCase().replace('_', ' ')}
                        color={
                          workflow.status === 'completed' ? 'success' :
                          workflow.status === 'failed' ? 'error' :
                          workflow.status === 'in_progress' ? 'primary' :
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {workflow.steps[workflow.currentStepIndex]?.name || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="textSecondary">No workflows have been executed</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const IncidentManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentWorkflows, setIncidentWorkflows] = useState([]);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build query parameters
      let queryParams = `limit=${rowsPerPage}&page=${page + 1}`;
      if (statusFilter !== 'all') queryParams += `&status=${statusFilter}`;
      if (severityFilter !== 'all') queryParams += `&severity=${severityFilter}`;
      if (typeFilter !== 'all') queryParams += `&type=${typeFilter}`;

      // Filter by tab value (open, investigating, resolved/closed)
      if (tabValue === 0) {
        queryParams += '&status=open';
      } else if (tabValue === 1) {
        queryParams += '&status=investigating,contained';
      } else if (tabValue === 2) {
        queryParams += '&status=resolved,closed';
      }

      const response = await axios.get(`/api/incidents?${queryParams}`);
      
      if (response.data.success) {
        setIncidents(response.data.incidents);
        setTotalCount(response.data.pagination.total);
      } else {
        setError('Failed to fetch incidents');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowTemplates = async () => {
    try {
      const response = await axios.get('/api/workflow-templates');
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (err) {
      console.error('Error fetching workflow templates:', err);
    }
  };

  const fetchIncidentWorkflows = async (incidentId) => {
    try {
      const response = await axios.get(`/api/incidents/${incidentId}/workflows`);
      if (response.data.success) {
        setIncidentWorkflows(response.data.workflows);
      } else {
        setIncidentWorkflows([]);
      }
    } catch (err) {
      console.error('Error fetching incident workflows:', err);
      setIncidentWorkflows([]);
    }
  };

  const handleViewIncident = async (incident) => {
    setSelectedIncident(incident);
    await fetchIncidentWorkflows(incident._id);
    setShowDetailDialog(true);
  };

  const handleStartWorkflow = (incident) => {
    setSelectedIncident(incident);
    setShowWorkflowDialog(true);
  };

  const executeWorkflow = async (templateId) => {
    try {
      const response = await axios.post(`/api/incidents/${selectedIncident._id}/workflows`, {
        templateId
      });
      
      if (response.data.success) {
        // Refresh incident workflows
        fetchIncidentWorkflows(selectedIncident._id);
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to start workflow');
      }
    } catch (err) {
      console.error('Error starting workflow:', err);
      throw err;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset pagination when changing tabs
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.error.light;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return theme.palette.info.main;
      case 'investigating': return theme.palette.warning.main;
      case 'contained': return theme.palette.success.light;
      case 'resolved': return theme.palette.success.main;
      case 'closed': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, rowsPerPage, tabValue, statusFilter, severityFilter, typeFilter]);

  useEffect(() => {
    fetchWorkflowTemplates();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Incident Management</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Open Incidents" />
          <Tab label="In Progress" />
          <Tab label="Resolved" />
        </Tabs>
      </Box>

      {/* Filter controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                label="Severity"
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="malware_detection">Malware Detection</MenuItem>
                <MenuItem value="unauthorized_access">Unauthorized Access</MenuItem>
                <MenuItem value="data_exfiltration">Data Exfiltration</MenuItem>
                <MenuItem value="network_intrusion">Network Intrusion</MenuItem>
                <MenuItem value="suspicious_activity">Suspicious Activity</MenuItem>
                <MenuItem value="compliance_violation">Compliance Violation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchIncidents}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Incidents table */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No incidents found</TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident._id}>
                  <TableCell>{incident._id.substring(0, 8)}...</TableCell>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>{incident.type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={incident.severity.toUpperCase()} 
                      size="small"
                      sx={{ 
                        bgcolor: getSeverityColor(incident.severity), 
                        color: 'white' 
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={incident.status.toUpperCase()} 
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(incident.status), 
                        color: 'white' 
                      }}
                    />
                  </TableCell>
                  <TableCell>{moment(incident.createdAt).format('MM/DD/YYYY HH:mm')}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewIncident(incident)}
                      title="View Details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleStartWorkflow(incident)}
                      title="Start Workflow"
                      disabled={incident.status === 'closed'}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Workflow selection dialog */}
      <WorkflowDialog
        open={showWorkflowDialog}
        onClose={() => setShowWorkflowDialog(false)}
        onStart={executeWorkflow}
        incidentId={selectedIncident?._id}
        templates={templates}
      />

      {/* Incident detail dialog */}
      <IncidentDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        incident={selectedIncident}
        workflows={incidentWorkflows}
      />
    </Box>
  );
};

export default IncidentManagement;
