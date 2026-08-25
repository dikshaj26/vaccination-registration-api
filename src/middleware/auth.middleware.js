const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Middleware to authenticate JWT tokens and attach user info to req.user
const protect = async (req, res, next) => {
  let token;

  // Check if token is sent in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the authenticated user/admin details from MongoDB based on token payload
      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
          return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
        }
        req.user = { id: admin._id, role: 'admin', username: admin.username };
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        req.user = user; // Attach full user document (without password)
        req.user.role = 'user'; // Explicitly set role
      }

      return next(); // Proceed to next controller/middleware
    } catch (error) {
      console.error('Token authentication error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  // If no token header was provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = {
  protect
};
