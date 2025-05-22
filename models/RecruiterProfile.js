const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  bio: { type: String },
  linkedin: { type: String }
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
