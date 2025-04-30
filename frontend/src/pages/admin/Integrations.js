import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Card, CardContent, 
  CardActions, Chip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select, MenuItem, Switch, FormControlLabel,
  IconButton, Tooltip, Divider, List, ListItem, 
  ListItemText, Alert, Tabs, Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Mock API call for integrations data
const fetchIntegrations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'ossim-1',
          name: 'OSSIM Primary',
          type: 'OSSIM',
          status: 'active',
          endpoint: 'https://ossim.example.com/api',
          lastSync: new Date(Date.now() - 3600000), // 1 hour ago
          healthStatus: 'healthy',
          features: ['threat detection', 'correlation', 'asset discovery'],
          configuration: {
            apiKey: '************',
            pollingInterval: '5 minutes',
            retentionPeriod: '30 days'
          }
        },
        {
          id: 'wireshark-1',
          name: 'Wireshark Network Analyzer',
          type: 'Wireshark',
          status: 'active',
          endpoint: 'https://wireshark.example.com/api',
          lastSync: new Date(Date.now() - 7200000), // 2 hours ago
          healthStatus: 'healthy',
          features: ['packet capture', 'traffic analysis', 'protocol inspection'],
          configuration: {
            apiKey: '************',
            pollingInterval: '10 minutes',
            retentionPeriod: '7 days'
          }
        },
        {
          id: 'snort-1',
          name: 'Snort IDS',
          type: 'Snort',
          status: 'active',
          endpoint: 'https://snort.example.com/api',
          lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
          healthStatus: 'warning',
          features: ['intrusion detection', 'traffic analysis', 'rule-based alerting'],
          configuration: {
            apiKey: '************',
            pollingInterval: '2 minutes',
            retentionPeriod: '14 days'
          }
        },
        {
          id: 'zeek-1',
          name: 'Zeek Network Monitor',
          type: 'Zeek',
          status: 'inactive',
          endpoint: 'https://zeek.example.com/api',
          lastSync: new Date(Date.now() - 259200000), // 3 days ago
          healthStatus: 'error',
          features: ['network analysis', 'protocol logging', 'security monitoring'],
          configuration: {
            apiKey: '************',
            pollingInterval: '5 minutes',
            retentionPeriod: '21 days'
          }
        },
        {
          id: 'grafana-1',
          name: 'Grafana Dashboards',
          type: 'Grafana',
          status: 'active',
          endpoint: 'https://grafana.example.com/api',
          lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
          healthStatus: 'healthy',
          features: ['visualization', 'dashboards', 'alerts'],
          configuration: {
            apiKey: '************',
            pollingInterval: 'N/A',
            retentionPeriod: 'N/A'
          }
        },
        {
          id: 'elk-1',
          name: 'ELK Stack',
          type: 'ELK',
          status: 'active',
          endpoint: 'https://elk.example.com/api',
          lastSync: new Date(Date.now() - 2700000), // 45 minutes ago
          healthStatus: 'healthy',
          features: ['log analysis', 'visualization', 'search'],
          configuration: {
            apiKey: '************',
            pollingInterval: '15 minutes',
            retentionPeriod: '90 days'
          }
        }
      ]);
    }, 1000);
  });
};

