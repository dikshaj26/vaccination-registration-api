const { query, body } = require('express-validator');
const mongoose = require('mongoose');

// Admin Login Validator
const adminLoginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Admin Users Filter Validator
const adminUserFilterValidator = [
  query('age')
    .optional()
    .isInt({ min: 0 }).withMessage('Age filter must be a positive integer'),
  query('pincode')
    .optional()
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('Pincode filter must be exactly 6 digits')
    .isNumeric().withMessage('Pincode filter must contain only numbers'),
  query('status')
    .optional()
    .isIn(['NONE', 'FIRST_DOSE_COMPLETED', 'ALL_COMPLETED']).withMessage('Status filter must be either NONE, FIRST_DOSE_COMPLETED, or ALL_COMPLETED')
];

// Admin Slot Statistics Validator
const adminStatsValidator = [
  query('date')
    .notEmpty().withMessage('Date query parameter is required')
    .isISO8601().withMessage('Date must be in a valid format (YYYY-MM-DD)')
    .custom((value) => {
      const dateRegex = /^2024-11-(0[1-9]|[12]\d|30)$/;
      if (!dateRegex.test(value)) {
        throw new Error('Date must be within the vaccination drive period (2024-11-01 to 2024-11-30)');
      }
      return true;
    })
];

module.exports = {
  adminLoginValidator,
  adminUserFilterValidator,
  adminStatsValidator
};
