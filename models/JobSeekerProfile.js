const mongoose = require('mongoose');

const jobSeekerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  resume: String,
  phone: String,
  location: String,
  bio: String,
  skills: [String],
  experience: [
    {
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      description: String,
      current: Boolean
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String,
      current: Boolean
    }
  ],
  github: String,
  linkedin: String
}, { timestamps: true });

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
