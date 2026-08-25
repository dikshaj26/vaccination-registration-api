const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

// Controller handling user registration
const register = async (req, res, next) => {
  try {
    const newUser = await userService.registerUser(req.body);

    const responseData = {
      id: newUser._id,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber,
      age: newUser.age,
      pincode: newUser.pincode,
      aadharNo: newUser.aadharNo,
      vaccinationStatus: newUser.vaccinationStatus
    };

    return sendSuccess(res, 'User registered successfully', responseData, 201);
  } catch (error) {
    next(error);
  }
};

// Controller handling user login
const login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    const { user, token } = await userService.loginUser(phoneNumber, password);

    // Prepare response data, making sure password and password hash are NEVER exposed
    const userData = {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      age: user.age,
      pincode: user.pincode,
      aadharNo: user.aadharNo,
      vaccinationStatus: user.vaccinationStatus
    };

    return sendSuccess(res, 'Login successful', { token, user: userData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
