import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Card, CardContent,
  CardHeader, TextField, Switch, FormControlLabel, Divider,
  List, ListItem, ListItemText, Snackbar, Alert, CircularProgress,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Mock API call for system settings
const fetchSystemSettings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        general: {
          systemName: 'Logware',
          adminEmail: 'admin@example.com',
          dataRetentionPeriod: '90 days',
          maxLogSize: '10GB',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h'
        },
        security: {
          passwordMinLength: 8,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: true,
          passwordExpiryDays: 90,
          maxLoginAttempts: 5,
          sessionTimeout: 30,
          enableTwoFactor: true,
          allowedIpRanges: ['192.168.0.0/24', '10.0.0.0/8']
        },
        notifications: {
          enableEmailNotifications: true,
          enableSystemNotifications: true,
          alertNotificationsEnabled: true,
          systemUpdatesNotificationsEnabled: true,
          dailySummaryEnabled: true,
          emailSender: 'notifications@logware.example.com'
        },
        backup: {
          automaticBackupsEnabled: true,
          backupFrequency: 'daily',
          backupTime: '02:00',
          backupRetention: '30 days',
          backupLocation: '/var/backups/logware',
          lastBackup: new Date(Date.now() - 86400000) // 1 day ago
        },
        maintenance: {
          maintenanceMode: false,
          maintenanceScheduled: false,
          maintenanceStartTime: null,
          maintenanceEndTime: null,
          maintenanceMessage: 'System is undergoing scheduled maintenance. Please try again later.'
        }
      });
    }, 1000);
  });
};

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load system settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (section, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [key]: value
      }
    }));
  };
  
  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    }, 1500);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  if (loading && !settings) {
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
          System Settings
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadSettings}
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            color="secondary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<BackupIcon />} label="Backup" />
          <Tab icon={<StorageIcon />} label="Maintenance" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* General Settings Tab */}
          {tabValue === 0 && settings && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="System Name"
                  value={settings.general.systemName}
                  onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Admin Email"
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Data Retention Period"
                  value={settings.general.dataRetentionPeriod}
                  onChange={(e) => handleInputChange('general', 'dataRetentionPeriod', e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText="How long to keep log data before archiving"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Maximum Log Size"
                  value={settings.general.maxLogSize}
                  onChange={(e) => handleInputChange('general', 'maxLogSize', e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText="Maximum size for individual log files"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="timezone-label">Timezone</InputLabel>
                  <Select
                    labelId="timezone-label"
                    value={settings.general.timezone}
                    onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                    label="Timezone"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="GMT">GMT</MenuItem>
                    <MenuItem value="EST">EST</MenuItem>
                    <MenuItem value="CST">CST</MenuItem>
                    <MenuItem value="MST">MST</MenuItem>
                    <MenuItem value="PST">PST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="date-format-label">Date Format</InputLabel>
                  <Select
                    labelId="date-format-label"
                    value={settings.general.dateFormat}
                    onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="time-format-label">Time Format</InputLabel>
                  <Select
                    labelId="time-format-label"
                    value={settings.general.timeFormat}
                    onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
                    label="Time Format"
                  >
                    <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          {/* Security Settings Tab */}
          {tabValue === 1 && settings && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Password Policy" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Minimum Password Length"
                          type="number"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            inputProps: { min: 6, max: 20 }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Password Expiry (days)"
                          type="number"
                          value={settings.security.passwordExpiryDays}
                          onChange={(e) => handleInputChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            inputProps: { min: 0, max: 365 }
                          }}
                          helperText="0 for never expire"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.security.passwordRequireNumbers}
                              onChange={(e) => handleInputChange('security', 'passwordRequireNumbers', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Require Numbers"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.security.passwordRequireSpecialChars}
                              onChange={(e) => handleInputChange('security', 'passwordRequireSpecialChars', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Require Special Characters"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Access Control" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Max Login Attempts"
                          type="number"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            inputProps: { min: 1, max: 10 }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Session Timeout (minutes)"
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            inputProps: { min: 5, max: 1440 }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.security.enableTwoFactor}
                              onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Enable Two-Factor Authentication"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="IP Restrictions" 
                    action={
                      <Button 
                        variant="text" 
                        color="secondary" 
                        size="small"
                      >
                        Add IP Range
                      </Button>
                    }
                  />
                  <Divider />
                  <List dense>
                    {settings.security.allowedIpRanges.map((ipRange, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={ipRange} 
                          secondary={index === 0 ? "Internal network" : "VPN network"} 
                        />
                        <Button 
                          variant="text" 
                          color="error" 
                          size="small"
                        >
                          Remove
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Notifications Settings Tab */}
          {tabValue === 2 && settings && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Email Notifications" />
                  <Divider />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enableEmailNotifications}
                          onChange={(e) => handleInputChange('notifications', 'enableEmailNotifications', e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="Enable Email Notifications"
                    />
                    
                    <TextField
                      label="Email Sender Address"
                      value={settings.notifications.emailSender}
                      onChange={(e) => handleInputChange('notifications', 'emailSender', e.target.value)}
                      fullWidth
                      margin="normal"
                      disabled={!settings.notifications.enableEmailNotifications}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        disabled={!settings.notifications.enableEmailNotifications}
                      >
                        Test Email Connection
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="System Notifications" />
                  <Divider />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enableSystemNotifications}
                          onChange={(e) => handleInputChange('notifications', 'enableSystemNotifications', e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="Enable System Notifications"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.alertNotificationsEnabled}
                          onChange={(e) => handleInputChange('notifications', 'alertNotificationsEnabled', e.target.checked)}
                          color="secondary"
                          disabled={!settings.notifications.enableSystemNotifications}
                        />
                      }
                      label="Security Alert Notifications"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.systemUpdatesNotificationsEnabled}
                          onChange={(e) => handleInputChange('notifications', 'systemUpdatesNotificationsEnabled', e.target.checked)}
                          color="secondary"
                          disabled={!settings.notifications.enableSystemNotifications}
                        />
                      }
                      label="System Update Notifications"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.dailySummaryEnabled}
                          onChange={(e) => handleInputChange('notifications', 'dailySummaryEnabled', e.target.checked)}
                          color="secondary"
                          disabled={!settings.notifications.enableSystemNotifications}
                        />
                      }
                      label="Daily Summary Notifications"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Backup Settings Tab */}
          {tabValue === 3 && settings && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Backup Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Automatic Backups" 
                    action={
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        size="small"
                        startIcon={<BackupIcon />}
                      >
                        Backup Now
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.backup.automaticBackupsEnabled}
                              onChange={(e) => handleInputChange('backup', 'automaticBackupsEnabled', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Enable Automatic Backups"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <FormControl 
                          fullWidth 
                          margin="normal"
                          disabled={!settings.backup.automaticBackupsEnabled}
                        >
                          <InputLabel id="backup-frequency-label">Backup Frequency</InputLabel>
                          <Select
                            labelId="backup-frequency-label"
                            value={settings.backup.backupFrequency}
                            onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
                            label="Backup Frequency"
                          >
                            <MenuItem value="hourly">Hourly</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Backup Time"
                          type="time"
                          value={settings.backup.backupTime}
                          onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                          disabled={!settings.backup.automaticBackupsEnabled || settings.backup.backupFrequency === 'hourly'}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Backup Retention"
                          value={settings.backup.backupRetention}
                          onChange={(e) => handleInputChange('backup', 'backupRetention', e.target.value)}
                          fullWidth
                          margin="normal"
                          disabled={!settings.backup.automaticBackupsEnabled}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Backup Location"
                          value={settings.backup.backupLocation}
                          onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
                          fullWidth
                          margin="normal"
                          disabled={!settings.backup.automaticBackupsEnabled}
                          helperText="Directory path for storing backups"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="Backup History" />
                  <Divider />
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Last successful backup" 
                        secondary={settings.backup.lastBackup ? settings.backup.lastBackup.toLocaleString() : 'None'} 
                      />
                      <Button 
                        variant="text" 
                        color="secondary" 
                        size="small"
                      >
                        Restore
                      </Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Weekly backup" 
                        secondary="2025-04-14 02:00:00" 
                      />
                      <Button 
                        variant="text" 
                        color="secondary" 
                        size="small"
                      >
                        Restore
                      </Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Monthly backup" 
                        secondary="2025-04-01 02:00:00" 
                      />
                      <Button 
                        variant="text" 
                        color="secondary" 
                        size="small"
                      >
                        Restore
                      </Button>
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Maintenance Settings Tab */}
          {tabValue === 4 && settings && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Maintenance Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="Maintenance Mode" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Alert 
                          severity={settings.maintenance.maintenanceMode ? "warning" : "info"}
                          sx={{ mb: 2 }}
                        >
                          {settings.maintenance.maintenanceMode 
                            ? "Maintenance mode is currently ACTIVE. Only administrators can access the system."
                            : "Maintenance mode is inactive. All users can access the system."
                          }
                        </Alert>
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.maintenance.maintenanceMode}
                              onChange={(e) => handleInputChange('maintenance', 'maintenanceMode', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Enable Maintenance Mode"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Maintenance Message"
                          value={settings.maintenance.maintenanceMessage}
                          onChange={(e) => handleInputChange('maintenance', 'maintenanceMessage', e.target.value)}
                          fullWidth
                          margin="normal"
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="Scheduled Maintenance" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.maintenance.maintenanceScheduled}
                              onChange={(e) => handleInputChange('maintenance', 'maintenanceScheduled', e.target.checked)}
                              color="secondary"
                            />
                          }
                          label="Schedule Maintenance"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Start Time"
                          type="datetime-local"
                          value={settings.maintenance.maintenanceStartTime || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => handleInputChange('maintenance', 'maintenanceStartTime', e.target.value)}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={!settings.maintenance.maintenanceScheduled}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="End Time"
                          type="datetime-local"
                          value={settings.maintenance.maintenanceEndTime || new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                          onChange={(e) => handleInputChange('maintenance', 'maintenanceEndTime', e.target.value)}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={!settings.maintenance.maintenanceScheduled}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="System Cleanup" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom>
                          Run cleanup tasks to optimize system performance
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                        >
                          Clear Cache
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                        >
                          Optimize Database
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                        >
                          Purge Old Logs
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;
