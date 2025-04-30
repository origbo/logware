import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  LinearProgress,
  Avatar
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Mock API call for admin dashboard data
const fetchAdminDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        systemSummary: {
          totalUsers: 145,
          activeIntegrations: 9,
          criticalAlerts: 3,
          systemHealth: 97
        },
        resourceUsage: {
          cpu: 42,
          memory: 58,
          disk: 63,
          network: 35
        },
        userActivity: [
          { time: '00:00', active: 12 },
          { time: '04:00', active: 8 },
          { time: '08:00', active: 27 },
          { time: '12:00', active: 45 },
          { time: '16:00', active: 53 },
          { time: '20:00', active: 31 },
          { time: '24:00', active: 19 }
        ],
        alertsTrend: [
          { date: 'Jan', count: 65 },
          { date: 'Feb', count: 59 },
          { date: 'Mar', count: 80 },
          { date: 'Apr', count: 81 },
          { date: 'May', count: 56 },
          { date: 'Jun', count: 55 },
          { date: 'Jul', count: 40 }
        ],
        integrationStatus: [
          { name: 'OSSIM', status: 'active', health: 100 },
          { name: 'Wireshark', status: 'active', health: 100 },
          { name: 'Snort', status: 'active', health: 92 },
          { name: 'Zeek', status: 'active', health: 100 },
          { name: 'Nagios', status: 'active', health: 100 },
          { name: 'Graylog', status: 'active', health: 100 },
          { name: 'ELK Stack', status: 'active', health: 95 },
          { name: 'Splunk', status: 'inactive', health: 0 },
          { name: 'Grafana', status: 'active', health: 100 },
          { name: 'Prometheus', status: 'active', health: 100 },
          { name: 'Tableau', status: 'active', health: 98 }
        ],
        recentUsers: [
          { id: 'u1', username: 'admin', role: 'admin', lastActive: '2 minutes ago' },
          { id: 'u2', username: 'john.doe', role: 'user', lastActive: '15 minutes ago' },
          { id: 'u3', username: 'sarah.smith', role: 'user', lastActive: '37 minutes ago' },
          { id: 'u4', username: 'mike.johnson', role: 'user', lastActive: '1 hour ago' }
        ],
        securityEvents: {
          total: 156,
          byType: [
            { name: 'Authentication', value: 42 },
            { name: 'Network', value: 38 },
            { name: 'System', value: 29 },
            { name: 'Application', value: 47 }
          ]
        },
        systemUpdates: [
          { id: 1, component: 'Logware Core', status: 'current', version: 'v1.2.3' },
          { id: 2, component: 'Security Definitions', status: 'update-available', version: 'v2.1.0' },
          { id: 3, component: 'Reporting Engine', status: 'current', version: 'v3.0.5' }
        ]
      });
    }, 1000);
  });
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const handleMenuOpen = (event, cardId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCard(cardId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCard(null);
  };
  
  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Chart colors
  const COLORS = ['#7c3aed', '#2563eb', '#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={loadDashboardData}
          variant="outlined"
          color="secondary"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Total Users</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {dashboardData.systemSummary.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {dashboardData.recentUsers.length} active in last hour
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IntegrationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Active Integrations</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1, color: 'primary.main' }}>
              {dashboardData.systemSummary.activeIntegrations}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {dashboardData.integrationStatus.filter(i => i.status === 'inactive').length} inactive
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Critical Alerts</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1, color: 'error.main' }}>
              {dashboardData.systemSummary.criticalAlerts}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Requires immediate attention
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SecurityIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">System Health</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1, color: 'success.main' }}>
              {dashboardData.systemSummary.systemHealth}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={dashboardData.systemSummary.systemHealth} 
              color={dashboardData.systemSummary.systemHealth > 90 ? "success" : dashboardData.systemSummary.systemHealth > 70 ? "warning" : "error"}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Resource Usage */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">System Resource Usage</Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'resources')}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">CPU Usage</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{dashboardData.resourceUsage.cpu}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.resourceUsage.cpu} 
                    color={dashboardData.resourceUsage.cpu > 80 ? "error" : dashboardData.resourceUsage.cpu > 60 ? "warning" : "primary"}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body2">Memory Usage</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{dashboardData.resourceUsage.memory}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.resourceUsage.memory} 
                    color={dashboardData.resourceUsage.memory > 80 ? "error" : dashboardData.resourceUsage.memory > 60 ? "warning" : "secondary"}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="body2">Disk Usage</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{dashboardData.resourceUsage.disk}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.resourceUsage.disk} 
                    color={dashboardData.resourceUsage.disk > 80 ? "error" : dashboardData.resourceUsage.disk > 60 ? "warning" : "info"}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NetworkIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">Network Usage</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{dashboardData.resourceUsage.network}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.resourceUsage.network} 
                    color={dashboardData.resourceUsage.network > 80 ? "error" : dashboardData.resourceUsage.network > 60 ? "warning" : "success"}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">User Activity</Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'user-activity')}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={dashboardData.userActivity}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="active" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Alerts Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Alerts Trend</Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'alerts-trend')}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData.alertsTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Security Events by Type */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Security Events</Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'security-events')}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" color="secondary.main">
                {dashboardData.securityEvents.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                events in last 24hrs
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dashboardData.securityEvents.byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.securityEvents.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <CardHeader 
              title="Integration Status" 
              action={
                <Button size="small" color="secondary">Manage</Button>
              }
            />
            <Divider />
            <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
              {dashboardData.integrationStatus.map((integration, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    secondaryAction={
                      <Chip 
                        label={integration.status} 
                        size="small"
                        color={integration.status === 'active' ? 'success' : 'error'}
                      />
                    }
                  >
                    <ListItemIcon>
                      <IntegrationIcon color={integration.status === 'active' ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={integration.name}
                      secondary={
                        integration.status === 'active' ? 
                        `Health: ${integration.health}%` : 
                        'Not connected'
                      }
                    />
                  </ListItem>
                  {index < dashboardData.integrationStatus.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Recent Users */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <CardHeader 
              title="Recent Users" 
              action={
                <Button size="small" color="secondary">View All</Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {dashboardData.recentUsers.map((user, index) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={user.username}
                      secondary={
                        <>
                          <Chip 
                            label={user.role} 
                            size="small"
                            color={user.role === 'admin' ? 'secondary' : 'primary'}
                            sx={{ mr: 1, height: 20 }}
                          />
                          {user.lastActive}
                        </>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentUsers.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* System Updates */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <CardHeader 
              title="System Updates" 
              action={
                <Button size="small" color="secondary">Update All</Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {dashboardData.systemUpdates.map((update, index) => (
                <React.Fragment key={update.id}>
                  <ListItem
                    secondaryAction={
                      update.status === 'update-available' ? (
                        <Button size="small" color="secondary">Update</Button>
                      ) : (
                        <Chip 
                          label="Current" 
                          size="small"
                          color="success"
                        />
                      )
                    }
                  >
                    <ListItemText
                      primary={update.component}
                      secondary={`Version: ${update.version}`}
                    />
                  </ListItem>
                  {index < dashboardData.systemUpdates.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
        <MenuItem onClick={handleMenuClose}>Configure</MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;
