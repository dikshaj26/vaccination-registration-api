const { body, param } = require('express-validator');
const mongoose = require('mongoose');

// Validation rules for booking a vaccination slot
const bookSlotValidator = [
  body('slotId')
    .notEmpty().withMessage('Slot ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Provide a valid slot ID');
      }
      return true;
    }),
  body('doseNumber')
    .notEmpty().withMessage('Dose number is required')
    .isInt({ min: 1, max: 2 }).withMessage('Dose number must be either 1 or 2')
];

// Validation rules for modifying a booking slot
const changeSlotValidator = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Provide a valid Booking ID in the URL parameter');
      }
      return true;
    }),
  body('newSlotId')
    .notEmpty().withMessage('New Slot ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Provide a valid new slot ID');
      }
      return true;
    })
];

module.exports = {
  bookSlotValidator,
  changeSlotValidator
};
