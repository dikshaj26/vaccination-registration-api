const { query } = require('express-validator');

// Validation rules for viewing available slots
const getSlotsValidator = [
  query('date')
    .notEmpty().withMessage('Date query parameter is required')
    .isISO8601().withMessage('Date must be in a valid format (YYYY-MM-DD)')
    // Validate that the date is strictly within November 1, 2024 to November 30, 2024
    .custom((value) => {
      const dateRegex = /^2024-11-(0[1-9]|[12]\d|30)$/;
      if (!dateRegex.test(value)) {
        throw new Error('Date must be within the vaccination drive period (2024-11-01 to 2024-11-30)');
      }
      return true;
    })
];

module.exports = {
  getSlotsValidator
};
