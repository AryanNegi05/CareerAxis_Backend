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
    enum: ['jobseeker', 'recruiter'],
    required: [true, 'Please specify role'],
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null } 
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
