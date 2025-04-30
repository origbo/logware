import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Avatar,
  Divider, Switch, FormControlLabel, Alert, Snackbar,
  CircularProgress, Card, CardContent, List, ListItem, ListItemText,
  ListItemIcon, IconButton, FormGroup, Chip, Tab, Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Mock API call to get user activity
const fetchUserActivity = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'activity-1',
          action: 'Login',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          details: 'Login from 192.168.1.100 (Chrome on Windows)'
        },
        {
          id: 'activity-2',
          action: 'Generate Report',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          details: 'Generated "Security Incident Summary" report'
        },
        {
          id: 'activity-3',
          action: 'Update Profile',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          details: 'Updated profile information'
        },
        {
          id: 'activity-4',
          action: 'Reset Password',
          timestamp: new Date(Date.now() - 604800000), // 7 days ago
          details: 'Password reset requested and completed'
        },
        {
          id: 'activity-5',
          action: 'Login',
          timestamp: new Date(Date.now() - 1209600000), // 14 days ago
          details: 'Login from 203.0.113.45 (Firefox on Mac)'
        }
      ]);
    }, 1000);
  });
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    theme: user?.preferences?.theme || 'light',
    notifications: user?.preferences?.notifications !== false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    // Load user activity
    const loadActivity = async () => {
      setActivityLoading(true);
      try {
        const activities = await fetchUserActivity();
        setUserActivity(activities);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };
    
    loadActivity();
    
    // Update form data if user data changes
    if (user) {
      setFormData({
        ...formData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        theme: user.preferences?.theme || 'light',
        notifications: user.preferences?.notifications !== false
      });
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'notifications') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear password error when user starts typing
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      setPasswordError('');
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      // Validate password fields if the user is trying to change password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          setPasswordError('Current password is required');
          setLoading(false);
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setPasswordError('New passwords do not match');
          setLoading(false);
          return;
        }
        
        if (formData.newPassword.length < 8) {
          setPasswordError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
      }
      
      // Prepare data for the API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        preferences: {
          theme: formData.theme,
          notifications: formData.notifications
        }
      };
      
      // If changing password, add password fields
      if (formData.newPassword && formData.currentPassword) {
        userData.currentPassword = formData.currentPassword;
        userData.newPassword = formData.newPassword;
      }
      
      // In a real app, this would call the updateProfile method from the auth context
      // For now, simulate a successful update
      setTimeout(() => {
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setSaveSuccess(true);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };
  
  const getInitials = () => {
    let initials = 'U';
    if (formData.firstName && formData.lastName) {
      initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
    } else if (formData.username) {
      initials = formData.username.charAt(0).toUpperCase();
    }
    return initials;
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* User profile card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {formData.firstName && formData.lastName 
                  ? `${formData.firstName} ${formData.lastName}` 
                  : formData.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formData.email}
              </Typography>
              
              <Chip 
                label={user?.role === 'admin' ? 'Administrator' : 'User'} 
                color={user?.role === 'admin' ? 'secondary' : 'primary'} 
                sx={{ mt: 1 }}
              />
              
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
              >
                Change Avatar
              </Button>
            </Box>
            
            <Divider />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Last Login" 
                  secondary={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Account Created" 
                  secondary={user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Profile form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<PersonIcon />} label="Personal Information" />
              <Tab icon={<SettingsIcon />} label="Preferences" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<HistoryIcon />} label="Activity Log" />
            </Tabs>
            
            {/* Personal Information Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled // Email changes should go through a verification process
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Preferences Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Theme
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={formData.theme === 'dark'} 
                                onChange={(e) => setFormData({
                                  ...formData,
                                  theme: e.target.checked ? 'dark' : 'light'
                                })}
                                color="primary"
                              />
                            }
                            label="Dark Mode"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Notifications
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={formData.notifications} 
                                onChange={handleInputChange}
                                name="notifications"
                                color="primary"
                              />
                            }
                            label="Enable Notifications"
                          />
                          <Typography variant="body2" color="text.secondary">
                            Receive notifications about alerts, reports, and system updates
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          Save Preferences
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </FormGroup>
              </Box>
            )}
            
            {/* Security Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Security
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Password"
                      name="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  {passwordError && (
                    <Grid item xs={12}>
                      <Alert severity="error">{passwordError}</Alert>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        Update Password
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Activity Log Tab */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Log
                </Typography>
                
                {activityLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {userActivity.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <HistoryIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.action}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {activity.timestamp.toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                  {activity.details}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
