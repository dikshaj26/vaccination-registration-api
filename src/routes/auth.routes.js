const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validation.middleware');

// User Registration Route
router.post('/register', registerValidator, validate, authController.register);

// User Login Route
router.post('/login', loginValidator, validate, authController.login);

module.exports = router;
