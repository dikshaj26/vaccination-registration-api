const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { 
  adminLoginValidator, 
  adminUserFilterValidator, 
  adminStatsValidator 
} = require('../validators/admin.validator');
const validate = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Admin Login Route (Public)
router.post('/auth/login', adminLoginValidator, validate, adminController.login);

// Admin-Only Routes (Require valid token AND 'admin' role role)
router.get('/users', protect, authorize('admin'), adminUserFilterValidator, validate, adminController.getUsers);
router.get('/slots/stats', protect, authorize('admin'), adminStatsValidator, validate, adminController.getStats);

module.exports = router;
