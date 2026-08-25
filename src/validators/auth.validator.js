const { body } = require('express-validator');

// Validation rules for user registration
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Provide a valid phone number')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits'),
  
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  
  body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .isLength({ min: 6, max: 6 }).withMessage('Pincode must be exactly 6 digits')
    .isNumeric().withMessage('Pincode must contain only numbers'),
  
  body('aadharNo')
    .trim()
    .notEmpty().withMessage('Aadhar number is required')
    .isLength({ min: 12, max: 12 }).withMessage('Aadhar number must be exactly 12 digits')
    .isNumeric().withMessage('Aadhar number must contain only numbers'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validation rules for login
const loginValidator = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
