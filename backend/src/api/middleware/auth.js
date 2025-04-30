/**
 * Authentication Middleware
 * For demo purposes, this middleware simply passes through all requests
 * In a real application, this would verify JWT tokens
 */

/**
 * Verify JWT Token Middleware
 * Simplified version for the demo
 */
const verifyToken = (req, res, next) => {
  // In a real application, this would verify the JWT token in the request header
  // For demo purposes, we're allowing all requests through
  
  // Add a mock user to the request for testing
  req.user = {
    id: 'demo-user-123',
    name: 'Demo User',
    role: 'admin',
    permissions: ['security.view', 'security.manage_models']
  };
  
  next();
};

module.exports = {
  verifyToken
};
