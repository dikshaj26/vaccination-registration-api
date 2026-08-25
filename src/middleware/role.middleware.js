// Middleware to authorize specific user roles (role-based access control)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access is denied for role '${req.user ? req.user.role : 'none'}'`
      });
    }
    next();
  };
};

module.exports = {
  authorize
};
