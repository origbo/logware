import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Link, 
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  LockReset as LockResetIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // In a real app, this would call an API to send a password reset email
      // For demo purposes, we'll just simulate a successful password reset request
      setTimeout(() => {
        setEmailSent(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to send password reset email. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              py: 4, 
              px: { xs: 2, sm: 4 }, 
              borderRadius: 2,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  width: '64px', 
                  height: '64px', 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <LockResetIcon fontSize="large" sx={{ color: 'white' }} />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom>
                Reset Password
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary">
                {!emailSent 
                  ? 'Enter your email to receive a password reset link' 
                  : 'Password reset instructions sent'
                }
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  value={email}
                  onChange={handleChange}
                  margin="normal"
                  autoFocus
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                </Button>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2" 
                    underline="hover"
                    color="primary"
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <BackIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Back to Login
                  </Link>
                </Box>
              </form>
            ) : (
              <Box>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mt: 2, 
                    mb: 3, 
                    backgroundColor: 'success.light', 
                    color: 'success.contrastText',
                    borderColor: 'success.main'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Email Sent!
                    </Typography>
                    <Typography variant="body2">
                      We've sent password reset instructions to:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Please check your inbox and follow the instructions to reset your password.
                    </Typography>
                  </CardContent>
                </Card>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    component={RouterLink}
                    to="/login"
                    sx={{ mb: 2 }}
                  >
                    Return to Login
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                  >
                    Try Another Email
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              &copy; {new Date().getFullYear()} Logware. All rights reserved.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;
