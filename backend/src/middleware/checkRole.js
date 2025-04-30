module.exports = function(role) {
  return function(req, res, next) {
    // Check if user has the required role
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
  };
};
