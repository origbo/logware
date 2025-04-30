import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Link, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  HowToReg as RegisterIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const steps = ['Account Information', 'Personal Details', 'Terms & Conditions'];
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'acceptTerms' ? checked : value;
    
    setUserData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!userData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (userData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!userData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!userData.password) {
        newErrors.password = 'Password is required';
      } else if (userData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!userData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (userData.password !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (activeStep === 1) {
      if (!userData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!userData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    } else if (activeStep === 2) {
      if (!userData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions to continue';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Extract relevant registration data
      const { confirmPassword, acceptTerms, ...registrationData } = userData;
      
      // Call register from AuthContext
      await register(registrationData);
      
      // Show success and redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              name="username"
              value={userData.username}
              onChange={handleChange}
              margin="normal"
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />
            
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              required
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
            
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              required
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={userData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={userData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              required
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
            />
            
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              required
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
            />
            
            <TextField
              label="Company"
              variant="outlined"
              fullWidth
              name="company"
              value={userData.company}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              helperText="Optional"
            />
            
            <TextField
              label="Job Title"
              variant="outlined"
              fullWidth
              name="jobTitle"
              value={userData.jobTitle}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              helperText="Optional"
            />
          </>
        );
      case 2:
        return (
          <>
            <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1, mb: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2">
                <strong>Terms of Service</strong>
                <br /><br />
                By using Logware, you agree to the following terms:
                <br /><br />
                1. You will use the platform in compliance with all applicable laws.
                <br />
                2. You will not share your account credentials with third parties.
                <br />
                3. You will not attempt to gain unauthorized access to the system.
                <br />
                4. You are responsible for maintaining the confidentiality of your account.
                <br />
                5. All data collected will be handled according to our privacy policy.
                <br /><br />
                The Logware team may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={userData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="I accept the terms and conditions"
            />
            {errors.acceptTerms && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                {errors.acceptTerms}
              </Typography>
            )}
          </>
        );
      default:
        return null;
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
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              py: 4, 
              px: { xs: 2, sm: 4 }, 
              borderRadius: 2,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                <RegisterIcon fontSize="large" sx={{ color: 'white' }} />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom>
                Create an Account
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary">
                Join Logware today and improve your security monitoring
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<BackIcon />}
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    Complete Registration
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    endIcon={<ForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </form>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2" 
                  underline="hover"
                  color="primary"
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
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

export default Register;
