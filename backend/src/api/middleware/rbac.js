/**
 * Role-Based Access Control (RBAC) Middleware
 * For demo purposes, this middleware simply passes through all requests
 * In a real application, this would check user permissions
 */

/**
 * Check Permission Middleware
 * Simplified version for the demo
 * @param {String} requiredPermission - The permission to check
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // In a real application, this would check if the user has the required permission
    // For demo purposes, we're allowing all requests through
    
    // The auth middleware should have already added a user object to the request
    if (!req.user) {
      req.user = {
        id: 'demo-user-123',
        name: 'Demo User',
        role: 'admin',
        permissions: ['security.view', 'security.manage_models']
      };
    }
    
    // Log the permission check for debugging
    console.log(`[RBAC] Checking permission: ${requiredPermission} for user: ${req.user.name}`);
    
    next();
  };
};

module.exports = {
  checkPermission
};
