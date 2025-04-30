import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Grid, Chip, Avatar, List, ListItem, 
  ListItemText, ListItemAvatar, ListItemSecondaryAction,
  IconButton, Tooltip, Badge, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  Public as PublicIcon,
  Language as LanguageIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  DataUsage as DataUsageIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  WifiTethering as WifiTetheringIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import axios from 'axios';
import moment from 'moment';

/**
 * Threat Intelligence Dashboard Component
 * Displays data from connected threat intelligence feeds
 */
const ThreatIntelligenceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    sources: [],
    recentIndicators: [],
    stats: {}
  });
  
  // Fetch threat intelligence data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create axios instance with base URL for mock server
      const api = axios.create({
        baseURL: 'http://localhost:5000',
        timeout: 10000
      });
      
      try {
        // Get threat intelligence data
        const response = await api.get('/api/mock-data/threat-intelligence/feeds');
        console.log('Threat Intel data:', response.data);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          throw new Error('Failed to fetch threat intelligence data');
        }
      } catch (apiError) {
        console.warn('Could not fetch threat intel data, using mock data:', apiError.message);
        setData(generateMockData());
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setData(generateMockData());
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading threat intelligence data...
        </Typography>
      </Box>
    );
  }
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Get icon for indicator type
  const getIndicatorTypeIcon = (type) => {
    switch (type) {
      case 'ip':
        return <WifiTetheringIcon />;
      case 'domain':
        return <LanguageIcon />;
      case 'url':
        return <LinkIcon />;
      case 'file_hash_md5':
      case 'file_hash_sha1':
      case 'file_hash_sha256':
        return <CodeIcon />;
      default:
        return <DataUsageIcon />;
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Threat Intelligence
        </Typography>
        
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Overview Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Indicators
              </Typography>
              <Typography variant="h4">
                {data.stats.activeIndicators?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                From {data.sources?.length || 0} feeds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recent Additions
              </Typography>
              <Typography variant="h4">
                {data.stats.recentAdditions?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Severity Indicators
              </Typography>
              <Typography variant="h4" color="error.main">
                {(data.stats.bySeverity?.find(s => s.severity === 'critical')?.count || 0) + 
                 (data.stats.bySeverity?.find(s => s.severity === 'high')?.count || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Critical + High severity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recent Matches
              </Typography>
              <Typography variant="h4" color="warning.main">
                {data.stats.recentMatches?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Threat Feed Sources */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Connected Threat Feeds" 
              avatar={<PublicIcon />}
            />
            <Divider />
            <CardContent sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
              <List sx={{ width: '100%' }}>
                {data.sources && data.sources.length > 0 ? (
                  data.sources.map((source) => (
                    <React.Fragment key={source.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: source.status === 'active' ? 'success.main' : 'grey.500' 
                          }}>
                            <SecurityIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={source.name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="textPrimary">
                                {source.description}
                              </Typography>
                              <br />
                              {`${source.integrationStatus.indicatorCount.toLocaleString()} indicators • Last sync: ${moment(source.integrationStatus.lastSyncAt).fromNow()}`}
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            size="small" 
                            label={source.type.toUpperCase()} 
                            color="primary"
                            variant="outlined"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No threat feeds configured" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Indicators */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Recent Threat Indicators" 
              avatar={<BugReportIcon />}
            />
            <Divider />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Indicator</TableCell>
                      <TableCell align="right">Type</TableCell>
                      <TableCell align="right">Severity</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                      <TableCell align="right">Source</TableCell>
                      <TableCell align="right">Category</TableCell>
                      <TableCell align="right">Last Seen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentIndicators && data.recentIndicators.length > 0 ? (
                      data.recentIndicators.map((indicator) => (
                        <TableRow key={indicator.id} hover>
                          <TableCell component="th" scope="row">
                            <Tooltip title={indicator.value}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {indicator.value}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={indicator.type}>
                              <IconButton size="small">
                                {getIndicatorTypeIcon(indicator.type)}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              size="small" 
                              label={indicator.severity.toUpperCase()} 
                              color={getSeverityColor(indicator.severity)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {indicator.confidenceScore}%
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              size="small" 
                              label={indicator.source.name.split(' ')[0]} 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {indicator.threat.category}
                          </TableCell>
                          <TableCell align="right">
                            {moment(indicator.lastSeenAt).fromNow()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No recent indicators found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Threat Intelligence Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Threat Intelligence Analytics" 
              avatar={<AssessmentIcon />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {/* By Category */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    By Threat Category
                  </Typography>
                  <List dense>
                    {data.stats.byCategory && data.stats.byCategory.length > 0 ? (
                      data.stats.byCategory.slice(0, 5).map((category, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: 
                                category.category === 'Malware' ? 'error.light' :
                                category.category === 'Phishing' ? 'warning.light' :
                                category.category === 'Ransomware' ? 'error.main' :
                                'info.light'
                            }}>
                              {category.category.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={category.category}
                            secondary={`${category.count.toLocaleString()} indicators`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No category data available" />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                
                {/* By Type */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    By Indicator Type
                  </Typography>
                  <List dense>
                    {data.stats.byType && data.stats.byType.length > 0 ? (
                      data.stats.byType.slice(0, 5).map((type, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              {getIndicatorTypeIcon(type.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={type.type}
                            secondary={`${type.count.toLocaleString()} indicators`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No type data available" />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                
                {/* By Severity */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    By Severity Level
                  </Typography>
                  <List dense>
                    {data.stats.bySeverity && data.stats.bySeverity.length > 0 ? (
                      data.stats.bySeverity.map((severity, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: 
                                severity.severity === 'critical' ? 'error.dark' :
                                severity.severity === 'high' ? 'error.main' :
                                severity.severity === 'medium' ? 'warning.main' :
                                severity.severity === 'low' ? 'success.main' :
                                'grey.500'
                            }}>
                              {severity.severity === 'critical' || severity.severity === 'high' ? 
                                <WarningIcon /> : <InfoIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={severity.severity.charAt(0).toUpperCase() + severity.severity.slice(1)}
                            secondary={`${severity.count.toLocaleString()} indicators`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No severity data available" />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Generate mock data if API fails
 */
function generateMockData() {
  return {
    sources: [
      {
        id: 'src1',
        name: 'AlienVault OTX',
        type: 'otx',
        status: 'active',
        description: 'Open Threat Exchange - Crowd-sourced threat intelligence',
        integrationStatus: {
          lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          lastSyncStatus: 'success',
          indicatorCount: 2156
        }
      },
      {
        id: 'src2',
        name: 'MISP Feed',
        type: 'misp',
        status: 'active',
        description: 'Malware Information Sharing Platform',
        integrationStatus: {
          lastSyncAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          lastSyncStatus: 'success',
          indicatorCount: 1842
        }
      },
      {
        id: 'src3',
        name: 'VirusTotal Intel',
        type: 'virustotal',
        status: 'active',
        description: 'VirusTotal Intelligence Feed',
        integrationStatus: {
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastSyncStatus: 'success',
          indicatorCount: 976
        }
      }
    ],
    recentIndicators: [
      {
        id: 'ind1',
        value: '185.193.141.247',
        type: 'ip',
        source: { name: 'MISP Feed', type: 'misp' },
        severity: 'high',
        confidenceScore: 92,
        lastSeenAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        threat: { category: 'Malware', family: 'Emotet' }
      },
      {
        id: 'ind2',
        value: 'secure-document-preview.com',
        type: 'domain',
        source: { name: 'AlienVault OTX', type: 'otx' },
        severity: 'critical',
        confidenceScore: 95,
        lastSeenAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        threat: { category: 'Phishing' }
      },
      {
        id: 'ind3',
        value: '8f31e9706614b30b42eac27d22d4c3a996e0ed916af039e9f8ce91649eed0b4a',
        type: 'file_hash_sha256',
        source: { name: 'VirusTotal Intel', type: 'virustotal' },
        severity: 'high',
        confidenceScore: 100,
        lastSeenAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        threat: { category: 'Ransomware', family: 'BlackCat' }
      }
    ],
    stats: {
      totalIndicators: 4974,
      activeIndicators: 4621,
      recentAdditions: 187,
      bySeverity: [
        { severity: 'critical', count: 376 },
        { severity: 'high', count: 1287 },
        { severity: 'medium', count: 1966 },
        { severity: 'low', count: 1345 }
      ],
      byType: [
        { type: 'ip', count: 1754 },
        { type: 'domain', count: 1247 },
        { type: 'url', count: 913 },
        { type: 'file_hash_sha256', count: 1060 }
      ],
      byCategory: [
        { category: 'Malware', count: 2134 },
        { category: 'Phishing', count: 1187 },
        { category: 'C2', count: 742 },
        { category: 'Ransomware', count: 564 },
        { category: 'Other', count: 347 }
      ],
      recentMatches: 32
    }
  };
}

export default ThreatIntelligenceDashboard;
