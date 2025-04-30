import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component for setting up two-factor authentication
const TwoFactorSetup = () => {
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch the 2FA setup details on component mount
  useEffect(() => {
    const fetchSetupData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/2fa/setup`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSecret(response.data.secret);
        setQrCode(response.data.qrCodeUrl);
      } catch (err) {
        setError('Failed to retrieve 2FA setup information. Please try again later.');
        console.error('Error fetching 2FA setup:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, [token]);

  // Handle verification code submission
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/2fa/verify`,
        { token: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Two-factor authentication has been successfully enabled!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      console.error('Error verifying 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Set Up Two-Factor Authentication
        </Typography>

        {loading && !qrCode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body1" paragraph>
              Scan the QR code below with your authenticator app (such as Google Authenticator, 
              Microsoft Authenticator, or Authy) to set up two-factor authentication.
            </Typography>

            {qrCode && (
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <img src={qrCode} alt="QR Code for Two-Factor Authentication" />
              </Box>
            )}

            {secret && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  If you cannot scan the QR code, enter this secret key manually in your authenticator app:
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontFamily: 'monospace', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}
                >
                  {secret}
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter the verification code from your authenticator app:
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                variant="outlined"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g., 123456"
              />
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {success && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {success}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleVerify}
                disabled={loading || !verificationCode.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify & Enable 2FA'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default TwoFactorSetup;
