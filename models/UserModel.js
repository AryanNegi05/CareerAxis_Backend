// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
  },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter','admin'],
    required: [true, 'Please specify role'],
  },
  company: { type: String } ,
  
  // ...existing fields
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },


}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
