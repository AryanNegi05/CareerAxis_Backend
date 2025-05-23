const mongoose = require('mongoose');

const jobSeekerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
  skills: [{ type: String }],
  experience: [
    {
      company: { type: String },
      position: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      description: { type: String },
      current: { type: Boolean }
    }
  ],
  education: [
    {
      institution: { type: String },
      degree: { type: String },
      field: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean }
    }
  ]
});

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
