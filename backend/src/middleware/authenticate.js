/**
 * Authentication Middleware
 * Verifies JWT token for protected routes
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'logware-secret');
    
    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (err) {
    logger.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
