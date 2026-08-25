const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

// Controller handling admin login requests
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { admin, token } = await adminService.loginAdmin(username, password);

    const adminData = {
      id: admin._id,
      username: admin.username,
      role: admin.role
    };

    return sendSuccess(res, 'Admin login successful', { token, admin: adminData });
  } catch (error) {
    next(error);
  }
};

// Controller handling registered users list retrieval (with filters)
const getUsers = async (req, res, next) => {
  try {
    const filters = {
      age: req.query.age,
      pincode: req.query.pincode,
      status: req.query.status
    };

    const result = await adminService.getRegisteredUsers(filters);

    return sendSuccess(res, 'Registered users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

// Controller handling slot stats retrieval
const getStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    const stats = await adminService.getSlotStatistics(date);

    return sendSuccess(res, 'Slot statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getUsers,
  getStats
};
