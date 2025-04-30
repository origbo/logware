import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Dialog, 
  DialogContent, DialogActions, IconButton, Tooltip,
  Card, CardContent, QRCode
} from '@mui/material';
import { 
  PhoneAndroid as PhoneIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Mobile Security Entry Point Component
 * Provides easy access to the mobile security interface from the desktop view
 */
const MobileSecurityEntryPoint = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Get the full URL to the mobile security interface
  const getMobileUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/security/mobile`;
  };
  
  // Handle copy URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getMobileUrl())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };
  
  return (
    <>
      <Paper 
        elevation={0} 
        variant="outlined"
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3,
          borderColor: 'primary.light',
          borderWidth: '2px',
          bgcolor: 'primary.lightest',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PhoneIcon sx={{ color: 'primary.main', mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Mobile Security Monitoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access your security dashboard on-the-go from any mobile device
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Open Mobile View
        </Button>
      </Paper>
      
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6">
              Mobile Security Dashboard
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Scan the QR code or visit the URL below on your mobile device to access the security monitoring dashboard.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Box sx={{ bgcolor: 'white', p: 2 }}>
                {/* QR Code */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getMobileUrl())}`}
                  alt="QR Code"
                  style={{ width: 200, height: 200 }}
                />
              </Box>
            </Card>
          </Box>
          
          <Paper
            variant="outlined"
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" sx={{ flexGrow: 1, mr: 2 }}>
              {getMobileUrl()}
            </Typography>
            
            <Tooltip title={copied ? "Copied!" : "Copy URL"}>
              <IconButton onClick={handleCopyUrl} color={copied ? "success" : "primary"}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Features available on mobile:
            </Typography>
            <ul>
              <li>Real-time security alerts and notifications</li>
              <li>Security posture overview</li>
              <li>Anomaly detection monitoring</li>
              <li>Quick incident response</li>
              <li>Security training access</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              window.open(getMobileUrl(), '_blank');
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileSecurityEntryPoint;
