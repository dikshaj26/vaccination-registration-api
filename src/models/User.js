const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be a positive number']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  aadharNo: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  vaccinationStatus: {
    type: String,
    enum: ['NONE', 'FIRST_DOSE_COMPLETED', 'ALL_COMPLETED'],
    default: 'NONE'
  }
}, {
  timestamps: true
});

// Hash password before saving to the database
// Using standard async/await without callback parameter to avoid mongoose compatibility errors
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create indexes for queries (phoneNumber and aadharNo are already indexed by 'unique: true' in field definitions)
userSchema.index({ pincode: 1 });
userSchema.index({ age: 1 });
userSchema.index({ vaccinationStatus: 1 });

module.exports = mongoose.model('User', userSchema);
