const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Business logic for registering a new user
const registerUser = async (userData) => {
  const { name, phoneNumber, age, pincode, aadharNo, password } = userData;

  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    const error = new Error('Phone number is already registered');
    error.statusCode = 409;
    throw error;
  }

  const aadharExists = await User.findOne({ aadharNo });
  if (aadharExists) {
    const error = new Error('Aadhar number is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = new User({
    name,
    phoneNumber,
    age,
    pincode,
    aadharNo,
    password
  });

  return await user.save();
};

// Business logic for user login
const loginUser = async (phoneNumber, password) => {
  // Find user by phone number
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    const error = new Error('User with this phone number does not exist');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // Verify password using User model method
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid password');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id, 'user');

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser
};
