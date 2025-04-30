import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Component for verifying 2FA during login
const TwoFactorVerify = ({ email, password, onSuccess, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Handle verification code submission
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First verify the 2FA code
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/verify-2fa`,
        { email, token: verificationCode }
      );

      if (response.data.verified) {
        // If verification succeeds, proceed with login
        await login(email, password, verificationCode);
        onSuccess();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      console.error('Error verifying 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Two-Factor Authentication
        </Typography>

        <Typography variant="body1" paragraph>
          Your account has two-factor authentication enabled. Please enter the verification code
          from your authenticator app to continue.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Verification Code"
            variant="outlined"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="e.g., 123456"
            autoFocus
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Back
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleVerify}
            disabled={loading || !verificationCode.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TwoFactorVerify;
