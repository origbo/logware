import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Security as SecurityIcon } from '@mui/icons-material';
import SimpleBehavioralDashboard from '../../components/security/SimpleBehavioralDashboard';

/**
 * Security Dashboard Page
 * This page displays the advanced behavioral analytics dashboard
 */
const SecurityDashboard = () => {
  return (
    <Box>
      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        <SecurityIcon sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Security Analytics
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" color="inherit">
            <Link 
              component={RouterLink} 
              to="/admin/dashboard" 
              underline="hover" 
              color="inherit"
            >
              Admin
            </Link>
            <Typography color="inherit">Security Analytics</Typography>
          </Breadcrumbs>
        </Box>
      </Paper>
      
      {/* Behavioral Analytics Dashboard */}
      <SimpleBehavioralDashboard />
    </Box>
  );
};

export default SecurityDashboard;
