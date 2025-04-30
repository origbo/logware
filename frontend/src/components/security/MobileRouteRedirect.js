import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

/**
 * Mobile Route Redirect Component
 * Detects mobile devices and redirects to the mobile interface
 */
const MobileRouteRedirect = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      setIsMobile(isMobileDevice || window.innerWidth < 768);
      setChecking(false);
      
      // Auto-redirect to mobile view if on mobile device
      if (isMobileDevice || window.innerWidth < 768) {
        navigate('/security/mobile');
      } else {
        navigate('/security/dashboard');
      }
    };
    
    // Check on component mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);
  
  // Handle manual navigation
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  if (checking) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1">Detecting device type...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isMobile ? 'Mobile Device Detected' : 'Desktop Device Detected'}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        {isMobile 
          ? 'You are being redirected to the mobile-optimized security dashboard.'
          : 'You are being redirected to the full security dashboard.'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleNavigate('/security/dashboard')}
        >
          Full Dashboard
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => handleNavigate('/security/mobile')}
        >
          Mobile View
        </Button>
      </Box>
    </Box>
  );
};

export default MobileRouteRedirect;