// Integration form dialog
const IntegrationFormDialog = ({ open, onClose, integration, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    endpoint: '',
    apiKey: '',
    pollingInterval: '5 minutes',
    retentionPeriod: '30 days',
    features: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name || '',
        type: integration.type || '',
        endpoint: integration.endpoint || '',
        apiKey: '************', // For security, we don't show the actual API key
        pollingInterval: integration.configuration?.pollingInterval || '5 minutes',
        retentionPeriod: integration.configuration?.retentionPeriod || '30 days',
        features: integration.features || []
      });
    } else {
      // Reset form for new integration
      setFormData({
        name: '',
        type: '',
        endpoint: '',
        apiKey: '',
        pollingInterval: '5 minutes',
        retentionPeriod: '30 days',
        features: []
      });
    }
  }, [integration, open]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.type || !formData.endpoint.trim()) {
      setError('Name, type, and endpoint are required');
      return;
    }
    
    setLoading(true);
    
    // Prepare configuration data
    const integrationData = {
      ...formData,
      configuration: {
        apiKey: formData.apiKey,
        pollingInterval: formData.pollingInterval,
        retentionPeriod: formData.retentionPeriod
      }
    };
    
    // Remove apiKey from the top level
    delete integrationData.apiKey;
    
    // Simulate API call
    setTimeout(() => {
      onSave(integrationData);
      setLoading(false);
      onClose();
    }, 1000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{integration ? 'Edit Integration' : 'Add New Integration'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Integration Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="type-label">Integration Type</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Integration Type"
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value="OSSIM">OSSIM</MenuItem>
                <MenuItem value="Wireshark">Wireshark</MenuItem>
                <MenuItem value="Snort">Snort</MenuItem>
                <MenuItem value="Zeek">Zeek</MenuItem>
                <MenuItem value="Nagios">Nagios</MenuItem>
                <MenuItem value="Graylog">Graylog</MenuItem>
                <MenuItem value="ELK">ELK Stack</MenuItem>
                <MenuItem value="Splunk">Splunk</MenuItem>
                <MenuItem value="Grafana">Grafana</MenuItem>
                <MenuItem value="Prometheus">Prometheus</MenuItem>
                <MenuItem value="Tableau">Tableau</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="endpoint"
              label="API Endpoint URL"
              value={formData.endpoint}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="apiKey"
              label="API Key"
              type="password"
              value={formData.apiKey}
              onChange={handleInputChange}
              fullWidth
              required={!integration}
              helperText={integration ? "Leave blank to keep current API key" : ""}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="pollingInterval"
              label="Polling Interval"
              value={formData.pollingInterval}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="retentionPeriod"
              label="Data Retention Period"
              value={formData.retentionPeriod}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="secondary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (integration ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Test connection dialog
const TestConnectionDialog = ({ open, onClose, integration }) => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const handleTestConnection = () => {
    if (!integration) return;
    
    setLoading(true);
    setTestResult(null);
    
    // Simulate API call
    setTimeout(() => {
      // Random success/failure for demonstration
      const success = Math.random() > 0.3;
      
      setTestResult({
        success,
        message: success ? 'Connection successful' : 'Connection failed',
        details: success 
          ? {
              responseTime: `${Math.floor(Math.random() * 500) + 100}ms`,
              apiVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
              features: ['logging', 'alerting', 'reporting']
            }
          : {
              error: ['Connection timeout', 'Authentication failed', 'API endpoint not found'][Math.floor(Math.random() * 3)],
              errorCode: ['E001', 'E002', 'E003'][Math.floor(Math.random() * 3)]
            }
      });
      
      setLoading(false);
    }, 2000);
  };
  
  useEffect(() => {
    if (open && integration) {
      handleTestConnection();
    }
  }, [open, integration]);
  
  if (!integration) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Test Connection: {integration.name}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Testing connection to {integration.endpoint}...</Typography>
          </Box>
        ) : testResult ? (
          <Box sx={{ py: 2 }}>
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testResult.message}
            </Alert>
            
            {testResult.success ? (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Response Time" 
                    secondary={testResult.details.responseTime} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="API Version" 
                    secondary={testResult.details.apiVersion} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Available Features" 
                    secondary={testResult.details.features.join(', ')} 
                  />
                </ListItem>
              </List>
            ) : (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Error" 
                    secondary={testResult.details.error} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Error Code" 
                    secondary={testResult.details.errorCode} 
                  />
                </ListItem>
              </List>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          onClick={handleTestConnection} 
          variant="contained" 
          color="secondary"
          disabled={loading}
        >
          Test Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  
  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await fetchIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadIntegrations();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAddIntegration = () => {
    setSelectedIntegration(null);
    setFormDialogOpen(true);
  };
  
  const handleEditIntegration = (integration) => {
    setSelectedIntegration(integration);
    setFormDialogOpen(true);
  };
  
  const handleTestIntegration = (integration) => {
    setSelectedIntegration(integration);
    setTestDialogOpen(true);
  };
  
  const handleSaveIntegration = (integrationData) => {
    if (selectedIntegration) {
      // Update existing integration
      setIntegrations(prevIntegrations => prevIntegrations.map(integration => 
        integration.id === selectedIntegration.id 
          ? { 
              ...integration, 
              ...integrationData,
              lastSync: integration.lastSync, // Preserve lastSync
              healthStatus: integration.healthStatus, // Preserve healthStatus
              status: integration.status // Preserve status
            } 
          : integration
      ));
    } else {
      // Add new integration
      const newIntegration = {
        id: `${integrationData.type.toLowerCase()}-${Date.now()}`,
        ...integrationData,
        status: 'inactive', // New integrations start as inactive
        lastSync: null,
        healthStatus: 'unknown'
      };
      setIntegrations(prevIntegrations => [...prevIntegrations, newIntegration]);
    }
  };
  
  const handleToggleStatus = (integrationId) => {
    setIntegrations(prevIntegrations => prevIntegrations.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' } 
        : integration
    ));
  };
  
  const handleSyncIntegration = (integrationId) => {
    // Simulate sync operation
    setIntegrations(prevIntegrations => prevIntegrations.map(integration => 
      integration.id === integrationId 
        ? { ...integration, lastSync: new Date() } 
        : integration
    ));
  };
  
  const handleDeleteIntegration = (integrationId) => {
    setIntegrations(prevIntegrations => prevIntegrations.filter(integration => integration.id !== integrationId));
  };
  
  // Filter integrations based on tab
  const getFilteredIntegrations = () => {
    switch (tabValue) {
      case 0: // All
        return integrations;
      case 1: // Active
        return integrations.filter(integration => integration.status === 'active');
      case 2: // Inactive
        return integrations.filter(integration => integration.status === 'inactive');
      case 3: // Issues
        return integrations.filter(integration => integration.healthStatus === 'warning' || integration.healthStatus === 'error');
      default:
        return integrations;
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };
  
  const renderIntegrationCards = () => {
    const filteredIntegrations = getFilteredIntegrations();
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (filteredIntegrations.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="text.secondary" gutterBottom>No integrations found</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />}
            onClick={handleAddIntegration}
            sx={{ mt: 2 }}
          >
            Add Integration
          </Button>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {filteredIntegrations.map(integration => (
          <Grid item xs={12} sm={6} lg={4} key={integration.id}>
            <Card elevation={0} sx={{ 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
              height: '100%',
              border: integration.healthStatus === 'error' 
                ? '1px solid #d32f2f' 
                : integration.healthStatus === 'warning'
                  ? '1px solid #ed6c02'
                  : '1px solid rgba(0, 0, 0, 0.12)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{integration.name}</Typography>
                  <Tooltip title={`Status: ${integration.healthStatus}`}>
                    {getStatusIcon(integration.healthStatus)}
                  </Tooltip>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={integration.type} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={integration.status === 'active' ? 'Active' : 'Inactive'} 
                    color={integration.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {integration.endpoint}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Last Sync:</strong> {integration.lastSync ? integration.lastSync.toLocaleString() : 'Never'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Features:</strong> {integration.features.join(', ')}
                </Typography>
              </CardContent>
              <CardActions>
                <Tooltip title={integration.status === 'active' ? 'Deactivate' : 'Activate'}>
                  <IconButton 
                    color={integration.status === 'active' ? 'error' : 'success'}
                    onClick={() => handleToggleStatus(integration.id)}
                  >
                    {integration.status === 'active' ? <StopIcon /> : <StartIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sync Now">
                  <IconButton 
                    color="primary"
                    onClick={() => handleSyncIntegration(integration.id)}
                    disabled={integration.status !== 'active'}
                  >
                    <SyncIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Test Connection">
                  <IconButton 
                    color="info"
                    onClick={() => handleTestIntegration(integration)}
                  >
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton 
                    color="secondary"
                    onClick={() => handleEditIntegration(integration)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteIntegration(integration.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
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
          Integrations
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadIntegrations}
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="secondary"
            onClick={handleAddIntegration}
          >
            Add Integration
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="integration tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Inactive" />
          <Tab label="Issues" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {renderIntegrationCards()}
        </Box>
      </Paper>
      
      {/* Dialogs */}
      <IntegrationFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        integration={selectedIntegration}
        onSave={handleSaveIntegration}
      />
      
      <TestConnectionDialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        integration={selectedIntegration}
      />
    </Box>
  );
};

export default Integrations;
