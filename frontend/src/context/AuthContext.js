import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      // For development/testing: use mock authentication
      const useMockAuth = true;
      
      if (useMockAuth) {
        // Check if we have a stored user from mock authentication
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // Real API token check
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Check if token is expired
            const decoded = jwt_decode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
              // Token expired
              localStorage.removeItem('token');
              setUser(null);
              setIsAuthenticated(false);
            } else {
              // Set auth token header
              axios.defaults.headers.common['x-auth-token'] = token;
              
              // Get user data
              const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
              
              setUser(response.data);
              setIsAuthenticated(true);
            }
          } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            setError('Authentication error. Please log in again.');
          }
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
      
      const { token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth token header
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Decode token to get user data
      const decoded = jwt_decode(token);
      
      // Get user data
      const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
      
      setUser(userResponse.data);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      
      return { success: false, error: errorMsg };
    }
  };

  // Login user
  const login = async (email, password, twoFactorToken = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // For development/testing: use mock authentication
      const useMockAuth = true;
      
      if (useMockAuth) {
        // Mock authentication for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Check mock credentials
        if ((email === 'admin' && password === 'password') || 
            (email === 'user' && password === 'password')) {
          
          // Create mock user data
          const userData = {
            id: email === 'admin' ? '1' : '2',
            email: email,
            firstName: email === 'admin' ? 'Admin' : 'John',
            lastName: email === 'admin' ? 'User' : 'Doe',
            role: email === 'admin' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          
          // Set user state
          setUser(userData);
          setIsAuthenticated(true);
          
          // Store user in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userData));
          
          setLoading(false);
          return userData;
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        // Real API authentication
        const payload = { email, password };
        if (twoFactorToken) {
          payload.twoFactorToken = twoFactorToken;
        }
        
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, payload);
        
        // Check if 2FA is required
        if (response.data.requiresTwoFactor && !twoFactorToken) {
          setLoading(false);
          // Return a special response indicating 2FA is needed
          return { requiresTwoFactor: true };
        }
        
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set auth token header
        axios.defaults.headers.common['x-auth-token'] = response.data.token;
        
        // Decode token to get user data
        const decoded = jwt_decode(response.data.token);
        
        // Get user data
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
        
        setUser(userResponse.data);
        setIsAuthenticated(true);
        setLoading(false);
        
        return userResponse.data;
      }
    } catch (err) {
      setLoading(false);
      
      const errorMsg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      
      throw new Error(errorMsg);
    }
  };

  // Logout user
  const logout = () => {
    // For both mock and real authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth header (for real API)
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, userData);
      
      setUser(response.data);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      
      const errorMsg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMsg);
      
      return { success: false, error: errorMsg };
    }
  };

  // Reset error state
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
