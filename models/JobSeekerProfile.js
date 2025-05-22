const mongoose = require('mongoose');

const jobSeekerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String },
  skills: [{ type: String }],
  experience: [
    {
      position: { type: String },
      company: { type: String },
      duration: { type: String }
    }
  ],
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      year: { type: String }
    }
  ]
});

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
