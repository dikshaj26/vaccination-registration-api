const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const { getSlotsValidator } = require('../validators/slot.validator');
const validate = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');

// View Available Slots Route
// Protected: Only authenticated users (with a valid JWT) can access this route
router.get('/', protect, getSlotsValidator, validate, slotController.getAvailableSlots);

module.exports = router;
