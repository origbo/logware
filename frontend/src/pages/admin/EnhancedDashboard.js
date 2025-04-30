import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  SecurityOutlined, 
  NetworkCheck, 
  Storage, 
  Warning, 
  BarChart,
  Timeline,
  Print,
  FileDownload
} from '@mui/icons-material';
import axios from 'axios';
import SecurityMetricsCard from '../../components/dashboard/SecurityMetricsCard';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Tab panel component for dashboard tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnhancedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];
  
  // Mock data - in a real implementation, this would come from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setDashboardData({
            securityMetrics: {
              totalAlerts: { 
                value: 157, 
                previousValue: 142, 
                threshold: 200, 
                thresholdType: 'max',
                unit: ''
              },
              criticalAlerts: { 
                value: 12, 
                previousValue: 8, 
                threshold: 10, 
                thresholdType: 'max',
                unit: ''
              },
              meanTimeToDetect: { 
                value: 12.5, 
                previousValue: 15.8, 
                threshold: 15, 
                thresholdType: 'max',
                unit: 'min'
              },
              meanTimeToResolve: { 
                value: 74.2, 
                previousValue: 96.5, 
                threshold: 120, 
                thresholdType: 'max',
                unit: 'min'
              },
              securityScore: { 
                value: 84, 
                previousValue: 79, 
                threshold: 70, 
                thresholdType: 'min',
                unit: '%'
              },
              vulnerabilities: { 
                value: 23, 
                previousValue: 35, 
                threshold: 30, 
                thresholdType: 'max',
                unit: ''
              }
            },
            alertTrends: [
              { name: 'Mon', critical: 3, high: 7, medium: 12, low: 18 },
              { name: 'Tue', critical: 2, high: 9, medium: 16, low: 22 },
              { name: 'Wed', critical: 1, high: 5, medium: 14, low: 17 },
              { name: 'Thu', critical: 4, high: 8, medium: 10, low: 14 },
              { name: 'Fri', critical: 2, high: 6, medium: 13, low: 15 },
              { name: 'Sat', critical: 0, high: 4, medium: 8, low: 12 },
              { name: 'Sun', critical: 0, high: 3, medium: 7, low: 10 }
            ],
            alertCategories: [
              { name: 'Intrusion Attempts', value: 42 },
              { name: 'Malware', value: 28 },
              { name: 'Authentication', value: 37 },
              { name: 'Policy Violations', value: 24 },
              { name: 'System Issues', value: 26 }
            ],
            networkedDevices: [
              { name: 'Servers', secure: 42, vulnerable: 3, offline: 1 },
              { name: 'Workstations', secure: 78, vulnerable: 12, offline: 5 },
              { name: 'Network Devices', secure: 23, vulnerable: 2, offline: 1 },
              { name: 'IoT Devices', secure: 16, vulnerable: 8, offline: 3 },
              { name: 'Mobile Devices', secure: 34, vulnerable: 5, offline: 2 }
            ],
            topAttackers: [
              { ip: '203.0.113.42', count: 234, country: 'Russia' },
              { ip: '198.51.100.78', count: 187, country: 'China' },
              { ip: '2001:db8::ff00:42', count: 156, country: 'North Korea' },
              { ip: '192.0.2.123', count: 112, country: 'Ukraine' },
              { ip: '203.0.113.99', count: 98, country: 'Brazil' }
            ],
            vulnerabilityData: [
              { severity: 'Critical', count: 4, patched: 1, inProgress: 2, pending: 1 },
              { severity: 'High', count: 18, patched: 7, inProgress: 6, pending: 5 },
              { severity: 'Medium', count: 27, patched: 19, inProgress: 4, pending: 4 },
              { severity: 'Low', count: 35, patched: 28, inProgress: 5, pending: 2 }
            ]
          });
          setLoading(false);
        }, 1500); // Simulate loading time
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Enhanced Security Dashboard
        </Typography>
        
        <Box>
          <Button
            variant={timeRange === '24h' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleTimeRangeChange('24h')}
            sx={{ mr: 1 }}
          >
            24H
          </Button>
          <Button
            variant={timeRange === '7d' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleTimeRangeChange('7d')}
            sx={{ mr: 1 }}
          >
            7D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleTimeRangeChange('30d')}
            sx={{ mr: 2 }}
          >
            30D
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Key Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SecurityMetricsCard 
            title="Security Score" 
            value={dashboardData.securityMetrics.securityScore.value} 
            previousValue={dashboardData.securityMetrics.securityScore.previousValue}
            threshold={dashboardData.securityMetrics.securityScore.threshold}
            thresholdType={dashboardData.securityMetrics.securityScore.thresholdType}
            unit="%"
            description="Overall security posture based on alerts, vulnerabilities, and compliance"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SecurityMetricsCard 
            title="Critical Alerts" 
            value={dashboardData.securityMetrics.criticalAlerts.value} 
            previousValue={dashboardData.securityMetrics.criticalAlerts.previousValue}
            threshold={dashboardData.securityMetrics.criticalAlerts.threshold}
            thresholdType={dashboardData.securityMetrics.criticalAlerts.thresholdType}
            description="Number of active critical security alerts requiring immediate attention"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SecurityMetricsCard 
            title="Mean Time to Resolve" 
            value={dashboardData.securityMetrics.meanTimeToResolve.value} 
            previousValue={dashboardData.securityMetrics.meanTimeToResolve.previousValue}
            threshold={dashboardData.securityMetrics.meanTimeToResolve.threshold}
            thresholdType={dashboardData.securityMetrics.meanTimeToResolve.thresholdType}
            unit="min"
            description="Average time to resolve security incidents"
          />
        </Grid>
      </Grid>
      
      {/* Dashboard Tabs */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SecurityOutlined />} label="SECURITY OVERVIEW" />
          <Tab icon={<NetworkCheck />} label="NETWORK SECURITY" />
          <Tab icon={<Storage />} label="SYSTEM SECURITY" />
          <Tab icon={<Warning />} label="VULNERABILITIES" />
          <Tab icon={<BarChart />} label="COMPLIANCE" />
        </Tabs>
        
        {/* Security Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Alert Trends
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Security alerts by severity over time
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dashboardData.alertTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="critical" stackId="a" fill="#FF5252" name="Critical" />
                      <Bar dataKey="high" stackId="a" fill="#FF9800" name="High" />
                      <Bar dataKey="medium" stackId="a" fill="#FFC107" name="Medium" />
                      <Bar dataKey="low" stackId="a" fill="#4CAF50" name="Low" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Alert Categories
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Distribution of alerts by category
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.alertCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData.alertCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Attacking IP Addresses
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Most active sources of security threats
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
                    <Box sx={{ display: 'table-header-group', backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <Box sx={{ display: 'table-row' }}>
                        <Box sx={{ display: 'table-cell', p: 2, fontWeight: 'bold' }}>IP Address</Box>
                        <Box sx={{ display: 'table-cell', p: 2, fontWeight: 'bold' }}>Country</Box>
                        <Box sx={{ display: 'table-cell', p: 2, fontWeight: 'bold' }}>Attack Count</Box>
                        <Box sx={{ display: 'table-cell', p: 2, fontWeight: 'bold' }}>Action</Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'table-row-group' }}>
                      {dashboardData.topAttackers.map((attacker, index) => (
                        <Box key={index} sx={{ display: 'table-row', '&:nth-of-type(even)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                          <Box sx={{ display: 'table-cell', p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>{attacker.ip}</Box>
                          <Box sx={{ display: 'table-cell', p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>{attacker.country}</Box>
                          <Box sx={{ display: 'table-cell', p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>{attacker.count}</Box>
                          <Box sx={{ display: 'table-cell', p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                            <Button size="small" variant="outlined" color="error">Block</Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Network Security Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Network Device Security Status
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dashboardData.networkedDevices}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="secure" stackId="a" fill="#4CAF50" name="Secure" />
                      <Bar dataKey="vulnerable" stackId="a" fill="#FF9800" name="Vulnerable" />
                      <Bar dataKey="offline" stackId="a" fill="#9E9E9E" name="Offline" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Network Traffic Analysis
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: '00:00', normal: 682, suspicious: 23 },
                        { name: '04:00', normal: 542, suspicious: 42 },
                        { name: '08:00', normal: 901, suspicious: 35 },
                        { name: '12:00', normal: 1293, suspicious: 78 },
                        { name: '16:00', normal: 1348, suspicious: 51 },
                        { name: '20:00', normal: 1120, suspicious: 47 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="normal" stroke="#8884d8" name="Normal Traffic" />
                      <Line type="monotone" dataKey="suspicious" stroke="#ff7300" name="Suspicious Traffic" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* System Security Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6">System Security Content</Typography>
          <Typography variant="body1">Detailed system security information will appear here.</Typography>
        </TabPanel>
        
        {/* Vulnerabilities Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6">Vulnerability Management</Typography>
          <Typography variant="body1">Vulnerability tracking and remediation will appear here.</Typography>
        </TabPanel>
        
        {/* Compliance Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6">Compliance Reporting</Typography>
          <Typography variant="body1">Compliance status and reporting will appear here.</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default EnhancedDashboard;
