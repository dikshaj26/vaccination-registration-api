const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { bookSlotValidator, changeSlotValidator } = require('../validators/booking.validator');
const validate = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');

// Apply protection middleware to all booking routes (user must be authenticated)
router.use(protect);

// Book Vaccine Slot Route (POST /api/bookings)
router.post('/', bookSlotValidator, validate, bookingController.createBooking);

// View User's Bookings Route (GET /api/bookings/me)
router.get('/me', bookingController.getMyBookings);

// Change Booking Slot Route (PUT /api/bookings/:id/slot)
router.put('/:id/slot', changeSlotValidator, validate, bookingController.changeSlot);

module.exports = router;
